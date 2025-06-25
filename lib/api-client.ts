
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Error Class
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string = 'API_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Rate Limiter
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      throw new APIError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }
    
    this.requests.push(now);
  }
}

// Secure API Client
export class SecureAPIClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor(baseURL: string, apiKey: string, options: AxiosRequestConfig = {}) {
    this.rateLimiter = new RateLimiter();
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WRDO/1.0',
        ...options.headers,
      },
      ...options,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        await this.rateLimiter.checkLimit();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          throw new APIError(
            data?.error?.message || data?.message || 'API request failed',
            status,
            this.getErrorCode(status)
          );
        }
        throw new APIError('Network error', 0, 'NETWORK_ERROR');
      }
    );
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 429: return 'RATE_LIMITED';
      case 500: return 'INTERNAL_ERROR';
      default: return 'API_ERROR';
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// API Configuration
export const apiConfig = {
  openai: {
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || '',
    organization: process.env.OPENAI_ORG_ID,
  },
  hume: {
    baseURL: process.env.HUME_BASE_URL || 'https://api.hume.ai/v0',
    apiKey: process.env.HUME_API_KEY || '',
  },
  elevenlabs: {
    baseURL: process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1',
    apiKey: process.env.ELEVENLABS_API_KEY || '',
  },
};

// Create API clients
export const openaiClient = new SecureAPIClient(
  apiConfig.openai.baseURL,
  apiConfig.openai.apiKey,
  {
    headers: {
      ...(apiConfig.openai.organization && {
        'OpenAI-Organization': apiConfig.openai.organization,
      }),
    },
  }
);

export const humeClient = new SecureAPIClient(
  apiConfig.hume.baseURL,
  apiConfig.hume.apiKey
);

export const elevenlabsClient = new SecureAPIClient(
  apiConfig.elevenlabs.baseURL,
  apiConfig.elevenlabs.apiKey
);

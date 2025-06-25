
import { NextApiRequest, NextApiResponse } from 'next';
import { openaiClient, APIError } from '../../lib/api-client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new APIError('OpenAI API key not configured', 500, 'CONFIG_ERROR');
    }

    // Validate request body
    const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 }: ChatRequest = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Validate message format
    for (const message of messages) {
      if (!message.role || !message.content) {
        return res.status(400).json({ error: 'Each message must have role and content' });
      }
      if (!['user', 'assistant', 'system'].includes(message.role)) {
        return res.status(400).json({ error: 'Invalid message role' });
      }
    }

    // Make request to OpenAI
    const response = await openaiClient.post<ChatResponse>('/chat/completions', {
      model,
      messages,
      temperature,
      max_tokens,
      stream: false,
    });

    // Return successful response
    res.status(200).json(response);

  } catch (error) {
    console.error('Chat API Error:', error);

    if (error instanceof APIError) {
      // Handle specific API errors
      switch (error.code) {
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
          return res.status(403).json({
            error: 'Authentication failed. Please check your API key configuration.',
            code: error.code,
          });
        case 'RATE_LIMITED':
          return res.status(429).json({
            error: 'Rate limit exceeded. Please try again later.',
            code: error.code,
          });
        case 'NOT_FOUND':
          return res.status(404).json({
            error: 'Model not found or not accessible.',
            code: error.code,
          });
        default:
          return res.status(error.statusCode || 500).json({
            error: error.message,
            code: error.code,
          });
      }
    }

    // Handle unexpected errors
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

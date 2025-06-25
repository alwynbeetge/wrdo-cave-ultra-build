
import { NextApiRequest, NextApiResponse } from 'next';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    [key: string]: {
      status: 'up' | 'down';
      message?: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheck>
) {
  const timestamp = new Date().toISOString();
  const services: HealthCheck['services'] = {};

  // Check OpenAI API key
  services.openai = {
    status: process.env.OPENAI_API_KEY ? 'up' : 'down',
    message: process.env.OPENAI_API_KEY ? undefined : 'API key not configured',
  };

  // Check Hume API key
  services.hume = {
    status: process.env.HUME_API_KEY ? 'up' : 'down',
    message: process.env.HUME_API_KEY ? undefined : 'API key not configured',
  };

  // Check ElevenLabs API key
  services.elevenlabs = {
    status: process.env.ELEVENLABS_API_KEY ? 'up' : 'down',
    message: process.env.ELEVENLABS_API_KEY ? undefined : 'API key not configured',
  };

  // Determine overall status
  const allServicesUp = Object.values(services).every(service => service.status === 'up');
  const status: HealthCheck['status'] = allServicesUp ? 'healthy' : 'unhealthy';

  const healthCheck: HealthCheck = {
    status,
    timestamp,
    services,
  };

  // Return appropriate status code
  const statusCode = status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
}

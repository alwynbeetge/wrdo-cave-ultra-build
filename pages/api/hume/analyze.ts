
import { NextApiRequest, NextApiResponse } from 'next';
import { humeClient, APIError } from '../../../lib/api-client';

interface HumeAnalysisRequest {
  text?: string;
  audio?: string; // base64 encoded audio
  type: 'text' | 'audio';
}

interface EmotionScore {
  name: string;
  score: number;
}

interface HumeAnalysisResponse {
  emotions: EmotionScore[];
  confidence: number;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    if (!process.env.HUME_API_KEY) {
      throw new APIError('Hume API key not configured', 500, 'CONFIG_ERROR');
    }

    const { text, audio, type }: HumeAnalysisRequest = req.body;

    if (!type || !['text', 'audio'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "text" or "audio"' });
    }

    if (type === 'text' && !text) {
      return res.status(400).json({ error: 'Text is required for text analysis' });
    }

    if (type === 'audio' && !audio) {
      return res.status(400).json({ error: 'Audio data is required for audio analysis' });
    }

    let endpoint: string;
    let payload: any;

    if (type === 'text') {
      endpoint = '/expression/text';
      payload = {
        text: text,
        models: ['emotion'],
      };
    } else {
      endpoint = '/expression/audio';
      payload = {
        audio: audio,
        models: ['emotion'],
      };
    }

    // Make request to Hume API
    const response = await humeClient.post(endpoint, payload);

    // Process response
    const emotions: EmotionScore[] = response.predictions?.[0]?.emotions || [];
    const confidence = emotions.reduce((sum, emotion) => sum + emotion.score, 0) / emotions.length;

    const analysisResponse: HumeAnalysisResponse = {
      emotions: emotions.sort((a, b) => b.score - a.score).slice(0, 10), // Top 10 emotions
      confidence,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(analysisResponse);

  } catch (error) {
    console.error('Hume API Error:', error);

    if (error instanceof APIError) {
      switch (error.code) {
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
          return res.status(403).json({
            error: 'Hume API authentication failed. Please check your API key.',
            code: error.code,
          });
        case 'RATE_LIMITED':
          return res.status(429).json({
            error: 'Hume API rate limit exceeded.',
            code: error.code,
          });
        default:
          return res.status(error.statusCode || 500).json({
            error: error.message,
            code: error.code,
          });
      }
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

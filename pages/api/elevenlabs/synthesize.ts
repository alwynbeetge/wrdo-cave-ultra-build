
import { NextApiRequest, NextApiResponse } from 'next';
import { elevenlabsClient, APIError } from '../../../lib/api-client';

interface SynthesizeRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
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
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new APIError('ElevenLabs API key not configured', 500, 'CONFIG_ERROR');
    }

    const {
      text,
      voice_id = 'pNInz6obpgDQGcFmaJgB', // Default voice
      model_id = 'eleven_monolingual_v1',
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    }: SynthesizeRequest = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text too long (max 5000 characters)' });
    }

    // Make request to ElevenLabs API
    const response = await elevenlabsClient.post(
      `/text-to-speech/${voice_id}`,
      {
        text,
        model_id,
        voice_settings,
      },
      {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'audio/mpeg',
        },
      }
    );

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
    res.status(200).send(Buffer.from(response));

  } catch (error) {
    console.error('ElevenLabs API Error:', error);

    if (error instanceof APIError) {
      switch (error.code) {
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
          return res.status(403).json({
            error: 'ElevenLabs API authentication failed. Please check your API key.',
            code: error.code,
          });
        case 'RATE_LIMITED':
          return res.status(429).json({
            error: 'ElevenLabs API rate limit exceeded.',
            code: error.code,
          });
        case 'NOT_FOUND':
          return res.status(404).json({
            error: 'Voice not found.',
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

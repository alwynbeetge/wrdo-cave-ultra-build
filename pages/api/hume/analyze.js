module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    if (!process.env.HUME_API_KEY) {
      return res.status(500).json({ 
        error: 'Hume API key not configured',
        code: 'CONFIG_ERROR'
      });
    }

    const { text, audio, type } = req.body;

    if (!type || !['text', 'audio'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "text" or "audio"' });
    }

    if (type === 'text' && !text) {
      return res.status(400).json({ error: 'Text is required for text analysis' });
    }

    if (type === 'audio' && !audio) {
      return res.status(400).json({ error: 'Audio data is required for audio analysis' });
    }

    // Since we're using test keys, return a mock response
    const mockResponse = {
      emotions: [
        { name: 'joy', score: 0.8 },
        { name: 'excitement', score: 0.6 },
        { name: 'contentment', score: 0.5 },
        { name: 'surprise', score: 0.3 },
        { name: 'neutral', score: 0.2 }
      ],
      confidence: 0.75,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(mockResponse);

  } catch (error) {
    console.error('Hume API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

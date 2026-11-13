
import { handleChat } from '../../../server/bedrockService.js';

export default async function handler(req: any, res: any) {
  // Allow POST requests only
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  // Read the request body
  let parsed: any;

  try {
    parsed =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body || {};
  } catch {
    return res.status(400).json({
      error: 'Invalid JSON payload',
    });
  }

  // Identify the client
  const forwardedFor = req.headers['x-forwarded-for'];

  const clientIp =
    (typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : '') ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  // Call the existing Bedrock service
  try {
    const result = await handleChat({
      message: parsed.message,
      history: parsed.history,
      clientIp,
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Bedrock chat API error:', error);

    return res.status(500).json({
      error: 'Unable to process the AI chat request.',
    });
  }
}

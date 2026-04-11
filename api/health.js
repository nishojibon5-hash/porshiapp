/**
 * Health Check Endpoint
 * Simple endpoint to verify backend is running
 * GET /api/health
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    return res.status(200).json({
      status: 'ok',
      service: 'porshi-chat-backend',
      version: '1.0.0',
      timestamp: Date.now(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
}

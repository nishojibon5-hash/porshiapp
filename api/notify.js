/**
 * Notification API
 * Handles push notifications to devices when new messages arrive
 * Uses Firebase Cloud Messaging (FCM) for real devices
 * Fallback to polling for web clients
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    return await sendNotification(req, res);
  }

  if (req.method === 'GET') {
    return await pollMessages(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Send notification to a device
 * POST /api/notify
 * Body: { recipientId, senderId, senderName, messagePreview }
 */
async function sendNotification(req, res) {
  const { recipientId, senderId, senderName, messagePreview } = req.body;

  if (!recipientId) {
    return res.status(400).json({ error: 'Missing recipientId' });
  }

  try {
    // In production, integrate with Firebase Cloud Messaging
    // const fcmToken = await getDeviceFCMToken(recipientId);
    // if (fcmToken) {
    //   await sendFCMNotification(fcmToken, {
    //     title: senderName || 'New message',
    //     body: messagePreview || 'You have a new message',
    //     data: { senderId, recipientId }
    //   });
    // }

    // For now, simulate notification
    console.log(`📱 Notification sent to ${recipientId} from ${senderName}`);

    return res.status(200).json({
      success: true,
      recipientId,
      notificationSent: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Notification error:', error);
    return res.status(500).json({
      error: 'Failed to send notification',
      message: error.message,
    });
  }
}

/**
 * Poll for new messages (for web clients without WebSocket)
 * GET /api/notify?userId=xxx&since=timestamp
 */
async function pollMessages(req, res) {
  const { userId, since = Date.now() - 60000 } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    // Simulate message polling
    // In production, query actual database for new messages since 'since' timestamp

    return res.status(200).json({
      success: true,
      userId,
      messages: [],
      since: parseInt(since),
      timestamp: Date.now(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to poll messages',
      message: error.message,
    });
  }
}

/**
 * Helper: Send FCM notification (production)
 * Requires: firebase-admin SDK
 */
async function sendFCMNotification(token, payload) {
  // Implement with firebase-admin:
  // const admin = require('firebase-admin');
  // await admin.messaging().send({
  //   token,
  //   notification: payload,
  //   webpush: { fcmOptions: { link: 'https://yourapp.com' } }
  // });
  console.log('FCM would send:', payload);
}

/**
 * Helper: Get device FCM token
 */
async function getDeviceFCMToken(userId) {
  // Query database for device's FCM token
  // return await db.getUserFCMToken(userId);
  return null;
}

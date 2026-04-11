/**
 * Porshi - P2P Chat Message Sync API
 * Deployed on Vercel
 * 
 * This API handles:
 * - Storing user unique IDs
 * - Syncing messages between paired devices
 * - Managing pending messages when devices are offline
 * - Retrieving chat history
 */

import { json } from 'micro';

// In-memory storage (replace with actual database in production)
const users = new Map();
const messages = new Map();
const pendingMessages = new Map();

/**
 * Handler function
 * POST /api/sync-chat - Send/sync messages
 * GET /api/sync-chat - Retrieve messages
 * PUT /api/sync-chat - Update user profile
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handlePostMessage(req, res);
      case 'GET':
        return await handleGetMessages(req, res);
      case 'PUT':
        return await handleUserProfile(req, res);
      case 'DELETE':
        return await handleDeleteMessages(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}

/**
 * Handle sending/syncing messages
 * POST /api/sync-chat
 * Body: { senderId, senderName, recipientId, text, timestamp }
 */
async function handlePostMessage(req, res) {
  const body = await json(req);
  const { senderId, senderName, recipientId, text, timestamp } = body;

  // Validation
  if (!senderId || !recipientId || !text) {
    return res.status(400).json({
      error: 'Missing required fields: senderId, recipientId, text',
    });
  }

  if (text.trim().length === 0 || text.length > 500) {
    return res.status(400).json({
      error: 'Message must be between 1 and 500 characters',
    });
  }

  try {
    const messageId = generateId();
    const message = {
      id: messageId,
      senderId,
      senderName: senderName || 'Unknown',
      recipientId,
      text: text.trim(),
      timestamp: timestamp || Date.now(),
      status: 'delivered',
    };

    // Store message
    const chatKey = getChatKey(senderId, recipientId);
    if (!messages.has(chatKey)) {
      messages.set(chatKey, []);
    }
    messages.get(chatKey).push(message);

    // Limit stored messages to last 100 per chat
    const chatMessages = messages.get(chatKey);
    if (chatMessages.length > 100) {
      chatMessages.shift();
    }

    // Try to notify recipient (webhook simulation)
    // In production, use Firebase Cloud Messaging or similar
    const notifyUrl = `${process.env.APP_URL}/api/notify?recipientId=${recipientId}`;

    return res.status(200).json({
      success: true,
      messageId,
      message,
      delivered: true,
      timestamp: Date.now(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to send message',
      message: error.message,
    });
  }
}

/**
 * Handle retrieving messages
 * GET /api/sync-chat?userId=xxx&recipientId=yyy&limit=50
 */
async function handleGetMessages(req, res) {
  const { userId, recipientId, limit = 50, offset = 0 } = req.query;

  if (!userId || !recipientId) {
    return res.status(400).json({
      error: 'Missing required query parameters: userId, recipientId',
    });
  }

  try {
    const chatKey = getChatKey(userId, recipientId);
    const allMessages = messages.get(chatKey) || [];

    // Pagination
    const start = Math.max(0, allMessages.length - parseInt(limit) - parseInt(offset));
    const end = Math.max(0, allMessages.length - parseInt(offset));
    const paginatedMessages = allMessages.slice(start, end);

    return res.status(200).json({
      success: true,
      userId,
      recipientId,
      messageCount: allMessages.length,
      messages: paginatedMessages,
      hasMore: start > 0,
      timestamp: Date.now(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to retrieve messages',
      message: error.message,
    });
  }
}

/**
 * Handle user profile registration/update
 * PUT /api/sync-chat
 * Body: { userId, name, bio, avatar }
 */
async function handleUserProfile(req, res) {
  const body = await json(req);
  const { userId, name, bio, avatar } = body;

  if (!userId) {
    return res.status(400).json({
      error: 'Missing userId',
    });
  }

  try {
    const user = {
      userId,
      name: name || 'User',
      bio: bio || '',
      avatar: avatar || '👤',
      createdAt: users.has(userId) ? users.get(userId).createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    users.set(userId, user);

    return res.status(200).json({
      success: true,
      user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update profile',
      message: error.message,
    });
  }
}

/**
 * Handle deleting messages (for privacy/cleanup)
 * DELETE /api/sync-chat?messageId=xxx&userId=xxx
 */
async function handleDeleteMessages(req, res) {
  const { messageId, userId } = req.query;

  if (!messageId || !userId) {
    return res.status(400).json({
      error: 'Missing required parameters: messageId, userId',
    });
  }

  try {
    let deleted = false;

    // Search and delete across all chats
    for (const [chatKey, chatMessages] of messages.entries()) {
      const index = chatMessages.findIndex((m) => m.id === messageId && m.senderId === userId);
      if (index !== -1) {
        chatMessages.splice(index, 1);
        deleted = true;
        break;
      }
    }

    return res.status(200).json({
      success: deleted,
      messageId,
      deleted,
      timestamp: Date.now(),
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to delete message',
      message: error.message,
    });
  }
}

/**
 * Helper: Generate unique ID
 */
function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper: Create consistent chat key (order-independent)
 * Ensures same key regardless of who initiates
 */
function getChatKey(userId1, userId2) {
  const ids = [userId1, userId2].sort();
  return `chat-${ids[0]}-${ids[1]}`;
}

/**
 * Health check endpoint
 * GET /api/health
 */
export async function handleHealth(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'porshi-chat-sync',
    timestamp: Date.now(),
  });
}

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const bcrypt = require('bcrypt');
// Encrypted store using Node crypto (AES-256-GCM)
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - MUST be before routes
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname)));

// User registration endpoint (ensures unique user ID)
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password, university, course, joinDate, location, bio, mobile, whatsapp, contactPublic, authProvider } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  let users = readJSON('users') || [];
  // Check for existing email
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }
  // Generate unique user ID
  let newId;
  do {
    newId = Date.now() + Math.floor(Math.random() * 10000);
  } while (users.some(u => String(u.id) === String(newId)));

  try {
    // Hash the password with bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      id: newId,
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store hashed password
      university: university || '',
      course: course || '',
      joinDate: joinDate || new Date().toISOString().slice(0, 10),
      location: location || '',
      bio: bio || '',
      mobile: mobile || '',
      whatsapp: whatsapp || '',
      contactPublic: contactPublic || false,
      authProvider: authProvider || 'email'
    };
    users.push(newUser);
    const success = writeJSON('users', users);
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to save user' });
    }
    // Return user without password for security
    const userResponse = { ...newUser };
    delete userResponse.password;
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Password hashing error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process registration' });
  }
});

// User login endpoint with encrypted password verification
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const users = readJSON('users') || [];
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  try {
    // Compare the provided password with the hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Return user without password for security
    const userResponse = { ...user };
    delete userResponse.password;
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Password verification error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

// User ID verification endpoint
app.post('/api/verify-user', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId required' });
  }
  const users = readJSON('users') || [];
  // Try to match by string, number, or loose equality
  let user = users.find(u => u.id === userId);
  if (!user) user = users.find(u => String(u.id) === String(userId));
  if (!user) {
    const numId = Number(userId);
    if (!isNaN(numId)) user = users.find(u => Number(u.id) === numId);
  }
  if (user) {
    // Return user without password for security
    const userResponse = { ...user };
    delete userResponse.password;
    return res.json({ success: true, user: userResponse });
  } else {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
});

const dataDir = path.join(__dirname, 'server_data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const files = {
  forum: 'forum.json',
  products: 'products.json',
  events: 'events.json',
  comments: 'comments.json',
  users: 'users.json',
  questionPhotos: 'questions.json',
  likedPosts: 'likedPosts.json',
  avatars: 'avatars.json',
  notifications: 'notifications.json',
  userActivity: 'userActivity.json',
  contactMessages: 'contact-messages.json',
  conversations: 'conversations.json'
};

// --- Encrypted JSON store (file-backed) ---
const ENC_PATH = path.join(__dirname, 'campus_hub.enc');
// Automatic DB_KEY management: prefer env var, then .env file, otherwise generate and persist locally
const ENV_PATH = path.join(__dirname, '.env');
let DB_KEY = process.env.DB_KEY;
if (!DB_KEY) {
  try {
    if (fs.existsSync(ENV_PATH)) {
      const envRaw = fs.readFileSync(ENV_PATH, 'utf8');
      const m = envRaw.match(/DB_KEY=(.+)/);
      if (m) DB_KEY = m[1].trim();
    }
  } catch (e) {
    console.error('Failed to read .env for DB_KEY', e);
  }
}
if (!DB_KEY) {
  // Generate a strong random key and persist to .env with restrictive permissions
  DB_KEY = crypto.randomBytes(32).toString('hex'); // 256-bit key
  try {
    fs.writeFileSync(ENV_PATH, `DB_KEY=${DB_KEY}\n`, { mode: 0o600 });
    console.log('Generated and saved DB_KEY to .env (ignored by git)');
  } catch (e) {
    console.error('Failed to write .env for DB_KEY', e);
  }
}
const ENC_ALGO = 'aes-256-gcm';

function _deriveKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest();
}

let store = {};

function loadStore() {
  if (!fs.existsSync(ENC_PATH)) {
    // no encrypted store yet
    store = {};
    return;
  }
  try {
    const raw = fs.readFileSync(ENC_PATH, 'utf8');
    const envelope = JSON.parse(raw);
    const iv = Buffer.from(envelope.iv, 'base64');
    const tag = Buffer.from(envelope.tag, 'base64');
    const dataBuf = Buffer.from(envelope.data, 'base64');
    const decipher = crypto.createDecipheriv(ENC_ALGO, _deriveKey(DB_KEY), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(dataBuf), decipher.final()]);
    store = JSON.parse(decrypted.toString('utf8')) || {};
  } catch (e) {
    console.error('Failed to load encrypted store, starting empty:', e);
    store = {};
  }
}

function saveStore() {
  try {
    const plaintext = JSON.stringify(store || {});
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ENC_ALGO, _deriveKey(DB_KEY), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const envelope = {
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      data: encrypted.toString('base64')
    };
    fs.writeFileSync(ENC_PATH, JSON.stringify(envelope), 'utf8');
  } catch (e) {
    console.error('Failed to save encrypted store:', e);
  }
}

// Initialize in-memory store from encrypted file
loadStore();

function readJSON(name) {
  if (store && Object.prototype.hasOwnProperty.call(store, name)) {
    return store[name];
  }
  // Fallback to file-based storage (legacy)
  const file = path.join(dataDir, files[name] || `${name}.json`);
  try {
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('readJSON error', name, e);
    return null;
  }
}

function writeJSON(name, data) {
  try {
    store = store || {};
    store[name] = data;
    saveStore();
    return true;
  } catch (e) {
    console.error('writeJSON error (encrypted)', name, e);
  }

  // Fallback to file-based write
  const file = path.join(dataDir, files[name] || `${name}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('writeJSON error (file fallback)', name, e);
    return false;
  }
}

app.get('/api/state', (req, res) => {
  const state = {
    forumPosts: readJSON('forum') || [],
    marketplaceProducts: readJSON('products') || [],
    events: readJSON('events') || [],
    comments: readJSON('comments') || {},
    likedPosts: readJSON('likedPosts') || [],
    users: readJSON('users') || [],
    userActivity: readJSON('userActivity') || [],
    userAvatars: readJSON('avatars') || {},
    notifications: readJSON('notifications') || [],
    questionPhotos: readJSON('questionPhotos') || [],
    conversations: readJSON('conversations') || []
  };
  res.json(state);
});

app.post('/api/sync/:collection', (req, res) => {
  const col = req.params.collection;
  if (!col) return res.status(400).json({error: 'collection required'});
  const success = writeJSON(col, req.body);
  if (!success) return res.status(500).json({error: 'failed to write data'});
  res.json({ok: true});
});

// convenience: allow replacing entire state
app.post('/api/state', (req, res) => {
  const body = req.body || {};
  Object.keys(files).forEach(key => {
    if (body[key]) writeJSON(key, body[key]);
  });
  res.json({ok: true});
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const contactMessage = {
    id: Date.now(),
    name: name,
    email: email,
    subject: subject,
    message: message,
    submittedAt: new Date().toISOString()
  };
  
  // Save to server
  let messages = readJSON('contactMessages') || [];
  messages.push(contactMessage);
  const success = writeJSON('contactMessages', messages);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to save message' });
  }
  
  res.json({ ok: true, message: 'Message saved successfully' });
});

// Chat API Endpoints

// Get all conversations for current user
app.get('/api/chat/conversations/:userId', (req, res) => {
  let userId = req.params.userId;
  // Convert userId to number if it's numeric (user IDs are stored as numbers)
  if (!isNaN(userId)) {
    userId = parseInt(userId);
  }
  
  const conversations = readJSON('conversations') || [];
  
  const userConversations = conversations.filter(conv => {
    if (!conv.participants) return false;
    // Compare both as numbers and strings to handle both cases
    return conv.participants.some(p => {
      return p === userId || p === String(userId) || Number(p) === userId;
    });
  });
  
  // Sort by most recent message
  userConversations.sort((a, b) => {
    const aTime = a.messages && a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0;
    const bTime = b.messages && b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0;
    return bTime - aTime;
  });
  
  res.json(userConversations);
});

// Get specific conversation
app.get('/api/chat/conversation/:conversationId', (req, res) => {
  const conversationId = req.params.conversationId;
  const conversations = readJSON('conversations') || [];
  const conversation = conversations.find(c => c.id === conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json(conversation);
});

// Send message in conversation
app.post('/api/chat/message', (req, res) => {
  const { conversationId, senderId, senderName, senderAvatar, text } = req.body;
  
  if (!conversationId || !senderId || !text) {
    return res.status(400).json({ error: 'conversationId, senderId, and text are required' });
  }
  
  let conversations = readJSON('conversations') || [];
  const conversation = conversations.find(c => c.id === conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  const message = {
    id: Date.now().toString(),
    senderId: senderId,
    senderName: senderName || 'Unknown User',
    senderAvatar: senderAvatar || '',
    text: text,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  conversation.messages.push(message);
  const success = writeJSON('conversations', conversations);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to save message' });
  }
  
  // Create notifications for all other participants
  let notifications = readJSON('notifications') || [];
  conversation.participants.forEach(participantId => {
    if (String(participantId) !== String(senderId)) {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'message',
        targetId: conversationId,
        targetType: 'conversation',
        content: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        author: senderName || 'Unknown User',
        recipientId: participantId,
        timestamp: new Date().toISOString(),
        read: false
      };
      notifications.push(notification);
    }
  });
  writeJSON('notifications', notifications);
  
  res.json({ ok: true, message: message });
});

// Delete message from conversation
app.delete('/api/chat/message/:messageId', (req, res) => {
  const { messageId } = req.params;
  const { conversationId, senderId } = req.body;
  
  if (!conversationId) {
    return res.status(400).json({ error: 'conversationId is required' });
  }
  
  let conversations = readJSON('conversations') || [];
  const conversation = conversations.find(c => c.id === conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  // Check if user is a participant of this conversation
  if (!conversation.participants.some(p => p === senderId || p === String(senderId) || Number(p) === senderId)) {
    return res.status(403).json({ error: 'You are not a participant of this conversation' });
  }
  
  // Find message with flexible ID comparison
  const messageIndex = conversation.messages.findIndex(m => 
    m.id === messageId || 
    m.id === String(messageId) || 
    String(m.id) === String(messageId)
  );
  
  if (messageIndex === -1) {
    console.error(`Message not found: messageId=${messageId}, conversationId=${conversationId}`);
    console.error('Available messages:', conversation.messages.map(m => ({ id: m.id, type: typeof m.id })));
    return res.status(404).json({ error: 'Message not found' });
  }
  
  conversation.messages.splice(messageIndex, 1);
  const success = writeJSON('conversations', conversations);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete message' });
  }
  
  res.json({ ok: true, message: 'Message deleted successfully' });
});

// Create new conversation
app.post('/api/chat/conversation', (req, res) => {
  const { participantIds, participantNames } = req.body;
  
  if (!participantIds || participantIds.length < 2) {
    return res.status(400).json({ error: 'At least 2 participants are required' });
  }
  
  let conversations = readJSON('conversations') || [];
  
  // Check if conversation already exists between these participants
  const existingConv = conversations.find(c => 
    c.participants.length === participantIds.length &&
    participantIds.every(id => c.participants.includes(id))
  );
  
  if (existingConv) {
    return res.json({ ok: true, conversation: existingConv });
  }
  
  const conversation = {
    id: 'conv_' + Date.now(),
    participants: participantIds,
    participantNames: participantNames || {},
    messages: [],
    createdAt: new Date().toISOString(),
    isGroupChat: participantIds.length > 2
  };
  
  conversations.push(conversation);
  const success = writeJSON('conversations', conversations);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
  
  res.json({ ok: true, conversation: conversation });
});

// Mark messages as read
app.post('/api/chat/mark-read', (req, res) => {
  const { conversationId, userId } = req.body;
  
  if (!conversationId || !userId) {
    return res.status(400).json({ error: 'conversationId and userId are required' });
  }
  
  let conversations = readJSON('conversations') || [];
  const conversation = conversations.find(c => c.id === conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  // Mark all messages from other users as read
  conversation.messages.forEach(msg => {
    if (msg.senderId !== userId) {
      msg.read = true;
    }
  });
  
  const success = writeJSON('conversations', conversations);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to mark messages as read' });
  }
  
  res.json({ ok: true });
});

// Delete conversation
app.post('/api/chat/delete-conversation', (req, res) => {
  const { conversationId, userId } = req.body;
  
  if (!conversationId || !userId) {
    return res.status(400).json({ error: 'conversationId and userId are required' });
  }
  
  let conversations = readJSON('conversations') || [];
  const index = conversations.findIndex(c => c.id === conversationId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  conversations.splice(index, 1);
  const success = writeJSON('conversations', conversations);
  
  if (!success) {
    return res.status(500).json({ error: 'Failed to delete conversation' });
  }
  
  res.json({ ok: true });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // Log local network addresses for convenience
  const nets = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  if (addresses.length) {
    addresses.forEach(addr => console.log(`Accessible: http://${addr}:${PORT}`));
  } else {
    console.log(`Accessible on localhost: http://localhost:${PORT}`);
  }
});

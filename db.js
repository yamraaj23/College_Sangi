const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'server_data');
const DB_PATH = path.join(DATA_DIR, 'collegesangi.db');
const KEY_PATH = path.join(DATA_DIR, 'secret.key');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Set up/load encryption key
let encryptionKey;
try {
  if (fs.existsSync(KEY_PATH)) {
    encryptionKey = fs.readFileSync(KEY_PATH);
    if (encryptionKey.length !== 32) {
      throw new Error('Invalid key length, generating a new one');
    }
  } else {
    encryptionKey = crypto.randomBytes(32);
    fs.writeFileSync(KEY_PATH, encryptionKey);
  }
} catch (err) {
  console.error('⚠️ Error reading encryption key, generating a new one:', err);
  encryptionKey = crypto.randomBytes(32);
  fs.writeFileSync(KEY_PATH, encryptionKey);
}

// AES-256-CBC Encryption helpers
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Encryption error:', err);
    throw err;
  }
}

function decrypt(text) {
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return text; // If not in iv:ciphertext format, return raw
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    throw err;
  }
}

let db;

function initialize() {
  console.log('🔒 Initializing Encrypted SQLite Database...');
  db = new DatabaseSync(DB_PATH);
  
  // Create collections table
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  console.log('🔐 Database connection established');
  
  // Check if migration is needed
  runMigration();
}

function dbRead(key) {
  if (!db) initialize();
  try {
    const query = db.prepare('SELECT value FROM collections WHERE key = ?');
    const row = query.get(key);
    if (!row) return null;
    
    const decrypted = decrypt(row.value);
    return JSON.parse(decrypted);
  } catch (err) {
    console.error(`Error reading key "${key}" from database:`, err);
    return null;
  }
}

function dbWrite(key, data) {
  if (!db) initialize();
  try {
    const jsonStr = JSON.stringify(data);
    const encrypted = encrypt(jsonStr);
    
    const query = db.prepare('INSERT OR REPLACE INTO collections (key, value) VALUES (?, ?)');
    query.run(key, encrypted);
    return true;
  } catch (err) {
    console.error(`Error writing key "${key}" to database:`, err);
    return false;
  }
}

function runMigration() {
  // Existing JSON collections mapping
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
    conversations: 'conversations.json',
    materials: 'materials.json'
  };

  let migratedCount = 0;

  Object.entries(files).forEach(([key, filename]) => {
    // Check if key already exists in DB
    const checkQuery = db.prepare('SELECT 1 FROM collections WHERE key = ?');
    const exists = checkQuery.get(key);
    
    if (!exists) {
      const filePath = path.join(DATA_DIR, filename);
      if (fs.existsSync(filePath)) {
        console.log(`📦 Found existing JSON file: ${filename}. Migrating to database...`);
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(raw);
          const success = dbWrite(key, data);
          if (success) {
            migratedCount++;
            // Rename to .bak to avoid re-migration
            fs.renameSync(filePath, `${filePath}.bak`);
            console.log(`✅ Successfully migrated and backed up: ${filename}`);
          }
        } catch (err) {
          console.error(`❌ Migration failed for file ${filename}:`, err);
        }
      }
    }
  });

  if (migratedCount > 0) {
    console.log(`🎉 Migration complete! Migrated ${migratedCount} collections to the encrypted SQLite database.`);
  } else {
    console.log('ℹ️ No migration needed (already migrated or no raw JSON files found).');
  }
}

module.exports = {
  initialize,
  dbRead,
  dbWrite
};

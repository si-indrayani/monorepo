const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const usersFile = path.join(DATA_DIR, 'users.json');

function loadUsers() {
  if (!fs.existsSync(usersFile)) return {};
  try { return JSON.parse(fs.readFileSync(usersFile, 'utf8')) } catch (e) { return {}; }
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Simple login: accepts { username } and returns a token (username-based)
router.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });

  const users = loadUsers();
  if (!users[username]) {
    users[username] = { username, createdAt: Date.now() };
    saveUsers(users);
  }

  // token is simple for demo
  const token = Buffer.from(username).toString('base64');
  res.json({ token, user: users[username] });
});

router.post('/logout', (req, res) => {
  // stateless demo logout
  res.json({ ok: true });
});

module.exports = router;

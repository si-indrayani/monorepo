const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const sessionsFile = path.join(DATA_DIR, 'sessions.json');

function loadSessions() {
  if (!fs.existsSync(sessionsFile)) return [];
  try { return JSON.parse(fs.readFileSync(sessionsFile, 'utf8')) } catch (e) { return []; }
}

function saveSessions(sessions) {
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
}

// Create or update a session
router.post('/', (req, res) => {
  const session = req.body;
  if (!session || !session.sessionId) return res.status(400).json({ error: 'sessionId required' });

  const sessions = loadSessions();
  const idx = sessions.findIndex(s => s.sessionId === session.sessionId);
  if (idx >= 0) {
    sessions[idx] = Object.assign({}, sessions[idx], session);
  } else {
    sessions.push(session);
  }
  saveSessions(sessions);
  res.json({ ok: true });
});

router.get('/:userId', (req, res) => {
  const userId = req.params.userId;
  const sessions = loadSessions().filter(s => s.playerId === userId || s.playerId === undefined);
  res.json(sessions);
});

module.exports = router;

export interface GameEvent {
  type: 'start'|'pause'|'resume'|'end'|'correct'|'incorrect'|'custom';
  timestamp: number;
  data?: any;
}

export interface GameSession {
  sessionId: string;
  gameId: string;
  tenantId?: string;
  playerId?: string;
  startTime: number;
  endTime?: number;
  status: 'active'|'completed'|'abandoned'|'paused';
  score: number;
  maxScore?: number;
  streak?: number;
  attempts?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  difficulty?: string;
  duration?: number;
  events: GameEvent[];
}

export class SessionManager {
  private currentSession: GameSession | null = null;
  private userId: string;

  constructor(userId: string = 'player_12345') {
    this.userId = userId;
    this.loadPersistedSession();
  }

  startSession(gameId: string, tenantId?: string, difficulty?: string) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
    this.currentSession = {
      sessionId,
      gameId,
      tenantId,
      playerId: this.userId,
      startTime: Date.now(),
      status: 'active',
      score: 0,
      maxScore: 0,
      streak: 0,
      attempts: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      difficulty,
      duration: 0,
      events: [{ type: 'start', timestamp: Date.now() }]
    };
    this.persistSession();
    return sessionId;
  }

  updateScore(points: number, isCorrect: boolean) {
    if (!this.currentSession) return;
    this.currentSession.score += points;
    this.currentSession.maxScore = Math.max(this.currentSession.maxScore || 0, this.currentSession.score);
    if (isCorrect) {
      this.currentSession.streak = (this.currentSession.streak || 0) + 1;
      this.currentSession.correctAnswers = (this.currentSession.correctAnswers || 0) + 1;
    } else {
      this.currentSession.streak = 0;
    }
    this.currentSession.attempts = (this.currentSession.attempts || 0) + 1;
    this.currentSession.events.push({ type: isCorrect ? 'correct' : 'incorrect', timestamp: Date.now(), data: { points } });
    this.persistSession();
  }

  pauseSession() {
    if (!this.currentSession) return;
    this.currentSession.status = 'paused';
    this.currentSession.events.push({ type: 'pause', timestamp: Date.now() });
    this.persistSession();
  }

  resumeSession() {
    if (!this.currentSession) return;
    this.currentSession.status = 'active';
    this.currentSession.events.push({ type: 'resume', timestamp: Date.now() });
    this.persistSession();
  }

  endSession(status: 'completed'|'abandoned' = 'completed') {
    if (!this.currentSession) return;
    this.currentSession.endTime = Date.now();
    this.currentSession.status = status;
    this.currentSession.duration = Math.floor((this.currentSession.endTime - this.currentSession.startTime) / 1000);
    this.currentSession.events.push({ type: 'end', timestamp: Date.now(), data: { finalStatus: status } });
    // send to server
    this.sendToServer();
    // save to history
    this.saveToHistory();
    this.currentSession = null;
  }

  getCurrentSession() { return this.currentSession; }

  getUserStats() {
    const history = this.loadHistory();
    const total = history.length;
    const completed = history.filter(h => h.status === 'completed').length;
    const abandoned = history.filter(h => h.status === 'abandoned').length;
    const paused = history.filter(h => h.status === 'paused').length;
    const totalScore = history.reduce((s, h) => s + (h.score || 0), 0);
    const avgScore = total ? totalScore / total : 0;
    const bestStreak = history.reduce((b, h) => Math.max(b, h.streak || 0), 0);
    const totalPlayTime = history.reduce((t, h) => t + (h.duration || 0), 0);
    return { total, completed, abandoned, paused, totalScore, avgScore, bestStreak, totalPlayTime, recent: history.slice(-5).reverse() };
  }

  // persistence
  private persistSession() {
    try { localStorage.setItem(`gaming_session_${this.userId}`, JSON.stringify(this.currentSession)); } catch (e) { /* ignore */ }
  }

  private loadPersistedSession() {
    try {
      const s = localStorage.getItem(`gaming_session_${this.userId}`);
      if (s) {
        const parsed = JSON.parse(s);
        // if too old, discard
        if (Date.now() - parsed.startTime < 24 * 60 * 60 * 1000) {
          this.currentSession = parsed;
        }
      }
    } catch (e) { /* ignore */ }
  }

  private saveToHistory() {
    try {
      const history = this.loadHistory();
      if (this.currentSession) history.push(this.currentSession);
      while (history.length > 200) history.shift();
      localStorage.setItem(`gaming_history_${this.userId}`, JSON.stringify(history));
    } catch (e) { /* ignore */ }
  }

  private loadHistory() {
    try { return JSON.parse(localStorage.getItem(`gaming_history_${this.userId}`) || '[]'); } catch (e) { return []; }
  }

  private async sendToServer() {
    if (!this.currentSession) return;
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentSession)
      });
    } catch (e) { console.warn('session send failed', e); }
  }
}

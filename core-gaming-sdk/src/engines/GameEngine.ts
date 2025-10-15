// 📍 Location: src/engines/GameEngine.ts
// 🎯 Purpose: Main game engine orchestrator for the entire gaming platform
// 🔗 Uses: Factory, all games, manages sessions, tournaments

import { 
  IGameEngine, 
  GameSession, 
  EngineConfig, 
  EngineMetrics, 
  EngineStatus, 
  HealthCheckResult,
  TournamentSession,
  EngineEventType
} from '../interfaces/IGameEngine';
import { IGame } from '../interfaces/IGame';
import { Player, PlayerAction, ActionResult } from '../interfaces/IPlayer';
import { GameConfig } from '../config/GameConfig';
import { UniversalGameFactory } from '../factories/UniversalGameFactory';

/**
 * 🎮 Master Game Engine
 * 
 * The central orchestrator that manages the entire gaming platform.
 * Handles sessions, players, tournaments, and all game operations.
 */
export class GameEngine implements IGameEngine {
  private config: EngineConfig = {
    maxConcurrentSessions: 100,
    sessionTimeout: 60,
    autoCleanup: true,
    persistSessions: false,
    logLevel: 'info',
    metricsEnabled: true,
    crashReporting: false,
  };
  private gameFactory: UniversalGameFactory;
  private sessions: Map<string, GameSession> = new Map();
  private tournaments: Map<string, TournamentSession> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private isRunning = false;
  private startTime: Date | null = null;
  private metrics: EngineMetrics;
  private healthChecks: Map<string, Function> = new Map();

  constructor(gameFactory?: UniversalGameFactory) {
    this.gameFactory = gameFactory || new UniversalGameFactory();
    this.metrics = this.initializeMetrics();
    this.setupBuiltInHealthChecks();
    
    console.log('🎮 Game Engine initialized');
  }

  /**
   * 🚀 Engine Lifecycle Management
   */
  async initialize(config: EngineConfig): Promise<void> {
    console.log('🔧 Initializing Game Engine...');
    
    this.config = {
      ...this.config,
      ...config
    };

    // Start cleanup timer if auto cleanup is enabled
    if (this.config.autoCleanup) {
      this.startCleanupTimer();
    }

    this.emit(EngineEventType.ENGINE_STARTED, { config: this.config });
    console.log('✅ Game Engine initialized successfully');
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Engine is already running');
      return;
    }

    console.log('🚀 Starting Game Engine...');
    this.isRunning = true;
    this.startTime = new Date();
    
    this.emit(EngineEventType.ENGINE_STARTED, { startTime: this.startTime });
    console.log('✅ Game Engine started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('⚠️ Engine is not running');
      return;
    }

    console.log('🛑 Stopping Game Engine...');
    
    // End all active sessions
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'active');
    for (const session of activeSessions) {
      try {
        await this.endGame(session.sessionId);
      } catch (error) {
        console.error(`Failed to end session ${session.sessionId}:`, error);
      }
    }

    this.isRunning = false;
    this.emit(EngineEventType.ENGINE_STOPPED, { stopTime: new Date() });
    console.log('✅ Game Engine stopped successfully');
  }

  async restart(): Promise<void> {
    console.log('🔄 Restarting Game Engine...');
    await this.stop();
    await this.start();
  }

  /**
   * 🎮 Session Management - The Core Functionality
   */
  async createGameSession(gameType: string, sessionId?: string, options: any = {}): Promise<GameSession> {
    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = `${gameType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check session limits
    if (this.sessions.size >= this.config.maxConcurrentSessions) {
      throw new Error(`Maximum concurrent sessions limit reached: ${this.config.maxConcurrentSessions}`);
    }

    // Check if session already exists
    if (this.sessions.has(sessionId)) {
      throw new Error(`Session already exists: ${sessionId}`);
    }

    console.log(`🎯 Creating game session: ${sessionId} (type: ${gameType})`);

    try {
      // 1. Create game instance using factory
      const game = await this.gameFactory.createGame(`${gameType}-${sessionId}`, options);
      
      // 2. Initialize the game
      await game.initialize();

      // 3. Create session object
      const session: GameSession = {
        sessionId,
        gameId: game.gameId,
        gameType,
        game,
        players: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'created',
        metadata: options.metadata || {}
      };

      // 4. Store session
      this.sessions.set(sessionId, session);

      // 5. Update metrics
      this.updateMetrics();

      // 6. Emit event
      this.emit(EngineEventType.SESSION_CREATED, { sessionId, gameType });

      console.log(`✅ Game session created successfully: ${sessionId}`);
      return session;

    } catch (error) {
      console.error(`❌ Failed to create session ${sessionId}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit(EngineEventType.SESSION_ERROR, { sessionId, error: errorMessage });
      throw error;
    }
  }

  getGameSession(sessionId: string): GameSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllSessions(): GameSession[] {
    return Array.from(this.sessions.values());
  }

  async destroyGameSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    console.log(`🗑️ Destroying game session: ${sessionId}`);

    try {
      // End the game if it's still running
      if (session.status === 'active') {
        await session.game.end();
      }

      // Remove session
      this.sessions.delete(sessionId);
      
      // Update metrics
      this.updateMetrics();

      console.log(`✅ Session destroyed: ${sessionId}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to destroy session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * 🎮 Universal Game Operations
   */
  async startGame(sessionId: string): Promise<void> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'created') {
      throw new Error(`Cannot start game in ${session.status} state`);
    }

    console.log(`🚀 Starting game in session: ${sessionId}`);

    try {
      await session.game.start();
      session.status = 'active';
      session.updatedAt = new Date();
      
      this.emit(EngineEventType.SESSION_STARTED, { sessionId });
      console.log(`✅ Game started in session: ${sessionId}`);

    } catch (error) {
      session.status = 'error';
      console.error(`❌ Failed to start game in session ${sessionId}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit(EngineEventType.SESSION_ERROR, { sessionId, error: errorMessage });
      throw error;
    }
  }

  async pauseGame(sessionId: string): Promise<void> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'active') {
      throw new Error(`Cannot pause game in ${session.status} state`);
    }

    session.game.pause();
    session.status = 'paused';
    session.updatedAt = new Date();
    
    console.log(`⏸️ Game paused in session: ${sessionId}`);
  }

  async resumeGame(sessionId: string): Promise<void> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'paused') {
      throw new Error(`Cannot resume game in ${session.status} state`);
    }

    session.game.resume();
    session.status = 'active';
    session.updatedAt = new Date();
    
    console.log(`▶️ Game resumed in session: ${sessionId}`);
  }

  async endGame(sessionId: string): Promise<void> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    console.log(`🏁 Ending game in session: ${sessionId}`);

    try {
      await session.game.end();
      session.status = 'completed';
      session.updatedAt = new Date();
      
      this.emit(EngineEventType.SESSION_ENDED, { sessionId });
      console.log(`✅ Game ended in session: ${sessionId}`);

    } catch (error) {
      session.status = 'error';
      console.error(`❌ Failed to end game in session ${sessionId}:`, error);
      this.emit(EngineEventType.SESSION_ERROR, { sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * 👥 Player Management
   */
  async addPlayerToSession(sessionId: string, player: Player): Promise<boolean> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    console.log(`👤 Adding player ${player.id} to session: ${sessionId}`);

    const success = session.game.addPlayer(player);
    if (success) {
      session.players.push(player);
      session.updatedAt = new Date();
      
      this.emit(EngineEventType.PLAYER_JOINED, { sessionId, playerId: player.id });
      console.log(`✅ Player ${player.id} added to session: ${sessionId}`);
    }

    return success;
  }

  async removePlayerFromSession(sessionId: string, playerId: string): Promise<boolean> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    console.log(`👤 Removing player ${playerId} from session: ${sessionId}`);

    const gameSuccess = session.game.removePlayer(playerId);
    if (gameSuccess) {
      session.players = session.players.filter(p => p.id !== playerId);
      session.updatedAt = new Date();
      
      this.emit(EngineEventType.PLAYER_LEFT, { sessionId, playerId });
      console.log(`✅ Player ${playerId} removed from session: ${sessionId}`);
    }

    return gameSuccess;
  }

  async movePlayerBetweenSessions(playerId: string, fromSession: string, toSession: string): Promise<boolean> {
    const fromSessionObj = this.getGameSession(fromSession);
    const toSessionObj = this.getGameSession(toSession);

    if (!fromSessionObj || !toSessionObj) {
      throw new Error('One or both sessions not found');
    }

    // Find player in source session
    const player = fromSessionObj.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found in session ${fromSession}`);
    }

    // Remove from source and add to target
    const removed = await this.removePlayerFromSession(fromSession, playerId);
    if (removed) {
      const added = await this.addPlayerToSession(toSession, player);
      if (!added) {
        // Rollback - add back to original session
        await this.addPlayerToSession(fromSession, player);
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * 🎯 Action Processing - The Heart of Gameplay
   */
  async processPlayerAction(sessionId: string, action: PlayerAction): Promise<ActionResult> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== 'active') {
      throw new Error(`Cannot process actions in ${session.status} session`);
    }

    console.log(`🎯 Processing action ${action.actionType} for player ${action.playerId} in session: ${sessionId}`);

    try {
      const result = await session.game.handlePlayerAction(action);
      session.updatedAt = new Date();
      
      this.emit(EngineEventType.PLAYER_ACTION, { sessionId, action, result });
      
      // Emit game state change if applicable
      if (result.gameStateChanged) {
        this.emit(EngineEventType.GAME_STATE_CHANGED, { 
          sessionId, 
          newState: session.game.getState() 
        });
      }

      // Emit score update if applicable
      if (result.scoreChange) {
        this.emit(EngineEventType.GAME_SCORE_UPDATED, { 
          sessionId, 
          playerId: action.playerId, 
          scoreChange: result.scoreChange,
          newScore: result.newScore
        });
      }

      return result;

    } catch (error) {
      console.error(`❌ Failed to process action in session ${sessionId}:`, error);
      this.emit(EngineEventType.SESSION_ERROR, { sessionId, error: error.message });
      throw error;
    }
  }

  async broadcastToSession(sessionId: string, event: string, data: any): Promise<void> {
    const session = this.getGameSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Broadcast to all players in the session
    session.game.emit(event, { sessionId, ...data });
    console.log(`📡 Broadcasted ${event} to session: ${sessionId}`);
  }

  async broadcastToAllSessions(event: string, data: any): Promise<void> {
    const sessionArray = Array.from(this.sessions.values());
    for (const session of sessionArray) {
      try {
        await this.broadcastToSession(session.sessionId, event, data);
      } catch (error) {
        console.error(`Failed to broadcast to session ${session.sessionId}:`, error);
      }
    }
    console.log(`📡 Broadcasted ${event} to all ${this.sessions.size} sessions`);
  }

  /**
   * 🔍 Game Discovery and Management
   */
  async getAvailableGameTypes(): Promise<string[]> {
    const discoveryResults = await this.gameFactory.getAvailableGames();
    const uniqueGameTypes = new Set(discoveryResults.map(result => result.gameType));
    return Array.from(uniqueGameTypes);
  }

  async getGameConfig(gameType: string): Promise<GameConfig | null> {
    try {
      // For now, return null - in a real implementation this would 
      // access the GameConfigManager directly
      console.log(`Getting config for game type: ${gameType}`);
      return null;
    } catch (error) {
      console.error(`Failed to get config for game type ${gameType}:`, error);
      return null;
    }
  }

  registerGameType(gameType: string, gameClass: any): void {
    this.gameFactory.registerGameType(gameType, gameClass);
    console.log(`📋 Registered game type: ${gameType}`);
  }

  unregisterGameType(gameType: string): void {
    this.gameFactory.unregisterGameType(gameType);
    console.log(`🗑️ Unregistered game type: ${gameType}`);
  }

  /**
   * 📊 Monitoring and Health
   */
  getEngineMetrics(): EngineMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  getEngineStatus(): EngineStatus {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    
    return {
      isRunning: this.isRunning,
      uptime,
      version: '1.0.0',
      activeSessions: this.sessions.size,
      totalPlayers: this.getTotalPlayerCount(),
      memoryUsage: this.getMemoryUsage(),
      lastError: null // TODO: Implement error tracking
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const checks = [];
    const startTime = Date.now();

    // Run all registered health checks
    const healthCheckEntries = Array.from(this.healthChecks.entries());
    for (const [name, checkFn] of healthCheckEntries) {
      const checkStart = Date.now();
      try {
        const result = await checkFn();
        checks.push({
          name,
          status: result ? 'pass' : 'fail',
          duration: Date.now() - checkStart
        });
      } catch (error) {
        checks.push({
          name,
          status: 'fail',
          message: error.message,
          duration: Date.now() - checkStart
        });
      }
    }

    const failedChecks = checks.filter(c => c.status === 'fail').length;
    const warnChecks = checks.filter(c => c.status === 'warn').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks === 0) {
      overallStatus = warnChecks > 0 ? 'degraded' : 'healthy';
    } else {
      overallStatus = 'unhealthy';
    }

    const result: HealthCheckResult = {
      healthy: overallStatus === 'healthy',
      timestamp: new Date(),
      checks,
      overallStatus
    };

    this.emit(EngineEventType.HEALTH_CHECK_COMPLETED, result);
    return result;
  }

  /**
   * 🎉 Event System
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
    } else {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  /**
   * 💾 Persistence
   */
  async saveEngineState(): Promise<string> {
    const state = {
      config: this.config,
      sessions: Array.from(this.sessions.entries()).map(([id, session]) => ({
        id,
        sessionData: {
          sessionId: session.sessionId,
          gameId: session.gameId,
          gameType: session.gameType,
          players: session.players,
          status: session.status,
          metadata: session.metadata,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          gameState: session.game.serialize()
        }
      })),
      metrics: this.metrics,
      isRunning: this.isRunning,
      startTime: this.startTime
    };

    return JSON.stringify(state);
  }

  async loadEngineState(data: string): Promise<void> {
    try {
      const state = JSON.parse(data);
      
      // Restore basic state
      this.config = state.config;
      this.metrics = state.metrics;
      this.isRunning = state.isRunning;
      this.startTime = state.startTime ? new Date(state.startTime) : null;

      // Restore sessions (this is complex and might need game-specific logic)
      console.log('⚠️ Session restoration not fully implemented yet');
      
    } catch (error) {
      console.error('Failed to load engine state:', error);
      throw error;
    }
  }

  /**
   * 🏆 Tournament Support (Advanced Feature)
   */
  async createTournament(gameType: string, players: Player[], config: any = {}): Promise<string> {
    const tournamentId = `tournament-${gameType}-${Date.now()}`;
    
    console.log(`🏆 Creating tournament: ${tournamentId} with ${players.length} players`);
    
    // TODO: Implement full tournament logic
    const tournament: TournamentSession = {
      tournamentId,
      gameType,
      players,
      status: 'created',
      rounds: [],
      createdAt: new Date(),
      config
    };

    this.tournaments.set(tournamentId, tournament);
    console.log(`✅ Tournament created: ${tournamentId}`);
    
    return tournamentId;
  }

  async getActiveTournaments(): Promise<TournamentSession[]> {
    return Array.from(this.tournaments.values()).filter(t => 
      t.status === 'active' || t.status === 'created'
    );
  }

  async scheduleGameSession(gameType: string, scheduledTime: Date, options: any = {}): Promise<string> {
    // TODO: Implement scheduling logic
    const sessionId = `scheduled-${gameType}-${scheduledTime.getTime()}`;
    console.log(`📅 Scheduled session ${sessionId} for ${scheduledTime}`);
    return sessionId;
  }

  /**
   * 🔧 Private Helper Methods
   */
  private initializeMetrics(): EngineMetrics {
    return {
      activeSessions: 0,
      totalSessionsCreated: 0,
      totalPlayersActive: 0,
      averageSessionDuration: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      lastUpdated: new Date()
    };
  }

  private updateMetrics(): void {
    this.metrics.activeSessions = this.sessions.size;
    this.metrics.totalPlayersActive = this.getTotalPlayerCount();
    this.metrics.memoryUsage = this.getMemoryUsage().used;
    this.metrics.lastUpdated = new Date();
    
    if (this.config.metricsEnabled) {
      this.emit(EngineEventType.METRICS_UPDATED, this.metrics);
    }
  }

  private getTotalPlayerCount(): number {
    return Array.from(this.sessions.values()).reduce((total, session) => 
      total + session.players.length, 0
    );
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    // In a real implementation, this would use process.memoryUsage()
    return {
      used: 50 * 1024 * 1024, // 50MB (mock)
      total: 512 * 1024 * 1024, // 512MB (mock)
      percentage: 9.76 // mock
    };
  }

  private setupBuiltInHealthChecks(): void {
    // Engine health check
    this.healthChecks.set('engine-status', async () => {
      return this.isRunning;
    });

    // Memory health check
    this.healthChecks.set('memory-usage', async () => {
      const memory = this.getMemoryUsage();
      return memory.percentage < 90; // Fail if over 90% memory usage
    });

    // Session health check
    this.healthChecks.set('session-count', async () => {
      return this.sessions.size < this.config.maxConcurrentSessions;
    });
  }

  private startCleanupTimer(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000);
  }

  private performCleanup(): void {
    const now = Date.now();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;
    
    let cleanedCount = 0;
    const sessionEntries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of sessionEntries) {
      const sessionAge = now - session.updatedAt.getTime();
      
      if (sessionAge > timeoutMs && (session.status === 'completed' || session.status === 'error')) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
      this.emit(EngineEventType.CLEANUP_COMPLETED, { cleanedSessions: cleanedCount });
    }
  }
}

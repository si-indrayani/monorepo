import { IGame, GameState, GameStateEnum, GameMetadata } from './interfaces/IGame';
import { GameConfig } from './config/GameConfig';
import { Player, PlayerAction, ActionResult } from './interfaces/IPlayer';

export class BaseGame implements IGame {
  public gameId: string;
  protected config: GameConfig;
  protected eventListeners: Map<string, Function[]> = new Map();
  protected state: any;
  protected gameState: GameState;
  protected players: Player[] = [];

  constructor(gameId: string, config: GameConfig, initialState: any) {
    this.gameId = gameId;
    this.config = config;
    this.state = initialState;
    this.gameState = {
      status: GameStateEnum.IDLE,
      gameData: this.state
    };
  }

  async initialize(): Promise<void> {
    // To be implemented by child class if needed
    this.emit('initialized', this.state);
  }

  async start(): Promise<void> {
    this.state.isStarted = true;
    this.gameState.status = GameStateEnum.RUNNING;
    this.gameState.startTime = new Date();
    // Send game_play_start event to backend
    try {
      await fetch('http://localhost:4000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: this.config?.customConfig?.tenant_id || 'TENANT_ID',
          player_id: this.players[0]?.id || 'player-test-001',
          event_type: 'game_play_start',
          occurred_at: new Date().toISOString(),
          session_id: this.gameId || 'session-test-123',
          app_version: '1.0.0',
          locale: 'en_US',
          region: 'NA',
          consent_state: 'granted',
          schema_version: '1.0',
          event_data: {
            game_id: this.gameId || 'GAME_ID',
            game_title: this.config?.metadata?.title || 'Test Game',
          },
        }),
      });
    } catch (err) {
      console.error('Failed to send game_play_start event:', err);
    }
    this.emit('game:started', this.state);
  }

  async end(): Promise<void> {
    this.gameState.status = GameStateEnum.ENDED;
    this.gameState.endTime = new Date();
    this.emit('game:ended', {
      correctCount: this.state.score?.correct,
      wrongCount: this.state.score?.wrong
    });
  }

  pause(): void {
    this.gameState.status = GameStateEnum.PAUSED;
    this.emit('game:paused', this.state);
  }

  resume(): void {
    this.gameState.status = GameStateEnum.RUNNING;
    this.emit('game:resumed', this.state);
  }

  getScore(): number {
    return this.state.score?.correct || 0;
  }

  getState(): GameState {
    this.gameState.gameData = this.state;
    return this.gameState;
  }

  getMetadata(): GameMetadata {
    return this.config.metadata;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  addPlayer(player: Player): boolean {
    this.players.push(player);
    return true;
  }

  removePlayer(playerId: string): boolean {
    const index = this.players.findIndex(p => p.id === playerId);
    if (index >= 0) {
      this.players.splice(index, 1);
      return true;
    }
    return false;
  }

  validateAction(action: PlayerAction): boolean {
    return action && typeof action === 'object';
  }

  canStart(): boolean {
    return this.state.questions && this.state.questions.length > 0;
  }

  async serialize(): Promise<string> {
    return JSON.stringify({
      gameId: this.gameId,
      state: this.state,
      gameState: this.gameState
    });
  }

  async deserialize(data: string): Promise<void> {
    const parsed = JSON.parse(data);
    this.state = parsed.state;
    this.gameState = parsed.gameState;
  }

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
    } else {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  async handlePlayerAction(action: PlayerAction): Promise<ActionResult> {
    return {
      success: true,
      actionId: action.actionId,
      result: { processed: true },
      processedAt: new Date()
    };
  }
}

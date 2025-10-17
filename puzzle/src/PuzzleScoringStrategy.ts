// 🎯 Puzzle Game Scoring Strategy
// Extends BaseScoringStrategy from core-gaming-sdk (via window)

declare global {
  interface Window {
    CoreGaming: any;
  }
}

const { BaseScoringStrategy } = window.CoreGaming;

/**
 * 📋 Scoring Context Interface
 */
interface ScoringContext {
  playerId?: string;
  playerLevel?: number;
  playerStats?: any;
  gameState?: any;
  gameTime?: number;
  currentRound?: number;
  difficulty?: string;
  previousActions?: string[];
  consecutiveActions?: number;
  actionSpeed?: number;
  timeRemaining?: number;
  maxTime?: number;
  accuracy?: number;
  streak?: number;
  bonusActive?: boolean;
  penaltyActive?: boolean;
  multiplierActive?: number;
  custom?: Record<string, any>;
}

/**
 * 🧩 Puzzle Game Scoring Strategy
 *
 * Specialized scoring for puzzle games like mazes, jigsaw, etc.
 */
export class PuzzleScoringStrategy extends BaseScoringStrategy {
  constructor() {
    super();

    // Default puzzle scoring rules
    this.scoringRules = {
      complete_puzzle: 100,
      time_bonus: 10,
      hint_used: -5,
      restart_penalty: -10,
      perfect_completion: 50,
      speed_bonus: 20
    };

    this.bonusMultipliers = {
      difficulty_bonus: 1.5,
      first_attempt: 1.2,
      no_hints: 1.3
    };

    this.penaltyRules = {
      time_penalty: 2,
      multiple_attempts: 5
    };
  }

  calculateScore(action: string, context: ScoringContext = {}): number {
    let baseScore = this.scoringRules[action] || 0;

    // Special handling for puzzle actions
    switch (action) {
      case 'complete_puzzle':
        baseScore = this.calculatePuzzleCompletionScore(context);
        break;

      case 'time_bonus':
        baseScore = this.calculatePuzzleTimeBonus(context);
        break;

      case 'speed_bonus':
        baseScore = this.calculatePuzzleSpeedBonus(context);
        break;
    }

    return Math.max(0, Math.floor(baseScore));
  }

  private calculatePuzzleCompletionScore(context: ScoringContext): number {
    let score = this.scoringRules.complete_puzzle;

    // Apply difficulty bonus
    if (context.difficulty === 'hard') {
      score = this.applyMultiplier(score, 'difficulty_bonus');
    }

    // Apply first attempt bonus
    if (context.custom?.attemptNumber === 1) {
      score = this.applyMultiplier(score, 'first_attempt');
    }

    // Apply no hints bonus
    if (context.custom?.hintsUsed === 0) {
      score = this.applyMultiplier(score, 'no_hints');
    }

    // Apply perfect completion bonus (no restarts, no hints)
    if (context.custom?.attemptNumber === 1 && context.custom?.hintsUsed === 0) {
      score += this.scoringRules.perfect_completion;
    }

    return score;
  }

  private calculatePuzzleTimeBonus(context: ScoringContext): number {
    if (!context.timeRemaining || !context.maxTime) return 0;

    // Time bonus for completing quickly
    const timeRatio = context.timeRemaining / context.maxTime;
    if (timeRatio > 0.5) { // Completed in less than half the time
      return this.scoringRules.time_bonus;
    }

    return 0;
  }

  private calculatePuzzleSpeedBonus(context: ScoringContext): number {
    if (!context.actionSpeed) return 0;

    // Speed bonus based on how quickly the puzzle was solved
    const speedScore = Math.max(0, 60 - context.actionSpeed); // Assuming actionSpeed in seconds
    return Math.floor(speedScore * 0.5);
  }
}

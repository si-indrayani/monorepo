// 📍 Location: src/strategies/ScoringStrategy.ts
// 🎯 Purpose: Handles ALL scoring logic for ALL games using Strategy Pattern
// 🔗 Used by: All game implementations

/**
 * 🎪 Strategy Pattern Base Class
 * 
 * This is the foundation for all scoring strategies. Every game can have
 * its own scoring logic while maintaining a consistent interface.
 */
export abstract class BaseScoringStrategy {
  protected scoringRules: Record<string, number> = {};
  protected bonusMultipliers: Record<string, number> = {};
  protected penaltyRules: Record<string, number> = {};

  /**
   * ⭐ Universal Scoring Method - Must be implemented by all strategies
   * 
   * @param action - The action being scored (e.g., 'correct_answer', 'goal', 'six')
   * @param context - Additional context for scoring decisions
   * @returns The calculated score for this action
   */
  abstract calculateScore(action: string, context?: ScoringContext): number;

  /**
   * 🔄 Dynamic Rule Updates (from GameConfigManager)
   */
  updateScoringRules(newRules: Record<string, number>): void {
    this.scoringRules = { ...this.scoringRules, ...newRules };
  }

  updateScoringRule(ruleKey: string, value: number): void {
    this.scoringRules[ruleKey] = value;
  }

  updateBonusMultipliers(multipliers: Record<string, number>): void {
    this.bonusMultipliers = { ...this.bonusMultipliers, ...multipliers };
  }

  updatePenaltyRules(penalties: Record<string, number>): void {
    this.penaltyRules = { ...this.penaltyRules, ...penalties };
  }

  /**
   * 📊 Scoring Analysis Methods
   */
  getAvailableActions(): string[] {
    return Object.keys(this.scoringRules);
  }

  getActionScore(action: string): number {
    return this.scoringRules[action] || 0;
  }

  getScoringRules(): Record<string, number> {
    return { ...this.scoringRules };
  }

  /**
   * 🎯 Helper Methods for Complex Scoring
   */
  protected applyMultiplier(baseScore: number, multiplierKey: string): number {
    const multiplier = this.bonusMultipliers[multiplierKey] || 1;
    return baseScore * multiplier;
  }

  protected applyPenalty(baseScore: number, penaltyKey: string): number {
    const penalty = this.penaltyRules[penaltyKey] || 0;
    return Math.max(0, baseScore - penalty);
  }

  protected calculateTimeBonus(timeRemaining: number, maxTime: number, bonusRate: number = 0.1): number {
    if (timeRemaining <= 0 || maxTime <= 0) return 0;
    const timeRatio = timeRemaining / maxTime;
    return Math.floor(timeRatio * bonusRate * 100);
  }

  protected calculateStreakBonus(streakCount: number, streakMultiplier: number = 1.1): number {
    if (streakCount <= 1) return 0;
    return Math.floor((streakCount - 1) * streakMultiplier);
  }
}

/**
 * 📋 Scoring Context Interface
 * 
 * Provides context information for scoring decisions
 */
export interface ScoringContext {
  // Player context
  playerId?: string;
  playerLevel?: number;
  playerStats?: any;

  // Game context
  gameState?: any;
  gameTime?: number;
  currentRound?: number;
  difficulty?: string;

  // Action context
  previousActions?: string[];
  consecutiveActions?: number;
  actionSpeed?: number; // time taken for action in seconds
  
  // Timing context
  timeRemaining?: number;
  maxTime?: number;
  
  // Performance context
  accuracy?: number;
  streak?: number;
  
  // Bonus/Penalty modifiers
  bonusActive?: boolean;
  penaltyActive?: boolean;
  multiplierActive?: number;

  // Custom context (game-specific)
  custom?: Record<string, any>;
}

/**
 * 🧠 Quiz Game Scoring Strategy
 * 
 * Specialized scoring for quiz games with knowledge-based scoring
 */
export class QuizScoringStrategy extends BaseScoringStrategy {
  constructor() {
    super();
    
    // Default quiz scoring rules
    this.scoringRules = {
      correct_answer: 10,
      wrong_answer: 0,
      skip_question: 0,
      hint_used: -2,
      time_bonus: 5,
      streak_bonus: 2
    };

    this.bonusMultipliers = {
      speed_bonus: 1.5,
      streak_multiplier: 1.2,
      difficulty_bonus: 1.3
    };

    this.penaltyRules = {
      time_penalty: 1,
      multiple_attempts: 2
    };
  }

  calculateScore(action: string, context: ScoringContext = {}): number {
    let baseScore = this.scoringRules[action] || 0;

    // Special handling for quiz actions
    switch (action) {
      case 'correct_answer':
        baseScore = this.calculateCorrectAnswerScore(context);
        break;
        
      case 'wrong_answer':
        baseScore = this.calculateWrongAnswerScore(context);
        break;
        
      case 'time_bonus':
        baseScore = this.calculateQuizTimeBonus(context);
        break;
        
      case 'streak_bonus':
        baseScore = this.calculateQuizStreakBonus(context);
        break;
    }

    return Math.max(0, Math.floor(baseScore));
  }

  private calculateCorrectAnswerScore(context: ScoringContext): number {
    let score = this.scoringRules.correct_answer;

    // Apply difficulty bonus
    if (context.difficulty === 'hard') {
      score = this.applyMultiplier(score, 'difficulty_bonus');
    }

    // Apply time bonus for quick answers
    if (context.timeRemaining && context.maxTime) {
      const timeBonus = this.calculateTimeBonus(context.timeRemaining, context.maxTime, 0.2);
      score += timeBonus;
    }

    // Apply streak bonus
    if (context.streak && context.streak > 1) {
      const streakBonus = this.calculateStreakBonus(context.streak, 1.1);
      score += streakBonus;
    }

    return score;
  }

  private calculateWrongAnswerScore(context: ScoringContext): number {
    let score = this.scoringRules.wrong_answer;

    // No penalty for first attempt on hard questions
    if (context.difficulty === 'hard' && !context.custom?.previousAttempts) {
      return score;
    }

    // Apply penalty for multiple wrong attempts
    if (context.custom?.previousAttempts && context.custom.previousAttempts > 1) {
      score = this.applyPenalty(score, 'multiple_attempts');
    }

    return score;
  }

  private calculateQuizTimeBonus(context: ScoringContext): number {
    if (!context.timeRemaining || !context.maxTime) return 0;
    
    // More generous time bonus for quiz games
    return this.calculateTimeBonus(context.timeRemaining, context.maxTime, 0.3);
  }

  private calculateQuizStreakBonus(context: ScoringContext): number {
    if (!context.streak || context.streak <= 1) return 0;
    
    // Progressive streak bonus for quiz games
    const baseBonus = this.scoringRules.streak_bonus;
    return baseBonus * (context.streak - 1);
  }
}

/**
 * 🏏 Cricket Game Scoring Strategy
 * 
 * Specialized scoring for cricket games with sports-specific logic
 */
export class CricketScoringStrategy extends BaseScoringStrategy {
  constructor() {
    super();
    
    // Default cricket scoring rules
    this.scoringRules = {
      run: 1,
      boundary: 4,
      six: 6,
      wicket: 10,
      maiden_over: 5,
      century: 50,
      half_century: 25,
      duck: -5,
      run_out: 15
    };

    this.bonusMultipliers = {
      power_play: 1.5,
      death_overs: 1.3,
      pressure_situation: 1.2
    };

    this.penaltyRules = {
      wide: 1,
      no_ball: 1,
      bye: 0.5
    };
  }

  calculateScore(action: string, context: ScoringContext = {}): number {
    let baseScore = this.scoringRules[action] || 0;

    // Special handling for cricket actions
    switch (action) {
      case 'century':
        // Only award century bonus if player actually scored 100+ runs
        if (context.custom?.runs >= 100) {
          baseScore = this.scoringRules.century;
        } else {
          baseScore = 0;
        }
        break;
        
      case 'half_century':
        // Only award fifty bonus if player scored 50+ runs (but less than 100)
        if (context.custom?.runs >= 50 && context.custom?.runs < 100) {
          baseScore = this.scoringRules.half_century;
        } else {
          baseScore = 0;
        }
        break;

      case 'six':
      case 'boundary':
        // Apply power play multiplier if in power play overs
        if (context.custom?.isPowerPlay) {
          baseScore = this.applyMultiplier(baseScore, 'power_play');
        }
        
        // Apply death overs multiplier if in last 5 overs
        if (context.custom?.isDeathOvers) {
          baseScore = this.applyMultiplier(baseScore, 'death_overs');
        }
        break;

      case 'wicket':
        // Bonus for wickets in pressure situations
        if (context.custom?.isPressureSituation) {
          baseScore = this.applyMultiplier(baseScore, 'pressure_situation');
        }
        break;
    }

    return Math.max(0, Math.floor(baseScore));
  }
}

/**
 * ⚽ Football Game Scoring Strategy
 * 
 * Specialized scoring for football games with match dynamics
 */
export class FootballScoringStrategy extends BaseScoringStrategy {
  constructor() {
    super();
    
    // Default football scoring rules
    this.scoringRules = {
      goal: 10,
      assist: 5,
      save: 3,
      tackle: 2,
      pass: 1,
      yellow_card: -3,
      red_card: -10,
      penalty_goal: 8,
      free_kick_goal: 12,
      header_goal: 11,
      clean_sheet: 5
    };

    this.bonusMultipliers = {
      injury_time: 1.5,
      derby_match: 1.3,
      final_match: 1.4
    };

    this.penaltyRules = {
      own_goal: 5,
      missed_penalty: 3,
      offside: 1
    };
  }

  calculateScore(action: string, context: ScoringContext = {}): number {
    let baseScore = this.scoringRules[action] || 0;

    // Special handling for football actions
    switch (action) {
      case 'goal':
      case 'penalty_goal':
      case 'free_kick_goal':
      case 'header_goal':
        // Apply injury time bonus
        if (context.custom?.isInjuryTime) {
          baseScore = this.applyMultiplier(baseScore, 'injury_time');
        }
        
        // Apply match importance bonus
        if (context.custom?.isDerby) {
          baseScore = this.applyMultiplier(baseScore, 'derby_match');
        }
        
        if (context.custom?.isFinal) {
          baseScore = this.applyMultiplier(baseScore, 'final_match');
        }
        break;

      case 'clean_sheet':
        // Only award clean sheet if goalkeeper played full match
        if (context.custom?.position === 'goalkeeper' && context.custom?.minutesPlayed >= 90) {
          baseScore = this.scoringRules.clean_sheet;
        } else {
          baseScore = 0;
        }
        break;
    }

    return Math.max(0, Math.floor(baseScore));
  }
}

/**
 * 🎮 Generic Game Scoring Strategy
 * 
 * Universal scoring strategy for unknown or custom games
 */
export class GenericScoringStrategy extends BaseScoringStrategy {
  constructor(customRules: Record<string, number> = {}) {
    super();
    
    // Default generic scoring rules
    this.scoringRules = {
      action: 1,
      correct: 10,
      incorrect: 0,
      bonus: 5,
      penalty: -2,
      ...customRules
    };

    this.bonusMultipliers = {
      speed: 1.2,
      accuracy: 1.3,
      difficulty: 1.1
    };

    this.penaltyRules = {
      timeout: 1,
      invalid_action: 2
    };
  }

  calculateScore(action: string, context: ScoringContext = {}): number {
    let baseScore = this.scoringRules[action] || this.scoringRules.action || 1;

    // Apply generic modifiers
    if (context.bonusActive) {
      baseScore = this.applyMultiplier(baseScore, 'speed');
    }

    if (context.accuracy && context.accuracy > 0.8) {
      baseScore = this.applyMultiplier(baseScore, 'accuracy');
    }

    if (context.penaltyActive) {
      baseScore = this.applyPenalty(baseScore, 'timeout');
    }

    return Math.max(0, Math.floor(baseScore));
  }
}

/**
 * 🏭 Scoring Strategy Factory
 * 
 * Creates appropriate scoring strategies for different game types
 */
export class ScoringStrategyFactory {
  private static strategies: Map<string, new () => BaseScoringStrategy> = new Map();

  static {
    // Register built-in strategies
    this.strategies.set('quiz', QuizScoringStrategy);
    this.strategies.set('cricket', CricketScoringStrategy);
    this.strategies.set('football', FootballScoringStrategy);
  }

  /**
   * Create a scoring strategy for a specific game type
   */
  static createStrategy(gameType: string, customRules?: Record<string, number>): BaseScoringStrategy {
    const StrategyClass = this.strategies.get(gameType);
    
    if (StrategyClass) {
      return new StrategyClass();
    }
    
    // Default to generic strategy with custom rules
    return new GenericScoringStrategy(customRules);
  }

  /**
   * Register a new scoring strategy
   */
  static registerStrategy(gameType: string, strategyClass: new () => BaseScoringStrategy): void {
    this.strategies.set(gameType, strategyClass);
  }

  /**
   * Get all available strategy types
   */
  static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

/**
 * 📊 Scoring Analytics
 * 
 * Provides analytics and insights about scoring patterns
 */
export class ScoringAnalytics {
  private scoreHistory: Array<{
    action: string;
    score: number;
    context: ScoringContext;
    timestamp: Date;
  }> = [];

  recordScore(action: string, score: number, context: ScoringContext): void {
    this.scoreHistory.push({
      action,
      score,
      context,
      timestamp: new Date()
    });
  }

  getTotalScore(): number {
    return this.scoreHistory.reduce((sum, entry) => sum + entry.score, 0);
  }

  getAverageScore(): number {
    if (this.scoreHistory.length === 0) return 0;
    return this.getTotalScore() / this.scoreHistory.length;
  }

  getActionStats(): Record<string, { count: number; totalScore: number; avgScore: number }> {
    const stats: Record<string, { count: number; totalScore: number; avgScore: number }> = {};

    this.scoreHistory.forEach(entry => {
      if (!stats[entry.action]) {
        stats[entry.action] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      
      stats[entry.action].count++;
      stats[entry.action].totalScore += entry.score;
      stats[entry.action].avgScore = stats[entry.action].totalScore / stats[entry.action].count;
    });

    return stats;
  }

  getBestAction(): { action: string; score: number } | null {
    if (this.scoreHistory.length === 0) return null;
    
    const best = this.scoreHistory.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return { action: best.action, score: best.score };
  }

  getScoreHistory(): Array<{ action: string; score: number; timestamp: Date }> {
    return this.scoreHistory.map(entry => ({
      action: entry.action,
      score: entry.score,
      timestamp: entry.timestamp
    }));
  }

  clear(): void {
    this.scoreHistory = [];
  }
}

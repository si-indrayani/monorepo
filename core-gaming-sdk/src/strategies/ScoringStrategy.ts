// 📍 Location: src/strategies/ScoringStrategy.ts
// 🎯 Purpose: Base scoring strategy for all games
// 🔗 Used by: Game implementations to extend and create their own scoring logic

/**
 * 🎪 Strategy Pattern Base Class
 *
 * This is the foundation for all scoring strategies. Every game can extend this
 * class to implement their own scoring logic while maintaining a consistent interface.
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

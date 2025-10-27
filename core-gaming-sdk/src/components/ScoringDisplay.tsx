// 📍 Location: src/components/ScoringDisplay.ts
// 🎯 Purpose: Utility class for generating scoring display HTML/data
// 🔗 Used by: Game implementations to show scoring breakdowns

export interface ScoringBreakdown {
  // Base scoring
  baseScore?: number;
  correctAnswers?: number;
  wrongAnswers?: number;

  // Bonuses
  timeBonus?: number;
  timeBonuses?: number;
  speedBonus?: number;
  streakBonus?: number;
  streakBonuses?: number;

  // Multipliers and penalties
  multipliers?: string[];
  penalties?: string[];

  // Streaks
  currentStreak?: number;
  maxStreak?: number;

  // Total
  totalScore: number;
}

export class ScoringDisplay {
  private gameType: 'puzzle' | 'trivia';

  constructor(gameType: 'puzzle' | 'trivia') {
    this.gameType = gameType;
  }

  private getGameIcon(): string {
    return this.gameType === 'puzzle' ? '🧩' : '🧠';
  }

  private getPrimaryColor(): string {
    return this.gameType === 'puzzle' ? '#4CAF50' : '#2196F3';
  }

  private getSecondaryColor(): string {
    return this.gameType === 'puzzle' ? '#2E7D32' : '#0D47A1';
  }

  /**
   * Generate HTML string for scoring display
   */
  generateHTML(breakdown: ScoringBreakdown, showLiveStats: boolean = false): string {
    const icon = this.getGameIcon();
    const primaryColor = this.getPrimaryColor();
    const secondaryColor = this.getSecondaryColor();

    let html = `
      <div class="scoring-display" style="
        background: rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.1);
        border: 1px solid ${primaryColor};
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        font-size: 14px;
      ">
        <h4 style="margin: 0 0 12px 0; color: ${secondaryColor};">
          ${icon} ${showLiveStats ? 'Live Score Breakdown' : 'Score Breakdown'}:
        </h4>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">`;

    // Base Scores
    if (breakdown.baseScore !== undefined) {
      html += `<div>🏆 Base Score: <strong>${breakdown.baseScore}</strong></div>`;
    }
    if (breakdown.correctAnswers !== undefined) {
      html += `<div>✅ Correct: <strong>${breakdown.correctAnswers}</strong></div>`;
    }
    if (breakdown.wrongAnswers !== undefined) {
      html += `<div>❌ Wrong: <strong>${breakdown.wrongAnswers}</strong></div>`;
    }

    // Bonuses
    if (breakdown.timeBonus !== undefined && breakdown.timeBonus > 0) {
      html += `<div>⏱️ Time Bonus: <strong>+${breakdown.timeBonus}</strong></div>`;
    }
    if (breakdown.timeBonuses !== undefined && breakdown.timeBonuses > 0) {
      html += `<div>⏱️ Time Bonuses: <strong>+${breakdown.timeBonuses}</strong></div>`;
    }
    if (breakdown.speedBonus !== undefined && breakdown.speedBonus > 0) {
      html += `<div>⚡ Speed Bonus: <strong>+${breakdown.speedBonus}</strong></div>`;
    }
    if (breakdown.streakBonus !== undefined && breakdown.streakBonus > 0) {
      html += `<div>🔥 Streak Bonus: <strong>+${breakdown.streakBonus}</strong></div>`;
    }
    if (breakdown.streakBonuses !== undefined && breakdown.streakBonuses > 0) {
      html += `<div>🔥 Streak Bonuses: <strong>+${breakdown.streakBonuses}</strong></div>`;
    }

    // Streaks
    if (breakdown.currentStreak !== undefined) {
      html += `<div>📈 Current Streak: <strong>${breakdown.currentStreak}</strong></div>`;
    }
    if (breakdown.maxStreak !== undefined) {
      html += `<div>🏆 Max Streak: <strong>${breakdown.maxStreak}</strong></div>`;
    }

    html += `</div>`;

    // Multipliers
    if (breakdown.multipliers && breakdown.multipliers.length > 0) {
      html += `<div style="margin-bottom: 12px;">
        <div style="color: #FF9800; font-weight: bold;">✨ Multipliers Applied:</div>`;
      breakdown.multipliers.forEach(multiplier => {
        html += `<div style="font-size: 12px; color: #E65100;">• ${multiplier}</div>`;
      });
      html += `</div>`;
    }

    // Penalties
    if (breakdown.penalties && breakdown.penalties.length > 0) {
      html += `<div style="margin-bottom: 12px;">
        <div style="color: #F44336; font-weight: bold;">⚠️ Penalties Applied:</div>`;
      breakdown.penalties.forEach(penalty => {
        html += `<div style="font-size: 12px; color: #C62828;">• ${penalty}</div>`;
      });
      html += `</div>`;
    }

    // Total Score
    html += `<div style="
      border-top: 1px solid ${primaryColor};
      padding-top: 10px;
      font-weight: bold;
      color: ${secondaryColor};
    ">
      🏅 Total Score: ${breakdown.totalScore}
    </div>`;

    html += `</div>`;

    return html;
  }

  /**
   * Get scoring data for React components
   */
  getScoringData(breakdown: ScoringBreakdown): {
    breakdown: ScoringBreakdown;
    gameIcon: string;
    primaryColor: string;
    secondaryColor: string;
  } {
    return {
      breakdown,
      gameIcon: this.getGameIcon(),
      primaryColor: this.getPrimaryColor(),
      secondaryColor: this.getSecondaryColor()
    };
  }
}

export default ScoringDisplay;

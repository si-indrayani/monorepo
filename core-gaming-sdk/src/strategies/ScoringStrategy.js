"use strict";
// 📍 Location: src/strategies/ScoringStrategy.ts
// 🎯 Purpose: Handles ALL scoring logic for ALL games using Strategy Pattern
// 🔗 Used by: All game implementations
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringAnalytics = exports.ScoringStrategyFactory = exports.GenericScoringStrategy = exports.FootballScoringStrategy = exports.CricketScoringStrategy = exports.QuizScoringStrategy = exports.BaseScoringStrategy = void 0;
/**
 * 🎪 Strategy Pattern Base Class
 *
 * This is the foundation for all scoring strategies. Every game can have
 * its own scoring logic while maintaining a consistent interface.
 */
var BaseScoringStrategy = /** @class */ (function () {
    function BaseScoringStrategy() {
        this.scoringRules = {};
        this.bonusMultipliers = {};
        this.penaltyRules = {};
    }
    /**
     * 🔄 Dynamic Rule Updates (from GameConfigManager)
     */
    BaseScoringStrategy.prototype.updateScoringRules = function (newRules) {
        this.scoringRules = __assign(__assign({}, this.scoringRules), newRules);
    };
    BaseScoringStrategy.prototype.updateScoringRule = function (ruleKey, value) {
        this.scoringRules[ruleKey] = value;
    };
    BaseScoringStrategy.prototype.updateBonusMultipliers = function (multipliers) {
        this.bonusMultipliers = __assign(__assign({}, this.bonusMultipliers), multipliers);
    };
    BaseScoringStrategy.prototype.updatePenaltyRules = function (penalties) {
        this.penaltyRules = __assign(__assign({}, this.penaltyRules), penalties);
    };
    /**
     * 📊 Scoring Analysis Methods
     */
    BaseScoringStrategy.prototype.getAvailableActions = function () {
        return Object.keys(this.scoringRules);
    };
    BaseScoringStrategy.prototype.getActionScore = function (action) {
        return this.scoringRules[action] || 0;
    };
    BaseScoringStrategy.prototype.getScoringRules = function () {
        return __assign({}, this.scoringRules);
    };
    /**
     * 🎯 Helper Methods for Complex Scoring
     */
    BaseScoringStrategy.prototype.applyMultiplier = function (baseScore, multiplierKey) {
        var multiplier = this.bonusMultipliers[multiplierKey] || 1;
        return baseScore * multiplier;
    };
    BaseScoringStrategy.prototype.applyPenalty = function (baseScore, penaltyKey) {
        var penalty = this.penaltyRules[penaltyKey] || 0;
        return Math.max(0, baseScore - penalty);
    };
    BaseScoringStrategy.prototype.calculateTimeBonus = function (timeRemaining, maxTime, bonusRate) {
        if (bonusRate === void 0) { bonusRate = 0.1; }
        if (timeRemaining <= 0 || maxTime <= 0)
            return 0;
        var timeRatio = timeRemaining / maxTime;
        return Math.floor(timeRatio * bonusRate * 100);
    };
    BaseScoringStrategy.prototype.calculateStreakBonus = function (streakCount, streakMultiplier) {
        if (streakMultiplier === void 0) { streakMultiplier = 1.1; }
        if (streakCount <= 1)
            return 0;
        return Math.floor((streakCount - 1) * streakMultiplier);
    };
    return BaseScoringStrategy;
}());
exports.BaseScoringStrategy = BaseScoringStrategy;
/**
 * 🧠 Quiz Game Scoring Strategy
 *
 * Specialized scoring for quiz games with knowledge-based scoring
 */
var QuizScoringStrategy = /** @class */ (function (_super) {
    __extends(QuizScoringStrategy, _super);
    function QuizScoringStrategy() {
        var _this = _super.call(this) || this;
        // Default quiz scoring rules
        _this.scoringRules = {
            correct_answer: 10,
            wrong_answer: 0,
            skip_question: 0,
            hint_used: -2,
            time_bonus: 5,
            streak_bonus: 2
        };
        _this.bonusMultipliers = {
            speed_bonus: 1.5,
            streak_multiplier: 1.2,
            difficulty_bonus: 1.3
        };
        _this.penaltyRules = {
            time_penalty: 1,
            multiple_attempts: 2
        };
        return _this;
    }
    QuizScoringStrategy.prototype.calculateScore = function (action, context) {
        if (context === void 0) { context = {}; }
        var baseScore = this.scoringRules[action] || 0;
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
    };
    QuizScoringStrategy.prototype.calculateCorrectAnswerScore = function (context) {
        var score = this.scoringRules.correct_answer;
        // Apply difficulty bonus
        if (context.difficulty === 'hard') {
            score = this.applyMultiplier(score, 'difficulty_bonus');
        }
        // Apply time bonus for quick answers
        if (context.timeRemaining && context.maxTime) {
            var timeBonus = this.calculateTimeBonus(context.timeRemaining, context.maxTime, 0.2);
            score += timeBonus;
        }
        // Apply streak bonus
        if (context.streak && context.streak > 1) {
            var streakBonus = this.calculateStreakBonus(context.streak, 1.1);
            score += streakBonus;
        }
        return score;
    };
    QuizScoringStrategy.prototype.calculateWrongAnswerScore = function (context) {
        var _a, _b;
        var score = this.scoringRules.wrong_answer;
        // No penalty for first attempt on hard questions
        if (context.difficulty === 'hard' && !((_a = context.custom) === null || _a === void 0 ? void 0 : _a.previousAttempts)) {
            return score;
        }
        // Apply penalty for multiple wrong attempts
        if (((_b = context.custom) === null || _b === void 0 ? void 0 : _b.previousAttempts) && context.custom.previousAttempts > 1) {
            score = this.applyPenalty(score, 'multiple_attempts');
        }
        return score;
    };
    QuizScoringStrategy.prototype.calculateQuizTimeBonus = function (context) {
        if (!context.timeRemaining || !context.maxTime)
            return 0;
        // More generous time bonus for quiz games
        return this.calculateTimeBonus(context.timeRemaining, context.maxTime, 0.3);
    };
    QuizScoringStrategy.prototype.calculateQuizStreakBonus = function (context) {
        if (!context.streak || context.streak <= 1)
            return 0;
        // Progressive streak bonus for quiz games
        var baseBonus = this.scoringRules.streak_bonus;
        return baseBonus * (context.streak - 1);
    };
    return QuizScoringStrategy;
}(BaseScoringStrategy));
exports.QuizScoringStrategy = QuizScoringStrategy;
/**
 * 🏏 Cricket Game Scoring Strategy
 *
 * Specialized scoring for cricket games with sports-specific logic
 */
var CricketScoringStrategy = /** @class */ (function (_super) {
    __extends(CricketScoringStrategy, _super);
    function CricketScoringStrategy() {
        var _this = _super.call(this) || this;
        // Default cricket scoring rules
        _this.scoringRules = {
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
        _this.bonusMultipliers = {
            power_play: 1.5,
            death_overs: 1.3,
            pressure_situation: 1.2
        };
        _this.penaltyRules = {
            wide: 1,
            no_ball: 1,
            bye: 0.5
        };
        return _this;
    }
    CricketScoringStrategy.prototype.calculateScore = function (action, context) {
        var _a, _b, _c, _d, _e, _f;
        if (context === void 0) { context = {}; }
        var baseScore = this.scoringRules[action] || 0;
        // Special handling for cricket actions
        switch (action) {
            case 'century':
                // Only award century bonus if player actually scored 100+ runs
                if (((_a = context.custom) === null || _a === void 0 ? void 0 : _a.runs) >= 100) {
                    baseScore = this.scoringRules.century;
                }
                else {
                    baseScore = 0;
                }
                break;
            case 'half_century':
                // Only award fifty bonus if player scored 50+ runs (but less than 100)
                if (((_b = context.custom) === null || _b === void 0 ? void 0 : _b.runs) >= 50 && ((_c = context.custom) === null || _c === void 0 ? void 0 : _c.runs) < 100) {
                    baseScore = this.scoringRules.half_century;
                }
                else {
                    baseScore = 0;
                }
                break;
            case 'six':
            case 'boundary':
                // Apply power play multiplier if in power play overs
                if ((_d = context.custom) === null || _d === void 0 ? void 0 : _d.isPowerPlay) {
                    baseScore = this.applyMultiplier(baseScore, 'power_play');
                }
                // Apply death overs multiplier if in last 5 overs
                if ((_e = context.custom) === null || _e === void 0 ? void 0 : _e.isDeathOvers) {
                    baseScore = this.applyMultiplier(baseScore, 'death_overs');
                }
                break;
            case 'wicket':
                // Bonus for wickets in pressure situations
                if ((_f = context.custom) === null || _f === void 0 ? void 0 : _f.isPressureSituation) {
                    baseScore = this.applyMultiplier(baseScore, 'pressure_situation');
                }
                break;
        }
        return Math.max(0, Math.floor(baseScore));
    };
    return CricketScoringStrategy;
}(BaseScoringStrategy));
exports.CricketScoringStrategy = CricketScoringStrategy;
/**
 * ⚽ Football Game Scoring Strategy
 *
 * Specialized scoring for football games with match dynamics
 */
var FootballScoringStrategy = /** @class */ (function (_super) {
    __extends(FootballScoringStrategy, _super);
    function FootballScoringStrategy() {
        var _this = _super.call(this) || this;
        // Default football scoring rules
        _this.scoringRules = {
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
        _this.bonusMultipliers = {
            injury_time: 1.5,
            derby_match: 1.3,
            final_match: 1.4
        };
        _this.penaltyRules = {
            own_goal: 5,
            missed_penalty: 3,
            offside: 1
        };
        return _this;
    }
    FootballScoringStrategy.prototype.calculateScore = function (action, context) {
        var _a, _b, _c, _d, _e;
        if (context === void 0) { context = {}; }
        var baseScore = this.scoringRules[action] || 0;
        // Special handling for football actions
        switch (action) {
            case 'goal':
            case 'penalty_goal':
            case 'free_kick_goal':
            case 'header_goal':
                // Apply injury time bonus
                if ((_a = context.custom) === null || _a === void 0 ? void 0 : _a.isInjuryTime) {
                    baseScore = this.applyMultiplier(baseScore, 'injury_time');
                }
                // Apply match importance bonus
                if ((_b = context.custom) === null || _b === void 0 ? void 0 : _b.isDerby) {
                    baseScore = this.applyMultiplier(baseScore, 'derby_match');
                }
                if ((_c = context.custom) === null || _c === void 0 ? void 0 : _c.isFinal) {
                    baseScore = this.applyMultiplier(baseScore, 'final_match');
                }
                break;
            case 'clean_sheet':
                // Only award clean sheet if goalkeeper played full match
                if (((_d = context.custom) === null || _d === void 0 ? void 0 : _d.position) === 'goalkeeper' && ((_e = context.custom) === null || _e === void 0 ? void 0 : _e.minutesPlayed) >= 90) {
                    baseScore = this.scoringRules.clean_sheet;
                }
                else {
                    baseScore = 0;
                }
                break;
        }
        return Math.max(0, Math.floor(baseScore));
    };
    return FootballScoringStrategy;
}(BaseScoringStrategy));
exports.FootballScoringStrategy = FootballScoringStrategy;
/**
 * 🎮 Generic Game Scoring Strategy
 *
 * Universal scoring strategy for unknown or custom games
 */
var GenericScoringStrategy = /** @class */ (function (_super) {
    __extends(GenericScoringStrategy, _super);
    function GenericScoringStrategy(customRules) {
        if (customRules === void 0) { customRules = {}; }
        var _this = _super.call(this) || this;
        // Default generic scoring rules
        _this.scoringRules = __assign({ action: 1, correct: 10, incorrect: 0, bonus: 5, penalty: -2 }, customRules);
        _this.bonusMultipliers = {
            speed: 1.2,
            accuracy: 1.3,
            difficulty: 1.1
        };
        _this.penaltyRules = {
            timeout: 1,
            invalid_action: 2
        };
        return _this;
    }
    GenericScoringStrategy.prototype.calculateScore = function (action, context) {
        if (context === void 0) { context = {}; }
        var baseScore = this.scoringRules[action] || this.scoringRules.action || 1;
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
    };
    return GenericScoringStrategy;
}(BaseScoringStrategy));
exports.GenericScoringStrategy = GenericScoringStrategy;
/**
 * 🏭 Scoring Strategy Factory
 *
 * Creates appropriate scoring strategies for different game types
 */
var ScoringStrategyFactory = /** @class */ (function () {
    function ScoringStrategyFactory() {
    }
    /**
     * Create a scoring strategy for a specific game type
     */
    ScoringStrategyFactory.createStrategy = function (gameType, customRules) {
        var StrategyClass = this.strategies.get(gameType);
        if (StrategyClass) {
            return new StrategyClass();
        }
        // Default to generic strategy with custom rules
        return new GenericScoringStrategy(customRules);
    };
    /**
     * Register a new scoring strategy
     */
    ScoringStrategyFactory.registerStrategy = function (gameType, strategyClass) {
        this.strategies.set(gameType, strategyClass);
    };
    /**
     * Get all available strategy types
     */
    ScoringStrategyFactory.getAvailableStrategies = function () {
        return Array.from(this.strategies.keys());
    };
    var _a;
    _a = ScoringStrategyFactory;
    ScoringStrategyFactory.strategies = new Map();
    (function () {
        // Register built-in strategies
        _a.strategies.set('quiz', QuizScoringStrategy);
        _a.strategies.set('cricket', CricketScoringStrategy);
        _a.strategies.set('football', FootballScoringStrategy);
    })();
    return ScoringStrategyFactory;
}());
exports.ScoringStrategyFactory = ScoringStrategyFactory;
/**
 * 📊 Scoring Analytics
 *
 * Provides analytics and insights about scoring patterns
 */
var ScoringAnalytics = /** @class */ (function () {
    function ScoringAnalytics() {
        this.scoreHistory = [];
    }
    ScoringAnalytics.prototype.recordScore = function (action, score, context) {
        this.scoreHistory.push({
            action: action,
            score: score,
            context: context,
            timestamp: new Date()
        });
    };
    ScoringAnalytics.prototype.getTotalScore = function () {
        return this.scoreHistory.reduce(function (sum, entry) { return sum + entry.score; }, 0);
    };
    ScoringAnalytics.prototype.getAverageScore = function () {
        if (this.scoreHistory.length === 0)
            return 0;
        return this.getTotalScore() / this.scoreHistory.length;
    };
    ScoringAnalytics.prototype.getActionStats = function () {
        var stats = {};
        this.scoreHistory.forEach(function (entry) {
            if (!stats[entry.action]) {
                stats[entry.action] = { count: 0, totalScore: 0, avgScore: 0 };
            }
            stats[entry.action].count++;
            stats[entry.action].totalScore += entry.score;
            stats[entry.action].avgScore = stats[entry.action].totalScore / stats[entry.action].count;
        });
        return stats;
    };
    ScoringAnalytics.prototype.getBestAction = function () {
        if (this.scoreHistory.length === 0)
            return null;
        var best = this.scoreHistory.reduce(function (best, current) {
            return current.score > best.score ? current : best;
        });
        return { action: best.action, score: best.score };
    };
    ScoringAnalytics.prototype.getScoreHistory = function () {
        return this.scoreHistory.map(function (entry) { return ({
            action: entry.action,
            score: entry.score,
            timestamp: entry.timestamp
        }); });
    };
    ScoringAnalytics.prototype.clear = function () {
        this.scoreHistory = [];
    };
    return ScoringAnalytics;
}());
exports.ScoringAnalytics = ScoringAnalytics;

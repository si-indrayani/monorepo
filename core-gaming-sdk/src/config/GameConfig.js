"use strict";
// 📍 Location: src/config/GameConfig.ts
// 🎯 Purpose: Manages ALL game configurations universally
// 🔗 Used by: Factory, all games, scoring strategies
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameConfigManager = void 0;
/**
 * ⚙️ Game Configuration Manager
 *
 * Central hub for managing all game configurations
 */
var GameConfigManager = /** @class */ (function () {
    function GameConfigManager(configDirectory) {
        if (configDirectory === void 0) { configDirectory = './config'; }
        this.configCache = new Map();
        this.defaultConfigs = new Map();
        this.configDirectory = configDirectory;
        this.initializeDefaultConfigs();
    }
    /**
     * 📋 Core Configuration Methods
     */
    // 1. Load configuration (JSON file or create default)
    GameConfigManager.prototype.loadConfig = function (gameId) {
        return __awaiter(this, void 0, void 0, function () {
            var config, error_1, defaultConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check cache first
                        if (this.configCache.has(gameId)) {
                            return [2 /*return*/, this.configCache.get(gameId)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 6]);
                        return [4 /*yield*/, this.loadConfigFromFile(gameId)];
                    case 2:
                        config = _a.sent();
                        this.configCache.set(gameId, config);
                        return [2 /*return*/, config];
                    case 3:
                        error_1 = _a.sent();
                        // File doesn't exist or is invalid, create default
                        return [4 /*yield*/, this.createDefaultConfig(gameId)];
                    case 4:
                        defaultConfig = _a.sent();
                        return [4 /*yield*/, this.saveConfig(gameId, defaultConfig)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, defaultConfig];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // 2. Save configuration back to file
    GameConfigManager.prototype.saveConfig = function (gameId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Update cache
                        this.configCache.set(gameId, config);
                        // Save to file system
                        return [4 /*yield*/, this.saveConfigToFile(gameId, config)];
                    case 1:
                        // Save to file system
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Failed to save configuration for ".concat(gameId, ":"), error_2);
                        throw new Error("Configuration save failed: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 3. Update specific rules dynamically
    GameConfigManager.prototype.updateScoringRule = function (gameId, rule, value) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadConfig(gameId)];
                    case 1:
                        config = _a.sent();
                        config.scoringRules[rule] = value;
                        return [4 /*yield*/, this.saveConfig(gameId, config)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GameConfigManager.prototype.updateGameRule = function (gameId, rule, value) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.loadConfig(gameId)];
                    case 1:
                        config = _b.sent();
                        if (config.gameRules.customRules) {
                            config.gameRules.customRules[rule] = value;
                        }
                        else {
                            config.gameRules.customRules = (_a = {}, _a[rule] = value, _a);
                        }
                        return [4 /*yield*/, this.saveConfig(gameId, config)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 4. Discover all available games
    GameConfigManager.prototype.getAvailableGames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cachedGames, defaultGames, uniqueGames;
            return __generator(this, function (_a) {
                try {
                    cachedGames = Array.from(this.configCache.keys());
                    defaultGames = Array.from(this.defaultConfigs.keys());
                    uniqueGames = new Set(__spreadArray(__spreadArray([], cachedGames, true), defaultGames, true));
                    return [2 /*return*/, Array.from(uniqueGames)];
                }
                catch (error) {
                    console.error('Failed to discover available games:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    // 5. Create new game configurations
    GameConfigManager.prototype.initializeNewGame = function (gameId_1) {
        return __awaiter(this, arguments, void 0, function (gameId, options) {
            var defaultConfig, newConfig;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createDefaultConfig(gameId)];
                    case 1:
                        defaultConfig = _a.sent();
                        newConfig = __assign(__assign(__assign({}, defaultConfig), options), { gameId: gameId, metadata: __assign(__assign({}, defaultConfig.metadata), options.metadata), gameRules: __assign(__assign({}, defaultConfig.gameRules), options.gameRules), ui: __assign(__assign({}, defaultConfig.ui), options.ui), storage: __assign(__assign({}, defaultConfig.storage), options.storage), features: __assign(__assign({}, defaultConfig.features), options.features) });
                        return [4 /*yield*/, this.saveConfig(gameId, newConfig)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, newConfig];
                }
            });
        });
    };
    /**
     * 🔧 Helper Methods
     */
    GameConfigManager.prototype.createDefaultConfig = function (gameId) {
        return __awaiter(this, void 0, void 0, function () {
            var gameType, defaultTemplate;
            return __generator(this, function (_a) {
                gameType = this.extractGameType(gameId);
                defaultTemplate = this.defaultConfigs.get(gameType);
                return [2 /*return*/, {
                        gameId: gameId,
                        gameType: gameType,
                        version: '1.0.0',
                        minEngineVersion: '1.0.0',
                        metadata: __assign({ title: this.formatGameTitle(gameId), description: "A ".concat(gameType, " game"), category: gameType, difficulty: 'medium', estimatedDuration: 10, maxPlayers: 4, minPlayers: 1, tags: [gameType, 'multiplayer'], version: '1.0.0' }, defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.metadata),
                        scoringRules: __assign({ baseScore: 10, bonusMultiplier: 1.5, penaltyDeduction: 5 }, defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.scoringRules),
                        gameRules: __assign({ minPlayers: 1, maxPlayers: 4, autoStart: false, autoEnd: true, pauseAllowed: true, difficulty: 'medium', adaptiveDifficulty: false, preventCheating: true, requireValidation: false }, defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.gameRules),
                        ui: __assign({ theme: 'auto', primaryColor: '#007bff', secondaryColor: '#6c757d', layout: 'standard', showScore: true, showTimer: true, showProgress: true, soundEnabled: true, animationsEnabled: true, hapticFeedback: false, highContrast: false, largeText: false, screenReader: false }, defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.ui),
                        storage: __assign({ storageType: 'local', saveGameState: true, savePlayerProgress: true, saveScores: true, autoCleanup: false, encryptData: false }, defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.storage),
                        features: __assign({ singlePlayer: true, multiPlayer: true, realTime: false, turnBased: true, tournaments: false, leaderboards: true, achievements: false, socialFeatures: false, analytics: true, crashReporting: true, cloudSync: false, offlineMode: true, customizable: false, moddingSupport: false, screenReaderSupport: false, keyboardNavigation: true, colorBlindSupport: false }, defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.features),
                        customConfig: (defaultTemplate === null || defaultTemplate === void 0 ? void 0 : defaultTemplate.customConfig) || {}
                    }];
            });
        });
    };
    GameConfigManager.prototype.extractGameType = function (gameId) {
        // Extract game type from gameId (e.g., 'quiz-game-1' -> 'quiz')
        return gameId.split('-')[0] || 'generic';
    };
    GameConfigManager.prototype.formatGameTitle = function (gameId) {
        return gameId
            .split('-')
            .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
            .join(' ');
    };
    GameConfigManager.prototype.loadConfigFromFile = function (gameId) {
        return __awaiter(this, void 0, void 0, function () {
            var filePath;
            return __generator(this, function (_a) {
                filePath = "".concat(this.configDirectory, "/").concat(gameId, ".json");
                // Simulate file system access
                throw new Error("Configuration file not found: ".concat(filePath));
            });
        });
    };
    GameConfigManager.prototype.saveConfigToFile = function (gameId, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would write to the file system
                // For now, just log the action
                return [2 /*return*/];
            });
        });
    };
    GameConfigManager.prototype.initializeDefaultConfigs = function () {
        // Quiz game defaults - using DeepPartial to override only specific properties
        this.defaultConfigs.set('quiz', {
            scoringRules: {
                correctAnswer: 10,
                wrongAnswer: 0,
                speedBonus: 5,
                streakBonus: 2
            },
            gameRules: {
                timeLimit: 300, // 5 minutes
                turnTimeLimit: 30, // 30 seconds per question
                customRules: {
                    questionsCount: 10,
                    shuffleQuestions: true,
                    shuffleOptions: true
                }
            }
        });
        // Cricket game defaults
        this.defaultConfigs.set('cricket', {
            scoringRules: {
                run: 1,
                boundary: 4,
                six: 6,
                wicket: 10,
                century: 50
            },
            gameRules: {
                customRules: {
                    overs: 20,
                    playersPerTeam: 11,
                    powerPlayOvers: 6
                }
            }
        });
        // Football game defaults
        this.defaultConfigs.set('football', {
            scoringRules: {
                goal: 1,
                assist: 0.5,
                cleanSheet: 0.5,
                yellowCard: -0.2,
                redCard: -0.5
            }
        });
    };
    /**
     * 🚀 Advanced Configuration Features
     */
    // Get configuration schema for validation
    GameConfigManager.prototype.getConfigSchema = function () {
        return {
            type: 'object',
            required: ['gameId', 'gameType', 'metadata', 'scoringRules', 'gameRules'],
            properties: {
                gameId: { type: 'string' },
                gameType: { type: 'string' },
                metadata: { type: 'object' },
                scoringRules: { type: 'object' },
                gameRules: { type: 'object' },
                ui: { type: 'object' },
                storage: { type: 'object' },
                features: { type: 'object' }
            }
        };
    };
    // Validate configuration
    GameConfigManager.prototype.validateConfig = function (config) {
        try {
            // Basic validation
            if (!config.gameId || !config.gameType)
                return false;
            if (!config.metadata || !config.scoringRules || !config.gameRules)
                return false;
            // More detailed validation could be added here
            return true;
        }
        catch (error) {
            return false;
        }
    };
    // Clear cache
    GameConfigManager.prototype.clearCache = function () {
        this.configCache.clear();
    };
    // Get cached configurations
    GameConfigManager.prototype.getCachedConfigs = function () {
        return Array.from(this.configCache.keys());
    };
    return GameConfigManager;
}());
exports.GameConfigManager = GameConfigManager;

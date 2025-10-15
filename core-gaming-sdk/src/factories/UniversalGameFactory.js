"use strict";
// 📍 Location: src/factories/UniversalGameFactory.ts
// 🎯 Purpose: Creates ANY game type (known or unknown) using Factory Pattern
// 🔗 Uses: GameConfigManager, all game classes, scoring strategies
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
exports.GenericGame = exports.GameCreationError = exports.UniversalGameFactory = void 0;
var GameConfig_1 = require("../config/GameConfig");
var ScoringStrategy_1 = require("../strategies/ScoringStrategy");
/**
 * 🏭 Universal Game Factory
 *
 * The master factory that can create ANY game type, whether it's:
 * - Known games with specific implementations (Cricket, Football, Quiz)
 * - Unknown games using generic implementation
 * - Custom games with dynamic configuration
 */
var UniversalGameFactory = /** @class */ (function () {
    function UniversalGameFactory(configManager) {
        this.gameRegistry = new Map();
        this.instanceCache = new Map();
        this.configManager = configManager || new GameConfig_1.GameConfigManager();
        this.registerBuiltInGames();
    }
    /**
     * 🏗️ Factory Method Pattern - Create Game Instance
     *
     * This is the heart of the factory - it can create ANY game type
     */
    UniversalGameFactory.prototype.createGame = function (gameId_1) {
        return __awaiter(this, arguments, void 0, function (gameId, options) {
            var config, error_1, gameType, scoringStrategy, game, GameClass, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        config = void 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.configManager.loadConfig(gameId)];
                    case 3:
                        config = _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.configManager.initializeNewGame(gameId, options.configOverrides)];
                    case 5:
                        config = _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        gameType = this.extractGameType(gameId);
                        scoringStrategy = ScoringStrategy_1.ScoringStrategyFactory.createStrategy(gameType, config.scoringRules);
                        // Apply any scoring rule overrides
                        if (options.scoringOverrides) {
                            scoringStrategy.updateScoringRules(options.scoringOverrides);
                        }
                        game = void 0;
                        GameClass = this.gameRegistry.get(gameType);
                        if (GameClass) {
                            // Use registered game class (specific implementation)
                            game = new GameClass(gameId, config, scoringStrategy, options);
                        }
                        else {
                            // Use generic implementation for unknown games
                            game = this.createGenericGame(gameId, config, scoringStrategy, options);
                        }
                        // 4. Cache instance if requested
                        if (options.cacheInstance) {
                            this.instanceCache.set(gameId, game);
                        }
                        return [2 /*return*/, game];
                    case 7:
                        error_2 = _a.sent();
                        console.error("\u274C Failed to create game ".concat(gameId, ":"), error_2);
                        throw new GameCreationError("Failed to create game ".concat(gameId, ": ").concat(error_2));
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔧 Game Registry Management
     */
    UniversalGameFactory.prototype.registerGameType = function (gameType, gameClass) {
        this.gameRegistry.set(gameType, gameClass);
    };
    UniversalGameFactory.prototype.unregisterGameType = function (gameType) {
        return this.gameRegistry.delete(gameType);
    };
    UniversalGameFactory.prototype.getRegisteredGameTypes = function () {
        return Array.from(this.gameRegistry.keys());
    };
    UniversalGameFactory.prototype.isGameTypeRegistered = function (gameType) {
        return this.gameRegistry.has(gameType);
    };
    /**
     * 🎮 Game Discovery
     */
    UniversalGameFactory.prototype.getAvailableGames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var availableGameIds, results, _i, availableGameIds_1, gameId, config, gameType, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.configManager.getAvailableGames()];
                    case 1:
                        availableGameIds = _a.sent();
                        results = [];
                        _i = 0, availableGameIds_1 = availableGameIds;
                        _a.label = 2;
                    case 2:
                        if (!(_i < availableGameIds_1.length)) return [3 /*break*/, 7];
                        gameId = availableGameIds_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.configManager.loadConfig(gameId)];
                    case 4:
                        config = _a.sent();
                        gameType = this.extractGameType(gameId);
                        results.push({
                            gameId: gameId,
                            gameType: gameType,
                            title: config.metadata.title,
                            description: config.metadata.description,
                            category: config.metadata.category,
                            difficulty: config.metadata.difficulty,
                            isRegistered: this.isGameTypeRegistered(gameType),
                            hasCustomImplementation: this.gameRegistry.has(gameType),
                            estimatedDuration: config.metadata.estimatedDuration,
                            maxPlayers: config.metadata.maxPlayers,
                            minPlayers: config.metadata.minPlayers,
                            tags: config.metadata.tags
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.warn("Failed to load config for ".concat(gameId, ":"), error_3);
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, results];
                    case 8:
                        error_4 = _a.sent();
                        console.error('Failed to discover available games:', error_4);
                        return [2 /*return*/, []];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🆕 Create New Game Type
     */
    UniversalGameFactory.prototype.createNewGameType = function (gameType, template, gameClass) {
        return __awaiter(this, void 0, void 0, function () {
            var gameId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        gameId = "".concat(gameType, "-").concat(Date.now());
                        // Create configuration
                        return [4 /*yield*/, this.configManager.initializeNewGame(gameId, template)];
                    case 1:
                        // Create configuration
                        _a.sent();
                        // Register game class if provided
                        if (gameClass) {
                            this.registerGameType(gameType, gameClass);
                        }
                        return [2 /*return*/, gameId];
                }
            });
        });
    };
    /**
     * 🔄 Instance Management
     */
    UniversalGameFactory.prototype.getCachedInstance = function (gameId) {
        return this.instanceCache.get(gameId) || null;
    };
    UniversalGameFactory.prototype.clearCache = function () {
        this.instanceCache.clear();
    };
    UniversalGameFactory.prototype.clearCacheFor = function (gameId) {
        return this.instanceCache.delete(gameId);
    };
    UniversalGameFactory.prototype.getCachedGameIds = function () {
        return Array.from(this.instanceCache.keys());
    };
    /**
     * 🔧 Helper Methods
     */
    UniversalGameFactory.prototype.extractGameType = function (gameId) {
        // Extract game type from gameId (e.g., 'quiz-game-1' -> 'quiz')
        return gameId.split('-')[0] || 'generic';
    };
    UniversalGameFactory.prototype.registerBuiltInGames = function () {
        // Built-in games will be registered here when they're implemented
        // For now, we'll register them when the specific game classes are created
    };
    /**
     * 🆕 Generic Game Implementation
     *
     * This creates a generic game instance for unknown game types
     */
    UniversalGameFactory.prototype.createGenericGame = function (gameId, config, scoringStrategy, options) {
        if (options === void 0) { options = {}; }
        return new GenericGame(gameId, config, scoringStrategy, options);
    };
    /**
     * 🎯 Factory Statistics
     */
    UniversalGameFactory.prototype.getFactoryStats = function () {
        return {
            registeredGameTypes: this.gameRegistry.size,
            cachedInstances: this.instanceCache.size,
            gameTypeList: this.getRegisteredGameTypes(),
            cachedGameIds: this.getCachedGameIds()
        };
    };
    return UniversalGameFactory;
}());
exports.UniversalGameFactory = UniversalGameFactory;
/**
 * ❌ Game Creation Error
 *
 * Error thrown when game creation fails
 */
var GameCreationError = /** @class */ (function (_super) {
    __extends(GameCreationError, _super);
    function GameCreationError(message, gameId) {
        var _this = _super.call(this, message) || this;
        _this.gameId = gameId;
        _this.name = 'GameCreationError';
        return _this;
    }
    return GameCreationError;
}(Error));
exports.GameCreationError = GameCreationError;
/**
 * 🆕 Generic Game Implementation
 *
 * A universal game implementation that works for any unknown game type
 */
var GenericGame = /** @class */ (function () {
    function GenericGame(gameId, config, scoringStrategy, options) {
        if (options === void 0) { options = {}; }
        this.eventListeners = new Map();
        this.gameState = {};
        this.players = [];
        this.isInitialized = false;
        this.isStarted = false;
        this.gameId = gameId;
        this.config = config;
        this.scoringStrategy = scoringStrategy;
        this.options = options;
    }
    GenericGame.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.gameState = {
                    status: 'ready',
                    startTime: null,
                    endTime: null,
                    currentRound: 0,
                    gameData: this.config.customConfig || {}
                };
                // Add initial players if provided
                if (this.options.initialPlayers) {
                    this.players = __spreadArray([], this.options.initialPlayers, true);
                }
                this.isInitialized = true;
                this.emit('initialized', this.gameState);
                return [2 /*return*/];
            });
        });
    };
    GenericGame.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isInitialized) {
                    throw new Error('Game must be initialized before starting');
                }
                this.gameState.status = 'running';
                this.gameState.startTime = new Date();
                this.isStarted = true;
                this.emit('started', this.gameState);
                return [2 /*return*/];
            });
        });
    };
    GenericGame.prototype.pause = function () {
        if (this.isStarted) {
            this.gameState.status = 'paused';
            this.emit('paused', this.gameState);
        }
    };
    GenericGame.prototype.resume = function () {
        if (this.isStarted && this.gameState.status === 'paused') {
            this.gameState.status = 'running';
            this.emit('resumed', this.gameState);
        }
    };
    GenericGame.prototype.end = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.gameState.status = 'ended';
                this.gameState.endTime = new Date();
                this.isStarted = false;
                this.emit('ended', this.gameState);
                return [2 /*return*/];
            });
        });
    };
    GenericGame.prototype.getScore = function () {
        // Return total score for single player, or score object for multiplayer
        if (this.players.length <= 1) {
            return this.gameState.score || 0;
        }
        var scores = {};
        this.players.forEach(function (player) {
            scores[player.id] = player.score || 0;
        });
        return scores;
    };
    GenericGame.prototype.getState = function () {
        return __assign({}, this.gameState);
    };
    GenericGame.prototype.getMetadata = function () {
        return __assign({}, this.config.metadata);
    };
    GenericGame.prototype.getPlayers = function () {
        return __spreadArray([], this.players, true);
    };
    GenericGame.prototype.addPlayer = function (player) {
        if (this.players.length >= this.config.metadata.maxPlayers) {
            return false;
        }
        this.players.push(player);
        this.emit('playerAdded', { player: player, totalPlayers: this.players.length });
        return true;
    };
    GenericGame.prototype.removePlayer = function (playerId) {
        var initialLength = this.players.length;
        this.players = this.players.filter(function (p) { return p.id !== playerId; });
        if (this.players.length < initialLength) {
            this.emit('playerRemoved', { playerId: playerId, totalPlayers: this.players.length });
            return true;
        }
        return false;
    };
    GenericGame.prototype.handlePlayerAction = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var score;
            return __generator(this, function (_a) {
                score = this.scoringStrategy.calculateScore(action.actionType, action.context);
                // Update game state
                this.gameState.lastAction = action;
                this.gameState.lastScore = score;
                // Emit events
                this.emit('actionProcessed', { action: action, score: score });
                return [2 /*return*/, {
                        success: true,
                        actionId: action.actionId,
                        score: score,
                        gameStateChanged: true,
                        processedAt: new Date()
                    }];
            });
        });
    };
    GenericGame.prototype.validateAction = function (action) {
        // Basic validation - can be overridden by specific games
        return action && action.actionType && action.playerId;
    };
    GenericGame.prototype.canStart = function () {
        return this.isInitialized &&
            this.players.length >= this.config.metadata.minPlayers &&
            this.players.length <= this.config.metadata.maxPlayers;
    };
    GenericGame.prototype.serialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, JSON.stringify({
                        gameId: this.gameId,
                        config: this.config,
                        gameState: this.gameState,
                        players: this.players,
                        isInitialized: this.isInitialized,
                        isStarted: this.isStarted
                    })];
            });
        });
    };
    GenericGame.prototype.deserialize = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed;
            return __generator(this, function (_a) {
                parsed = JSON.parse(data);
                this.gameState = parsed.gameState;
                this.players = parsed.players;
                this.isInitialized = parsed.isInitialized;
                this.isStarted = parsed.isStarted;
                return [2 /*return*/];
            });
        });
    };
    // Event system implementation
    GenericGame.prototype.on = function (event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    };
    GenericGame.prototype.emit = function (event, data) {
        var listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(function (callback) {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error("Error in event listener for ".concat(event, ":"), error);
                }
            });
        }
    };
    GenericGame.prototype.off = function (event, callback) {
        if (!callback) {
            this.eventListeners.delete(event);
        }
        else {
            var listeners = this.eventListeners.get(event);
            if (listeners) {
                var index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }
    };
    return GenericGame;
}());
exports.GenericGame = GenericGame;

"use strict";
// 📍 Location: src/engines/GameEngine.ts
// 🎯 Purpose: Main game engine orchestrator for the entire gaming platform
// 🔗 Uses: Factory, all games, manages sessions, tournaments
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
var IGameEngine_1 = require("../interfaces/IGameEngine");
var UniversalGameFactory_1 = require("../factories/UniversalGameFactory");
/**
 * 🎮 Master Game Engine
 *
 * The central orchestrator that manages the entire gaming platform.
 * Handles sessions, players, tournaments, and all game operations.
 */
var GameEngine = /** @class */ (function () {
    function GameEngine(gameFactory) {
        this.sessions = new Map();
        this.tournaments = new Map();
        this.eventListeners = new Map();
        this.isRunning = false;
        this.startTime = null;
        this.healthChecks = new Map();
        this.gameFactory = gameFactory || new UniversalGameFactory_1.UniversalGameFactory();
        this.metrics = this.initializeMetrics();
        this.setupBuiltInHealthChecks();
    }
    /**
     * 🚀 Engine Lifecycle Management
     */
    GameEngine.prototype.initialize = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.config = __assign({ maxConcurrentSessions: 100, sessionTimeout: 60, autoCleanup: true, persistSessions: false, logLevel: 'info', metricsEnabled: true, crashReporting: false }, config);
                // Start cleanup timer if auto cleanup is enabled
                if (this.config.autoCleanup) {
                    this.startCleanupTimer();
                }
                this.emit(IGameEngine_1.EngineEventType.ENGINE_STARTED, { config: this.config });
                return [2 /*return*/];
            });
        });
    };
    /**
     * ⏸️ Pause the entire engine (all sessions)
     */
    GameEngine.prototype.pause = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessionArray, _i, sessionArray_1, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning) {
                            console.warn('⚠️ Engine is not running');
                            return [2 /*return*/];
                        }
                        sessionArray = Array.from(this.sessions.values());
                        for (_i = 0, sessionArray_1 = sessionArray; _i < sessionArray_1.length; _i++) {
                            session = sessionArray_1[_i];
                            if (session.status === 'active' && typeof session.game.pause === 'function') {
                                session.game.pause();
                                session.status = 'paused';
                                session.updatedAt = new Date();
                            }
                        }
                        this.isRunning = false;
                        if (typeof this.emit === 'function') {
                            this.emit('ENGINE_PAUSED', { pauseTime: new Date() });
                        }
                        console.log('⏸️ Game Engine paused');
                        return [2 /*return*/];
                }
            });
        });
    };

    /**
     * 🔄 Reset the engine to initial state
     */
    GameEngine.prototype.reset = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessionArray, _i, sessionArray_1, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔄 Resetting Game Engine...');
                        sessionArray = Array.from(this.sessions.values());
                        for (_i = 0, sessionArray_1 = sessionArray; _i < sessionArray_1.length; _i++) {
                            session = sessionArray_1[_i];
                            if (typeof session.game.end === 'function') {
                                session.game.end();
                            }
                        }
                        this.sessions.clear();
                        this.tournaments.clear();
                        this.eventListeners.clear();
                        this.healthChecks.clear();
                        this.isRunning = false;
                        this.startTime = null;
                        if (typeof this.initializeMetrics === 'function') {
                            this.metrics = this.initializeMetrics();
                        }
                        if (typeof this.setupBuiltInHealthChecks === 'function') {
                            this.setupBuiltInHealthChecks();
                        }
                        if (typeof this.emit === 'function') {
                            this.emit('ENGINE_RESET', { resetTime: new Date() });
                        }
                        console.log('✅ Game Engine reset to initial state');
                        return [2 /*return*/];
                }
            });
        });
    };
    GameEngine.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isRunning) {
                    console.warn('⚠️ Engine is already running');
                    return [2 /*return*/];
                }
                this.isRunning = true;
                this.startTime = new Date();
                this.emit(IGameEngine_1.EngineEventType.ENGINE_STARTED, { startTime: this.startTime });
                return [2 /*return*/];
            });
        });
    };
    GameEngine.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeSessions, _i, activeSessions_1, session, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning) {
                            console.warn('⚠️ Engine is not running');
                            return [2 /*return*/];
                        }
                        activeSessions = Array.from(this.sessions.values()).filter(function (s) { return s.status === 'active'; });
                        _i = 0, activeSessions_1 = activeSessions;
                        _a.label = 1;
                    case 1:
                        if (!(_i < activeSessions_1.length)) return [3 /*break*/, 6];
                        session = activeSessions_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.endGame(session.sessionId)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Failed to end session ".concat(session.sessionId, ":"), error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.isRunning = false;
                        this.emit(IGameEngine_1.EngineEventType.ENGINE_STOPPED, { stopTime: new Date() });
                        return [2 /*return*/];
                }
            });
        });
    };
    GameEngine.prototype.restart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        return [4 /*yield*/, this.stop()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.start()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🎮 Session Management - The Core Functionality
     */
    GameEngine.prototype.createGameSession = function (gameType_1, sessionId_1) {
        return __awaiter(this, arguments, void 0, function (gameType, sessionId, options) {
            var game, session, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Generate session ID if not provided
                        if (!sessionId) {
                            sessionId = "".concat(gameType, "-").concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                        }
                        // Check session limits
                        if (this.sessions.size >= this.config.maxConcurrentSessions) {
                            throw new Error("Maximum concurrent sessions limit reached: ".concat(this.config.maxConcurrentSessions));
                        }
                        // Check if session already exists
                        if (this.sessions.has(sessionId)) {
                            throw new Error("Session already exists: ".concat(sessionId));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.gameFactory.createGame("".concat(gameType, "-").concat(sessionId), options)];
                    case 2:
                        game = _a.sent();
                        // 2. Initialize the game
                        return [4 /*yield*/, game.initialize()];
                    case 3:
                        // 2. Initialize the game
                        _a.sent();
                        session = {
                            sessionId: sessionId,
                            gameId: game.gameId,
                            gameType: gameType,
                            game: game,
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
                        this.emit(IGameEngine_1.EngineEventType.SESSION_CREATED, { sessionId: sessionId, gameType: gameType });
                        return [2 /*return*/, session];
                    case 4:
                        error_2 = _a.sent();
                        console.error("\u274C Failed to create session ".concat(sessionId, ":"), error_2);
                        this.emit(IGameEngine_1.EngineEventType.SESSION_ERROR, { sessionId: sessionId, error: error_2.message });
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GameEngine.prototype.getGameSession = function (sessionId) {
        return this.sessions.get(sessionId) || null;
    };
    GameEngine.prototype.getAllSessions = function () {
        return Array.from(this.sessions.values());
    };
    GameEngine.prototype.destroyGameSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.sessions.get(sessionId);
                        if (!session) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(session.status === 'active')) return [3 /*break*/, 3];
                        return [4 /*yield*/, session.game.end()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        // Remove session
                        this.sessions.delete(sessionId);
                        // Update metrics
                        this.updateMetrics();
                        return [2 /*return*/, true];
                    case 4:
                        error_3 = _a.sent();
                        console.error("\u274C Failed to destroy session ".concat(sessionId, ":"), error_3);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🎮 Universal Game Operations
     */
    GameEngine.prototype.startGame = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.getGameSession(sessionId);
                        if (!session) {
                            throw new Error("Session not found: ".concat(sessionId));
                        }
                        if (session.status !== 'created') {
                            throw new Error("Cannot start game in ".concat(session.status, " state"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, session.game.start()];
                    case 2:
                        _a.sent();
                        session.status = 'active';
                        session.updatedAt = new Date();
                        this.emit(IGameEngine_1.EngineEventType.SESSION_STARTED, { sessionId: sessionId });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        session.status = 'error';
                        console.error("\u274C Failed to start game in session ".concat(sessionId, ":"), error_4);
                        this.emit(IGameEngine_1.EngineEventType.SESSION_ERROR, { sessionId: sessionId, error: error_4.message });
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GameEngine.prototype.pauseGame = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                session = this.getGameSession(sessionId);
                if (!session) {
                    throw new Error("Session not found: ".concat(sessionId));
                }
                if (session.status !== 'active') {
                    throw new Error("Cannot pause game in ".concat(session.status, " state"));
                }
                session.game.pause();
                session.status = 'paused';
                session.updatedAt = new Date();
                return [2 /*return*/];
            });
        });
    };
    GameEngine.prototype.resumeGame = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                session = this.getGameSession(sessionId);
                if (!session) {
                    throw new Error("Session not found: ".concat(sessionId));
                }
                if (session.status !== 'paused') {
                    throw new Error("Cannot resume game in ".concat(session.status, " state"));
                }
                session.game.resume();
                session.status = 'active';
                session.updatedAt = new Date();
                return [2 /*return*/];
            });
        });
    };
    GameEngine.prototype.endGame = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.getGameSession(sessionId);
                        if (!session) {
                            throw new Error("Session not found: ".concat(sessionId));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, session.game.end()];
                    case 2:
                        _a.sent();
                        session.status = 'completed';
                        session.updatedAt = new Date();
                        this.emit(IGameEngine_1.EngineEventType.SESSION_ENDED, { sessionId: sessionId });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        session.status = 'error';
                        console.error("\u274C Failed to end game in session ".concat(sessionId, ":"), error_5);
                        this.emit(IGameEngine_1.EngineEventType.SESSION_ERROR, { sessionId: sessionId, error: error_5.message });
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 👥 Player Management
     */
    GameEngine.prototype.addPlayerToSession = function (sessionId, player) {
        return __awaiter(this, void 0, void 0, function () {
            var session, success;
            return __generator(this, function (_a) {
                session = this.getGameSession(sessionId);
                if (!session) {
                    throw new Error("Session not found: ".concat(sessionId));
                }
                success = session.game.addPlayer(player);
                if (success) {
                    session.players.push(player);
                    session.updatedAt = new Date();
                    this.emit(IGameEngine_1.EngineEventType.PLAYER_JOINED, { sessionId: sessionId, playerId: player.id });
                }
                return [2 /*return*/, success];
            });
        });
    };
    GameEngine.prototype.removePlayerFromSession = function (sessionId, playerId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, gameSuccess;
            return __generator(this, function (_a) {
                session = this.getGameSession(sessionId);
                if (!session) {
                    throw new Error("Session not found: ".concat(sessionId));
                }
                gameSuccess = session.game.removePlayer(playerId);
                if (gameSuccess) {
                    session.players = session.players.filter(function (p) { return p.id !== playerId; });
                    session.updatedAt = new Date();
                    this.emit(IGameEngine_1.EngineEventType.PLAYER_LEFT, { sessionId: sessionId, playerId: playerId });
                }
                return [2 /*return*/, gameSuccess];
            });
        });
    };
    GameEngine.prototype.movePlayerBetweenSessions = function (playerId, fromSession, toSession) {
        return __awaiter(this, void 0, void 0, function () {
            var fromSessionObj, toSessionObj, player, removed, added;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fromSessionObj = this.getGameSession(fromSession);
                        toSessionObj = this.getGameSession(toSession);
                        if (!fromSessionObj || !toSessionObj) {
                            throw new Error('One or both sessions not found');
                        }
                        player = fromSessionObj.players.find(function (p) { return p.id === playerId; });
                        if (!player) {
                            throw new Error("Player ".concat(playerId, " not found in session ").concat(fromSession));
                        }
                        return [4 /*yield*/, this.removePlayerFromSession(fromSession, playerId)];
                    case 1:
                        removed = _a.sent();
                        if (!removed) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.addPlayerToSession(toSession, player)];
                    case 2:
                        added = _a.sent();
                        if (!!added) return [3 /*break*/, 4];
                        // Rollback - add back to original session
                        return [4 /*yield*/, this.addPlayerToSession(fromSession, player)];
                    case 3:
                        // Rollback - add back to original session
                        _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/, true];
                    case 5: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * 🎯 Action Processing - The Heart of Gameplay
     */
    GameEngine.prototype.processPlayerAction = function (sessionId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.getGameSession(sessionId);
                        if (!session) {
                            throw new Error("Session not found: ".concat(sessionId));
                        }
                        if (session.status !== 'active') {
                            throw new Error("Cannot process actions in ".concat(session.status, " session"));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, session.game.handlePlayerAction(action)];
                    case 2:
                        result = _a.sent();
                        session.updatedAt = new Date();
                        this.emit(IGameEngine_1.EngineEventType.PLAYER_ACTION, { sessionId: sessionId, action: action, result: result });
                        // Emit game state change if applicable
                        if (result.gameStateChanged) {
                            this.emit(IGameEngine_1.EngineEventType.GAME_STATE_CHANGED, {
                                sessionId: sessionId,
                                newState: session.game.getState()
                            });
                        }
                        // Emit score update if applicable
                        if (result.scoreChange) {
                            this.emit(IGameEngine_1.EngineEventType.GAME_SCORE_UPDATED, {
                                sessionId: sessionId,
                                playerId: action.playerId,
                                scoreChange: result.scoreChange,
                                newScore: result.newScore
                            });
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_6 = _a.sent();
                        console.error("\u274C Failed to process action in session ".concat(sessionId, ":"), error_6);
                        this.emit(IGameEngine_1.EngineEventType.SESSION_ERROR, { sessionId: sessionId, error: error_6.message });
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GameEngine.prototype.broadcastToSession = function (sessionId, event, data) {
        return __awaiter(this, void 0, void 0, function () {
            var session;
            return __generator(this, function (_a) {
                session = this.getGameSession(sessionId);
                if (!session) {
                    throw new Error("Session not found: ".concat(sessionId));
                }
                // Broadcast to all players in the session
                session.game.emit(event, __assign({ sessionId: sessionId }, data));
                return [2 /*return*/];
            });
        });
    };
    GameEngine.prototype.broadcastToAllSessions = function (event, data) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionArray, _i, sessionArray_1, session, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionArray = Array.from(this.sessions.values());
                        _i = 0, sessionArray_1 = sessionArray;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sessionArray_1.length)) return [3 /*break*/, 6];
                        session = sessionArray_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.broadcastToSession(session.sessionId, event, data)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        console.error("Failed to broadcast to session ".concat(session.sessionId, ":"), error_7);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🔍 Game Discovery and Management
     */
    GameEngine.prototype.getAvailableGameTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var discoveryResults, uniqueGameTypes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.gameFactory.getAvailableGames()];
                    case 1:
                        discoveryResults = _a.sent();
                        uniqueGameTypes = new Set(discoveryResults.map(function (result) { return result.gameType; }));
                        return [2 /*return*/, Array.from(uniqueGameTypes)];
                }
            });
        });
    };
    GameEngine.prototype.getGameConfig = function (gameType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // For now, return null - in a real implementation this would 
                    // access the GameConfigManager directly
                    return [2 /*return*/, null];
                }
                catch (error) {
                    console.error("Failed to get config for game type ".concat(gameType, ":"), error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    GameEngine.prototype.registerGameType = function (gameType, gameClass) {
        this.gameFactory.registerGameType(gameType, gameClass);
    };
    GameEngine.prototype.unregisterGameType = function (gameType) {
        this.gameFactory.unregisterGameType(gameType);
    };
    /**
     * 📊 Monitoring and Health
     */
    GameEngine.prototype.getEngineMetrics = function () {
        this.updateMetrics();
        return __assign({}, this.metrics);
    };
    GameEngine.prototype.getEngineStatus = function () {
        var uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
        return {
            isRunning: this.isRunning,
            uptime: uptime,
            version: '1.0.0',
            activeSessions: this.sessions.size,
            totalPlayers: this.getTotalPlayerCount(),
            memoryUsage: this.getMemoryUsage(),
            lastError: null // TODO: Implement error tracking
        };
    };
    GameEngine.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var checks, startTime, healthCheckEntries, _i, healthCheckEntries_1, _a, name_1, checkFn, checkStart, result_1, error_8, failedChecks, warnChecks, overallStatus, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        checks = [];
                        startTime = Date.now();
                        healthCheckEntries = Array.from(this.healthChecks.entries());
                        _i = 0, healthCheckEntries_1 = healthCheckEntries;
                        _b.label = 1;
                    case 1:
                        if (!(_i < healthCheckEntries_1.length)) return [3 /*break*/, 6];
                        _a = healthCheckEntries_1[_i], name_1 = _a[0], checkFn = _a[1];
                        checkStart = Date.now();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, checkFn()];
                    case 3:
                        result_1 = _b.sent();
                        checks.push({
                            name: name_1,
                            status: result_1 ? 'pass' : 'fail',
                            duration: Date.now() - checkStart
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _b.sent();
                        checks.push({
                            name: name_1,
                            status: 'fail',
                            message: error_8.message,
                            duration: Date.now() - checkStart
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        failedChecks = checks.filter(function (c) { return c.status === 'fail'; }).length;
                        warnChecks = checks.filter(function (c) { return c.status === 'warn'; }).length;
                        if (failedChecks === 0) {
                            overallStatus = warnChecks > 0 ? 'degraded' : 'healthy';
                        }
                        else {
                            overallStatus = 'unhealthy';
                        }
                        result = {
                            healthy: overallStatus === 'healthy',
                            timestamp: new Date(),
                            checks: checks,
                            overallStatus: overallStatus
                        };
                        this.emit(IGameEngine_1.EngineEventType.HEALTH_CHECK_COMPLETED, result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 🎉 Event System
     */
    GameEngine.prototype.on = function (event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    };
    GameEngine.prototype.emit = function (event, data) {
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
    GameEngine.prototype.off = function (event, callback) {
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
    /**
     * 💾 Persistence
     */
    GameEngine.prototype.saveEngineState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                state = {
                    config: this.config,
                    sessions: Array.from(this.sessions.entries()).map(function (_a) {
                        var id = _a[0], session = _a[1];
                        return ({
                            id: id,
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
                        });
                    }),
                    metrics: this.metrics,
                    isRunning: this.isRunning,
                    startTime: this.startTime
                };
                return [2 /*return*/, JSON.stringify(state)];
            });
        });
    };
    GameEngine.prototype.loadEngineState = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                try {
                    state = JSON.parse(data);
                    // Restore basic state
                    this.config = state.config;
                    this.metrics = state.metrics;
                    this.isRunning = state.isRunning;
                    this.startTime = state.startTime ? new Date(state.startTime) : null;
                    // Restore sessions (this is complex and might need game-specific logic)
                }
                catch (error) {
                    console.error('Failed to load engine state:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 🏆 Tournament Support (Advanced Feature)
     */
    GameEngine.prototype.createTournament = function (gameType_1, players_1) {
        return __awaiter(this, arguments, void 0, function (gameType, players, config) {
            var tournamentId, tournament;
            if (config === void 0) { config = {}; }
            return __generator(this, function (_a) {
                tournamentId = "tournament-".concat(gameType, "-").concat(Date.now());
                tournament = {
                    tournamentId: tournamentId,
                    gameType: gameType,
                    players: players,
                    status: 'created',
                    rounds: [],
                    createdAt: new Date(),
                    config: config
                };
                this.tournaments.set(tournamentId, tournament);
                return [2 /*return*/, tournamentId];
            });
        });
    };
    GameEngine.prototype.getActiveTournaments = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.tournaments.values()).filter(function (t) {
                        return t.status === 'active' || t.status === 'created';
                    })];
            });
        });
    };
    GameEngine.prototype.scheduleGameSession = function (gameType_1, scheduledTime_1) {
        return __awaiter(this, arguments, void 0, function (gameType, scheduledTime, options) {
            var sessionId;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                sessionId = "scheduled-".concat(gameType, "-").concat(scheduledTime.getTime());
                return [2 /*return*/, sessionId];
            });
        });
    };
    /**
     * 🔧 Private Helper Methods
     */
    GameEngine.prototype.initializeMetrics = function () {
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
    };
    GameEngine.prototype.updateMetrics = function () {
        this.metrics.activeSessions = this.sessions.size;
        this.metrics.totalPlayersActive = this.getTotalPlayerCount();
        this.metrics.memoryUsage = this.getMemoryUsage().used;
        this.metrics.lastUpdated = new Date();
        if (this.config.metricsEnabled) {
            this.emit(IGameEngine_1.EngineEventType.METRICS_UPDATED, this.metrics);
        }
    };
    GameEngine.prototype.getTotalPlayerCount = function () {
        return Array.from(this.sessions.values()).reduce(function (total, session) {
            return total + session.players.length;
        }, 0);
    };
    GameEngine.prototype.getMemoryUsage = function () {
        // In a real implementation, this would use process.memoryUsage()
        return {
            used: 50 * 1024 * 1024, // 50MB (mock)
            total: 512 * 1024 * 1024, // 512MB (mock)
            percentage: 9.76 // mock
        };
    };
    GameEngine.prototype.setupBuiltInHealthChecks = function () {
        var _this = this;
        // Engine health check
        this.healthChecks.set('engine-status', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.isRunning];
            });
        }); });
        // Memory health check
        this.healthChecks.set('memory-usage', function () { return __awaiter(_this, void 0, void 0, function () {
            var memory;
            return __generator(this, function (_a) {
                memory = this.getMemoryUsage();
                return [2 /*return*/, memory.percentage < 90]; // Fail if over 90% memory usage
            });
        }); });
        // Session health check
        this.healthChecks.set('session-count', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sessions.size < this.config.maxConcurrentSessions];
            });
        }); });
    };
    GameEngine.prototype.startCleanupTimer = function () {
        var _this = this;
        // Run cleanup every 5 minutes
        setInterval(function () {
            _this.performCleanup();
        }, 5 * 60 * 1000);
    };
    GameEngine.prototype.performCleanup = function () {
        var now = Date.now();
        var timeoutMs = this.config.sessionTimeout * 60 * 1000;
        var cleanedCount = 0;
        var sessionEntries = Array.from(this.sessions.entries());
        for (var _i = 0, sessionEntries_1 = sessionEntries; _i < sessionEntries_1.length; _i++) {
            var _a = sessionEntries_1[_i], sessionId = _a[0], session = _a[1];
            var sessionAge = now - session.updatedAt.getTime();
            if (sessionAge > timeoutMs && (session.status === 'completed' || session.status === 'error')) {
                this.sessions.delete(sessionId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            this.emit(IGameEngine_1.EngineEventType.CLEANUP_COMPLETED, { cleanedSessions: cleanedCount });
        }
    };
    return GameEngine;
}());
exports.GameEngine = GameEngine;

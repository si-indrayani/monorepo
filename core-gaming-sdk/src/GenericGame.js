"use strict";
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
exports.GenericGame = void 0;
// Generic Game Base Class - Foundation for all game implementations
var interfaces_js_1 = require("./interfaces.js");
/**
 * Base class that provides common game functionality
 */
var GenericGame = /** @class */ (function () {
    function GenericGame(config) {
        this.players = new Map();
        this.eventListeners = new Map();
        this.gameId = config.gameId;
        this.metadata = config.metadata;
        this.config = config;
        this._state = {
            status: interfaces_js_1.GameStateEnum.IDLE,
            metadata: {},
        };
    }
    /**
     * Start the game
     */
    GenericGame.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this._state.status !== interfaces_js_1.GameStateEnum.READY) {
                    throw new Error('Game must be initialized before starting');
                }
                this.startTime = new Date();
                this._state = __assign(__assign({}, this._state), { status: interfaces_js_1.GameStateEnum.PLAYING, startTime: this.startTime });
                this.emit('gameStarted', { gameId: this.gameId, startTime: this.startTime });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Pause the game
     */
    GenericGame.prototype.pause = function () {
        if (this._state.status === interfaces_js_1.GameStateEnum.PLAYING) {
            this._state.status = interfaces_js_1.GameStateEnum.PAUSED;
            this.emit('gamePaused', { gameId: this.gameId });
        }
    };
    /**
     * Resume the game
     */
    GenericGame.prototype.resume = function () {
        if (this._state.status === interfaces_js_1.GameStateEnum.PAUSED) {
            this._state.status = interfaces_js_1.GameStateEnum.PLAYING;
            this.emit('gameResumed', { gameId: this.gameId });
        }
    };
    /**
     * End the game
     */
    GenericGame.prototype.end = function () {
        return __awaiter(this, void 0, void 0, function () {
            var endTime;
            return __generator(this, function (_a) {
                endTime = new Date();
                this._state = __assign(__assign({}, this._state), { status: interfaces_js_1.GameStateEnum.ENDED, endTime: endTime });
                this.emit('gameEnded', {
                    gameId: this.gameId,
                    endTime: endTime,
                    finalScore: this.getScore()
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get current game state
     */
    GenericGame.prototype.getState = function () {
        return __assign({}, this._state);
    };
    /**
     * Get game metadata
     */
    GenericGame.prototype.getMetadata = function () {
        return __assign({}, this.metadata);
    };
    /**
     * Get all players
     */
    GenericGame.prototype.getPlayers = function () {
        return Array.from(this.players.values());
    };
    /**
     * Add a player to the game
     */
    GenericGame.prototype.addPlayer = function (player) {
        if (this.players.size >= (this.metadata.maxPlayers || 1)) {
            return false;
        }
        this.players.set(player.id, player);
        this.emit('playerAdded', { gameId: this.gameId, player: player });
        return true;
    };
    /**
     * Remove a player from the game
     */
    GenericGame.prototype.removePlayer = function (playerId) {
        var removed = this.players.delete(playerId);
        if (removed) {
            this.emit('playerRemoved', { gameId: this.gameId, playerId: playerId });
        }
        return removed;
    };
    /**
     * Add event listener
     */
    GenericGame.prototype.on = function (event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    };
    /**
     * Remove event listener
     */
    GenericGame.prototype.off = function (event, callback) {
        var listeners = this.eventListeners.get(event);
        if (listeners) {
            var index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    };
    /**
     * Emit event to all listeners
     */
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
    /**
     * Update game state and emit change event
     */
    GenericGame.prototype.setState = function (newState) {
        var previousState = __assign({}, this._state);
        this._state = __assign(__assign({}, this._state), newState);
        this.emit('stateChanged', {
            gameId: this.gameId,
            previousState: previousState,
            newState: this._state,
        });
    };
    /**
     * Check if game is active (playing or paused)
     */
    GenericGame.prototype.isActive = function () {
        return this._state.status === interfaces_js_1.GameStateEnum.PLAYING || this._state.status === interfaces_js_1.GameStateEnum.PAUSED;
    };
    /**
     * Check if game is finished
     */
    GenericGame.prototype.isFinished = function () {
        return this._state.status === interfaces_js_1.GameStateEnum.COMPLETED || this._state.status === interfaces_js_1.GameStateEnum.ENDED;
    };
    return GenericGame;
}());
exports.GenericGame = GenericGame;

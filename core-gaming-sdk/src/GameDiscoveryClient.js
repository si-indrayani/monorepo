"use strict";
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
exports.GameDiscoveryClient = void 0;
/**
 * Client for discovering available games from server
 */
var GameDiscoveryClient = /** @class */ (function () {
    function GameDiscoveryClient(apiEndpoint) {
        if (apiEndpoint === void 0) { apiEndpoint = 'https://api.games.platform.com'; }
        this.cache = new Map();
        this.apiEndpoint = apiEndpoint;
    }
    /**
     * Discover games based on query parameters
     */
    GameDiscoveryClient.prototype.discoverGames = function (gameType_1) {
        return __awaiter(this, arguments, void 0, function (gameType, query) {
            var cacheKey, mockGames;
            if (query === void 0) { query = {}; }
            return __generator(this, function (_a) {
                cacheKey = this.generateCacheKey(gameType, query);
                // Check cache first
                if (this.cache.has(cacheKey)) {
                    return [2 /*return*/, this.cache.get(cacheKey)];
                }
                try {
                    mockGames = this.generateMockGames(gameType, query);
                    // Cache the results
                    this.cache.set(cacheKey, mockGames);
                    return [2 /*return*/, mockGames];
                }
                catch (error) {
                    console.error('❌ Game discovery failed:', error);
                    throw new Error("Failed to discover games: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generate cache key for query
     */
    GameDiscoveryClient.prototype.generateCacheKey = function (gameType, query) {
        return "".concat(gameType, "_").concat(JSON.stringify(query));
    };
    /**
     * Generate mock game configurations for development
     */
    GameDiscoveryClient.prototype.generateMockGames = function (gameType, query) {
        if (query === void 0) { query = {}; }
        if (gameType === 'quiz') {
            return [
                {
                    gameId: 'quiz-trivia-general',
                    metadata: {
                        id: 'quiz-trivia-general',
                        name: 'General Knowledge Quiz',
                        version: '1.0.0',
                        description: 'Test your knowledge across various topics',
                        category: query.category || 'general',
                        tags: ['trivia', 'knowledge', 'general'],
                        minPlayers: 1,
                        maxPlayers: 1,
                        estimatedDuration: 10,
                    },
                    scoringRules: {
                        correct_answer: 10,
                        wrong_answer: 0,
                        time_bonus: 5,
                    },
                    gameRules: {
                        maxDuration: 15,
                        maxRounds: 10,
                    },
                    ui: {
                        theme: { primary: '#007aff' },
                        layout: 'standard',
                    },
                    storage: {
                        persistent: true,
                        strategy: 'localStorage',
                    },
                },
            ];
        }
        return [];
    };
    /**
     * Clear all cached game configurations
     */
    GameDiscoveryClient.prototype.clearCache = function () {
        this.cache.clear();
    };
    return GameDiscoveryClient;
}());
exports.GameDiscoveryClient = GameDiscoveryClient;

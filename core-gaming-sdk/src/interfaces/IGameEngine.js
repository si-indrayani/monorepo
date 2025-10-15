"use strict";
// 📍 Location: src/interfaces/IGameEngine.ts
// 🎯 Purpose: Game engine orchestration interface
// 🔗 Used by: GameEngine implementation
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineEventType = void 0;
/**
 * 📝 Engine Event Types
 *
 * Standard events emitted by the game engine
 */
var EngineEventType;
(function (EngineEventType) {
    // Engine lifecycle
    EngineEventType["ENGINE_STARTED"] = "engine:started";
    EngineEventType["ENGINE_STOPPED"] = "engine:stopped";
    EngineEventType["ENGINE_ERROR"] = "engine:error";
    // Session events
    EngineEventType["SESSION_CREATED"] = "session:created";
    EngineEventType["SESSION_STARTED"] = "session:started";
    EngineEventType["SESSION_ENDED"] = "session:ended";
    EngineEventType["SESSION_ERROR"] = "session:error";
    // Player events
    EngineEventType["PLAYER_JOINED"] = "player:joined";
    EngineEventType["PLAYER_LEFT"] = "player:left";
    EngineEventType["PLAYER_ACTION"] = "player:action";
    // Game events
    EngineEventType["GAME_STATE_CHANGED"] = "game:state:changed";
    EngineEventType["GAME_SCORE_UPDATED"] = "game:score:updated";
    EngineEventType["GAME_COMPLETED"] = "game:completed";
    // System events
    EngineEventType["METRICS_UPDATED"] = "metrics:updated";
    EngineEventType["HEALTH_CHECK_COMPLETED"] = "health:check:completed";
    EngineEventType["CLEANUP_COMPLETED"] = "cleanup:completed";
})(EngineEventType || (exports.EngineEventType = EngineEventType = {}));

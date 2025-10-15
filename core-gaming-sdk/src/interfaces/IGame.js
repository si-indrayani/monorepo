"use strict";
// 📍 Location: src/interfaces/IGame.ts
// 🎯 Purpose: Defines what EVERY game must implement
// 🔗 Used by: All game classes, factory, engine
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateEnum = void 0;
var GameStateEnum;
(function (GameStateEnum) {
    GameStateEnum["IDLE"] = "idle";
    GameStateEnum["INITIALIZING"] = "initializing";
    GameStateEnum["READY"] = "ready";
    GameStateEnum["RUNNING"] = "running";
    GameStateEnum["PAUSED"] = "paused";
    GameStateEnum["ENDED"] = "ended";
    GameStateEnum["ERROR"] = "error";
})(GameStateEnum || (exports.GameStateEnum = GameStateEnum = {}));

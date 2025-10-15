"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: ['preact'],
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    esbuildOptions: function (options) {
        options.jsx = 'automatic';
        options.jsxImportSource = 'preact';
    }
});

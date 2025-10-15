# 🎮 Core Gaming SDK - Class-Based Polymorphic Architecture

## Overview

This document describes the class-based polymorphic architecture implemented for the Core Gaming SDK, featuring proper separation of concerns, validation rules, and extensible game loading system.

## 🏗️ Class-Based Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CORE GAMING SDK                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  GameSelector   │  │  GameRegistry   │  │ GameLoader  │ │
│  │  (Orchestrator) │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                     │                   │       │
│           └─────────────────────┼───────────────────┘       │
│                                 │                           │
│                    ┌────────────▼────────────┐              │
│                    │     GameValidator      │              │
│                    └─────────────────────────┘              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   PuzzleGame    │  │   TriviaGame    │  │  Game+      │ │
│  │   (Concrete)    │  │   (Concrete)    │  │  (Abstract) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │BrowserCompatRule│  │NetworkConnectRule│  │GameResource│ │
│  │                 │  │  (CORS-aware)   │  │Rule (CORS- │ │
│  └─────────────────┘  └─────────────────┘  │  aware)    │ │
│           │                     │                   │       │
│           └─────────────────────┼───────────────────┘       │
│                                 │                           │
│                    ┌────────────▼────────────┐              │
│                    │   GameLoadRule         │              │
│                    │   (Interface)          │              │
│                    └─────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Patterns Used

### 1. Polymorphism
- **Abstract Base Class**: `Game` with concrete implementations `PuzzleGame`, `TriviaGame`
- **Interface**: `GameLoadRule` with multiple rule implementations
- **Strategy Pattern**: Different validation rules applied to games

### 2. Rules Engine
- **Pre-loading Validation**: Browser compatibility, network connectivity, resource availability
- **Extensible Rules**: Easy to add new validation rules
- **Async Validation**: Rules return Promises for async validation
- **CORS Handling**: Graceful fallback when CORS restrictions apply

### 3. Separation of Concerns
- **GameSelector**: UI orchestration and user interaction
- **GameRegistry**: Game management and registration
- **GameLoader**: Script loading logic
- **GameValidator**: Validation rule execution

## 📋 Scope Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SCOPE DIAGRAM                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                CORE RESPONSIBILITIES               │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  • Game Discovery & Registration                   │   │
│  │  • UI Rendering & State Management                 │   │
│  │  • Validation Rule Execution                       │   │
│  │  • Script Loading Orchestration                    │   │
│  │  • Error Handling & User Feedback                  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │               GAME-SPECIFIC LOGIC                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  • Game Metadata (name, emoji, gradient)           │   │
│  │  • Event Names for Script Loading                  │   │
│  │  • Game-specific Validation Rules                  │   │
│  │  • UI Customization (colors, styling)              │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 VALIDATION RULES                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  • Browser Compatibility Checks                    │   │
│  │  • Network Connectivity Tests (CORS-aware)         │   │
│  │  • Resource Availability Verification (CORS-aware) │   │
│  │  • Custom Business Rules                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Core and Game Segregation

### Core Components (Framework)
```typescript
// Always available, framework-level classes
- GameSelector (Main orchestrator)
- GameRegistry (Game management)
- GameLoader (Loading logic)
- GameValidator (Validation engine)
- GameLoadRule (Rule interface)
```

### Game Components (Extensible)
```typescript
// Game-specific implementations
- PuzzleGame extends Game
- TriviaGame extends Game
- CustomGame extends Game (future games)
```

### Rule Components (Pluggable)
```typescript
// Validation rules (can be added/removed)
- BrowserCompatibilityRule
- NetworkConnectivityRule
- GameResourceRule
- CustomValidationRule (business-specific)
```

## 📚 Class Documentation

### GameLoadRule Interface
```typescript
interface GameLoadRule {
    validate(game: Game): Promise<boolean>;
    getErrorMessage(): string;
}
```

**Purpose**: Defines the contract for validation rules that must be checked before loading a game.

### Game Abstract Class
```typescript
abstract class Game {
    protected name: string;
    protected baseUrl: string;
    protected emoji: string;
    protected rules: GameLoadRule[];

    // Abstract methods
    abstract getScriptsLoadedEvent(): string;
    abstract getGradient(): string;

    // Concrete methods
    getName(): string;
    getBaseUrl(): string;
    getEmoji(): string;
    getDisplayName(): string;
    async validateRules(): Promise<{valid: boolean, errors: string[]}>;
    addRule(rule: GameLoadRule): void;
}
```

**Purpose**: Base class for all games, providing common functionality and requiring game-specific implementations.

### GameSelector Class
```typescript
export class GameSelector {
    private container: HTMLElement;
    private s3BaseUrl: string;
    private gameRegistry: GameRegistry;
    private gameLoader: GameLoader;
    private gameValidator: GameValidator;

    constructor(containerId: string, s3BaseUrl?: string);
    // ... UI and game loading methods
}
```

**Purpose**: Main orchestrator that manages the entire game loading lifecycle.

### GameRegistry Class
```typescript
class GameRegistry {
    private games: Map<string, Game> = new Map();

    registerGame(game: Game): void;
    getGame(name: string): Game | undefined;
    getAllGames(): Game[];
}
```

**Purpose**: Manages the collection of available games.

### GameLoader Class
```typescript
class GameLoader {
    private s3BaseUrl: string;

    constructor(s3BaseUrl: string);
    async loadGame(game: Game, container: HTMLElement): Promise<void>;
}
```

**Purpose**: Handles the actual loading of game scripts from S3.

### GameValidator Class
```typescript
class GameValidator {
    async validateGame(game: Game): Promise<{valid: boolean, errors: string[]}>;
}
```

**Purpose**: Executes all validation rules for a game before loading.

## 🚀 Benefits of This Architecture

### 1. Extensibility
- **New Games**: Just create a new class extending `Game`
- **New Rules**: Implement `GameLoadRule` interface
- **Zero Code Changes**: Core framework remains unchanged

### 2. Maintainability
- **Single Responsibility**: Each class has one clear purpose
- **Dependency Injection**: Components are loosely coupled
- **Testability**: Each component can be unit tested independently

### 3. Polymorphism Benefits
- **Consistent Interface**: All games behave the same way
- **Type Safety**: TypeScript ensures correct implementation
- **Runtime Flexibility**: Games can be added dynamically

### 4. Validation Framework
- **Pre-loading Checks**: Games are validated before loading
- **User Feedback**: Clear error messages for failed validations
- **Async Support**: Rules can perform network checks, etc.

## 📝 Usage Example

```typescript
// Initialize the gaming hub
import { initGameSelector } from '@si/core-gaming-sdk';

const gameSelector = initGameSelector('game-container');

// The system automatically:
// 1. Registers PuzzleGame and TriviaGame
// 2. Applies validation rules before loading
// 3. Uses polymorphic behavior for different games
// 4. Handles errors gracefully
```

## 🔄 Game Loading Flow

1. **User selects a game** → `GameSelector.showGameOptions()`
2. **Validation phase** → `GameValidator.validateGame()`
   - Browser compatibility check
   - Network connectivity check
   - Resource availability check
3. **Loading phase** → `GameLoader.loadGame()`
   - Load main script from S3
   - Wait for scripts-loaded event
4. **Mounting phase** → Wait for React to mount
5. **Completion** → Hide loading UI, show game

## 🧪 Testing Strategy

### Unit Tests
- **Game Classes**: Test concrete implementations
- **Validation Rules**: Test each rule independently
- **Core Components**: Test business logic

### Integration Tests
- **Full Loading Flow**: Test complete game loading process
- **Error Scenarios**: Test validation failures and error handling
- **UI Interactions**: Test user interactions and state changes

### E2E Tests
- **Real Game Loading**: Test actual game loading from S3
- **Cross-browser**: Test compatibility across different browsers
- **Network Conditions**: Test under various network conditions

## 🔮 Future Extensions

### Adding New Games
```typescript
class NewGame extends Game {
    constructor(baseUrl: string) {
        super('newgame', baseUrl, '🎯');
    }

    getScriptsLoadedEvent(): string {
        return 'newgame-scripts-loaded';
    }

    getGradient(): string {
        return 'linear-gradient(45deg, #your-color, #your-color)';
    }
}

// Register in GameSelector constructor
this.gameRegistry.registerGame(new NewGame(s3BaseUrl));
```

### Adding New Validation Rules
```typescript
class CustomRule implements GameLoadRule {
    async validate(game: Game): Promise<boolean> {
        // Your custom validation logic
        return true;
    }

    getErrorMessage(): string {
        return 'Custom validation failed';
    }
}

// Add to specific game
game.addRule(new CustomRule());
```

## 📊 Performance Considerations

- **Async Loading**: Scripts load in parallel for better performance
- **Validation Caching**: Rules can cache results to avoid repeated checks
- **Lazy Loading**: Games are only loaded when selected
- **Resource Optimization**: Minimal bundle size with tree shaking

## 🔒 Security Considerations

- **Input Validation**: All user inputs are validated
- **Script Loading**: Only load from trusted S3 domains
- **Error Handling**: Graceful error handling without exposing internals
- **CSP Compliance**: Architecture supports Content Security Policy
- **CORS Handling**: Validation rules gracefully handle CORS restrictions in development environments

---

This architecture provides a solid foundation for scalable game loading with proper validation, clear separation of concerns, and extensible design patterns. The polymorphic approach ensures consistency while allowing for game-specific customizations.

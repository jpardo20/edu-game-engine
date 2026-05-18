# Architecture Overview

## Introduction

`edu-game-engine` is a modular browser-based educational game engine designed to support configurable quiz and board-based learning experiences.

The project evolved from a monolithic JavaScript prototype into a modular frontend architecture with separated responsibilities, centralized state management and renderer isolation.

---

# Current Architecture

```plaintext
js/
├── app.js
├── core/
├── render/
```

---

# High-Level Responsibilities

| Layer | Responsibility |
|---|---|
| `app.js` | Composition root, initialization, dependency wiring |
| `core/` | Game logic, state, movement, persistence, rules |
| `render/` | UI rendering and DOM updates |

---

# app.js

`app.js` acts as the application entry point and composition root.

Its responsibilities are:

- Initialize the game
- Load configuration and data
- Wire modules together
- Configure event listeners
- Coordinate rendering and gameplay flow

`app.js` should NOT contain:

- Business rules
- Rendering logic
- State mutation logic
- Movement calculations

---

# Core Layer

The `core/` folder contains the gameplay logic and engine services.

---

## state.js

Centralized game state container.

Stores:

- teams
- active turn
- board
- configuration
- game progress

Acts as the single source of truth for the application state.

---

## gameEngine.js

Core gameplay engine.

Responsibilities:

- dice rolling
- player movement
- turn management
- unfair system logic
- state mutations

Important architectural decision:

The engine does NOT interact with:

- DOM
- HTML
- CSS
- renderers
- browser globals

---

## movement.js

Contains pure movement calculations.

Example:

```js
calculateNextPosition()
```

This module is intentionally renderer-independent.

---

## movementAnimation.js

Handles visual movement animations.

Separates:

- game logic
- visual animation timing

---

## dice.js

Pure dice rolling logic.

No DOM interaction.

---

## questions.js

Question management service.

Responsibilities:

- random question selection
- repeated question prevention

---

## teamBuilder.js

Responsible for randomized team creation.

Separates team generation from UI and engine logic.

---

## boardFactory.js

Board generation utilities.

Responsibilities:

- board creation
- category label resolution

---

## gamePersistence.js

Persistence abstraction layer.

Handles:

- saving games
- loading games
- saving teams
- loading teams

Uses browser localStorage through lower-level persistence services.

---

## gameSetup.js

Application setup and bootstrapping helpers.

Responsibilities:

- configuration loading
- JSON loading
- initial data preparation

---

## modalService.js

Handles:

- question modals
- timers
- overlay interactions

---

# Render Layer

The `render/` folder is responsible ONLY for UI rendering.

Renderers should never contain gameplay rules.

---

## renderBoard.js

Board rendering system.

Responsibilities:

- board drawing
- tokens rendering
- board layout
- category labels

---

## renderScoreboard.js

Scoreboard rendering system.

Responsibilities:

- score bars
- active team highlighting
- score labels
- score tooltips

---

## renderDice.js

Dice UI rendering.

Responsibilities:

- dice value rendering
- dice reset animations

---

# Architectural Principles

---

## 1. Separation of Responsibilities

Each module should have a single clear responsibility.

---

## 2. Explicit Dependencies

Modules communicate through parameters and imports.

The architecture intentionally avoids:

```js
window.*
```

globals between modules.

---

## 3. Renderer Isolation

Renderers:

- display data
- never own game logic

---

## 4. Centralized State

All important runtime state is centralized inside:

```plaintext
core/state.js
```

---

## 5. Incremental Refactoring

The architecture was evolved progressively through small refactors instead of a full rewrite.

This approach minimized regressions while improving maintainability.

---

# Current Strengths

The current architecture provides:

- modularity
- maintainability
- renderer independence
- centralized state
- reduced coupling
- explicit dependency flow

---

# Potential Future Improvements

Possible next architectural evolutions:

- GameEngine class
- Board class
- TurnManager abstraction
- Renderer abstraction
- Plugin system
- Multiple game modes
- Automated tests
- Editor interface for teachers

---

# Conclusion

The project has evolved from a monolithic educational prototype into a modular frontend game engine architecture.

The current structure provides a stable foundation for future scalability and experimentation.
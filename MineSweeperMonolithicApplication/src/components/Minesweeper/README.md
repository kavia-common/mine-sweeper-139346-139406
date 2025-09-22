# Minesweeper Component

This directory contains a fully functional, accessible, and responsive Minesweeper game implemented in React.

Highlights:
- Grid generation with first-click-safe randomized mine placement
- Recursive reveal for empty cells
- Flagging via right-click or Space/F key
- Win/Loss detection with overlay feedback and timer
- Difficulty presets and custom configuration
- WCAG 2.1 AA practices: keyboard navigation, aria labels, live regions, focus styles
- Responsive layout and scalable styling
- Stubs prepared for optional high score backend integration

Keyboard:
- Arrow keys to move focus across the board region
- Enter (or 'O') to reveal
- Space (or 'F') to toggle flag
- Escape closes modals

Extensibility:
- `utils/highScores.js` provides public interfaces for future backend integration.
- Component structured to allow easy extraction of board logic into hooks or reducers for testing.

# Lightweight React Template for KAVIA + Minesweeper

This project now includes a fully functional, accessible Minesweeper game.

## Minesweeper Overview

- Grid generation with randomized mines (first click is always safe)
- Left click/Enter to reveal, Right click/Space/F to flag
- Recursive reveal of empty cells
- Win/Loss detection, end-game overlay, and timer
- Difficulty presets and custom configuration
- WCAG 2.1 AA-aligned keyboard navigation and screen reader support
- Responsive, mobile-friendly layout
- Optional backend integration stubs for future high score tracking

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Optional Backend Integration

A stub is provided at `src/utils/highScores.js` with public interfaces to submit and fetch scores in the future. Create a `.env` from `.env.example` and set `REACT_APP_API_BASE` when you enable the backend.

## Accessibility

- The board is a keyboard-focusable region with arrow-key navigation.
- Cells have descriptive aria-labels.
- Live regions announce status updates and end-game messages.
- Focus outlines and color choices meet contrast guidelines.

## Directory

- `src/components/Minesweeper/` – main game component and styles.
- `src/utils/highScores.js` – optional high scores stub.

For React documentation see https://reactjs.org/.

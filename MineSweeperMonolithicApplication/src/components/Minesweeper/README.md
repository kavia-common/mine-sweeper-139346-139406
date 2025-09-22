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
- Sound effects (reveal, flag, win, loss) with a mute toggle in controls
- Lightweight CSS animations for reveal/flag and overlay transitions

Keyboard:
- Arrow keys to move focus across the board region
- Enter (or 'O') to reveal
- Space (or 'F') to toggle flag
- Escape closes modals

Extensibility:
- `utils/highScores.js` provides public interfaces for future backend integration.
- Component structured to allow easy extraction of board logic into hooks or reducers for testing.

Audio/Animation Notes:
- Audio elements are in the component tree and are aria-hidden to avoid extra announcements.
- Place audio files in `public/assets/audio/` with names: reveal.wav, flag.wav, win.wav, lose.wav.
- Sounds can be muted/unmuted via the "Sound" toggle in the controls.
- Animations use CSS keyframes: cell reveal and flag pop, and win/loss overlay fade and rise.

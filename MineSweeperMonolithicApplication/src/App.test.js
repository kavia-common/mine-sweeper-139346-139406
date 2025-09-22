import { render, screen } from '@testing-library/react';
import App from './App';

test('renders KAVIA header and Minesweeper heading without ambiguity', () => {
  render(<App />);
  // Assert the KAVIA header text exists (specific text query, not role-ambiguous)
  expect(screen.getByText(/KAVIA Minesweeper/i)).toBeInTheDocument();

  // Scope to main to assert the Minesweeper heading inside the game area
  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { name: /minesweeper/i })).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Minesweeper heading', () => {
  render(<App />);
  const heading = screen.getByText(/KAVIA Minesweeper/i);
  expect(heading).toBeInTheDocument();
});

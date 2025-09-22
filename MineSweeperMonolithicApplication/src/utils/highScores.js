/**
 * Optional High Score integration placeholder.
 * This module outlines the public interfaces to integrate with a backend later.
 * Do not store secrets here. Use environment variables via .env when implementing.
 */

// PUBLIC_INTERFACE
export async function submitHighScore({ difficulty, rows, cols, mines, seconds, won }) {
  /** 
   * This function is intentionally a stub.
   * Future integration example:
   * const resp = await fetch(process.env.REACT_APP_API_BASE + '/scores', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ difficulty, rows, cols, mines, seconds, won })
   * });
   * if (!resp.ok) throw new Error('Failed to submit score');
   * return await resp.json();
   */
  return Promise.resolve({ ok: true, message: 'High score stub called' });
}

// PUBLIC_INTERFACE
export async function fetchHighScores() {
  /**
   * Future implementation (e.g., GET /scores)
   */
  return Promise.resolve([]);
}

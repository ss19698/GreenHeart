
export function generateRandomDraw() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...numbers].sort((a, b) => a - b);
}

/**
 * Generate 5 winning numbers using algorithmic mode
 * Weighted by frequency of user scores:
 *   - 'most': favours numbers that appear most in user scores
 *   - 'least': favours numbers that appear least in user scores
 *
 * @param {Array} allUserScores - flat array of score numbers from all users
 * @param {'most'|'least'} mode
 */
export function generateAlgorithmicDraw(allUserScores, mode = 'most') {
  // Build frequency map
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 0;
  allUserScores.forEach(s => { if (s >= 1 && s <= 45) freq[s]++; });

  // Build weighted pool
  const entries = Object.entries(freq).map(([num, count]) => ({
    num: Number(num),
    weight: mode === 'most' ? count + 1 : (1 / (count + 1)),
  }));

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  const selected = new Set();

  while (selected.size < 5) {
    let rand = Math.random() * totalWeight;
    for (const entry of entries) {
      rand -= entry.weight;
      if (rand <= 0) {
        selected.add(entry.num);
        break;
      }
    }
  }

  return [...selected].sort((a, b) => a - b);
}

/**
 * Match user scores against winning numbers.
 * Returns match count (0–5).
 *
 * @param {number[]} userScores - user's 5 scores
 * @param {number[]} winningNumbers - draw's 5 winning numbers
 */
export function countMatches(userScores, winningNumbers) {
  const winSet = new Set(winningNumbers);
  return userScores.filter(s => winSet.has(s)).length;
}

/**
 * Prize pool distribution per PRD
 */
export const PRIZE_POOL_DISTRIBUTION = {
  5: 0.40, // Jackpot
  4: 0.35,
  3: 0.25,
};

/**
 * Calculate prize amounts from pool size and winner counts
 *
 * @param {number} totalPool - total prize pool in pence
 * @param {{ 5: number, 4: number, 3: number }} winnerCounts
 * @param {boolean} jackpotRollover - whether jackpot was rolled from last month
 * @param {number} rolloverAmount
 */
export function calculatePrizes(totalPool, winnerCounts, jackpotRollover = false, rolloverAmount = 0) {
  const jackpotPool = totalPool * PRIZE_POOL_DISTRIBUTION[5] + (jackpotRollover ? rolloverAmount : 0);
  const pool4 = totalPool * PRIZE_POOL_DISTRIBUTION[4];
  const pool3 = totalPool * PRIZE_POOL_DISTRIBUTION[3];

  return {
    perWinner5: winnerCounts[5] > 0 ? Math.floor(jackpotPool / winnerCounts[5]) : 0,
    perWinner4: winnerCounts[4] > 0 ? Math.floor(pool4 / winnerCounts[4]) : 0,
    perWinner3: winnerCounts[3] > 0 ? Math.floor(pool3 / winnerCounts[3]) : 0,
    jackpotPoolTotal: jackpotPool,
    rollsOver: winnerCounts[5] === 0,
  };
}

/**
 * Run a full draw simulation against a set of users.
 *
 * @param {number[]} winningNumbers
 * @param {Array<{id, scores}>} users - active subscribers with scores
 * @param {number} prizePool
 * @param {boolean} jackpotRollover
 * @param {number} rolloverAmount
 */
export function runDrawSimulation(winningNumbers, users, prizePool, jackpotRollover = false, rolloverAmount = 0) {
  const results = { 5: [], 4: [], 3: [] };

  users.forEach(user => {
    const userScoreNums = (user.scores || []).map(s => s.score);
    if (userScoreNums.length === 0) return;
    const matches = countMatches(userScoreNums, winningNumbers);
    if (matches >= 3) {
      results[matches] = results[matches] || [];
      results[matches].push({ userId: user.id, matches, scores: userScoreNums });
    }
  });

  const winnerCounts = { 5: results[5].length, 4: results[4].length, 3: results[3].length };
  const prizes = calculatePrizes(prizePool, winnerCounts, jackpotRollover, rolloverAmount);

  return { results, winnerCounts, prizes };
}

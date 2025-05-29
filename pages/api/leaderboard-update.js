import fs from 'fs/promises';
import path from 'path';
import pokemon from 'pokemontcgsdk';

export default async function handler(req, res) {
  try {
    const metaPath = path.join(process.cwd(), 'public', 'data', 'leaderboard-meta.json');

    // Check last updated time
    let lastUpdated = null;
    try {
      const metaRaw = await fs.readFile(metaPath, 'utf8');
      const meta = JSON.parse(metaRaw);
      lastUpdated = new Date(meta.lastUpdated);
    } catch {
      // No meta file or invalid, proceed to update
    }

    const now = new Date();
    if (lastUpdated && (now - lastUpdated) < 3 * 60 * 60 * 1000) { // less than 3 hours
      return res.status(200).json({ message: 'Update skipped: last update less than 3 hours ago' });
    }

    // Fetch cards paginated
    let allCards = [];
    let page = 1;
    const pageSize = 100;
    let fetchedCount;

    do {
      const response = await pokemon.card.where({ page, pageSize });
      fetchedCount = response.data.length;
      allCards = allCards.concat(response.data);
      page++;
      console.log(`Fetched page ${page - 1}, cards count: ${fetchedCount}`);
    } while (fetchedCount === pageSize);

    // Path to leaderboard JSON file
    const filePath = path.join(process.cwd(), 'public', 'data', 'leaderboard.json');

    // Read existing data asynchronously
    let oldData = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      oldData = JSON.parse(raw);
    } catch (e) {
      console.log('No previous leaderboard data found, starting fresh.');
    }

    const oldDataMap = new Map(Array.isArray(oldData) ? oldData.map(card => [card.id, card]) : []);

    let leaderboardData = allCards.map(card => {
      const oldCard = oldDataMap.get(card.id);
      const oldPrice = oldCard ? oldCard.price : null;
      const newPrice = card.tcgplayer?.prices?.normal?.market || null;

      let priceChange = null;
      if (oldPrice && newPrice) {
        priceChange = ((newPrice - oldPrice) / oldPrice) * 100;
      }

      return {
        id: card.id,
        name: card.name,
        price: newPrice,
        priceChange,
        image: card.images?.small || '',
      };
    });

    // Do not slice here; save all cards

    await fs.writeFile(filePath, JSON.stringify(leaderboardData, null, 2));

    const meta = { lastUpdated: now.toISOString() };
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

    res.status(200).json({ message: 'Leaderboard updated', count: leaderboardData.length });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
}
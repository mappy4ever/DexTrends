import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import Papa from 'papaparse';

// Initialize Supabase client
const supabase = createClient("https://opvdrtdwkcdmiskxpnal.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdmRydGR3a2NkbWlza3hwbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDYzMjcsImV4cCI6MjA1NjcyMjMyN30.1eeSkKboKB4DGKND5It8mdAo4OQuW6cWrLdVNS8uFmI");

// Initialize Redis for caching
const redis = new Redis({
  url: 'https://unified-jawfish-32586.upstash.io',
  token: 'AX9KAAIjcDEyNDVhZjQwYWU4ZjQ0OTM2OGZmMjQzOWQxNmMyZWJhMXAxMA',
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Fetching updated date from Redis...');
    const updatedDate = await redis.get('monthly_org_trends-updated-date') || new Date().toISOString();
    
    console.log('Fetching data from Supabase...');
    const { data, error } = await supabase.from('monthly_org_trends').select('*');

    if (!error && data?.length > 0) {
      console.log('Data successfully retrieved from Supabase.');
      return res.status(200).json({
        updated_date: updatedDate,
        data: data.map(row => ({
          month: row.month,
          owner_org_title: row.owner_org_title,
          count: parseFloat(row.count) || 0,
          airfare: parseFloat(row.airfare) || 0,
          other_transport: parseFloat(row.other_transport) || 0,
          lodging: parseFloat(row.lodging) || 0,
          meals: parseFloat(row.meals) || 0,
          other_expenses: parseFloat(row.other_expenses) || 0,
        })),
      });
    } else {
      console.warn('Supabase fetch failed or returned no data. Falling back to CSV...');
    }
  } catch (error) {
    console.error('Supabase fetch error:', error);
  }

  try {
    console.log('Fetching data from CSV backup...');
    const csvResponse = await fetch('/data/monthly_org_trends.csv');
    if (!csvResponse.ok) {
      console.error('CSV response error headers:', csvResponse.headers);
      throw new Error(`Failed to fetch CSV: ${csvResponse.status} ${csvResponse.statusText}`);
    }

    const text = await csvResponse.text();
    
    let cleanedData = [];

    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        cleanedData = results.data
          .filter(row => row.month && row.owner_org_title)
          .map(row => ({
            month: row.month,
            owner_org_title: row.owner_org_title,
            count: parseFloat(row.count) || 0,
            airfare: parseFloat(row.airfare) || 0,
            other_transport: parseFloat(row.other_transport) || 0,
            lodging: parseFloat(row.lodging) || 0,
            meals: parseFloat(row.meals) || 0,
            other_expenses: parseFloat(row.other_expenses) || 0,
          }));

        console.log('Data successfully retrieved from CSV.');
        res.status(200).json({ updated_date: new Date().toISOString(), data: cleanedData });
      },
      error: (err) => {
        console.error('Error parsing CSV data:', err);
        res.status(500).json({ error: 'Failed to parse CSV data' });
      },
    });
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    res.status(500).json({ error: 'Failed to fetch travel data from all sources' });
  }
}

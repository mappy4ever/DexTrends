import { Redis } from '@upstash/redis';
import Papa from 'papaparse';

// Token and URL for authenticating with Vercel KV Storage
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Token for authenticating with Vercel Blob
const blob_token = process.env.BLOB_READ_WRITE_TOKEN;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Check if data exists in Redis
      const blobURL = await redis.get('monthly-org-trends-blob-url');

      if (blobURL) {
        console.log('Found monthly-org-trends-blob-url from redis', blobURL);
		
		const blobResponse  = await fetch(blobURL, {
          headers: {
            Authorization: `Bearer ${blob_token}`,
          },
        });
        
        if (!blobResponse.ok) {
          console.error('Blob response error headers:', blobResponse.headers); // Log headers on error
		  throw new Error(`Failed to fetch blob: ${blobResponse.status} ${blobResponse.statusText}`);
        }
		
		const data = await blobResponse.json();
		const jsonData = JSON.parse(data.monthly_org_trends.data); 
		
        const cleanedData = {
          updated_date: data.monthly_org_trends.updated_date,
          data: Object.keys(jsonData.month).map((key) => ({
            month: jsonData.month[key],
            owner_org_title: jsonData.owner_org_title[key],
            count: parseFloat(jsonData.count[key]) || 0,
            airfare: parseFloat(jsonData.airfare[key]) || 0,
            other_transport: parseFloat(jsonData.other_transport[key]) || 0,
            lodging: parseFloat(jsonData.lodging[key]) || 0,
            meals: parseFloat(jsonData.meals[key]) || 0,
            other_expenses: parseFloat(jsonData.other_expenses[key]) || 0,
          })),
        };

        console.log('Travel expenses fetched from blob', blobURL);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(cleanedData);	
	  } else {

	    // If not found in blob, fetch from CSV
        const csvResponse = await fetch('/data/monthly_org_trends.csv');
        if (!csvResponse.ok) {
          console.error('CSV response error headers:', csvResponse.headers); // Log headers on error
		  throw new Error(`Failed to fetch CSV: ${csvResponse.status} ${csvResponse.statusText}`);
        }
	    
        const text = await csvResponse.text();
	    
        // Parse CSV using Papa Parse
		Papa.parse(text, {
			header: true,
			dynamicTyping: true,
			complete: async (results) => {
				const cleanedData = {
					data: results.data
						.filter((row) => row.month && row.owner_org_title)
						.map((row) => ({
							month: row.month,
							owner_org_title: row.owner_org_title,
							count: parseFloat(row.count) || 0,
							airfare: parseFloat(row.airfare) || 0,
							other_transport: parseFloat(row.other_transport) || 0,
							lodging: parseFloat(row.lodging) || 0,
							meals: parseFloat(row.meals) || 0,
							other_expenses: parseFloat(row.other_expenses) || 0,
						})),
				};
		
				console.log('Travel expenses fetched and cached');
				console.log('Response headers:', res.getHeaders());
				res.status(200).json(cleanedData); // Send the whole cleanedData object
			},
            error: (err) => {
                console.error('Error parsing CSV data:', err);
                res.status(500).json({ error: 'Failed to parse CSV data' });
            },
        });
	  }
    } catch (error) {
      console.error('Error fetching travel data:', error);
      res.status(500).json({ error: 'Failed to fetch travel data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
// pages/api/map.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - This is OK at the top level
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check environment variables.");
  // Optionally throw an error during build/startup if preferred
}

// Create client only if variables are present
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initialize Supabase client
/*const supabase = createClient(
  "https://opvdrtdwkcdmiskxpnal.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdmRydGR3a2NkbWlza3hwbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDYzMjcsImV4cCI6MjA1NjcyMjMyN30.1eeSkKboKB4DGKND5It8mdAo4OQuW6cWrLdVNS8uFmI"
);*/

interface MapData {
  location_id: number;
  lat: number;
  long: number;
  city: string;
  country: string;
  region: string;
  trip_count: number;
  total_spending_at_location: number;
  total_travel_days: number;
  involved_org_ids: string[];
  involved_names: string[];
  month: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapData[] | ErrorResponse>
) {

//    // --- Check for Initialization Errors ---
//    if (initializationError || !supabaseInstance) {
//         const errorMessage = initializationError || "Supabase client not available.";
//         // Log error every time handler is called with faulty init
//         console.error(`MAP API [Handler - ${req.url}]: Supabase client not ready. Error: ${errorMessage}`);
//         return res.status(500).json({ message: errorMessage });
//    }

//    // Use the successfully initialized instance
//    const supabase = supabaseInstance;

    // --- Method Check ---
    if (!supabase) {
      return res.status(500).json({ message: "Supabase URL or Anon Key is not configured." });
    } 
	if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    // --- Main Logic ---
    try {
        const { startMonth, endMonth, org } = req.query;
        
        const startMonthStr = Array.isArray(startMonth) ? startMonth[0] : startMonth;
        const endMonthStr = Array.isArray(endMonth) ? endMonth[0] : endMonth;
        const orgStr = Array.isArray(org) ? org[0] : org;

        // --- Input Validation ---
        const dateRegex = /^\d{4}-\d{2}$/; // YYYY-MM format
        if (!startMonthStr || !dateRegex.test(startMonthStr)) {
            return res.status(400).json({ message: "Invalid or missing 'startMonth' parameter. Expected format: YYYY-MM" });
        }
        if (!endMonthStr || !dateRegex.test(endMonthStr)) {
            return res.status(400).json({ message: "Invalid or missing 'endMonth' parameter. Expected format: YYYY-MM" });
        }
        // Optional: Add more validation (e.g., is startMonth <= endMonth?)

        // --- Build Query ---
        let query = supabase
            .from('mv_map_data') // Ensure this view/table exists
            // Select only columns needed by the frontend aggregation for performance
            .select('location_id, lat, long, city, country, region, trip_count, total_spending_at_location, total_travel_days, involved_org_ids, involved_names, month');
            // **REMOVED INCORRECT .gte('start_date', startDate).lte('end_date', endDate) line**

        // --- Apply CORRECT Date Range Filter (inclusive) ---
        // Assumes 'month' column in mv_map_data is DATE or TEXT 'YYYY-MM-DD'
        const startDateStr = `${startMonthStr}-01`; // Start of the start month
        query = query.gte('month', startDateStr); // Filter points ON or AFTER start of startMonth

        // Calculate the *end* date of the endMonth
        const [endYear, endM] = endMonthStr.split('-').map(Number);
        const nextMonthStartDate = new Date(Date.UTC(endYear, endM, 1)); // Gives start of the month *after* endMonth
        const endOfMonthDate = new Date(nextMonthStartDate.getTime() - 1); // Subtract 1ms to get the very end of endMonth
        const endDateStr = endOfMonthDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        query = query.lte('month', endDateStr); // Filter points ON or BEFORE end of endMonth

        // --- Apply Org Filter ---
        if (orgStr && orgStr !== 'all') {
            // Assumes 'involved_org_ids' is an array column (e.g., text[])
            // Checks if the array contains the specified organization name
            query = query.filter('involved_org_ids', '@>', JSON.stringify([orgStr]));
        }

        // Optional: Add a limit for very large datasets?
        // query = query.limit(10000);

        // --- Execute Query ---
        const { data, error } = await query;

        if (error) {
            console.error(`MAP API [Handler - ${req.url}]: Supabase error fetching map data:`, error);
            return res.status(500).json({ message: `Database error: ${error.message}`, details: error.details });
        }

        // --- Success Response ---
        res.status(200).json(data || []); // Ensure array return

    } catch (error) {
        // --- Catch Unexpected Errors ---
        console.error(`MAP API [Handler - ${req.url}]: Unexpected error:`, error);
        res.status(500).json({ message: 'An unexpected server error occurred.', error: error.message });
    }
}
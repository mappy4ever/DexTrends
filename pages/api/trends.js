// pages/api/trends.js
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

export default async function handler(req, res) {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client is not initialized." });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { start, end, orgId } = req.query; // titleId removed as it's not used

  if (!start || !/^\d{4}-\d{2}$/.test(start) || !end || !/^\d{4}-\d{2}$/.test(end)) {
    return res.status(400).json({ error: "Missing or invalid required date parameters: start (YYYY-MM), end (YYYY-MM)" });
  }

  const startDateDb = `${start}-01`;
  const [endYear, endMonthNum] = end.split('-').map(Number);
  // Use last day of the month for end date to capture all trips within the selected end month
  const endDateDb = new Date(Date.UTC(endYear, endMonthNum, 0)).toISOString().split('T')[0];


  const parsedOrgId = (orgId && orgId.toLowerCase() !== 'all') ? parseInt(orgId, 10) : null;

  if (orgId && orgId.toLowerCase() !== 'all' && isNaN(parsedOrgId)) {
    return res.status(400).json({ error: "Invalid orgId parameter. Must be a number or 'all'." });
  }

  try {
    // Fetch org details only if a specific, valid orgId is provided
    const orgDetailsPromise = parsedOrgId
      ? supabase
          .from('org_title_dim') // Your org table
          .select('*') // Select relevant fields like org_name, director_name
          .eq('org_title_id', parsedOrgId) // Ensure this is the correct ID column in org_title_dim
          .maybeSingle()
      : Promise.resolve({ data: null, error: null });

    // Base query for trips from all_travel_expenses
    let tripsQuery = supabase
        .from('all_travel_expenses')
        .select(`
            id, ref_number, start_date, end_date, name, title, purpose, month,
            owner_org_title_id, owner_org_title, traveldays, airfare, lodging, meals, other_transport,
            other_expenses, total, destination_en, cleaned_dest_names, cleaned_dest_ids
        `) // Added owner_org_title_id for consistency if needed for filtering
        .gte('start_date', startDateDb)
        // Ensure 'end_date' column exists and is appropriate for range queries.
        // If trips are point-in-time or only have start_date, adjust this.
        .lte('start_date', endDateDb); // Filtering trips that START within the period.
                                      // If using trip's end_date: .lte('end_date', endDateDb)
                                      // Be sure trips table has an 'end_date' field if using it for lte.


    if (parsedOrgId) {
      // Ensure 'owner_org_title_id' is the correct foreign key to org_title_dim in all_travel_expenses
      tripsQuery = tripsQuery.eq('owner_org_title_id', parsedOrgId);
    }
    // If parsedOrgId is null (orgId is 'all'), no organization filter is applied to trips.

    tripsQuery = tripsQuery.order('start_date', { ascending: false });

    const [orgResult, tripsResult] = await Promise.all([
        orgDetailsPromise,
        tripsQuery
    ]);

    // Error handling for individual promises
    if (orgResult.error) {
        console.warn("Supabase warning fetching org details:", orgResult.error.message);
        // Non-critical, proceed without org details if it fails but trips succeed
    }
    if (tripsResult.error) {
        console.error("Supabase error fetching trips:", tripsResult.error);
        return res.status(500).json({ error: "Failed to fetch trip data.", details: tripsResult.error.message });
    }

    const fetchedTrips = tripsResult.data || [];

    // Calculate purposeBreakdown from the fetched trips
    const purposeAgg = fetchedTrips.reduce((acc, item) => {
        const name = item.purpose || 'Unknown';
        const value = Number(item.total) || 0; // Use item.total for consistency
        acc[name] = (acc[name] || 0) + value;
        return acc;
    }, {});
    const formattedPurposeBreakdown = Object.entries(purposeAgg)
        .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value);

    res.status(200).json({
        orgDetails: orgResult.data, // This will be null if orgId was 'all' or no specific org was found
        trips: fetchedTrips,
        purposeBreakdown: formattedPurposeBreakdown,
    });

  } catch (exception) {
    console.error("API Route Exception (trends):", exception);
    res.status(500).json({ error: "An unexpected error occurred.", details: exception.message });
  }
}
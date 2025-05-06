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
    return res.status(500).json({ error: "Supabase URL or Anon Key is not configured." });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { start, end, orgId, titleId } = req.query;

  if (!start || !/^\d{4}-\d{2}$/.test(start) || !end || !/^\d{4}-\d{2}$/.test(end)) {
    return res.status(400).json({ error: "Missing or invalid required date parameters: start (YYYY-MM), end (YYYY-MM)" });
  }

  const startDateDb = `${start}-01`;
  const [endYear, endMonthNum] = end.split('-').map(Number);
  const endDateDb = new Date(Date.UTC(endYear, endMonthNum, 0)).toISOString().split('T')[0];

  // Validate orgId and titleId - allow 'all' or numeric ID
  const parsedOrgId = (orgId && orgId !== 'all') ? parseInt(orgId, 10) : null;
  const parsedTitleId = (titleId && titleId !== 'all') ? parseInt(titleId, 10) : null;

  if (orgId && orgId !== 'all' && isNaN(parsedOrgId)) {
      return res.status(400).json({ error: "Invalid orgId parameter. Must be a number or 'all'." });
  }
  if (titleId && titleId !== 'all' && isNaN(parsedTitleId)) {
      return res.status(400).json({ error: "Invalid titleId parameter. Must be a number or 'all'." });
  }

  try {
    let query = supabase
      .from('mv_department_trends') // Ensure this MV exists and has necessary columns
      .select('*') // Or specify columns: 'month, owner_org_title_id, title_id, total_cost, airfare, ...'
      .gte('month', startDateDb)
      .lte('month', endDateDb);

    if (parsedOrgId) { // If orgId is a valid number, filter by it
      query = query.eq('owner_org_title_id', parsedOrgId); // Ensure column name is correct
    }

    if (parsedTitleId) { // If titleId is a valid number, filter by it
      query = query.eq('title_id', parsedTitleId); // Ensure column name is correct
    }

    query = query.order('month', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error (trends):", error);
      return res.status(500).json({ error: "Failed to fetch trends data.", details: error.message });
    }

    // Calculate purposeBreakdown from the (potentially filtered) trends data
    const purposeAgg = (data || []).reduce((acc, item) => {
        const name = item.purpose || 'Unknown'; // Assuming 'purpose' and cost fields exist in 'mv_department_trends'
        const value = Number(item.total_cost_purpose) || Number(item.total_cost) || 0; // Prioritize specific purpose cost
        acc[name] = (acc[name] || 0) + value;
        return acc;
    }, {});
    const formattedPurposeBreakdown = Object.entries(purposeAgg)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    res.status(200).json({
        trendsData: data || [],
        purposeBreakdown: formattedPurposeBreakdown, // Include this if OrgsPage expects it
    });

  } catch (exception) {
    console.error("API Route Exception (trends):", exception);
    res.status(500).json({ error: "An unexpected error occurred.", details: exception.message });
  }
}
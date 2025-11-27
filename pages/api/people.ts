// pages/api/people.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import logger from '@/utils/logger';
import { ErrorResponse } from '@/types/api/api-responses';

// Initialize Supabase client - This is OK at the top level
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  logger.error("Supabase URL or Anon Key is missing. Check environment variables.");
  // Optionally throw an error during build/startup if preferred
}

// Create client only if variables are present
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Initialize Supabase client
/*const supabase = createClient(
  "https://opvdrtdwkcdmiskxpnal.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdmRydGR3a2NkbWlza3hwbmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNDYzMjcsImV4cCI6MjA1NjcyMjMyN30.1eeSkKboKB4DGKND5It8mdAo4OQuW6cWrLdVNS8uFmI"
);*/

interface PersonDetails {
  // Define based on your name_dim table structure
  name_id: number;
  name?: string;
  [key: string]: unknown;
}

interface TripData {
  id: number;
  ref_number: string;
  start_date: string;
  name: string;
  title: string;
  purpose: string;
  purpose_en: string;
  month: string;
  owner_org_title: string;
  traveldays: number;
  airfare: number;
  lodging: number;
  meals: number;
  other_transport: number;
  other_expenses: number;
  total: number;
  destination_en: string;
  cleaned_dest_names: string;
  cleaned_dest_ids: string;
}

interface PeopleResponse {
  personDetails: PersonDetails | null;
  personTrips: TripData[];
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PeopleResponse | ErrorResponse>
) {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase URL or Anon Key is not configured." });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { personId, start, end } = req.query; // `list` and general `search` params are removed
  
  const personIdStr = Array.isArray(personId) ? personId[0] : personId;
  const startStr = Array.isArray(start) ? start[0] : start;
  const endStr = Array.isArray(end) ? end[0] : end;

  if (!personIdStr) {
    return res.status(400).json({ error: "Missing required query parameter: personId", details: "" });
  }
  const personIdNum = parseInt(personIdStr, 10);
  if (isNaN(personIdNum)) {
    return res.status(400).json({ error: "Invalid personId parameter, must be a number.", details: "" });
  }

  if (!startStr || !/^\d{4}-\d{2}$/.test(startStr) || !endStr || !/^\d{4}-\d{2}$/.test(endStr)) {
    return res.status(400).json({ error: "Missing or invalid date parameters: start (YYYY-MM), end (YYYY-MM)", details: "" });
  }

  const startDateDb = `${startStr}-01`;
  const [endYear, endMonthNum] = endStr.split('-').map(Number);
  const endDateDb = new Date(Date.UTC(endYear, endMonthNum, 0)).toISOString().split('T')[0];

  try {
    const [personResult, tripsResult] = await Promise.all([
      supabase
        .from('name_dim') // Your persons table
        .select('*') // Select relevant fields for person details card
        .eq('name_id', personIdNum)
        .maybeSingle(),
      supabase
        .from('all_travel_expenses') // Your trips/expenses table
        .select(`
            id, ref_number, start_date, name, title, purpose, purpose_en, month,
            owner_org_title, traveldays, airfare, lodging, meals, other_transport,
            other_expenses, total, destination_en, cleaned_dest_names, cleaned_dest_ids
        `) // Ensure these fields exist and are what the frontend TripTable needs
        .eq('name_id', personIdNum)
        .gte('start_date', startDateDb) // Assuming 'start_date' column exists on trips table
        .lte('end_date', endDateDb)     // Assuming 'end_date' column exists on trips table
        .order('start_date', { ascending: false })
    ]);

    if (personResult.error) throw personResult.error;
    if (tripsResult.error) throw tripsResult.error;

    // Frontend expects personDetails and personTrips
    res.status(200).json({
      personDetails: personResult.data, // This can be null if personId not found, frontend should handle
      personTrips: tripsResult.data || [],
    });

  } catch (exception) {
    logger.error("API Route Exception (People Data):", exception);
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    const details = exception instanceof Error && 'details' in exception
      ? String((exception as Error & { details?: unknown }).details)
      : (exception instanceof Error && 'hint' in exception
          ? String((exception as Error & { hint?: unknown }).hint)
          : "");
    res.status(500).json({ error: errorMessage || "An unexpected error occurred.", details });
  }
}
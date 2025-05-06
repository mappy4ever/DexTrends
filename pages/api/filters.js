// pages/api/filters.js 
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
  // --- Basic Checks ---
  if (!supabase) {
    console.error("API Error: Supabase client not configured.");
    return res.status(500).json({ error: "Server configuration error." });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { types, searchPerson, limit = 20 } = req.query;
  console.log(`API Call: /api/filters with query: ${JSON.stringify(req.query)}`); // Log incoming request

  try {
    const responseData = {};
    let orgsError = null;
    let titlesError = null;
    let personsError = null;

    // --- Fetch Data Based on Query Params ---
    if (types) {
      const requestedTypes = String(types).split(',');

      if (requestedTypes.includes('org')) {
        console.log("Attempting to fetch organizations...");
        const { data: orgsData, error } = await supabase
          .from('org_title_dim') // Verified table name
          .select('owner_org_title_id, owner_org_title') // Verified columns
          .order('owner_org_title', { ascending: true });

        orgsError = error; // Store error status
        if (!error && orgsData) {
            // Map to consistent { id, name } structure
            responseData.orgs = orgsData.map(org => ({
                id: org.owner_org_title_id,
                name: org.owner_org_title
            }));
            console.log(`Workspaceed ${responseData.orgs.length} organizations.`);
        } else {
             responseData.orgs = []; // Ensure key exists even if fetch failed or returned null
             if(error) console.error("Supabase error fetching orgs:", error);
        }
      }

      if (requestedTypes.includes('title')) {
        console.log("Attempting to fetch titles...");
        const { data: titlesData, error } = await supabase
          .from('title_dim') // Verified table name
          .select('title_id, title') // Verified columns
          .order('title', { ascending: true });

        titlesError = error; // Store error status
        if (!error && titlesData) {
            // Map to consistent { id, name } structure
            responseData.titles = titlesData.map(title => ({
                id: title.title_id,
                name: title.title
            }));
            console.log(`Workspaceed ${responseData.titles.length} titles.`);
        } else {
             responseData.titles = []; // Ensure key exists
             if(error) console.error("Supabase error fetching titles:", error);
        }
      }
    } // End of 'if (types)'

    if (searchPerson) {
      const searchTerm = String(searchPerson).trim();
      console.log(`Attempting to search persons with term: "${searchTerm}"`);
      if (searchTerm.length >= 1) {
        const { data: personsData, error } = await supabase
          .from('name_dim')
          .select('name_id, name')
          .ilike('name', `%${searchTerm}%`)
          .limit(Number(limit));

        personsError = error; // Store error status
        if (!error && personsData) {
             responseData.persons = personsData.map(p => ({
                 id: p.name_id,
                 name: p.name
             }));
             console.log(`Found ${responseData.persons.length} persons matching search.`);
        } else {
            responseData.persons = []; // Ensure key exists
            if(error) console.error("Supabase error searching persons:", error);
        }
      } else {
        console.log("Person search term too short, returning empty.");
        responseData.persons = []; // Ensure key exists
      }
    } // End of 'if (searchPerson)'

    // --- Determine Response ---
    console.log("Final responseData object:", JSON.stringify(responseData));

    // Check if *any* error occurred during the database fetches
    if (orgsError || titlesError || personsError) {
        // Log the specific errors
        console.error("One or more Supabase errors occurred:", { orgsError, titlesError, personsError });
        // Return a 500 Internal Server Error, as the request was valid but data fetching failed
        return res.status(500).json({
             error: "Failed to fetch some or all filter options.",
             details: { // Provide breakdown of errors if possible
                 orgs: orgsError?.message,
                 titles: titlesError?.message,
                 persons: personsError?.message,
             }
         });
    }

    // If no database errors occurred, check if the request itself was valid
    const wasTypeRequest = typeof types === 'string' && types.length > 0;
    const wasPersonSearchAttempt = typeof searchPerson === 'string'; // Note: True even if term is empty
    const hasAnyData = Object.values(responseData).some(value => Array.isArray(value) && value.length > 0);
    const hasExpectedKeys = Object.keys(responseData).length > 0; // Checks if keys like 'orgs', 'titles', 'persons' were added

    // If it wasn't a person search, and no specific types were requested, it's a bad request.
    if (!wasTypeRequest && !wasPersonSearchAttempt) {
        console.log("Returning 400: No specific types requested and not a person search.");
        return res.status(400).json({ error: "Please specify filter types (e.g., ?types=org,title) or a search term (e.g., ?searchPerson=...).", details: "Request was missing required query parameters." });
    }

    // If types *were* requested or a search *was* attempted, but responseData is still completely empty
    // (meaning no keys like 'orgs', 'titles', 'persons' were added at all - which shouldn't happen with current logic
    // unless the 'types' parameter contained only unrecognized types), then return 400.
    if (!hasExpectedKeys && (wasTypeRequest || wasPersonSearchAttempt)) {
         console.log("Returning 400: Request made but responseData has no keys.", responseData);
         return res.status(400).json({ error: "No data fields populated for the request.", details: "Potentially invalid type requested or internal issue." });
    }

    // If we get here, the request was valid and DB calls succeeded (even if they returned empty arrays).
    console.log("Returning 200 OK with data:", responseData);
    res.status(200).json(responseData); // Send responseData (may contain empty arrays if no data found)

  } catch (error) {
    // Catch unexpected errors (e.g., programming errors within the try block)
    console.error("API Route UNEXPECTED Exception (/api/filters):", error);
    res.status(500).json({ error: "An unexpected server error occurred.", details: error.message });
  }
}
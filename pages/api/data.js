import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { type, start, end, org, name, columns, destination, purpose } = req.query;

  try {
    switch (type) {
	  case 'dashboard': {
		try {
		  // Fetching data for different sections
          const [{ data: spendingByName, error: nameError },
                 { data: spendingByPurpose, error: purposeError },
                 { data: spendingByOrg, error: orgError },
                 { data: spendingHeatmap, error: heatmapError }] = await Promise.all([
            supabase.from('monthly_spending_by_name').select('*').gte('month', start).lte('month', end),
            supabase.from('monthly_spending_by_purpose').select('*').gte('month', start).lte('month', end),
            supabase.from('monthly_spending_by_org').select('*').gte('month', start).lte('month', end),
            supabase.from('monthly_spending_heatmap').select('*'), // Fetching heatmap from materialized view
          ]);
		  
          // Handle errors
          if (nameError || purposeError || orgError || heatmapError) {
            console.error("Error fetching dashboard data:", nameError || purposeError || orgError || heatmapError);
            return res.status(500).json({
              error: "Unexpected error fetching dashboard data",
              details: nameError || purposeError || orgError || heatmapError
            });
          }
		  
          return res.status(200).json({
            spendingByName: spendingByName || [],
            spendingByOrg: spendingByOrg || [],
            spendingByPurpose: spendingByPurpose || [],
            spendingHeatmap: spendingHeatmap || [], // Returning heatmap data
          });
		} catch (error) {
            console.error("Unexpected API Error:", error);
            return res.status(500).json({ error: "Unexpected error fetching org data", details: error.message });
        }
      }

      case 'org': {
          try {
              const { org, org2, start, end } = req.query;  // Ensure org2 is extracted
      
              let query = supabase.from('org_facts').select('*').gte('month', start).lte('month', end);
              if (org && org !== "all") query = query.eq('owner_org_title', org);
      
              let org2Query = null;
              if (org2) {
                  org2Query = supabase.from('org_facts').select('*').gte('month', start).lte('month', end);
                  if (org2 !== "all") org2Query = org2Query.eq('owner_org_title', org2);
              }
      
              const [orgResult, org2Result] = await Promise.all([
                  query,
                  org2Query ? org2Query : Promise.resolve({ data: [] }) // Ensure correct response structure
              ]);
      
              if (orgResult.error || org2Result.error) {
                  console.error("Error fetching org data: ", orgResult.error || org2Result.error);
                  return res.status(500).json({ error: "Failed to fetch org data", details: orgResult.error || org2Result.error });
              }
      
              return res.status(200).json({ orgData: orgResult.data, org2Data: org2Result.data });
          } catch (error) {
              console.error("Unexpected API Error:", error);
              return res.status(500).json({ error: "Unexpected error fetching org data", details: error.message });
          }
      }
	  
      case 'person': {
        try {
		    let orgFactsQuery = supabase.from('org_facts').select('*').gte('month', start).lte('month', end);
            let personMapQuery = supabase.from('person_map_facts').select('*').gte('month', start).lte('month', end);
		    
            if (name) {
              personMapQuery = personMapQuery.eq('person_name', name);
            }
		    
            const [{ data: orgFacts, error: orgFactsError }, { data: personMapFacts, error: personMapError }] = await Promise.all([
              orgFactsQuery,
              personMapQuery
            ]);
		    
            if (orgFactsError || personMapError) {
              console.error("Error fetching person data:", orgFactsError || personMapError);
              return res.status(500).json({ error: "Failed to fetch person data", details: orgFactsError.error || personMapError.error });
            }
		    
            return res.status(200).json({ orgFacts, personMapFacts });
          } catch (error) {
              console.error("Unexpected API Error:", error);
              return res.status(500).json({ error: "Unexpected error fetching person data", details: error.message });
          }
      }

      case 'map': {
		  try {
             let query = supabase.from('map_facts').select('*').gte('month', start).lte('month', end);
             if (org && org !== "all") query = query.eq('owner_org_title', org);
		     
             let { data, error } = await query;
             if (error) {
               console.error("Error fetching map data:", error);
               return res.status(500).json({ error: "Failed to fetch map data", details: error.message });
             }
		     
             return res.status(200).json({ mapData: data });
          } catch (error) {
              console.error("Unexpected API Error:", error);
              return res.status(500).json({ error: "Unexpected error fetching map data", details: error.message });
          }
      }

      case 'events': {
	      try {
		    let query = supabase.from('election_period_trends').select('*').gte('month', start).lte('month', end);
		    if (org && org !== "all") query = query.eq('owner_org_title', org);
		    
		    let { data, error } = await query;
		    if (error) {
		    console.error("Error fetching event trends:", error);
		    return res.status(500).json({ error: "Failed to fetch map data", details: error.message });
		    }
		    
		    return res.status(200).json({ electionTrends: data });
		  } catch (error) {
              console.error("Unexpected API Error:", error);
              return res.status(500).json({ error: "Unexpected error fetching event data", details: error.message });
          }
      }
	  
      case 'tables': {
          try {
		    let query = supabase.from('all_travel_expenses').select(columns || '*').gte('month', start).lte('month', end);
		    
            if (org && org !== "all") query = query.eq('owner_org_title', org);
            if (name) query = query.eq('traveler_name', name);
            if (destination) query = query.eq('destination', destination);
            if (purpose) query = query.eq('purpose', purpose);
		    
            let { data, error } = await query;
            if (error) {
              console.error("Error fetching tables data:", error);
              return res.status(500).json({ error: "Failed to fetch tables data", details: error.message });
            }
		    
            return res.status(200).json({ travelExpenses: data });
		  } catch (error) {
              console.error("Unexpected API Error:", error);
              return res.status(500).json({ error: "Unexpected error fetching tables data", details: error.message });
          }
      }
	  
      default:
        return res.status(400).json({ error: "Invalid request type" });
    }
  } catch (error) {
    console.error('Unexpected API error:', error);
    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}

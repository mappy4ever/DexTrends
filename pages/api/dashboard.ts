// pages/api/dashboard.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import logger from '@/utils/logger';

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

interface KPIData {
  totalSpending: number;
  recordCount: number;
  avgTripCost: number;
}

interface SpendingByPurpose {
  name: string;
  value: number;
}

interface TopOrg {
  id: number;
  name: string;
  value: number;
}

interface TopName {
  id: number;
  name: string;
  value: number;
}

interface SpendingOverTime {
  month: string;
  total_airfare: number;
  total_other_transport: number;
  total_lodging: number;
  total_meals: number;
  total_other_expenses: number;
}

type HeatmapData = [number, number, number][];

interface DashboardResponse {
  kpiData: KPIData;
  spendingByPurpose: SpendingByPurpose[];
  spendingOverTime: SpendingOverTime[];
  topOrgs: TopOrg[];
  topNames: TopName[];
  heatmapData: HeatmapData;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardResponse | ErrorResponse>
) {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase URL or Anon Key is not configured." });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { start, end } = req.query; // Expecting YYYY-MM format
  
  const startStr = Array.isArray(start) ? start[0] : start;
  const endStr = Array.isArray(end) ? end[0] : end;

  if (!startStr || !/^\d{4}-\d{2}$/.test(startStr) || !endStr || !/^\d{4}-\d{2}$/.test(endStr)) {
    return res.status(400).json({ error: "Missing or invalid required query parameters: start (YYYY-MM), end (YYYY-MM)" });
  }

  // Format dates for DB query (inclusive start, inclusive end)
  const startDateDb = `${startStr}-01`; // First day of the start month

  const [endYear, endMonthNum] = endStr.split('-').map(Number);
  // Day 0 of the next month gives the last day of the current month.
  const endDateDb = new Date(Date.UTC(endYear, endMonthNum, 0)).toISOString().split('T')[0];

  try {
    const [
        monthlyTotalsResult, orgSpendingResult, nameSpendingResult,
        purposeSpendingResult, heatmapResult
    ] = await Promise.all([
        supabase.from('mv_monthly_totals').select('*').gte('month', startDateDb).lte('month', endDateDb),
        supabase.from('mv_org_spending_monthly').select('*').gte('month', startDateDb).lte('month', endDateDb),
        supabase.from('mv_name_spending_monthly').select('*').gte('month', startDateDb).lte('month', endDateDb),
        supabase.from('mv_purpose_spending_monthly').select('*').gte('month', startDateDb).lte('month', endDateDb),
        supabase.from('mv_heatmap_data').select('*').gte('month', startDateDb).lte('month', endDateDb) // Assuming heatmap also filtered by month
    ]);

    const errors = [
        monthlyTotalsResult.error, orgSpendingResult.error, nameSpendingResult.error,
        purposeSpendingResult.error, heatmapResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
        logger.error("Supabase errors fetching dashboard data:", errors);
        const combinedErrorMsg = errors.map(e => e?.message || 'Unknown error').join('; ');
        return res.status(500).json({ error: "Failed to fetch dashboard data", details: combinedErrorMsg });
    }

    const monthlyTotalsData = monthlyTotalsResult.data || [];
    const orgSpendingData = orgSpendingResult.data || [];
    const nameSpendingData = nameSpendingResult.data || [];
    const purposeSpendingData = purposeSpendingResult.data || [];
    const heatmapRawData = heatmapResult.data || [];

    const kpiData = {
        totalSpending: monthlyTotalsData.reduce((sum, item) => sum + (Number(item.total_spending) || 0), 0),
        recordCount: monthlyTotalsData.reduce((sum, item) => sum + (Number(item.record_count) || 0), 0),
        avgTripCost: 0,
    };
    if (kpiData.recordCount > 0) {
        kpiData.avgTripCost = kpiData.totalSpending / kpiData.recordCount;
    }

    const purposeAgg = purposeSpendingData.reduce<Record<string, number>>((acc, item) => {
        const key = item.purpose || 'Unknown';
        acc[key] = (acc[key] || 0) + (Number(item.total_spent_purpose) || 0);
        return acc;
    }, {});
    const spendingByPurpose = Object.entries(purposeAgg).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    // --- Top Orgs with ID ---
    const orgAgg = orgSpendingData.reduce<Record<number, TopOrg>>((acc, item) => {
        const orgId = item.owner_org_title_id; // Use ID as the key for uniqueness
        if (!orgId) return acc; // Skip if no ID

        if (!acc[orgId]) {
            acc[orgId] = {
                id: orgId,
                name: item.owner_org_title || 'Unknown Org',
                value: 0
            };
        }
        acc[orgId].value += (Number(item.total_spent_org) || 0);
        return acc;
    }, {});
    const topOrgs = Object.values(orgAgg)
                        .sort((a,b) => b.value - a.value)
                        .slice(0, 5);

    // --- Top Names with ID ---
    const nameAgg = nameSpendingData.reduce<Record<number, TopName>>((acc, item) => {
        const personId = item.name_id; // Use ID as the key
        if (!personId) return acc; // Skip if no ID

        if (!acc[personId]) {
            acc[personId] = {
                id: personId,
                name: item.name || 'Unknown Name',
                value: 0
            };
        }
        acc[personId].value += (Number(item.total_spent_name) || 0);
        return acc;
    }, {});
    const topNames = Object.values(nameAgg)
                       .sort((a,b) => b.value - a.value)
                       .slice(0, 5);

    const spendingOverTime = monthlyTotalsData.map(item => ({
        month: item.month, // Assumed YYYY-MM-DD
        total_airfare: Number(item.total_airfare) || 0,
        total_other_transport: Number(item.total_other_transport) || 0,
        total_lodging: Number(item.total_lodging) || 0,
        total_meals: Number(item.total_meals) || 0,
        total_other_expenses: Number(item.total_other_expenses) || 0,
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const heatmapData: HeatmapData = heatmapRawData.map(d => [
        d.month_num,
        d.year,
        Number(d.total_spent_heatmap) || 0
    ]);

    res.status(200).json({
        kpiData, spendingByPurpose, spendingOverTime, topOrgs, topNames, heatmapData,
    });

  } catch (exception) {
    logger.error("API Route Exception (Dashboard):", exception);
    res.status(500).json({ error: "An unexpected error occurred.", details: exception.message });
  }
}
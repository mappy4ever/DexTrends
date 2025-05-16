// components/ui/TripTable.js
import React from 'react';
import { formatDatePretty } from '../../utils/formatters'; // Adjust path
import { formatCurrency } from '../../utils/formatters';   // Adjust path

const TripTable = ({ trips, isLoading }) => (
	<div className="card card-padding-default">
        <h3 className="text-section-heading mb-3">Associated Trips</h3>
        {isLoading ? (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-10 w-full bg-foreground-muted animate-pulse rounded-app-sm"></div>)}
            </div>
        ) : trips && trips.length > 0 ? (
            <div className="overflow-x-auto">
                <table className={`w-full min-w-[850px] text-sm text-left text-foreground`}>
                    <thead className="text-xs text-foreground-muted uppercase bg-surface-hovered">
                        <tr>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Days</th>
                            <th scope="col" className="px-4 py-3">Organization</th>
                            <th scope="col" className="px-4 py-3">Title</th>
                            <th scope="col" className="px-4 py-3">Purpose</th>
                            <th scope="col" className="px-4 py-3">Destinations</th>
                            <th scope="col" className="px-4 py-3 text-right">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip, index) => (
                            <tr key={trip.id || trip.ref_number || `trip-${index}`} className="border-b border-border-subtle hover:bg-surface-hovered transition-colors duration-300 last:border-b-0">
                                <td className="px-4 py-2.5 font-medium text-text-heading whitespace-nowrap">{formatDatePretty(trip.start_date)}</td>
                                <td className="px-4 py-2.5">{trip.traveldays}</td>
                                <td className="px-4 py-2.5">{trip.owner_org_title || 'N/A'}</td>
                                <td className="px-4 py-2.5">{trip.title || 'N/A'}</td>
                                <td className="px-4 py-2.5">{trip.purpose_en || trip.purpose || 'N/A'}</td>
                                <td className="px-4 py-2.5">{trip.destination_en || 'N/A'}</td>
                                <td className="px-4 py-2.5 text-right font-medium text-text-heading whitespace-nowrap">${formatCurrency(trip.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-foreground-muted py-4 text-center">No trips found for this person in the selected date range.</p>
        )}
    </div>
);
export default TripTable;
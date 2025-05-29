// components/ui/OrgDetailsCard.js
import React from 'react';

const OrgDetailsCard = ({ org, isLoading, className = "" }) => {
    // org prop is expected to be the orgDetails object from your API
    // e.g., { org_title_id: '1', org_name: 'Department of Services', director_name: 'Jane Doe', ... }

    // Determine the display name:
    // 1. Use org.owner_org_title if available.
    // 2. Fallback to a generic name if org object exists but name is missing.
    // 3. If no org object, it implies either loading or no specific org selected/found.
    const displayName = org?.owner_org_title || 'Department Details';

    return (
        <div className={`card card-padding-default bg-surface-raised shadow ${className}`}>
            <h2 className="text-xl font-semibold text-text-heading mb-2">
                {isLoading && !org ? 'Loading Department Info...' : displayName}
            </h2>
            {(isLoading && !org) ? (
                // Skeleton loader when loading and no org data yet
                <div className="space-y-1.5">
                    <div className="h-4 w-3/4 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
                    <div className="h-4 w-1/2 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
					<div className="h-4 w-1/2 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
                    {/* Add more skeleton lines if you expect more details */}
                </div>
            ) : org ? (
                // Display actual organization details
                <div className="text-sm space-y-1 font-medium text-foreground">
                    {!org.current && (
                        <p><span className="font-medium text-foreground-muted">Historical Department</span></p>
                    )}
                    <p>Director: <span className="text-foreground-muted">{org.leader || 'Coming soon'}</span></p>
					<p>Description: <span className="text-foreground-muted">{org.description || 'Coming soon'}</span></p>
                </div>
            ) : (
                // Message if no specific organization's data is loaded (and not in loading state)
                // This case might be handled by the parent component not rendering the card if no org is selected.
                <p className="text-foreground-muted">Department information not available.</p>
            )}
        </div>
    );
};

export default OrgDetailsCard;

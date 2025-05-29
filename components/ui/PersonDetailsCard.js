// components/ui/PersonDetailsCard.js
import React from 'react';
import { VscInfo } from "react-icons/vsc";
import Tooltip from './Tooltip';
import { TOOLTIP_TEXTS } from './data/tooltips';

const PersonDetailsCard = ({ person, isLoading, className = "" }) => (
    <div className={`card card-padding-default ${className}`}>
        <h2 className="text-xl font-semibold text-text-heading mb-2">
            {isLoading && !person ? 'Loading Person...' : <div className="flex items-center gap-1.5"><span>{person?.name}</span><Tooltip text={TOOLTIP_TEXTS.NAME_TITLE_DEPT}><VscInfo size = {18} className="text-muted-foreground cursor-help hover:text-primary"/></Tooltip></div> || 'Person Details'}
        </h2>
        {(isLoading && !person) ? (
            <div className="space-y-1.5">
                <div className="h-4 w-3/4 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
                <div className="h-4 w-1/2 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
                <div className="h-4 w-5/6 bg-foreground-muted/20 animate-pulse rounded-app-sm"></div>
            </div>
        ) : person ? (
            <div className="text-sm space-y-1 font-medium text-foreground">
                {/* Example fields - adjust based on what `personData.personDetails` actually contains
                  <p>ID: <span className="font-medium text-foreground">{person.name_id || 'N/A'}</span></p>
                  <p>Name: <span className="font-medium text-foreground">{person.name || 'N/A'}</span></p>
                  <p>Department: <span className="font-medium text-foreground">{person.owner_org_title || 'N/A'}</span></p> 
                */}
                 <p>Title: <span className="text-foreground-muted">{person.title || 'Coming soon'}</span></p>
				 <p>Department: <span className="text-foreground-muted">{person.owner_org_title || 'Coming soon'}</span></p>
                 {/* Add other details from person object as needed */}
            </div>
        ) : (
            <p className="text-foreground-muted">Select a person using the filter above to view their details.</p>
        )}
    </div>
);
export default PersonDetailsCard;
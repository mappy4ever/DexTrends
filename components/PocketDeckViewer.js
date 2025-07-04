import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TypeBadge } from "./ui/TypeBadge"; // Updated path
import { FadeIn, SlideUp } from "./ui/animations";

/**
 * Component to display and interact with Pokémon TCG Pocket deck details
 * @param {Object} props Component props
 * @param {Object} props.deck The deck data to display
 */
export default function PocketDeckViewer({ deck }) {
  const [expanded, setExpanded] = useState(false);

  if (!deck) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
      {/* Deck header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold flex items-center">
            {deck.name}
            <div className="ml-3 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
              {deck.winRate} Win Rate
            </div>
          </h3>
          <div className="flex space-x-1">
            {deck.types?.map(type => (
              <TypeBadge key={type} type={type} size="md" />
            ))}
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{deck.description}</p>
      </div>
      {/* Key cards */}
      <div className="p-4">
        <h4 className="text-base font-medium mb-3">Key Cards</h4>
        <div className="flex mb-4 overflow-x-auto gap-3 pb-2">
          {deck.keyCards.map(card => (
            <Link
              href={`/pocketmode/${card.id}`}
              key={card.id}
              className="flex-shrink-0 relative group transform transition-all hover:scale-105">
              
              <div className="w-20 h-28 relative">
                <Image
                  src={card.image || "/back-card.png"}
                  alt={card.name}
                  width={80}
                  height={112}
                  layout="responsive"
                  className="rounded-md shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "/back-card.png";
                  }}
                />
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {card.count}
                </div>
              </div>
              <div className="mt-1 text-center">
                <p className="text-xs font-medium truncate w-20">{card.name}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Expand/collapse section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-sm text-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
        >
          <span className="mr-1">{expanded ? "Hide" : "Show"} Details</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        {/* Expanded details section */}
        {expanded && (
          <SlideUp className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Strategy</h5>
                <p className="text-sm">
                  {deck.description}
                  {deck.strategy || " This deck focuses on fast setup and consistent damage output. Use your key cards efficiently to maintain board control."}
                </p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Matchups</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span>Strong vs: Electric, Fighting</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    <span>Weak vs: Water, Psychic</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Created by {deck.creator}
                </div>
                <div>
                  <span>{new Date(deck.dateCreated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </SlideUp>
        )}
      </div>
    </div>
  );
}

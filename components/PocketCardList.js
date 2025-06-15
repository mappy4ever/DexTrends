import React from "react";

// PocketCardList: displays cards from the Pocket API (structure is different from TCG)
export default function PocketCardList({ cards, loading, error, emptyMessage = "No Pocket cards found.", cardClassName = "", gridClassName = "" }) {
  if (loading) {
    return <div className="text-center py-8">Loading Pocket cards...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }
  if (!cards || cards.length === 0) {
    return <div className="text-center py-8">{emptyMessage}</div>;
  }
  return (
    <div className={gridClassName || "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"}>
      {cards.map(card => (
        <div key={card.id || card.cardId} className={cardClassName || "bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all p-4 flex flex-col items-center"}>
          <img
            src={card.image || card.sprite || "/dextrendslogo.png"}
            alt={card.name}
            className="w-32 h-32 object-contain mb-2"
            loading="lazy"
          />
          <div className="font-bold text-lg capitalize mb-1">{card.name}</div>
          {card.type && <div className="text-xs text-gray-500 mb-1">Type: {card.type}</div>}
          {card.set && <div className="text-xs text-gray-500 mb-1">Set: {card.set}</div>}
          {/* Add more fields as needed based on Pocket card structure */}
        </div>
      ))}
    </div>
  );
}

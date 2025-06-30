/**
 * Pokemon Moves Tab Component
 * Displays Pokemon moves organized by learn method
 */

import React, { useState } from 'react';
import { FadeIn } from '../ui/animations';
import { getMoveTypeColor, getDamageClassColor, formatLearnMethod } from '../../utils/moveUtils';

const PokemonMovesTab = ({ 
  groupedMoves, 
  detailedMoves, 
  moveFilter, 
  setMoveFilter, 
  showMoveDetails, 
  setShowMoveDetails,
  getFilteredMoves,
  detailedAbilities = []
}) => {
  const [activeSection, setActiveSection] = useState("moves");
  const filteredMoves = getFilteredMoves(groupedMoves);

  return (
    <FadeIn>
      <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
        {/* Section Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveSection("moves")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === "moves"
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Moves
          </button>
          <button
            onClick={() => setActiveSection("abilities")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === "abilities"
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Abilities
          </button>
        </div>

        {/* Moves Section */}
        {activeSection === "moves" && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Moves</h3>
          
          <div className="flex flex-wrap gap-3">
            {/* Move Filter Buttons */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              {[
                { key: "all", label: "All Moves" },
                { key: "learned", label: "Level Up" },
                { key: "learnable", label: "TM/TR" }
              ].map(filter => (
                <button
                  key={filter.key}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    moveFilter === filter.key
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setMoveFilter(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            {/* Toggle Details Button */}
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                showMoveDetails
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setShowMoveDetails(!showMoveDetails)}
            >
              {showMoveDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>
        </div>

        {Object.keys(filteredMoves).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(filteredMoves).map(([method, moves]) => (
              <div key={method} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 capitalize">
                  {method} ({moves.length} moves)
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        {method === 'Level Up' && <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Level</th>}
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Move</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
                        {showMoveDetails && (
                          <>
                            <th className="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Power</th>
                            <th className="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Acc</th>
                            <th className="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">PP</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                            <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Description</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {moves.slice(0, showMoveDetails ? 15 : 25).map((move, idx) => {
                        const moveDetails = detailedMoves[move.id];
                        return (
                          <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {method === 'Level Up' && (
                              <td className="py-3 px-3">
                                {move.level > 0 && (
                                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {move.level}
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="py-3 px-3">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {move.name}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {moveDetails && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoveTypeColor(moveDetails.type)}`}>
                                  {moveDetails.type}
                                </span>
                              )}
                            </td>
                            {showMoveDetails && (
                              <>
                                <td className="py-3 px-3 text-center text-sm">
                                  {moveDetails ? (moveDetails.power || '—') : '—'}
                                </td>
                                <td className="py-3 px-3 text-center text-sm">
                                  {moveDetails ? (moveDetails.accuracy === 'N/A' ? '—' : `${moveDetails.accuracy}%`) : '—'}
                                </td>
                                <td className="py-3 px-3 text-center text-sm">
                                  {moveDetails ? moveDetails.pp : '—'}
                                </td>
                                <td className="py-3 px-3">
                                  {moveDetails && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDamageClassColor(moveDetails.damageClass)}`}>
                                      {moveDetails.damageClass}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                  {moveDetails ? (
                                    <span className="line-clamp-2" title={moveDetails.description}>
                                      {moveDetails.description}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">Loading...</span>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {moves.length > (showMoveDetails ? 15 : 25) && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {showMoveDetails ? 15 : 25} of {moves.length} moves
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No move data available.</p>
          </div>
        )}
        </>
        )}

        {/* Abilities Section */}
        {activeSection === "abilities" && (
          <>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Abilities</h3>
            
            {detailedAbilities.length > 0 ? (
              <div className="space-y-4">
                {detailedAbilities.map((ability, index) => (
                  <div key={ability.name} className={`glass-elevated rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${
                    ability.is_hidden 
                      ? 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
                      : 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {ability.name}
                      </h4>
                      {ability.is_hidden && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                          Hidden Ability
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {ability.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No ability data available.</p>
              </div>
            )}
          </>
        )}
      </div>
    </FadeIn>
  );
};

export default PokemonMovesTab;
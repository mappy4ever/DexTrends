/**
 * Team Synergy Network Graph Component
 * Visualizes Pokemon team composition, type coverage, and synergies
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  ScatterDataPoint,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { analyzeTeamTypeSynergy, getTypeColor, getTypeMatchups, calculateOffensiveCoverage } from '../../utils/typeEffectiveness';
import type { TeamMember, NetworkNode, NetworkEdge, GraphData } from '../../types/team-builder';
import type { Pokemon } from "../../types/pokemon";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface TeamSynergyGraphProps {
  team: TeamMember[];
  onPokemonClick?: (pokemon: TeamMember) => void;
  highlightWeaknesses?: boolean;
  showRoles?: boolean;
}

const TeamSynergyGraph: React.FC<TeamSynergyGraphProps> = ({
  team,
  onPokemonClick,
  highlightWeaknesses = true,
  showRoles = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Generate graph data from team
  const graphData = useMemo((): GraphData => {
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    
    if (team.length === 0) return { nodes, edges };

    // Create Pokemon nodes
    team.forEach((member, index) => {
      const types = member.pokemon.types?.map(t => t.type.name) || [];
      const primaryType = types[0] || 'normal';
      
      nodes.push({
        id: `pokemon-${index}`,
        label: member.nickname || member.pokemon.name,
        type: 'pokemon',
        data: member,
        size: 30,
        color: getTypeColor(primaryType),
        x: Math.cos((index / team.length) * 2 * Math.PI) * 200 + 250,
        y: Math.sin((index / team.length) * 2 * Math.PI) * 200 + 250,
      });
    });

    // Analyze type synergies and create type nodes
    const typeCount: Record<string, number> = {};
    team.forEach(member => {
      member.pokemon.types?.forEach(t => {
        const typeName = t.type.name;
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });
    });

    // Add type nodes
    Object.entries(typeCount).forEach(([type, count], index) => {
      nodes.push({
        id: `type-${type}`,
        label: type,
        type: 'type',
        data: { type, count },
        size: 15 + (count * 5),
        color: getTypeColor(type),
        x: 250 + Math.cos((index / Object.keys(typeCount).length) * 2 * Math.PI) * 120,
        y: 250 + Math.sin((index / Object.keys(typeCount).length) * 2 * Math.PI) * 120,
      });
    });

    // Create edges between Pokemon and their types
    team.forEach((member, memberIndex) => {
      member.pokemon.types?.forEach(t => {
        edges.push({
          id: `edge-pokemon-${memberIndex}-type-${t.type.name}`,
          source: `pokemon-${memberIndex}`,
          target: `type-${t.type.name}`,
          type: 'coverage',
          weight: 1,
          color: 'rgba(100, 100, 100, 0.3)',
        });
      });
    });

    // Analyze synergies between Pokemon
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        const synergy = calculatePokemonSynergy(team[i], team[j]);
        
        if (synergy.score > 0) {
          edges.push({
            id: `edge-synergy-${i}-${j}`,
            source: `pokemon-${i}`,
            target: `pokemon-${j}`,
            type: 'synergy',
            weight: synergy.score,
            label: synergy.reason,
            color: synergy.score > 0.7 ? 'rgba(0, 200, 0, 0.5)' : 'rgba(0, 100, 200, 0.5)',
          });
        }
      }
    }

    // Add weakness relationships if enabled
    if (highlightWeaknesses) {
      const teamTypes = team.map(m => m.pokemon.types?.map(t => t.type.name) || []);
      const { sharedWeaknesses } = analyzeTeamTypeSynergy(teamTypes);
      
      Object.entries(sharedWeaknesses).forEach(([weakType, count]) => {
        if (!nodes.find(n => n.id === `weakness-${weakType}`)) {
          nodes.push({
            id: `weakness-${weakType}`,
            label: `${weakType} (${count}x weak)`,
            type: 'type',
            data: { type: weakType, count },
            size: 20,
            color: 'rgba(255, 0, 0, 0.8)',
            x: 450,
            y: 250 + (Object.keys(sharedWeaknesses).indexOf(weakType) * 50),
          });
        }
      });
    }

    return { nodes, edges };
  }, [team, highlightWeaknesses]);

  // Calculate synergy score between two Pokemon
  function calculatePokemonSynergy(member1: TeamMember, member2: TeamMember): {
    score: number;
    reason: string;
  } {
    const types1 = member1.pokemon.types?.map(t => t.type.name) || [];
    const types2 = member2.pokemon.types?.map(t => t.type.name) || [];
    
    // Check if one resists what the other is weak to
    const matchups1 = getTypeMatchups(types1);
    const matchups2 = getTypeMatchups(types2);
    
    let score = 0;
    let reasons: string[] = [];
    
    // Type synergy
    for (const weakness in matchups1.weaknesses) {
      if (matchups2.resistances[weakness] || matchups2.immunities.includes(weakness)) {
        score += 0.3;
        reasons.push(`${member2.pokemon.name} covers ${weakness}`);
      }
    }
    
    for (const weakness in matchups2.weaknesses) {
      if (matchups1.resistances[weakness] || matchups1.immunities.includes(weakness)) {
        score += 0.3;
        reasons.push(`${member1.pokemon.name} covers ${weakness}`);
      }
    }
    
    // Role synergy (simplified for now)
    const stats1 = member1.pokemon.stats || [];
    const stats2 = member2.pokemon.stats || [];
    
    const isPhysical1 = stats1.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const isSpecial1 = stats1.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
    const isPhysical2 = stats2.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const isSpecial2 = stats2.find(s => s.stat.name === 'special-attack')?.base_stat || 0;
    
    if ((isPhysical1 > isSpecial1) !== (isPhysical2 > isSpecial2)) {
      score += 0.2;
      reasons.push('Mixed offensive presence');
    }
    
    return {
      score: Math.min(score, 1),
      reason: reasons[0] || 'Good synergy',
    };
  }

  // Chart configuration
  const chartData = {
    datasets: [
      // Pokemon nodes
      {
        label: 'Pokemon',
        data: graphData.nodes
          .filter(n => n.type === 'pokemon')
          .map(n => ({
            x: n.x || 0,
            y: n.y || 0,
            node: n,
          })),
        backgroundColor: graphData.nodes
          .filter(n => n.type === 'pokemon')
          .map(n => n.color),
        pointRadius: graphData.nodes
          .filter(n => n.type === 'pokemon')
          .map(n => n.size / 3),
        pointHoverRadius: graphData.nodes
          .filter(n => n.type === 'pokemon')
          .map(n => (n.size / 3) + 5),
      },
      // Type nodes
      {
        label: 'Types',
        data: graphData.nodes
          .filter(n => n.type === 'type')
          .map(n => ({
            x: n.x || 0,
            y: n.y || 0,
            node: n,
          })),
        backgroundColor: graphData.nodes
          .filter(n => n.type === 'type')
          .map(n => n.color),
        pointRadius: graphData.nodes
          .filter(n => n.type === 'type')
          .map(n => n.size / 3),
        pointStyle: 'rect',
      },
    ],
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
        min: 0,
        max: 500,
      },
      y: {
        display: false,
        min: 0,
        max: 500,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw as any;
            const node = point.node as NetworkNode;
            
            if (node.type === 'pokemon') {
              const member = node.data as TeamMember;
              return [
                `${member.pokemon.name}`,
                `Types: ${member.pokemon.types?.map(t => t.type.name).join(', ') || 'Unknown'}`,
                `Level: ${member.level}`,
              ];
            } else {
              return [`${node.label}`];
            }
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const index = element.index;
        const dataset = chartData.datasets[datasetIndex];
        const point = dataset.data[index] as any;
        const node = point.node as NetworkNode;
        
        if (node.type === 'pokemon' && onPokemonClick) {
          onPokemonClick(node.data as TeamMember);
        }
        
        setSelectedNode(node.id);
      }
    },
    onHover: (event, elements) => {
      if (elements.length > 0) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const index = element.index;
        const dataset = chartData.datasets[datasetIndex];
        const point = dataset.data[index] as any;
        const node = point.node as NetworkNode;
        
        setHoveredNode(node.id);
      } else {
        setHoveredNode(null);
      }
    },
  };

  // Draw edges on canvas
  useEffect(() => {
    const chart = ChartJS.getChart('synergy-graph');
    if (!chart) return;

    const ctx = chart.ctx;
    const originalDraw = chart.draw.bind(chart);
    
    chart.draw = function() {
      originalDraw();
      
      // Draw edges
      ctx.save();
      graphData.edges.forEach(edge => {
        const sourceNode = graphData.nodes.find(n => n.id === edge.source);
        const targetNode = graphData.nodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode && sourceNode.x && targetNode.x && sourceNode.y && targetNode.y) {
          const sourceX = chart.scales.x.getPixelForValue(sourceNode.x);
          const sourceY = chart.scales.y.getPixelForValue(sourceNode.y);
          const targetX = chart.scales.x.getPixelForValue(targetNode.x);
          const targetY = chart.scales.y.getPixelForValue(targetNode.y);
          
          ctx.beginPath();
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = edge.weight * 2;
          ctx.stroke();
          
          // Draw edge label if present
          if (edge.label && (hoveredNode === edge.source || hoveredNode === edge.target)) {
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(edge.label, midX, midY);
          }
        }
      });
      ctx.restore();
    };
    
    return () => {
      chart.draw = originalDraw;
    };
  }, [graphData, hoveredNode]);

  return (
    <div className="relative w-full h-[500px] bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Team Synergy Network
      </h3>
      
      {team.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            Add Pokemon to your team to see synergy analysis
          </p>
        </div>
      ) : (
        <>
          <Scatter 
            id="synergy-graph"
            data={chartData} 
            options={options}
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
            <h4 className="font-semibold text-sm mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Pokemon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500"></div>
                <span>Type</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <span>Strong Synergy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500"></div>
                <span>Good Synergy</span>
              </div>
              {highlightWeaknesses && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500"></div>
                  <span>Shared Weakness</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Synergy Score */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
            <TeamSynergyScore team={team} />
          </div>
        </>
      )}
    </div>
  );
};

// Synergy score component
const TeamSynergyScore: React.FC<{ team: TeamMember[] }> = ({ team }) => {
  const teamTypes = team.map(m => m.pokemon.types?.map(t => t.type.name) || []);
  const { defensiveScore, sharedWeaknesses, uncoveredTypes } = analyzeTeamTypeSynergy(teamTypes);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Team Analysis</h4>
      <div className="text-xs space-y-1">
        <div className="flex justify-between items-center">
          <span>Defensive Score:</span>
          <span className={`font-bold ${getScoreColor(defensiveScore)}`}>
            {defensiveScore}/100
          </span>
        </div>
        {Object.keys(sharedWeaknesses).length > 0 && (
          <div className="text-red-600">
            Shared weaknesses: {Object.keys(sharedWeaknesses).join(', ')}
          </div>
        )}
        {uncoveredTypes.length > 0 && (
          <div className="text-orange-600">
            No resist: {uncoveredTypes.slice(0, 3).join(', ')}
            {uncoveredTypes.length > 3 && ` +${uncoveredTypes.length - 3}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSynergyGraph;
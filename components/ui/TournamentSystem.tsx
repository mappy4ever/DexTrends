import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaChartBar, FaCrown, FaFire, FaBolt } from 'react-icons/fa';
import { BsLightning, BsGrid3X3Gap, BsGraphUp, BsStopwatch, BsStar, BsShield } from 'react-icons/bs';
import { GiTwoCoins, GiDiamonds, GiSwordman } from 'react-icons/gi';

interface Prize {
  gems?: number;
  coins?: number;
  title?: string;
}

interface PrizePool {
  first: Prize;
  second?: Prize;
  third?: Prize;
  top8?: Prize;
  top16?: Prize;
  participation?: Prize;
}

interface Tournament {
  id: string;
  name: string;
  format: 'Standard' | 'Expanded' | 'Unlimited';
  type: 'Swiss' | 'Single Elimination' | 'Swiss + Top Cut' | 'Round Robin';
  status: 'registration' | 'live' | 'upcoming' | 'completed';
  startTime: Date;
  endTime: Date;
  location: string;
  organizer: string;
  maxPlayers: number;
  currentPlayers: number;
  entryFee: number;
  prizePool: PrizePool;
  description: string;
  rules: string;
  featured: boolean;
  currentRound?: string;
}

interface MyTournament {
  id: string;
  name: string;
  placement: number;
  totalPlayers: number;
  format: string;
  date: Date;
  prize: Prize;
  record: {
    wins: number;
    losses: number;
  };
}

interface Archetype {
  name: string;
  usage: number;
  winRate: number;
  trend: 'rising' | 'falling' | 'stable';
  keyCards: string[];
}

interface MetaAnalysis {
  topArchetypes: Archetype[];
  totalMatches: number;
  lastUpdated: Date;
  seasonStats: {
    totalTournaments: number;
    averageParticipants: number;
    mostPopularFormat: string;
  };
}

interface Player {
  id: string;
  name: string;
  seed: number;
  deck: string;
}

interface Match {
  player1: Player;
  player2: Player;
  winner?: Player;
}

interface Round {
  name: string;
  matches: Match[];
}

interface Bracket {
  rounds: Round[];
}

interface TournamentSystemProps {
  userId?: string;
  onTournamentJoin?: (tournament: Tournament) => void;
  onCreateTournament?: () => void;
}

const TournamentSystem: React.FC<TournamentSystemProps> = ({ userId, onTournamentJoin, onCreateTournament }) => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'my-tournaments' | 'meta-analysis' | 'leaderboards'>('tournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [metaAnalysis, setMetaAnalysis] = useState<MetaAnalysis | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showBracket, setShowBracket] = useState(false);

  useEffect(() => {
    loadTournamentData();
  }, []);

  const loadTournamentData = () => {
    // Mock tournament data
    const mockTournaments: Tournament[] = [
      {
        id: 'tour-1',
        name: 'Weekly Standard Championship',
        format: 'Standard',
        type: 'Swiss + Top Cut',
        status: 'registration',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Online',
        organizer: 'DexTrends',
        maxPlayers: 128,
        currentPlayers: 67,
        entryFee: 0,
        prizePool: {
          first: { gems: 500, title: 'Weekly Champion' },
          second: { gems: 300, coins: 1000 },
          third: { gems: 200, coins: 750 },
          top8: { gems: 100, coins: 500 }
        },
        description: 'Weekly competitive tournament for Standard format. Best of 3 matches.',
        rules: 'Standard format, 60-card decks, best of 3 matches',
        featured: true
      },
      {
        id: 'tour-2',
        name: 'Premium Collector\'s Cup',
        format: 'Expanded',
        type: 'Single Elimination',
        status: 'live',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        location: 'Premium Event',
        organizer: 'EliteTournaments',
        maxPlayers: 64,
        currentPlayers: 64,
        entryFee: 10,
        prizePool: {
          first: { gems: 2000, coins: 5000, title: 'Elite Champion' },
          second: { gems: 1200, coins: 3000 },
          third: { gems: 800, coins: 2000 },
          top8: { gems: 400, coins: 1000 }
        },
        description: 'High-stakes tournament with premium rewards for the best players.',
        rules: 'Expanded format, single elimination, best of 3',
        currentRound: 'Quarterfinals',
        featured: true
      },
      {
        id: 'tour-3',
        name: 'Beginner Friendly League',
        format: 'Standard',
        type: 'Round Robin',
        status: 'registration',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        location: 'Casual Division',
        organizer: 'NewPlayerSupport',
        maxPlayers: 32,
        currentPlayers: 18,
        entryFee: 0,
        prizePool: {
          first: { gems: 200, coins: 500 },
          participation: { gems: 50, coins: 100 }
        },
        description: 'Perfect for new players to learn competitive play in a friendly environment.',
        rules: 'Standard format, beginner-friendly, coaching available',
        featured: false
      },
      {
        id: 'tour-4',
        name: 'Monthly Meta Madness',
        format: 'Standard',
        type: 'Swiss',
        status: 'upcoming',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        location: 'Major Event',
        organizer: 'MetaGamers',
        maxPlayers: 256,
        currentPlayers: 43,
        entryFee: 5,
        prizePool: {
          first: { gems: 1500, coins: 4000, title: 'Meta Master' },
          second: { gems: 1000, coins: 2500 },
          third: { gems: 750, coins: 1800 },
          top8: { gems: 500, coins: 1200 },
          top16: { gems: 300, coins: 800 }
        },
        description: 'Monthly championship featuring the current meta decks and strategies.',
        rules: 'Standard format, Swiss rounds + Top 8 cut',
        featured: true
      }
    ];

    // Mock user's tournament history
    const mockMyTournaments: MyTournament[] = [
      {
        id: 'my-tour-1',
        name: 'Last Week\'s Standard Cup',
        placement: 3,
        totalPlayers: 64,
        format: 'Standard',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        prize: { gems: 200, coins: 750 },
        record: { wins: 5, losses: 2 }
      },
      {
        id: 'my-tour-2',
        name: 'Expanded Masters',
        placement: 12,
        totalPlayers: 128,
        format: 'Expanded',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        prize: { gems: 50, coins: 200 },
        record: { wins: 4, losses: 3 }
      }
    ];

    // Mock meta analysis
    const mockMetaAnalysis: MetaAnalysis = {
      topArchetypes: [
        {
          name: 'Charizard ex',
          usage: 23.5,
          winRate: 67.2,
          trend: 'rising',
          keyCards: ['Charizard ex', 'Pidgeot ex', 'Professor\'s Research']
        },
        {
          name: 'Miraidon ex',
          usage: 18.7,
          winRate: 64.8,
          trend: 'stable',
          keyCards: ['Miraidon ex', 'Electric Generator', 'Ultra Ball']
        },
        {
          name: 'Gardevoir ex',
          usage: 15.2,
          winRate: 61.9,
          trend: 'falling',
          keyCards: ['Gardevoir ex', 'Psychic Embrace', 'Kirlia']
        },
        {
          name: 'Lost Box',
          usage: 12.1,
          winRate: 59.3,
          trend: 'stable',
          keyCards: ['Comfey', 'Lost Vacuum', 'Colress\'s Experiment']
        },
        {
          name: 'Pidgeot Control',
          usage: 8.9,
          winRate: 55.7,
          trend: 'rising',
          keyCards: ['Pidgeot ex', 'Boss\'s Orders', 'Counter Catcher']
        }
      ],
      totalMatches: 2847,
      lastUpdated: new Date(),
      seasonStats: {
        totalTournaments: 156,
        averageParticipants: 67,
        mostPopularFormat: 'Standard'
      }
    };

    setTournaments(mockTournaments);
    setMyTournaments(mockMyTournaments);
    setMetaAnalysis(mockMetaAnalysis);
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'registration': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'live': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'upcoming': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTrendIcon = (trend: Archetype['trend']) => {
    switch (trend) {
      case 'rising': return <BsGraphUp className="text-green-500" />;
      case 'falling': return <BsGraphUp className="text-red-500 transform rotate-180" />;
      default: return <BsLightning className="text-gray-400" />;
    }
  };

  const formatTimeToStart = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs <= 0) return 'Started';
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
    return `${diffHours}h ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  const generateBracket = (tournament: Tournament): Bracket => {
    // Mock bracket data for visualization
    const players: Player[] = Array.from({ length: Math.min(tournament.currentPlayers, 8) }, (_, i) => ({
      id: `player-${i}`,
      name: `Player ${i + 1}`,
      seed: i + 1,
      deck: ['Charizard ex', 'Miraidon ex', 'Gardevoir ex', 'Lost Box'][i % 4]
    }));

    return {
      rounds: [
        {
          name: 'Quarterfinals',
          matches: [
            { player1: players[0], player2: players[7], winner: players[0] },
            { player1: players[1], player2: players[6], winner: players[1] },
            { player1: players[2], player2: players[5], winner: players[2] },
            { player1: players[3], player2: players[4], winner: players[4] }
          ]
        },
        {
          name: 'Semifinals',
          matches: [
            { player1: players[0], player2: players[1], winner: players[0] },
            { player1: players[2], player2: players[4], winner: players[4] }
          ]
        },
        {
          name: 'Finals',
          matches: [
            { player1: players[0], player2: players[4], winner: players[0] }
          ]
        }
      ]
    };
  };

  const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 ${
      tournament.featured ? 'ring-2 ring-yellow-400' : ''
    }`}>
      {tournament.featured && (
        <div className="flex items-center space-x-1 mb-3">
          <FaCrown className="text-yellow-500" />
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Featured Tournament</span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {tournament.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span className="flex items-center space-x-1">
              <BsShield />
              <span>{tournament.format}</span>
            </span>
            <span className="flex items-center space-x-1">
              <FaUsers />
              <span>{tournament.currentPlayers}/{tournament.maxPlayers}</span>
            </span>
            <span className="flex items-center space-x-1">
              <FaMapMarkerAlt />
              <span>{tournament.location}</span>
            </span>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(tournament.status)}`}>
          {tournament.status === 'live' && tournament.currentRound 
            ? tournament.currentRound 
            : tournament.status}
        </span>
      </div>

      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
        {tournament.description}
      </p>

      {/* Prize Pool */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Prize Pool</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
            <span className="text-yellow-700 dark:text-yellow-300">1st Place</span>
            <div className="flex items-center space-x-2">
              {tournament.prizePool.first.gems && (
                <div className="flex items-center space-x-1">
                  <GiDiamonds className="text-cyan-500" />
                  <span>{tournament.prizePool.first.gems}</span>
                </div>
              )}
              {tournament.prizePool.first.coins && (
                <div className="flex items-center space-x-1">
                  <GiTwoCoins className="text-yellow-500" />
                  <span>{tournament.prizePool.first.coins}</span>
                </div>
              )}
            </div>
          </div>
          
          {tournament.prizePool.participation && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-700 dark:text-gray-300">All Players</span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <GiDiamonds className="text-cyan-500" />
                  <span>{tournament.prizePool.participation.gems}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GiTwoCoins className="text-yellow-500" />
                  <span>{tournament.prizePool.participation.coins}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tournament Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Start Time:</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {tournament.startTime.toLocaleDateString()} {tournament.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Entry Fee:</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {tournament.entryFee === 0 ? 'Free' : `$${tournament.entryFee}`}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {tournament.status === 'registration' && (
          <button
            onClick={() => onTournamentJoin?.(tournament)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

            Join Tournament
          </button>
        )}
        
        {tournament.status === 'live' && (
          <button
            onClick={() => {
              setSelectedTournament(tournament);
              setShowBracket(true);
            }}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">

            View Live Bracket
          </button>
        )}
        
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          View Details
        </button>
      </div>

      {tournament.status === 'registration' && (
        <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          Starts in {formatTimeToStart(tournament.startTime)}
        </div>
      )}
    </div>
  );

  const BracketView: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
    const bracket = generateBracket(tournament);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tournament Bracket - {tournament.name}
          </h3>
          <button
            onClick={() => setShowBracket(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">

            ✕
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="flex space-x-8 min-w-max">
            {bracket.rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="flex flex-col justify-center">
                <h4 className="text-center font-medium text-gray-900 dark:text-white mb-4">
                  {round.name}
                </h4>
                <div className="space-y-8">
                  {round.matches.map((match, matchIndex) => (
                    <div key={matchIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-w-48">
                      <div className={`p-2 rounded mb-2 ${
                        match.winner?.id === match.player1.id 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <div className="font-medium">{match.player1.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{match.player1.deck}</div>
                      </div>
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">VS</div>
                      <div className={`p-2 rounded ${
                        match.winner?.id === match.player2.id 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-600'
                      }`}>
                        <div className="font-medium">{match.player2.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{match.player2.deck}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tournament-system space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FaTrophy className="mr-3" />
              Tournament Hub
            </h2>
            <p className="text-purple-100">Compete in tournaments and climb the competitive ladder</p>
          </div>
          <div className="text-right">
            <button
              onClick={() => onCreateTournament?.()}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">

              Create Tournament
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'tournaments' as const, label: 'Active Tournaments', icon: <FaTrophy /> },
          { id: 'my-tournaments' as const, label: 'My History', icon: <FaMedal /> },
          { id: 'meta-analysis' as const, label: 'Meta Analysis', icon: <FaChartBar /> },
          { id: 'leaderboards' as const, label: 'Leaderboards', icon: <FaCrown /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && !showBracket && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tournaments.map(tournament => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}

      {/* Bracket View */}
      {showBracket && selectedTournament && (
        <BracketView tournament={selectedTournament} />
      )}

      {/* My Tournaments Tab */}
      {activeTab === 'my-tournaments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tournament History
            </h3>
            
            <div className="space-y-4">
              {myTournaments.map(tournament => (
                <div key={tournament.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {tournament.name}
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {tournament.date.toLocaleDateString()} • {tournament.format}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        tournament.placement <= 3 ? 'text-yellow-600' :
                        tournament.placement <= 8 ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        #{tournament.placement}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        of {tournament.totalPlayers}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {tournament.record.wins}-{tournament.record.losses}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Record</div>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center justify-center space-x-1">
                        {tournament.prize.gems && (
                          <>
                            <GiDiamonds className="text-cyan-500" />
                            <span>{tournament.prize.gems}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Gems</div>
                    </div>
                    
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center justify-center space-x-1">
                        {tournament.prize.coins && (
                          <>
                            <GiTwoCoins className="text-yellow-500" />
                            <span>{tournament.prize.coins}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Coins</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meta Analysis Tab */}
      {activeTab === 'meta-analysis' && metaAnalysis && (
        <div className="space-y-6">
          {/* Meta Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metaAnalysis.totalMatches.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Matches</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metaAnalysis.seasonStats.totalTournaments}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tournaments</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {metaAnalysis.seasonStats.averageParticipants}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Players</div>
              </div>
            </div>
          </div>

          {/* Top Archetypes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Meta Breakdown
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {metaAnalysis.lastUpdated.toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-4">
              {metaAnalysis.topArchetypes.map((archetype, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {archetype.name}
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {archetype.keyCards.slice(0, 3).join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {archetype.usage}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Usage</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {archetype.winRate}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
                      </div>
                      
                      <div className="flex items-center">
                        {getTrendIcon(archetype.trend)}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${archetype.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tournament Info Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaFire className="text-orange-500 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Tournament Tips:</strong> Practice with meta decks, join beginner tournaments to learn, 
            watch live streams to understand strategy, and always check the latest banned/restricted lists before competing.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentSystem;
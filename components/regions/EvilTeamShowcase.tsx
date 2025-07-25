import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, SlideUp, CardHover } from '../ui/animations/animations';
import { 
  BsExclamationTriangle,
  BsPerson,
  BsGeoAlt,
  BsLightning,
  BsShieldX,
  BsFlag,
  BsCurrencyDollar,
  BsEye,
  BsXCircle,
  BsArrowRight
} from 'react-icons/bs';
import { GiEvilMinion, GiCrown } from 'react-icons/gi';

// Types
interface TeamMember {
  name: string;
  role: string;
  description: string;
}

interface Leader {
  name: string;
  title: string;
  image: string;
  description: string;
  signature: string;
}

interface Team {
  name: string;
  logo: string;
  motto: string;
  color: string;
  leader: Leader;
  executives?: TeamMember[];
  admins?: TeamMember[];
  commanders?: TeamMember[];
  scientists?: TeamMember[];
  sages?: TeamMember[];
  squadBosses?: TeamMember[];
  members?: TeamMember[];
  goals: string[];
  majorPlots: string[];
  notableMembers?: string[];
  defeat: string;
  legacy: string;
}

interface Region {
  id: string;
  name: string;
}

interface EvilTeamShowcaseProps {
  region: Region;
  theme: 'light' | 'dark';
}

type TeamData = Team | Team[];

interface AllTeamData {
  [key: string]: TeamData;
}

const EvilTeamShowcase: React.FC<EvilTeamShowcaseProps> = ({ region, theme }) => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  // Comprehensive evil team data
  const evilTeamData: AllTeamData = {
    kanto: {
      name: 'Team Rocket',
      logo: '/images/evil-teams/team-rocket-logo.png',
      motto: "Steal Pokémon for profit. Exploit Pokémon for profit. All Pokémon exist for the glory of Team Rocket.",
      color: 'from-gray-800 to-red-600',
      leader: {
        name: 'Giovanni',
        title: 'Boss',
        image: '/images/scraped/gym-leaders-organized/giovanni.png',
        description: 'Viridian City Gym Leader and secret crime boss. Seeks powerful and rare Pokémon.',
        signature: 'Rhyhorn, Persian, Nidoking'
      },
      executives: [
        { name: 'Archer', role: 'Executive', description: 'Giovanni\'s right-hand man' },
        { name: 'Ariana', role: 'Executive', description: 'Ruthless and devoted to Giovanni' },
        { name: 'Petrel', role: 'Executive', description: 'Master of disguise' },
        { name: 'Proton', role: 'Executive', description: 'The cruelest Team Rocket member' }
      ],
      goals: [
        'Control and exploit Pokémon for profit',
        'Capture rare and powerful Pokémon',
        'Take over Silph Co. for Master Ball production',
        'Use technology to control Pokémon'
      ],
      majorPlots: [
        'Mt. Moon fossil theft operation',
        'Silph Co. hostile takeover attempt',
        'Game Corner secret base operation',
        'Radio Tower takeover (Johto)'
      ],
      notableMembers: ['Jessie', 'James', 'Butch', 'Cassidy'],
      defeat: 'Disbanded after Giovanni\'s defeat, later reformed in Johto',
      legacy: 'The most iconic villainous team in Pokémon history'
    },
    johto: {
      name: 'Team Rocket (Neo)',
      logo: '/images/evil-teams/team-rocket-logo.png',
      motto: "Revive Team Rocket and bring back Giovanni!",
      color: 'from-gray-800 to-red-600',
      leader: {
        name: 'Archer & Executives',
        title: 'Interim Leaders',
        image: '/images/evil-teams/rocket-executives.png',
        description: 'Former executives trying to revive Team Rocket and locate Giovanni.',
        signature: 'Houndoom, Crobat, Weezing'
      },
      executives: [
        { name: 'Archer', role: 'Interim Boss', description: 'Leading the revival effort' },
        { name: 'Ariana', role: 'Executive', description: 'Radio Tower operation leader' },
        { name: 'Petrel', role: 'Executive', description: 'Infiltration specialist' },
        { name: 'Proton', role: 'Executive', description: 'Mahogany Town hideout commander' }
      ],
      goals: [
        'Locate and bring back Giovanni',
        'Revive Team Rocket to former glory',
        'Use radio waves to control Pokémon',
        'Force evolution of Magikarp at Lake of Rage'
      ],
      majorPlots: [
        'Slowpoke Well tail-cutting operation',
        'Radio Tower takeover',
        'Lake of Rage forced evolution experiment',
        'Mahogany Town secret base'
      ],
      notableMembers: ['Jessie', 'James', 'Tyson'],
      defeat: 'Permanently disbanded after Radio Tower failure',
      legacy: 'Showed that evil teams can persist beyond their original leaders'
    },
    hoenn: [
      {
        name: 'Team Aqua',
        logo: '/images/evil-teams/team-aqua-logo.png',
        motto: "Expand the sea for the benefit of Water Pokémon!",
        color: 'from-blue-600 to-blue-800',
        leader: {
          name: 'Archie',
          title: 'Leader',
          image: '/images/evil-teams/archie.png',
          description: 'Passionate about the sea and Water Pokémon. Seeks to awaken Kyogre.',
          signature: 'Sharpedo, Muk, Crobat'
        },
        admins: [
          { name: 'Matt', role: 'Admin', description: 'Archie\'s muscle and enforcer' },
          { name: 'Shelly', role: 'Admin', description: 'Strategic planner and scientist' }
        ],
        goals: [
          'Awaken Kyogre to expand the seas',
          'Create more habitat for Water Pokémon',
          'Return the world to its primordial state',
          'Counter Team Magma\'s land expansion plans'
        ],
        majorPlots: [
          'Steal submarine from Slateport',
          'Raid Weather Institute',
          'Steal the Blue Orb',
          'Awaken Kyogre at Seafloor Cavern'
        ],
        defeat: 'Disbanded after realizing the catastrophic consequences',
        legacy: 'First team with environmental motivations'
      },
      {
        name: 'Team Magma',
        logo: '/images/evil-teams/team-magma-logo.png',
        motto: "Expand the land for the benefit of people and Pokémon!",
        color: 'from-red-600 to-orange-600',
        leader: {
          name: 'Maxie',
          title: 'Leader',
          image: '/images/evil-teams/maxie.png',
          description: 'Intellectual leader who believes in expanding landmass. Seeks to awaken Groudon.',
          signature: 'Camerupt, Mightyena, Crobat'
        },
        admins: [
          { name: 'Tabitha', role: 'Admin', description: 'Loyal enforcer and tactician' },
          { name: 'Courtney', role: 'Admin', description: 'Analytical and emotionless scientist' }
        ],
        goals: [
          'Awaken Groudon to expand landmass',
          'Create more living space for people and Pokémon',
          'Advance human civilization through land expansion',
          'Counter Team Aqua\'s ocean expansion plans'
        ],
        majorPlots: [
          'Steal meteorite from Mt. Chimney',
          'Raid for rocket fuel',
          'Steal the Red Orb',
          'Awaken Groudon at Seafloor Cavern'
        ],
        defeat: 'Disbanded after ecological disaster nearly occurred',
        legacy: 'Showed villains could have misguided good intentions'
      }
    ],
    sinnoh: {
      name: 'Team Galactic',
      logo: '/images/evil-teams/team-galactic-logo.png',
      motto: "Create a new world without spirit!",
      color: 'from-blue-700 to-purple-700',
      leader: {
        name: 'Cyrus',
        title: 'Boss',
        image: '/images/evil-teams/cyrus.png',
        description: 'Emotionless leader who seeks to destroy and recreate the universe without spirit.',
        signature: 'Weavile, Honchkrow, Gyarados, Crobat'
      },
      commanders: [
        { name: 'Mars', role: 'Commander', description: 'Hot-headed and impulsive' },
        { name: 'Jupiter', role: 'Commander', description: 'Cold and calculating' },
        { name: 'Saturn', role: 'Commander', description: 'Most loyal to Cyrus' },
        { name: 'Charon', role: 'Scientist', description: 'Only interested in money' }
      ],
      goals: [
        'Capture Dialga and Palkia',
        'Use their power to destroy the universe',
        'Create a new world without emotions',
        'Achieve Cyrus\'s vision of perfection'
      ],
      majorPlots: [
        'Steal energy from Valley Windworks',
        'Bomb Lake Valor to capture Azelf',
        'Capture the Lake Guardians',
        'Create the Red Chain at Spear Pillar'
      ],
      notableMembers: [],
      defeat: 'Disbanded after Cyrus disappears into Distortion World',
      legacy: 'Most ambitious villain goal - universal destruction and recreation'
    },
    unova: [
      {
        name: 'Team Plasma',
        logo: '/images/evil-teams/team-plasma-logo.png',
        motto: "Free Pokémon from human oppression!",
        color: 'from-blue-500 to-gray-600',
        leader: {
          name: 'N (King) / Ghetsis (True Leader)',
          title: 'King / Sage',
          image: '/images/evil-teams/n-ghetsis.png',
          description: 'N believes in Pokémon liberation. Ghetsis manipulates him for world domination.',
          signature: 'N: Zekrom/Reshiram, Ghetsis: Hydreigon'
        },
        sages: [
          { name: 'Ghetsis', role: 'True Leader', description: 'Manipulative mastermind' },
          { name: 'Rood', role: 'Sage', description: 'Caretaker of N' },
          { name: 'Zinzolin', role: 'Sage', description: 'Cold researcher' },
          { name: 'Others', role: 'Sages', description: 'Gorm, Bronius, Giallo, Ryoku' }
        ],
        goals: [
          'Convince people to release their Pokémon',
          'Make N the hero of Unova\'s legend',
          'Use legendary dragon for domination',
          'Ghetsis: Rule over defenseless people'
        ],
        majorPlots: [
          'Public speeches about Pokémon liberation',
          'Steal Pokémon from trainers',
          'Awaken legendary dragon',
          'Take over Pokémon League'
        ],
        defeat: 'Split after N learns the truth about Ghetsis',
        legacy: 'Most complex motivation - false liberation ideology'
      },
      {
        name: 'Neo Team Plasma',
        logo: '/images/evil-teams/neo-plasma-logo.png',
        motto: "Rule Unova through force!",
        color: 'from-black to-blue-800',
        leader: {
          name: 'Ghetsis',
          title: 'True Leader',
          image: '/images/evil-teams/ghetsis.png',
          description: 'No longer hiding behind liberation ideology, seeks direct domination.',
          signature: 'Hydreigon, Kyurem'
        },
        members: [
          { name: 'Colress', role: 'Scientist', description: 'Obsessed with Pokémon potential' },
          { name: 'Shadow Triad', role: 'Ninjas', description: 'Ghetsis\'s personal guard' },
          { name: 'Zinzolin', role: 'Sage', description: 'Still loyal to Ghetsis' }
        ],
        goals: [
          'Take over Unova by force',
          'Use Kyurem\'s power for domination',
          'Freeze Unova with the Plasma Frigate',
          'Eliminate all opposition'
        ],
        majorPlots: [
          'Steal Pokémon across Unova',
          'Attack Opelucid City',
          'Capture and control Kyurem',
          'Freeze cities with Plasma Frigate'
        ],
        defeat: 'Permanently disbanded after Ghetsis\'s breakdown',
        legacy: 'Showed how idealistic movements can become corrupted'
      }
    ],
    kalos: {
      name: 'Team Flare',
      logo: '/images/evil-teams/team-flare-logo.png',
      motto: "Create a beautiful world by eliminating everyone who isn\'t Team Flare!",
      color: 'from-red-600 to-orange-500',
      leader: {
        name: 'Lysandre',
        title: 'Boss',
        image: '/images/evil-teams/lysandre.png',
        description: 'Philanthropist turned misanthrope who believes the world has become ugly.',
        signature: 'Pyroar, Gyarados (Mega), Xerneas/Yveltal'
      },
      scientists: [
        { name: 'Xerosic', role: 'Head Scientist', description: 'Inventor of Expansion Suit' },
        { name: 'Aliana', role: 'Scientist', description: 'Orange-haired researcher' },
        { name: 'Bryony', role: 'Scientist', description: 'Green-haired scientist' },
        { name: 'Celosia', role: 'Scientist', description: 'Purple-haired operative' },
        { name: 'Mable', role: 'Scientist', description: 'Blue-haired admin' }
      ],
      goals: [
        'Activate the ultimate weapon',
        'Eliminate all life except Team Flare',
        'Create a "beautiful" world',
        'Achieve immortality for the chosen few'
      ],
      majorPlots: [
        'Steal Pokémon energy for ultimate weapon',
        'Capture Xerneas/Yveltal',
        'Activate 3,000-year-old weapon',
        'Destroy all life in Kalos'
      ],
      notableMembers: ['Malva (Elite Four member)'],
      defeat: 'Disbanded after Lysandre\'s apparent death',
      legacy: 'Most genocidal team with fashionable aesthetic'
    },
    alola: [
      {
        name: 'Team Skull',
        logo: '/images/evil-teams/team-skull-logo.png',
        motto: "We're just a bunch of misfits making trouble, yo!",
        color: 'from-gray-800 to-purple-600',
        leader: {
          name: 'Guzma',
          title: 'Boss',
          image: '/images/evil-teams/guzma.png',
          description: 'Failed trial-goer who formed Team Skull out of other rejects.',
          signature: 'Golisopod, Ariados, Masquerain'
        },
        admins: [
          { name: 'Plumeria', role: 'Admin', description: 'Big sister figure to grunts' }
        ],
        goals: [
          'Cause trouble and make money',
          'Prove themselves after failing trials',
          'Support each other as outcasts',
          'Work as muscle for Aether Foundation'
        ],
        majorPlots: [
          'Vandalize trial sites',
          'Steal Pokémon and items',
          'Take over Po Town',
          'Help Aether Foundation operations'
        ],
        defeat: 'Reformed after Guzma\'s change of heart',
        legacy: 'Most sympathetic villain team - just troubled youths'
      },
      {
        name: 'Aether Foundation',
        logo: '/images/evil-teams/aether-foundation-logo.png',
        motto: "Protect and preserve Pokémon at any cost!",
        color: 'from-white to-gold-200',
        leader: {
          name: 'Lusamine',
          title: 'President',
          image: '/images/evil-teams/lusamine.png',
          description: 'Obsessed with Ultra Beasts and "preserving" beauty forever.',
          signature: 'Clefable, Milotic, Mismagius, Lilligant, Bewear'
        },
        members: [
          { name: 'Faba', role: 'Branch Chief', description: 'Ambitious and treacherous' },
          { name: 'Wicke', role: 'Assistant', description: 'Kind-hearted, opposes extremism' }
        ],
        goals: [
          'Open Ultra Wormholes',
          'Collect and "preserve" Ultra Beasts',
          'Create a paradise for Pokémon',
          'Lusamine: Reunite with Nihilego'
        ],
        majorPlots: [
          'Type: Null creation experiments',
          'Cosmog abuse for wormholes',
          'Open portals to Ultra Space',
          'Lusamine merges with Nihilego'
        ],
        defeat: 'Reformed after Lusamine\'s recovery',
        legacy: 'First "good" organization revealed as evil'
      }
    ],
    galar: {
      name: 'Macro Cosmos',
      logo: '/images/evil-teams/macro-cosmos-logo.png',
      motto: "Ensure Galar's prosperity for a thousand years!",
      color: 'from-purple-600 to-pink-600',
      leader: {
        name: 'Chairman Rose',
        title: 'Chairman',
        image: '/images/evil-teams/chairman-rose.png',
        description: 'Businessman who fears Galar\'s future energy crisis.',
        signature: 'Copperajah, Ferrothorn, Perrserker, Escavalier'
      },
      members: [
        { name: 'Oleana', role: 'Secretary', description: 'Devoted assistant and enforcer' },
        { name: 'Macro Cosmos Employees', role: 'Various', description: 'Loyal corporate workers' }
      ],
      goals: [
        'Awaken Eternatus for infinite energy',
        'Solve the energy crisis 1,000 years early',
        'Ensure Galar\'s eternal prosperity',
        'Control the Darkest Day phenomenon'
      ],
      majorPlots: [
        'Collect Wishing Stars',
        'Research Eternatus in secret',
        'Interrupt Championship match',
        'Trigger the Darkest Day'
      ],
      notableMembers: ['Bede (formerly)'],
      defeat: 'Rose turns himself in after plan fails',
      legacy: 'Well-intentioned extremism with corporate facade'
    },
    paldea: {
      name: 'Team Star',
      logo: '/images/evil-teams/team-star-logo.png',
      motto: "We're the bad guys, but we stick together!",
      color: 'from-red-500 to-purple-600',
      leader: {
        name: 'Penny (Cassiopeia)',
        title: 'Big Boss',
        image: '/images/evil-teams/penny.png',
        description: 'Former bullying victim who united other outcasts.',
        signature: 'Eeveelutions team'
      },
      squadBosses: [
        { name: 'Giacomo', role: 'Dark Boss', description: 'DJ and mechanic' },
        { name: 'Mela', role: 'Fire Boss', description: 'Passionate and protective' },
        { name: 'Atticus', role: 'Poison Boss', description: 'Fashion designer' },
        { name: 'Ortega', role: 'Fairy Boss', description: 'Youngest boss' },
        { name: 'Eri', role: 'Fighting Boss', description: 'Strongest but kindest' }
      ],
      goals: [
        'Create safe space for bullied students',
        'Stand up against academy bullies',
        'Support each other as found family',
        'Eventually: Find way to disband safely'
      ],
      majorPlots: [
        'Form Team Star to fight bullies',
        'Take over academy areas as bases',
        'Skip classes en masse',
        'Operation Starfall (disbanding plan)'
      ],
      defeat: 'Voluntarily disbanded to return to school',
      legacy: 'Most sympathetic team - anti-bullying message'
    }
  };

  // Get team data for the region
  const getTeamData = (): Team[] | null => {
    const data = evilTeamData[region.id.toLowerCase()];
    if (!data) return null;
    return Array.isArray(data) ? data : [data];
  };

  const teams = getTeamData();

  if (!teams || teams.length === 0) return null;

  return (
    <div className={`py-16 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <BsExclamationTriangle className="text-red-500" />
              Villainous Organizations
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              The evil teams threatening {region.name}'s peace
            </p>
          </div>
        </FadeIn>

        {/* Team Cards */}
        <div className="space-y-8">
          {teams.map((team, index) => (
            <SlideUp key={team.name} delay={index * 0.1}>
              <motion.div
                className={`relative overflow-hidden rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } shadow-xl cursor-pointer`}
                onClick={() => setExpandedTeam(expandedTeam === team.name ? null : team.name)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Team Header */}
                <div className={`relative h-48 bg-gradient-to-r ${team.color}`}>
                  {/* Team Logo/Pattern Background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
                    }} />
                  </div>

                  {/* Team Info Overlay */}
                  <div className="relative h-full flex items-center justify-between p-8">
                    <div>
                      <h3 className="text-4xl font-bold text-white mb-2">{team.name}</h3>
                      <p className="text-white/80 text-lg italic">"{team.motto}"</p>
                    </div>
                    
                    {/* Leader Preview */}
                    <div className="flex items-center gap-4 bg-black/20 rounded-xl p-4">
                      <div className="text-right">
                        <p className="text-white/60 text-sm">Leader</p>
                        <p className="text-white font-bold text-xl">{team.leader.name}</p>
                        <p className="text-white/80 text-sm">{team.leader.title}</p>
                      </div>
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10">
                        {team.leader.image && (
                          <Image
                            src={team.leader.image}
                            alt={team.leader.name}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <motion.div
                      animate={{ rotate: expandedTeam === team.name ? 180 : 0 }}
                      className="text-white/60"
                    >
                      <BsArrowRight className="text-2xl rotate-90" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedTeam === team.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 space-y-8">
                        {/* Leader Details */}
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                              <GiCrown className="text-yellow-500" />
                              Leadership
                            </h4>
                            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                              <p className="text-gray-600 dark:text-gray-300 mb-3">
                                {team.leader.description}
                              </p>
                              <p className="text-sm">
                                <span className="font-semibold">Signature Pokémon:</span> {team.leader.signature}
                              </p>
                            </div>

                            {/* Executives/Admins */}
                            {(team.executives || team.admins || team.commanders || team.scientists || team.sages || team.squadBosses) && (
                              <div className="mt-6">
                                <h5 className="font-semibold mb-3 flex items-center gap-2">
                                  <BsPerson />
                                  Key Members
                                </h5>
                                <div className="space-y-2">
                                  {(team.executives || team.admins || team.commanders || team.scientists || team.sages || team.squadBosses || team.members || []).map((member, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                      <p className="font-semibold">{member.name}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {member.role} - {member.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Goals and Plots */}
                          <div className="space-y-6">
                            {/* Goals */}
                            <div>
                              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <BsFlag className="text-red-500" />
                                Objectives
                              </h4>
                              <ul className="space-y-2">
                                {team.goals.map((goal, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <BsLightning className="text-yellow-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-300">{goal}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Major Plots */}
                            <div>
                              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <BsShieldX className="text-purple-500" />
                                Criminal Activities
                              </h4>
                              <ul className="space-y-2">
                                {team.majorPlots.map((plot, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <BsExclamationTriangle className="text-red-500 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-300">{plot}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <h5 className="font-semibold mb-2 flex items-center gap-2">
                              <BsXCircle className="text-red-500" />
                              Defeat
                            </h5>
                            <p className="text-gray-600 dark:text-gray-300">{team.defeat}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold mb-2 flex items-center gap-2">
                              <BsEye className="text-blue-500" />
                              Legacy
                            </h5>
                            <p className="text-gray-600 dark:text-gray-300">{team.legacy}</p>
                          </div>
                        </div>

                        {/* Notable Members */}
                        {team.notableMembers && team.notableMembers.length > 0 && (
                          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="font-semibold mb-3">Notable Members</h5>
                            <div className="flex flex-wrap gap-2">
                              {team.notableMembers.map((member, idx) => (
                                <span
                                  key={idx}
                                  className={`px-4 py-2 rounded-full text-sm ${
                                    theme === 'dark' 
                                      ? 'bg-gray-700 text-gray-300' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {member}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </SlideUp>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EvilTeamShowcase;
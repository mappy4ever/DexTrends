import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { TypeBadge } from '../../ui/TypeBadge';
import { 
  BsBookmark, 
  BsArrowRight,
  BsGenderMale,
  BsGenderFemale,
  BsShield,
  BsExclamationTriangle,
  BsTrophy,
  BsHeart,
  BsStars
} from 'react-icons/bs';
import { GiMuscleUp, GiSparkles } from 'react-icons/gi';
import type { StarterData } from './types';
import { getEvolutionChain } from './starterData';

interface StarterDetailsProps {
  selectedStarter: string;
  starterData: Record<string, StarterData>;
  theme: string;
}

export const StarterDetails: React.FC<StarterDetailsProps> = ({ 
  selectedStarter, 
  starterData, 
  theme 
}) => {
  const router = useRouter();
  const starter = starterData[selectedStarter];
  
  if (!starter) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedStarter}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`rounded-2xl p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Stats and Info */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <BsBookmark className="text-blue-500" />
                Pokédex Entry
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {starter.description}
              </p>
            </div>

            {/* Base Stats */}
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <GiMuscleUp className="text-red-500" />
                Base Stats
              </h3>
              <div className="space-y-2">
                {Object.entries(starter.stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-medium capitalize">
                      {stat.replace('spAtk', 'Sp.Atk').replace('spDef', 'Sp.Def')}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 255) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          value >= 90 ? 'from-green-500 to-green-600' :
                          value >= 60 ? 'from-yellow-500 to-yellow-600' :
                          'from-red-500 to-red-600'
                        }`}
                      />
                    </div>
                    <span className="w-10 text-sm font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <GiSparkles className="text-purple-500" />
                Abilities
              </h3>
              <div className="space-y-2">
                {starter.abilities.map((ability, idx) => (
                  <div 
                    key={ability}
                    className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } ${idx === 1 ? 'border-2 border-purple-500' : ''}`}
                  >
                    <p className="font-semibold flex items-center gap-2">
                      {ability}
                      {idx === 1 && <span className="text-xs text-purple-500">Hidden</span>}
                    </p>
                    {idx === 1 && starter.hiddenAbility && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {starter.hiddenAbility.split(' - ')[1]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Ratio */}
            <div>
              <h3 className="text-xl font-bold mb-3">Gender Ratio</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <BsGenderMale className="text-blue-500" />
                  <span>{starter.genderRatio.male}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsGenderFemale className="text-pink-500" />
                  <span>{starter.genderRatio.female}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Evolution and More */}
          <div className="space-y-6">
            {/* Evolution Chain */}
            <div>
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <BsArrowRight className="text-green-500" />
                Evolution Chain
              </h3>
              <div className="flex items-center justify-around">
                {getEvolutionChain(selectedStarter).map((evo, idx) => (
                  <React.Fragment key={evo.name}>
                    {idx > 0 && (
                      <div className="flex flex-col items-center">
                        <BsArrowRight className="text-2xl text-gray-400" />
                        <span className="text-xs text-gray-500">Lv.{evo.level}</span>
                      </div>
                    )}
                    <div 
                      className="text-center cursor-pointer transform transition-transform hover:scale-105 group"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/pokedex/${evo.id}`);
                      }}
                    >
                      <div className="w-24 h-24 relative mx-auto mb-2 group-hover:drop-shadow-lg transition-all">
                        <Image
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                          alt={evo.name}
                          fill
                          className="object-contain group-hover:brightness-110 transition-all"
                        />
                      </div>
                      <p className="font-semibold text-sm group-hover:text-blue-500 transition-colors">{evo.name}</p>
                      <div className="flex flex-wrap gap-1 justify-center mt-1">
                        {evo.types?.map((type, typeIdx) => (
                          <TypeBadge key={typeIdx} type={type} size="xs" />
                        ))}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Mega Evolution / Gigantamax */}
              {(starter.megaEvolution || starter.gigantamax) && (
                <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <p className="text-sm font-semibold text-center">
                    {starter.megaEvolution ? 'Mega Evolution Available!' : 'Gigantamax Form Available!'}
                  </p>
                </div>
              )}
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <BsShield />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {starter.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-gray-600 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <BsExclamationTriangle />
                  Weaknesses
                </h4>
                <ul className="space-y-1">
                  {starter.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-600 dark:text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Competitive Info */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <BsTrophy className="text-yellow-500" />
                Competitive Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-semibold">{starter.competitiveRole}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tier</p>
                  <p className="font-semibold">{starter.tier}</p>
                </div>
                <div>
                  <p className="text-gray-500">Signature Move</p>
                  <p className="font-semibold">{starter.signature}</p>
                </div>
                <div>
                  <p className="text-gray-500">Notable Users</p>
                  <p className="font-semibold">{starter.notableTrainers[0]}</p>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            <div>
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <BsHeart className="text-pink-500" />
                Fun Facts
              </h4>
              <ul className="space-y-2">
                {starter.funFacts.map((fact, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <BsStars className="text-yellow-500 mt-1 flex-shrink-0" />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
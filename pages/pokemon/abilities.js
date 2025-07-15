import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSearch, BsShield, BsLightning, BsDroplet, BsFire } from "react-icons/bs";
import { GiPunch, GiHealing, GiSpeedometer, GiShieldBounces } from "react-icons/gi";
import { fetchData } from "../../utils/apiutils";

// Comprehensive abilities data
const abilitiesData = [
  // Attack-boosting abilities
  { id: 1, name: "Adaptability", category: "attack", effect: "Powers up moves of the same type as the Pokémon.", description: "Powers up moves of the same type as the Pokémon. STAB moves deal 2x damage instead of 1.5x.", generation: 4, hidden: false },
  { id: 2, name: "Blaze", category: "attack", effect: "Powers up Fire-type moves when HP is low.", description: "When HP is below 1/3rd its maximum, power of Fire-type moves is increased by 50%.", generation: 3, hidden: false },
  { id: 3, name: "Torrent", category: "attack", effect: "Powers up Water-type moves when HP is low.", description: "When HP is below 1/3rd its maximum, power of Water-type moves is increased by 50%.", generation: 3, hidden: false },
  { id: 4, name: "Overgrow", category: "attack", effect: "Powers up Grass-type moves when HP is low.", description: "When HP is below 1/3rd its maximum, power of Grass-type moves is increased by 50%.", generation: 3, hidden: false },
  { id: 5, name: "Swarm", category: "attack", effect: "Powers up Bug-type moves when HP is low.", description: "When HP is below 1/3rd its maximum, power of Bug-type moves is increased by 50%.", generation: 3, hidden: false },
  { id: 6, name: "Huge Power", category: "attack", effect: "Doubles the Pokémon's Attack stat.", description: "The Pokémon's Attack stat is doubled. This boost is calculated after all other modifiers.", generation: 3, hidden: false },
  { id: 7, name: "Pure Power", category: "attack", effect: "Doubles the Pokémon's Attack stat.", description: "The Pokémon's Attack stat is doubled. This boost is calculated after all other modifiers.", generation: 3, hidden: false },
  { id: 8, name: "Technician", category: "attack", effect: "Powers up weak moves.", description: "Moves with a base power of 60 or less are boosted in power by 50%.", generation: 4, hidden: false },
  { id: 9, name: "Sheer Force", category: "attack", effect: "Removes secondary effects but increases move power.", description: "Moves with secondary effects have their power increased by 30%, but the secondary effects are removed.", generation: 5, hidden: false },
  { id: 10, name: "Iron Fist", category: "attack", effect: "Powers up punching moves.", description: "The power of punching moves is increased by 20%.", generation: 4, hidden: false },
  { id: 11, name: "Strong Jaw", category: "attack", effect: "Powers up biting moves.", description: "The power of biting moves is increased by 50%.", generation: 6, hidden: false },
  { id: 12, name: "Mega Launcher", category: "attack", effect: "Powers up pulse moves.", description: "The power of pulse and aura moves is increased by 50%.", generation: 6, hidden: false },
  { id: 13, name: "Tough Claws", category: "attack", effect: "Powers up contact moves.", description: "The power of contact moves is increased by 30%.", generation: 6, hidden: false },
  { id: 14, name: "Pixilate", category: "attack", effect: "Normal moves become Fairy-type and powered up.", description: "Normal-type moves become Fairy-type and have their power increased by 20%.", generation: 6, hidden: false },
  { id: 15, name: "Aerilate", category: "attack", effect: "Normal moves become Flying-type and powered up.", description: "Normal-type moves become Flying-type and have their power increased by 20%.", generation: 6, hidden: false },
  { id: 16, name: "Refrigerate", category: "attack", effect: "Normal moves become Ice-type and powered up.", description: "Normal-type moves become Ice-type and have their power increased by 20%.", generation: 6, hidden: false },
  { id: 17, name: "Galvanize", category: "attack", effect: "Normal moves become Electric-type and powered up.", description: "Normal-type moves become Electric-type and have their power increased by 20%.", generation: 7, hidden: false },
  { id: 18, name: "Guts", category: "attack", effect: "Boosts Attack when suffering from status.", description: "Attack is increased by 50% when affected by a status condition. Burn's attack reduction is ignored.", generation: 3, hidden: false },
  { id: 19, name: "Hustle", category: "attack", effect: "Boosts Attack but lowers accuracy.", description: "Attack is increased by 50%, but physical moves' accuracy is reduced by 20%.", generation: 3, hidden: false },
  { id: 20, name: "Moxie", category: "attack", effect: "Boosts Attack after knocking out a Pokémon.", description: "Attack is raised by one stage when the Pokémon knocks out another Pokémon.", generation: 5, hidden: false },

  // Defense abilities
  { id: 21, name: "Sturdy", category: "defense", effect: "Protects from one-hit KO moves.", description: "The Pokémon is protected against 1-hit KO attacks. If at full HP, survives any hit with 1 HP.", generation: 3, hidden: false },
  { id: 22, name: "Levitate", category: "defense", effect: "Immunity to Ground-type moves.", description: "Ground-type moves have no effect on this Pokémon. Also unaffected by Spikes, Toxic Spikes, etc.", generation: 3, hidden: false },
  { id: 23, name: "Volt Absorb", category: "defense", effect: "Restores HP when hit by Electric moves.", description: "Restores 25% of max HP when hit by an Electric-type move instead of taking damage.", generation: 3, hidden: false },
  { id: 24, name: "Water Absorb", category: "defense", effect: "Restores HP when hit by Water moves.", description: "Restores 25% of max HP when hit by a Water-type move instead of taking damage.", generation: 3, hidden: false },
  { id: 25, name: "Flash Fire", category: "defense", effect: "Powers up Fire moves when hit by Fire.", description: "Grants immunity to Fire-type moves and increases the power of Fire-type moves by 50% when hit by one.", generation: 3, hidden: false },
  { id: 26, name: "Lightning Rod", category: "defense", effect: "Draws in Electric moves and raises Sp. Attack.", description: "Electric-type moves are drawn to this Pokémon. Raises Special Attack when hit by one.", generation: 3, hidden: false },
  { id: 27, name: "Storm Drain", category: "defense", effect: "Draws in Water moves and raises Sp. Attack.", description: "Water-type moves are drawn to this Pokémon. Raises Special Attack when hit by one.", generation: 4, hidden: false },
  { id: 28, name: "Thick Fat", category: "defense", effect: "Reduces damage from Fire and Ice moves.", description: "Damage from Fire-type and Ice-type moves is reduced by 50%.", generation: 3, hidden: false },
  { id: 29, name: "Filter", category: "defense", effect: "Reduces damage from super-effective moves.", description: "Damage from super-effective attacks is reduced by 25%.", generation: 4, hidden: false },
  { id: 30, name: "Solid Rock", category: "defense", effect: "Reduces damage from super-effective moves.", description: "Damage from super-effective attacks is reduced by 25%.", generation: 4, hidden: false },
  { id: 31, name: "Multiscale", category: "defense", effect: "Reduces damage when HP is full.", description: "Damage taken is halved when HP is full.", generation: 5, hidden: false },
  { id: 32, name: "Magic Guard", category: "defense", effect: "Only takes damage from attacks.", description: "The Pokémon only takes damage from attacks. Indirect damage is prevented.", generation: 4, hidden: false },
  { id: 33, name: "Wonder Guard", category: "defense", effect: "Only super-effective moves hit.", description: "Only super-effective moves will hit. All other moves have no effect.", generation: 3, hidden: false },
  { id: 34, name: "Bulletproof", category: "defense", effect: "Protects from ball and bomb moves.", description: "Protects the Pokémon from ball and bomb moves.", generation: 6, hidden: false },
  { id: 35, name: "Fur Coat", category: "defense", effect: "Halves damage from physical moves.", description: "Damage from physical moves is halved.", generation: 6, hidden: false },
  { id: 36, name: "Ice Scales", category: "defense", effect: "Halves damage from special moves.", description: "Damage from special moves is halved.", generation: 8, hidden: false },
  { id: 37, name: "Fluffy", category: "defense", effect: "Halves damage from contact moves.", description: "Damage from contact moves is halved, but damage from Fire-type moves is doubled.", generation: 7, hidden: false },
  { id: 38, name: "Water Bubble", category: "defense", effect: "Halves damage from Fire moves, powers up Water moves.", description: "Halves damage from Fire-type moves, doubles power of Water-type moves, and prevents burns.", generation: 7, hidden: false },
  { id: 39, name: "Prism Armor", category: "defense", effect: "Reduces damage from super-effective moves.", description: "Reduces the power of super-effective attacks by 25%.", generation: 7, hidden: false },
  { id: 40, name: "Shadow Shield", category: "defense", effect: "Reduces damage when HP is full.", description: "Damage taken is reduced when HP is full.", generation: 7, hidden: false },

  // Speed abilities
  { id: 41, name: "Speed Boost", category: "speed", effect: "Gradually boosts Speed.", description: "Speed stat is boosted by one stage at the end of each turn.", generation: 3, hidden: false },
  { id: 42, name: "Chlorophyll", category: "speed", effect: "Doubles Speed in harsh sunlight.", description: "Speed stat is doubled during harsh sunlight weather.", generation: 3, hidden: false },
  { id: 43, name: "Swift Swim", category: "speed", effect: "Doubles Speed in rain.", description: "Speed stat is doubled during rain weather.", generation: 3, hidden: false },
  { id: 44, name: "Sand Rush", category: "speed", effect: "Doubles Speed in sandstorm.", description: "Speed stat is doubled during sandstorm weather. Immune to sandstorm damage.", generation: 5, hidden: false },
  { id: 45, name: "Slush Rush", category: "speed", effect: "Doubles Speed in hail.", description: "Speed stat is doubled during hail weather.", generation: 7, hidden: false },
  { id: 46, name: "Surge Surfer", category: "speed", effect: "Doubles Speed on Electric Terrain.", description: "Speed stat is doubled when Electric Terrain is active.", generation: 7, hidden: false },
  { id: 47, name: "Quick Feet", category: "speed", effect: "Boosts Speed when suffering from status.", description: "Speed is increased by 50% when affected by a status condition. Ignores paralysis speed drop.", generation: 4, hidden: false },
  { id: 48, name: "Unburden", category: "speed", effect: "Doubles Speed when item is used or lost.", description: "Speed is doubled when the held item is consumed or lost.", generation: 4, hidden: false },
  { id: 49, name: "Motor Drive", category: "speed", effect: "Raises Speed when hit by Electric moves.", description: "Grants immunity to Electric-type moves and raises Speed by one stage when hit by one.", generation: 4, hidden: false },
  { id: 50, name: "Steadfast", category: "speed", effect: "Raises Speed when flinched.", description: "Speed is raised by one stage when the Pokémon flinches.", generation: 4, hidden: false },

  // Status abilities
  { id: 51, name: "Intimidate", category: "status", effect: "Lowers opponent's Attack on switch-in.", description: "Lowers the Attack stat of all opposing Pokémon by one stage when entering battle.", generation: 3, hidden: false },
  { id: 52, name: "Pressure", category: "status", effect: "Increases PP usage of opponents.", description: "When this Pokémon is hit by a move, the opponent's PP usage is doubled.", generation: 3, hidden: false },
  { id: 53, name: "Unnerve", category: "status", effect: "Prevents opponents from eating berries.", description: "Opposing Pokémon cannot eat berries while this Pokémon is in battle.", generation: 5, hidden: false },
  { id: 54, name: "Drought", category: "status", effect: "Summons harsh sunlight.", description: "The weather becomes harsh sunlight when the Pokémon enters battle.", generation: 3, hidden: false },
  { id: 55, name: "Drizzle", category: "status", effect: "Summons rain.", description: "The weather becomes rain when the Pokémon enters battle.", generation: 3, hidden: false },
  { id: 56, name: "Sand Stream", category: "status", effect: "Summons sandstorm.", description: "The weather becomes sandstorm when the Pokémon enters battle.", generation: 3, hidden: false },
  { id: 57, name: "Snow Warning", category: "status", effect: "Summons hail.", description: "The weather becomes hail when the Pokémon enters battle.", generation: 4, hidden: false },
  { id: 58, name: "Electric Surge", category: "status", effect: "Creates Electric Terrain.", description: "Electric Terrain is created when the Pokémon enters battle.", generation: 7, hidden: false },
  { id: 59, name: "Grassy Surge", category: "status", effect: "Creates Grassy Terrain.", description: "Grassy Terrain is created when the Pokémon enters battle.", generation: 7, hidden: false },
  { id: 60, name: "Misty Surge", category: "status", effect: "Creates Misty Terrain.", description: "Misty Terrain is created when the Pokémon enters battle.", generation: 7, hidden: false },
  { id: 61, name: "Psychic Surge", category: "status", effect: "Creates Psychic Terrain.", description: "Psychic Terrain is created when the Pokémon enters battle.", generation: 7, hidden: false },
  { id: 62, name: "Poison Point", category: "status", effect: "May poison on contact.", description: "30% chance to poison opponents that make contact with this Pokémon.", generation: 3, hidden: false },
  { id: 63, name: "Static", category: "status", effect: "May paralyze on contact.", description: "30% chance to paralyze opponents that make contact with this Pokémon.", generation: 3, hidden: false },
  { id: 64, name: "Flame Body", category: "status", effect: "May burn on contact.", description: "30% chance to burn opponents that make contact with this Pokémon.", generation: 3, hidden: false },
  { id: 65, name: "Effect Spore", category: "status", effect: "May inflict status on contact.", description: "30% chance to poison, paralyze, or sleep opponents that make contact.", generation: 3, hidden: false },
  { id: 66, name: "Cute Charm", category: "status", effect: "May infatuate on contact.", description: "30% chance to infatuate opponents of the opposite gender that make contact.", generation: 3, hidden: false },
  { id: 67, name: "Cursed Body", category: "status", effect: "May disable a move on contact.", description: "30% chance to disable the move used by opponents that make contact.", generation: 5, hidden: false },
  { id: 68, name: "Perish Body", category: "status", effect: "Both Pokémon faint in 3 turns after contact.", description: "When hit by a contact move, both Pokémon will faint in 3 turns unless switched out.", generation: 8, hidden: false },
  { id: 69, name: "Wandering Spirit", category: "status", effect: "Swaps abilities on contact.", description: "When hit by a contact move, swaps abilities with the attacker.", generation: 8, hidden: false },
  { id: 70, name: "Neutralizing Gas", category: "status", effect: "Nullifies all abilities.", description: "While this Pokémon is active, all other Pokémon's abilities have no effect.", generation: 8, hidden: false },

  // Healing abilities
  { id: 71, name: "Regenerator", category: "healing", effect: "Restores HP when switching out.", description: "Restores 1/3 of max HP when switching out.", generation: 5, hidden: false },
  { id: 72, name: "Natural Cure", category: "healing", effect: "Cures status when switching out.", description: "Status conditions are cured when switching out.", generation: 3, hidden: false },
  { id: 73, name: "Poison Heal", category: "healing", effect: "Restores HP when poisoned.", description: "Restores 1/8 of max HP each turn when poisoned instead of taking damage.", generation: 4, hidden: false },
  { id: 74, name: "Rain Dish", category: "healing", effect: "Restores HP in rain.", description: "Restores 1/16 of max HP each turn during rain.", generation: 3, hidden: false },
  { id: 75, name: "Ice Body", category: "healing", effect: "Restores HP in hail.", description: "Restores 1/16 of max HP each turn during hail. Immune to hail damage.", generation: 4, hidden: false },
  { id: 76, name: "Grassy Pelt", category: "healing", effect: "Boosts Defense on Grassy Terrain.", description: "Defense is increased by 50% when Grassy Terrain is active.", generation: 7, hidden: false },
  { id: 77, name: "Triage", category: "healing", effect: "Gives priority to healing moves.", description: "Healing moves gain +3 priority.", generation: 7, hidden: false },
  { id: 78, name: "Healer", category: "healing", effect: "May heal ally's status conditions.", description: "30% chance to heal an ally's status condition at the end of each turn.", generation: 5, hidden: false },
  { id: 79, name: "Hydration", category: "healing", effect: "Heals status in rain.", description: "Status conditions are healed at the end of each turn during rain.", generation: 4, hidden: false },
  { id: 80, name: "Shed Skin", category: "healing", effect: "May heal status conditions.", description: "33% chance to heal status conditions at the end of each turn.", generation: 3, hidden: false },

  // Immunity abilities
  { id: 81, name: "Immunity", category: "immunity", effect: "Prevents poison.", description: "This Pokémon cannot be poisoned.", generation: 3, hidden: false },
  { id: 82, name: "Insomnia", category: "immunity", effect: "Prevents sleep.", description: "This Pokémon cannot fall asleep.", generation: 3, hidden: false },
  { id: 83, name: "Vital Spirit", category: "immunity", effect: "Prevents sleep.", description: "This Pokémon cannot fall asleep.", generation: 3, hidden: false },
  { id: 84, name: "Limber", category: "immunity", effect: "Prevents paralysis.", description: "This Pokémon cannot be paralyzed.", generation: 3, hidden: false },
  { id: 85, name: "Magma Armor", category: "immunity", effect: "Prevents freezing.", description: "This Pokémon cannot be frozen.", generation: 3, hidden: false },
  { id: 86, name: "Water Veil", category: "immunity", effect: "Prevents burns.", description: "This Pokémon cannot be burned.", generation: 3, hidden: false },
  { id: 87, name: "Own Tempo", category: "immunity", effect: "Prevents confusion.", description: "This Pokémon cannot be confused.", generation: 3, hidden: false },
  { id: 88, name: "Inner Focus", category: "immunity", effect: "Prevents flinching.", description: "This Pokémon cannot flinch.", generation: 3, hidden: false },
  { id: 89, name: "Oblivious", category: "immunity", effect: "Prevents infatuation and Taunt.", description: "This Pokémon cannot be infatuated or taunted. Immune to Intimidate.", generation: 3, hidden: false },
  { id: 90, name: "Clear Body", category: "immunity", effect: "Prevents stat reduction.", description: "Prevents other Pokémon from lowering this Pokémon's stats.", generation: 3, hidden: false },

  // Unique abilities
  { id: 91, name: "Protean", category: "unique", effect: "Changes type to match move used.", description: "Changes the Pokémon's type to the type of the move it's about to use.", generation: 6, hidden: false },
  { id: 92, name: "Libero", category: "unique", effect: "Changes type to match move used.", description: "Changes the Pokémon's type to the type of the move it's about to use.", generation: 8, hidden: false },
  { id: 93, name: "Illusion", category: "unique", effect: "Enters battle disguised as last party member.", description: "Enters battle disguised as the last non-fainted Pokémon in the party.", generation: 5, hidden: false },
  { id: 94, name: "Imposter", category: "unique", effect: "Transforms into opponent on switch-in.", description: "Transforms into the opposing Pokémon upon entering battle.", generation: 5, hidden: false },
  { id: 95, name: "Stance Change", category: "unique", effect: "Changes form when using attack or King's Shield.", description: "Changes to Blade Forme when using an attack move, Shield Forme when using King's Shield.", generation: 6, hidden: false },
  { id: 96, name: "Schooling", category: "unique", effect: "Forms school when HP is high.", description: "When HP is above 25%, changes to School Form for better stats.", generation: 7, hidden: false },
  { id: 97, name: "Battle Bond", category: "unique", effect: "Transforms after KO.", description: "After knocking out a Pokémon, transforms into Ash-Greninja form.", generation: 7, hidden: false },
  { id: 98, name: "Power Construct", category: "unique", effect: "Transforms when HP drops.", description: "When HP falls below 50%, transforms into Complete Forme.", generation: 7, hidden: false },
  { id: 99, name: "RKS System", category: "unique", effect: "Changes type based on held Memory.", description: "Changes type to match the Memory disc held.", generation: 7, hidden: false },
  { id: 100, name: "Multitype", category: "unique", effect: "Changes type based on held Plate.", description: "Changes type to match the Plate or Z-Crystal held.", generation: 4, hidden: false }
];

export default function AbilitiesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGeneration, setSelectedGeneration] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [abilities, setAbilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [abilitiesPerPage] = useState(30);

  // Fetch abilities from PokeAPI
  useEffect(() => {
    const fetchAbilities = async () => {
      setLoading(true);
      try {
        // PokeAPI has many abilities, fetch them with pagination
        const response = await fetchData(`https://pokeapi.co/api/v2/ability?limit=350`);
        
        // Fetch details for abilities
        const abilityDetailsPromises = response.results.slice(0, 200).map(ability => 
          fetchData(ability.url)
        );
        
        const abilityDetails = await Promise.all(abilityDetailsPromises);
        
        // Process ability data
        const processedAbilities = abilityDetails.map(ability => {
          // Categorize abilities based on their effects
          let category = 'other';
          const effectText = ability.effect_entries.find(entry => entry.language.name === 'en')?.effect || '';
          const shortEffect = ability.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || '';
          const combinedText = (effectText + ' ' + shortEffect).toLowerCase();

          if (combinedText.includes('attack') || combinedText.includes('damage') || combinedText.includes('power')) {
            category = 'attack';
          } else if (combinedText.includes('defense') || combinedText.includes('resist') || combinedText.includes('reduce') || combinedText.includes('absorb')) {
            category = 'defense';
          } else if (combinedText.includes('speed') || combinedText.includes('priority')) {
            category = 'speed';
          } else if (combinedText.includes('heal') || combinedText.includes('recover') || combinedText.includes('restore')) {
            category = 'healing';
          } else if (combinedText.includes('prevent') || combinedText.includes('immunity') || combinedText.includes('cannot')) {
            category = 'immunity';
          } else if (combinedText.includes('weather') || combinedText.includes('terrain') || combinedText.includes('intimidate') || combinedText.includes('pressure')) {
            category = 'status';
          } else if (combinedText.includes('transform') || combinedText.includes('form') || combinedText.includes('type')) {
            category = 'unique';
          }

          return {
            id: ability.id,
            name: ability.name.replace(/-/g, ' '),
            category: category,
            effect: ability.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || 
                    'No effect description available',
            description: ability.effect_entries.find(entry => entry.language.name === 'en')?.effect || 
                        ability.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text || 
                        'No description available',
            generation: ability.generation ? parseInt(ability.generation.name.replace('generation-', '')) : 1,
            hidden: ability.is_main_series === false
          };
        });
        
        setAbilities(processedAbilities);
      } catch (error) {
        console.error("Error fetching abilities:", error);
        setError("Failed to fetch abilities from PokeAPI");
      } finally {
        setLoading(false);
      }
    };

    fetchAbilities();
  }, []);

  // Get all unique generations from fetched abilities
  const allGenerations = useMemo(() => {
    const gens = new Set();
    abilities.forEach(ability => gens.add(ability.generation));
    return ["all", ...Array.from(gens).sort((a, b) => a - b)];
  }, [abilities]);

  // Filter and sort abilities
  const filteredAbilities = useMemo(() => {
    let filtered = abilities;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(ability =>
        ability.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ability.effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ability.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(ability => ability.category === selectedCategory);
    }

    // Generation filter
    if (selectedGeneration !== "all") {
      filtered = filtered.filter(ability => ability.generation === parseInt(selectedGeneration));
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "generation":
          return a.generation - b.generation;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedCategory, selectedGeneration, sortBy]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "attack":
        return <GiPunch className="text-red-500" />;
      case "defense":
        return <BsShield className="text-blue-500" />;
      case "speed":
        return <GiSpeedometer className="text-yellow-500" />;
      case "status":
        return <BsLightning className="text-purple-500" />;
      case "healing":
        return <GiHealing className="text-green-500" />;
      case "immunity":
        return <GiShieldBounces className="text-gray-500" />;
      case "unique":
        return <AiOutlineBulb className="text-pink-500" />;
      default:
        return <AiOutlineBulb className="text-gray-500" />;
    }
  };

  const getCategoryName = (category) => {
    const names = {
      attack: "Attack",
      defense: "Defense",
      speed: "Speed",
      status: "Status",
      healing: "Healing",
      immunity: "Immunity",
      unique: "Unique"
    };
    return names[category] || category;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "attack":
        return "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100";
      case "defense":
        return "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100";
      case "speed":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100";
      case "status":
        return "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100";
      case "healing":
        return "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100";
      case "immunity":
        return "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100";
      case "unique":
        return "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100";
      default:
        return "bg-gray-100 dark:bg-gray-700";
    }
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>Pokémon Abilities | DexTrends</title>
        <meta name="description" content="Discover all Pokémon abilities and their effects" />
      </Head>

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <StyledBackButton 
              text="Back to Pokémon Hub" 
              onClick={() => router.push('/pokemon')} 
            />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <AiOutlineBulb className="text-pokemon-indigo" />
              <span className="bg-gradient-to-r from-pokemon-indigo to-pokemon-violet bg-clip-text text-transparent">
                Pokémon Abilities
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Explore {abilities.length} unique abilities
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Data from PokeAPI
            </p>
          </div>

          {/* Search and Filters */}
          <SlideUp>
            <div className={`mb-8 p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search abilities by name, effect, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:ring-2 focus:ring-pokemon-indigo outline-none`}
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:ring-2 focus:ring-pokemon-indigo outline-none`}
                  >
                    <option value="all">All Categories</option>
                    <option value="attack">Attack</option>
                    <option value="defense">Defense</option>
                    <option value="speed">Speed</option>
                    <option value="status">Status</option>
                    <option value="healing">Healing</option>
                    <option value="immunity">Immunity</option>
                    <option value="unique">Unique</option>
                  </select>
                </div>

                {/* Generation Filter */}
                <div>
                  <label className="block text-sm font-medium mb-1">Generation</label>
                  <select
                    value={selectedGeneration}
                    onChange={(e) => setSelectedGeneration(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:ring-2 focus:ring-pokemon-indigo outline-none`}
                  >
                    {allGenerations.map(gen => (
                      <option key={gen} value={gen}>
                        {gen === 'all' ? 'All Generations' : `Generation ${gen}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:ring-2 focus:ring-pokemon-indigo outline-none`}
                  >
                    <option value="name">Name</option>
                    <option value="generation">Generation</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredAbilities.length} abilities
              </div>
            </div>
          </SlideUp>

          {/* Category Quick Filters */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {["all", "attack", "defense", "speed", "status", "healing", "immunity", "unique"].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-pokemon-indigo to-pokemon-violet text-white scale-110'
                    : 'bg-gray-200 dark:bg-gray-700 hover:scale-105'
                }`}
              >
                {category !== 'all' && getCategoryIcon(category)}
                {category === 'all' ? 'All Abilities' : getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* Abilities List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading abilities from PokeAPI...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600 dark:text-gray-400">
                Showing {filteredAbilities.length} abilities
              </div>

              <StaggeredChildren className="space-y-4">
                {filteredAbilities.slice((currentPage - 1) * abilitiesPerPage, currentPage * abilitiesPerPage).map((ability) => (
                  <CardHover key={ability.id}>
                    <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${getCategoryColor(ability.category)}`}>
                              {getCategoryIcon(ability.category)}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold capitalize">{ability.name}</h3>
                              <p className="text-pokemon-indigo font-semibold">{ability.effect}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Gen {ability.generation}
                            </span>
                            {ability.hidden && (
                              <span className="ml-2 px-2 py-1 bg-pokemon-yellow text-black rounded-full text-xs font-semibold">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                          {ability.description}
                        </p>

                        <div className="mt-4 flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(ability.category)}`}>
                            {getCategoryName(ability.category)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHover>
                ))}
              </StaggeredChildren>

              {/* Pagination */}
              {Math.ceil(filteredAbilities.length / abilitiesPerPage) > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-400 text-white hover:bg-indigo-500'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2">
                    Page {currentPage} of {Math.ceil(filteredAbilities.length / abilitiesPerPage)}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredAbilities.length / abilitiesPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(filteredAbilities.length / abilitiesPerPage)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === Math.ceil(filteredAbilities.length / abilitiesPerPage)
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-400 text-white hover:bg-indigo-500'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {filteredAbilities.length === 0 && (
            <div className="text-center py-16">
              <AiOutlineBulb className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No abilities found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Stats Section */}
          <SlideUp>
            <div className={`mt-12 p-8 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h2 className="text-2xl font-bold mb-6 text-center">Ability Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-pokemon-red">
                    {abilities.filter(a => a.category === 'attack').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Attack Abilities</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pokemon-blue">
                    {abilities.filter(a => a.category === 'defense').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Defense Abilities</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pokemon-yellow">
                    {abilities.filter(a => a.category === 'speed').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Speed Abilities</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pokemon-violet">
                    {abilities.filter(a => a.category === 'unique').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Unique Abilities</div>
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { FiShoppingBag } from "react-icons/fi";
import { BsSearch, BsHeart, BsShield, BsLightning } from "react-icons/bs";
import { GiPotionBall, GiSwordWound, GiStoneBlock, GiCrystalGrowth } from "react-icons/gi";
import { fetchData } from "../../utils/apiutils";

// Comprehensive items data
const itemsData = [
  // Healing Items
  { id: 1, name: "Potion", category: "healing", effect: "Restores 20 HP to one Pokémon.", price: 300, description: "A spray-type medicine for treating wounds. It can be used to restore 20 HP to a single Pokémon.", generation: 1 },
  { id: 2, name: "Super Potion", category: "healing", effect: "Restores 50 HP to one Pokémon.", price: 700, description: "A spray-type medicine for treating wounds. It can be used to restore 50 HP to a single Pokémon.", generation: 1 },
  { id: 3, name: "Hyper Potion", category: "healing", effect: "Restores 200 HP to one Pokémon.", price: 1200, description: "A spray-type medicine for treating wounds. It can be used to restore 200 HP to a single Pokémon.", generation: 1 },
  { id: 4, name: "Max Potion", category: "healing", effect: "Fully restores HP of one Pokémon.", price: 2500, description: "A spray-type medicine for treating wounds. It can be used to fully restore the max HP of a single Pokémon.", generation: 1 },
  { id: 5, name: "Full Restore", category: "healing", effect: "Fully restores HP and cures all status conditions.", price: 3000, description: "A medicine that can be used to fully restore the HP of a single Pokémon and heal any status conditions.", generation: 1 },
  { id: 6, name: "Revive", category: "healing", effect: "Revives a fainted Pokémon with half HP.", price: 1500, description: "A medicine that can revive a fainted Pokémon, restoring half of its maximum HP.", generation: 1 },
  { id: 7, name: "Max Revive", category: "healing", effect: "Revives a fainted Pokémon with full HP.", price: 4000, description: "A medicine that can revive a fainted Pokémon, restoring its HP fully.", generation: 1 },
  { id: 8, name: "Antidote", category: "healing", effect: "Cures poison.", price: 100, description: "A spray-type medicine for poisoning. It can be used to cure a single poisoned Pokémon.", generation: 1 },
  { id: 9, name: "Burn Heal", category: "healing", effect: "Cures burn.", price: 250, description: "A spray-type medicine for treating burns. It can be used to cure a single Pokémon suffering from a burn.", generation: 1 },
  { id: 10, name: "Ice Heal", category: "healing", effect: "Cures freeze.", price: 250, description: "A spray-type medicine for treating freezing. It can be used to defrost a single frozen Pokémon.", generation: 1 },
  { id: 11, name: "Awakening", category: "healing", effect: "Cures sleep.", price: 250, description: "A spray-type medicine to wake the sleeping. It can be used to wake a single Pokémon from sleep.", generation: 1 },
  { id: 12, name: "Paralyze Heal", category: "healing", effect: "Cures paralysis.", price: 200, description: "A spray-type medicine for treating paralysis. It can be used to cure a single Pokémon suffering from paralysis.", generation: 1 },
  { id: 13, name: "Full Heal", category: "healing", effect: "Cures all status conditions.", price: 600, description: "A spray-type medicine that is broadly effective. It can be used to heal all status conditions of a single Pokémon.", generation: 1 },
  { id: 14, name: "Ether", category: "healing", effect: "Restores 10 PP to one move.", price: null, description: "This medicine can restore 10 PP to a single selected move that has been learned by a Pokémon.", generation: 1 },
  { id: 15, name: "Max Ether", category: "healing", effect: "Fully restores PP to one move.", price: null, description: "This medicine can fully restore the PP of a single selected move that has been learned by a Pokémon.", generation: 1 },
  { id: 16, name: "Elixir", category: "healing", effect: "Restores 10 PP to all moves.", price: null, description: "This medicine can restore 10 PP to each of the moves that have been learned by a Pokémon.", generation: 1 },
  { id: 17, name: "Max Elixir", category: "healing", effect: "Fully restores PP to all moves.", price: null, description: "This medicine can fully restore the PP of all of the moves that have been learned by a Pokémon.", generation: 1 },
  { id: 18, name: "Berry Juice", category: "healing", effect: "Restores 20 HP to one Pokémon.", price: 100, description: "A 100% pure juice made of Berries. It can restore the HP of one Pokémon by just 20 points.", generation: 2 },
  { id: 19, name: "Sacred Ash", category: "healing", effect: "Revives all fainted Pokémon with full HP.", price: null, description: "This rare ash can revive all fainted Pokémon in a party. Their HP will be completely restored.", generation: 2 },
  { id: 20, name: "Fresh Water", category: "healing", effect: "Restores 50 HP to one Pokémon.", price: 200, description: "Water with high mineral content. It can be used to restore 50 HP to a single Pokémon.", generation: 1 },
  { id: 21, name: "Soda Pop", category: "healing", effect: "Restores 60 HP to one Pokémon.", price: 300, description: "A highly carbonated soda drink. It can be used to restore 60 HP to a single Pokémon.", generation: 1 },
  { id: 22, name: "Lemonade", category: "healing", effect: "Restores 80 HP to one Pokémon.", price: 350, description: "A very sweet and refreshing drink. It can be used to restore 80 HP to a single Pokémon.", generation: 1 },
  { id: 23, name: "Moomoo Milk", category: "healing", effect: "Restores 100 HP to one Pokémon.", price: 500, description: "A bottle of highly nutritious milk. It can be used to restore 100 HP to a single Pokémon.", generation: 2 },

  // Pokéballs
  { id: 24, name: "Poké Ball", category: "pokeballs", effect: "Basic Pokéball with 1x catch rate.", price: 200, description: "A device for catching wild Pokémon. It's thrown like a ball, comfortably encapsulating its target.", generation: 1 },
  { id: 25, name: "Great Ball", category: "pokeballs", effect: "Better Pokéball with 1.5x catch rate.", price: 600, description: "A good, high-performance Poké Ball that provides a higher success rate for catching Pokémon than a standard Poké Ball.", generation: 1 },
  { id: 26, name: "Ultra Ball", category: "pokeballs", effect: "High-performance ball with 2x catch rate.", price: 1200, description: "An ultra-high-performance Poké Ball that provides a higher success rate for catching Pokémon than a Great Ball.", generation: 1 },
  { id: 27, name: "Master Ball", category: "pokeballs", effect: "Always catches any wild Pokémon.", price: null, description: "The best Poké Ball with the ultimate level of performance. With it, you will catch any wild Pokémon without fail.", generation: 1 },
  { id: 28, name: "Safari Ball", category: "pokeballs", effect: "Special ball for Safari Zone.", price: null, description: "A special Poké Ball that is used only in the Safari Zone. It is decorated in a camouflage pattern.", generation: 1 },
  { id: 29, name: "Net Ball", category: "pokeballs", effect: "3x catch rate for Water and Bug types.", price: 1000, description: "A somewhat different Poké Ball that is more effective when catching Water- and Bug-type Pokémon.", generation: 3 },
  { id: 30, name: "Dive Ball", category: "pokeballs", effect: "3.5x catch rate for Pokémon in water.", price: 1000, description: "A somewhat different Poké Ball that works especially well when catching Pokémon that live underwater.", generation: 3 },
  { id: 31, name: "Nest Ball", category: "pokeballs", effect: "Better catch rate for lower level Pokémon.", price: 1000, description: "A somewhat different Poké Ball that becomes more effective the lower the level of the wild Pokémon.", generation: 3 },
  { id: 32, name: "Repeat Ball", category: "pokeballs", effect: "3x catch rate for already caught species.", price: 1000, description: "A somewhat different Poké Ball that works especially well on a Pokémon species that has been caught before.", generation: 3 },
  { id: 33, name: "Timer Ball", category: "pokeballs", effect: "Better catch rate as turns pass.", price: 1000, description: "A somewhat different Poké Ball that becomes progressively more effective the more turns that are taken in battle.", generation: 3 },
  { id: 34, name: "Luxury Ball", category: "pokeballs", effect: "Makes caught Pokémon friendlier.", price: 1000, description: "A particularly comfortable Poké Ball that makes a wild Pokémon quickly grow friendlier after being caught.", generation: 3 },
  { id: 35, name: "Premier Ball", category: "pokeballs", effect: "Same as Poké Ball but looks cooler.", price: null, description: "A somewhat rare Poké Ball that was made as a commemorative item used to celebrate an event of some sort.", generation: 3 },
  { id: 36, name: "Dusk Ball", category: "pokeballs", effect: "3.5x catch rate at night or in caves.", price: 1000, description: "A somewhat different Poké Ball that makes it easier to catch wild Pokémon at night or in caves.", generation: 4 },
  { id: 37, name: "Heal Ball", category: "pokeballs", effect: "Heals caught Pokémon fully.", price: 300, description: "A remedial Poké Ball that restores the HP of a Pokémon caught with it and eliminates any status conditions.", generation: 4 },
  { id: 38, name: "Quick Ball", category: "pokeballs", effect: "5x catch rate on first turn.", price: 1000, description: "A somewhat different Poké Ball that has a more successful catch rate if used at the start of a wild encounter.", generation: 4 },
  { id: 39, name: "Cherish Ball", category: "pokeballs", effect: "Used for event Pokémon.", price: null, description: "A quite rare Poké Ball that has been crafted in order to commemorate a special occasion of some sort.", generation: 4 },

  // Battle Items
  { id: 40, name: "X Attack", category: "battle", effect: "Raises Attack by 1 stage in battle.", price: 500, description: "An item that sharply boosts the Attack stat of a Pokémon during a battle. It wears off once the Pokémon is withdrawn.", generation: 1 },
  { id: 41, name: "X Defense", category: "battle", effect: "Raises Defense by 1 stage in battle.", price: 550, description: "An item that sharply boosts the Defense stat of a Pokémon during a battle. It wears off once the Pokémon is withdrawn.", generation: 1 },
  { id: 42, name: "X Sp. Atk", category: "battle", effect: "Raises Sp. Attack by 1 stage in battle.", price: 350, description: "An item that sharply boosts the Sp. Atk stat of a Pokémon during a battle. It wears off once the Pokémon is withdrawn.", generation: 1 },
  { id: 43, name: "X Sp. Def", category: "battle", effect: "Raises Sp. Defense by 1 stage in battle.", price: 350, description: "An item that sharply boosts the Sp. Def stat of a Pokémon during a battle. It wears off once the Pokémon is withdrawn.", generation: 1 },
  { id: 44, name: "X Speed", category: "battle", effect: "Raises Speed by 1 stage in battle.", price: 350, description: "An item that sharply boosts the Speed stat of a Pokémon during a battle. It wears off once the Pokémon is withdrawn.", generation: 1 },
  { id: 45, name: "X Accuracy", category: "battle", effect: "Raises Accuracy by 1 stage in battle.", price: 950, description: "An item that sharply boosts the accuracy of a Pokémon during a battle. It wears off once the Pokémon is withdrawn.", generation: 1 },
  { id: 46, name: "Guard Spec.", category: "battle", effect: "Prevents stat reduction for 5 turns.", price: 700, description: "An item that prevents stat reduction among the Trainer's party Pokémon for five turns after it is used in battle.", generation: 1 },
  { id: 47, name: "Dire Hit", category: "battle", effect: "Increases critical hit ratio.", price: 650, description: "An item that raises the critical-hit ratio greatly. It can be used only once and wears off if the Pokémon is withdrawn.", generation: 1 },

  // Held Items
  { id: 48, name: "Leftovers", category: "held", effect: "Restores 1/16 max HP each turn.", price: null, description: "An item to be held by a Pokémon. The holder's HP is slowly but steadily restored throughout every battle.", generation: 2 },
  { id: 49, name: "Black Sludge", category: "held", effect: "Restores HP for Poison types, damages others.", price: null, description: "An item to be held by a Pokémon. It restores HP steadily to Poison types, but damages all other types.", generation: 4 },
  { id: 50, name: "Life Orb", category: "held", effect: "Boosts moves by 30% but costs HP.", price: null, description: "An item to be held by a Pokémon. It boosts the power of moves but at the cost of some HP on each hit.", generation: 4 },
  { id: 51, name: "Choice Band", category: "held", effect: "Boosts Attack by 50% but locks into one move.", price: null, description: "An item to be held by a Pokémon. This headband ups Attack, but allows the use of only one move.", generation: 3 },
  { id: 52, name: "Choice Specs", category: "held", effect: "Boosts Sp. Attack by 50% but locks into one move.", price: null, description: "An item to be held by a Pokémon. These specs boost Sp. Atk but allow the use of only one move.", generation: 4 },
  { id: 53, name: "Choice Scarf", category: "held", effect: "Boosts Speed by 50% but locks into one move.", price: null, description: "An item to be held by a Pokémon. This scarf boosts Speed, but allows the use of only one move.", generation: 4 },
  { id: 54, name: "Focus Sash", category: "held", effect: "Survives one OHKO with 1 HP if at full health.", price: null, description: "An item to be held by a Pokémon. If the holder has full HP, it will survive a potential KO attack with 1 HP. It can only be used once.", generation: 4 },
  { id: 55, name: "Focus Band", category: "held", effect: "10% chance to survive a KO with 1 HP.", price: null, description: "An item to be held by a Pokémon. The holder may endure a potential KO attack, leaving it with just 1 HP.", generation: 2 },
  { id: 56, name: "Eviolite", category: "held", effect: "Boosts Defense and Sp. Defense of not fully evolved Pokémon by 50%.", price: null, description: "A mysterious evolutionary lump. When held by a Pokémon that can still evolve, it raises both Defense and Sp. Def.", generation: 5 },
  { id: 57, name: "Rocky Helmet", category: "held", effect: "Damages attackers making contact.", price: null, description: "An item to be held by a Pokémon. If the holder is hit, the attacker will also be damaged upon contact.", generation: 5 },
  { id: 58, name: "Air Balloon", category: "held", effect: "Holder is immune to Ground moves until hit.", price: null, description: "An item to be held by a Pokémon. The holder will float in the air until hit. A popped balloon can't be reused.", generation: 5 },

  // Evolution Items
  { id: 59, name: "Fire Stone", category: "evolution", effect: "Evolves certain Fire-type Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. The stone has a fiery orange heart.", generation: 1 },
  { id: 60, name: "Water Stone", category: "evolution", effect: "Evolves certain Water-type Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It is the blue of a pool of clear water.", generation: 1 },
  { id: 61, name: "Thunder Stone", category: "evolution", effect: "Evolves certain Electric-type Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It has a distinct thunderbolt pattern.", generation: 1 },
  { id: 62, name: "Leaf Stone", category: "evolution", effect: "Evolves certain Grass-type Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It has an unmistakable leaf pattern.", generation: 1 },
  { id: 63, name: "Moon Stone", category: "evolution", effect: "Evolves certain Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It is as black as the night sky.", generation: 1 },
  { id: 64, name: "Sun Stone", category: "evolution", effect: "Evolves certain Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It burns as red as the evening sun.", generation: 2 },
  { id: 65, name: "Shiny Stone", category: "evolution", effect: "Evolves certain Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It shines with a dazzling light.", generation: 4 },
  { id: 66, name: "Dusk Stone", category: "evolution", effect: "Evolves certain Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It holds shadows as dark as can be.", generation: 4 },
  { id: 67, name: "Dawn Stone", category: "evolution", effect: "Evolves certain Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It sparkles like a glittering eye.", generation: 4 },
  { id: 68, name: "Ice Stone", category: "evolution", effect: "Evolves certain Ice-type Pokémon.", price: 3000, description: "A peculiar stone that can make certain species of Pokémon evolve. It has an unmistakable snowflake pattern.", generation: 7 },

  // Berries
  { id: 69, name: "Oran Berry", category: "berries", effect: "Restores 10 HP when HP drops below 50%.", price: null, description: "If held by a Pokémon, it heals the user by just 10 HP.", generation: 3 },
  { id: 70, name: "Sitrus Berry", category: "berries", effect: "Restores 25% max HP when HP drops below 50%.", price: null, description: "If held by a Pokémon, it heals the user's HP a little.", generation: 3 },
  { id: 71, name: "Lum Berry", category: "berries", effect: "Cures all status conditions.", price: null, description: "If held by a Pokémon, it recovers from any status condition.", generation: 3 },
  { id: 72, name: "Cheri Berry", category: "berries", effect: "Cures paralysis.", price: null, description: "If held by a Pokémon, it recovers from paralysis.", generation: 3 },
  { id: 73, name: "Chesto Berry", category: "berries", effect: "Cures sleep.", price: null, description: "If held by a Pokémon, it recovers from sleep.", generation: 3 },
  { id: 74, name: "Pecha Berry", category: "berries", effect: "Cures poison.", price: null, description: "If held by a Pokémon, it recovers from poison.", generation: 3 },
  { id: 75, name: "Rawst Berry", category: "berries", effect: "Cures burn.", price: null, description: "If held by a Pokémon, it recovers from a burn.", generation: 3 },
  { id: 76, name: "Aspear Berry", category: "berries", effect: "Cures freeze.", price: null, description: "If held by a Pokémon, it defrosts it.", generation: 3 },
  { id: 77, name: "Leppa Berry", category: "berries", effect: "Restores 10 PP to a move.", price: null, description: "If held by a Pokémon, it restores a move's PP by 10.", generation: 3 },
  { id: 78, name: "Persim Berry", category: "berries", effect: "Cures confusion.", price: null, description: "If held by a Pokémon, it recovers from confusion.", generation: 3 },
  
  // TMs/HMs
  { id: 79, name: "TM01", category: "tms", effect: "Teaches a Pokémon a move.", price: null, description: "A technical machine that teaches a specific move to a compatible Pokémon.", generation: 1 },
  { id: 80, name: "HM01 Cut", category: "tms", effect: "Teaches Cut and can cut small trees.", price: null, description: "A hidden machine that teaches Cut to a Pokémon. Can be used to cut down small trees.", generation: 1 },
  { id: 81, name: "HM02 Fly", category: "tms", effect: "Teaches Fly and allows flying to visited towns.", price: null, description: "A hidden machine that teaches Fly to a Pokémon. Can be used to fly to any previously visited town.", generation: 1 },
  { id: 82, name: "HM03 Surf", category: "tms", effect: "Teaches Surf and allows travel over water.", price: null, description: "A hidden machine that teaches Surf to a Pokémon. Can be used to travel across bodies of water.", generation: 1 },
  { id: 83, name: "HM04 Strength", category: "tms", effect: "Teaches Strength and can move boulders.", price: null, description: "A hidden machine that teaches Strength to a Pokémon. Can be used to move heavy boulders.", generation: 1 },

  // Key Items
  { id: 84, name: "Bicycle", category: "key", effect: "Allows faster travel than walking.", price: null, description: "A folding bicycle that enables a rider to get around much faster than with Running Shoes.", generation: 1 },
  { id: 85, name: "Old Rod", category: "key", effect: "Fish for Pokémon in water.", price: null, description: "An old and beat-up fishing rod. Use it at any body of water to fish for wild aquatic Pokémon.", generation: 1 },
  { id: 86, name: "Good Rod", category: "key", effect: "Better fishing rod than Old Rod.", price: null, description: "A new, good-quality fishing rod. Use it at any body of water to fish for wild aquatic Pokémon.", generation: 1 },
  { id: 87, name: "Super Rod", category: "key", effect: "Best fishing rod available.", price: null, description: "An awesome, high-tech fishing rod. Use it at any body of water to fish for wild aquatic Pokémon.", generation: 1 },
  { id: 88, name: "Pokédex", category: "key", effect: "Records data on encountered Pokémon.", price: null, description: "A high-tech device that records Pokémon data. It evaluates information about Pokémon you've seen or caught.", generation: 1 },
  { id: 89, name: "Town Map", category: "key", effect: "Shows map of the region.", price: null, description: "A very convenient map that can be viewed anytime. It even shows you your present location in the region.", generation: 1 },
  { id: 90, name: "VS Seeker", category: "key", effect: "Rechallenge trainers.", price: null, description: "A device that indicates Trainers who want to battle. Its battery charges while you walk.", generation: 3 }
];

export default function ItemsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Fetch items from PokeAPI
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // PokeAPI has a lot of items, so we'll fetch them with pagination
        const response = await fetchData(`https://pokeapi.co/api/v2/item?limit=300`);
        
        // Fetch details for first batch of items
        const itemDetailsPromises = response.results.slice(0, 150).map(item => 
          fetchData(item.url)
        );
        
        const itemDetails = await Promise.all(itemDetailsPromises);
        
        // Process item data
        const processedItems = itemDetails.map(item => {
          // Determine category based on item attributes
          let category = 'other';
          if (item.category) {
            const categoryName = item.category.name.toLowerCase();
            if (categoryName.includes('healing') || categoryName.includes('medicine') || categoryName.includes('hp-recovery')) {
              category = 'healing';
            } else if (categoryName.includes('pokeballs') || categoryName.includes('poke-balls')) {
              category = 'pokeballs';
            } else if (categoryName.includes('stat-boosts') || categoryName.includes('battle')) {
              category = 'battle';
            } else if (categoryName.includes('held-items') || categoryName.includes('choice')) {
              category = 'held';
            } else if (categoryName.includes('evolution') || categoryName.includes('stones')) {
              category = 'evolution';
            } else if (categoryName.includes('berries')) {
              category = 'berries';
            } else if (categoryName.includes('machines') || categoryName.includes('tms')) {
              category = 'tms';
            } else if (categoryName.includes('key') || categoryName.includes('plot')) {
              category = 'key';
            }
          }

          return {
            id: item.id,
            name: item.name.replace(/-/g, ' '),
            category: category,
            effect: item.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || 
                    item.flavor_text_entries.find(entry => entry.language.name === 'en')?.text || 
                    'No effect description available',
            description: item.flavor_text_entries.find(entry => entry.language.name === 'en')?.text || 
                        item.effect_entries.find(entry => entry.language.name === 'en')?.effect || 
                        'No description available',
            price: item.cost || null,
            generation: item.generation ? parseInt(item.generation.name.replace('generation-', '')) : 1,
            sprite: item.sprites?.default
          };
        });
        
        setItems(processedItems);
      } catch (error) {
        console.error("Error fetching items:", error);
        setError("Failed to fetch items from PokeAPI");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Get all unique categories from fetched items
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(items.map(item => item.category))];
    return cats;
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          if (a.price === null && b.price === null) return 0;
          if (a.price === null) return 1;
          if (b.price === null) return -1;
          return a.price - b.price;
        case "generation":
          return a.generation - b.generation;
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedCategory, sortBy]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "healing":
        return <BsHeart className="text-pink-500" />;
      case "pokeballs":
        return <GiPotionBall className="text-red-500" />;
      case "battle":
        return <GiSwordWound className="text-orange-500" />;
      case "held":
        return <BsShield className="text-blue-500" />;
      case "evolution":
        return <GiStoneBlock className="text-purple-500" />;
      case "berries":
        return <GiCrystalGrowth className="text-green-500" />;
      case "tms":
        return <BsLightning className="text-yellow-500" />;
      case "key":
        return <FiShoppingBag className="text-gray-500" />;
      default:
        return <FiShoppingBag className="text-gray-500" />;
    }
  };

  const getCategoryName = (category) => {
    const names = {
      healing: "Healing Items",
      pokeballs: "Poké Balls",
      battle: "Battle Items",
      held: "Held Items",
      evolution: "Evolution Items",
      berries: "Berries",
      tms: "TMs/HMs",
      key: "Key Items"
    };
    return names[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      healing: "from-pink-400 to-pink-600",
      pokeballs: "from-red-400 to-red-600",
      battle: "from-orange-400 to-orange-600",
      held: "from-blue-400 to-blue-600",
      evolution: "from-purple-400 to-purple-600",
      berries: "from-green-400 to-green-600",
      tms: "from-yellow-400 to-yellow-600",
      key: "from-gray-400 to-gray-600"
    };
    return colors[category] || "from-gray-400 to-gray-600";
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>Pokémon Items | DexTrends</title>
        <meta name="description" content="Browse all Pokémon items and their effects" />
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
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <FiShoppingBag className="text-pokemon-pink" />
              <span className="bg-gradient-to-r from-pokemon-pink to-pokemon-yellow bg-clip-text text-transparent">
                Pokémon Items
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Discover {items.length} items and their effects
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
                    placeholder="Search items by name, effect, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:ring-2 focus:ring-pokemon-pink outline-none`}
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-3 py-1 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-900'
                    } focus:ring-2 focus:ring-pokemon-pink outline-none`}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="generation">Generation</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredItems.length} items
                </div>
              </div>
            </div>
          </SlideUp>

          {/* Category Tabs */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category
                    ? `bg-gradient-to-r ${getCategoryColor(category)} text-white scale-110`
                    : 'bg-gray-200 dark:bg-gray-700 hover:scale-105'
                }`}
              >
                {getCategoryIcon(category)}
                {category === 'all' ? 'All Items' : getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading items from PokeAPI...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600 dark:text-gray-400">
                Showing {filteredItems.length} items
              </div>

              <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                  <CardHover key={item.id}>
                    <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg h-full flex flex-col`}>
                      {/* Item Header */}
                      <div className={`bg-gradient-to-r ${getCategoryColor(item.category)} p-4 text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.sprite && (
                              <img 
                                src={item.sprite} 
                                alt={item.name} 
                                className="w-8 h-8" 
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            )}
                            <h3 className="text-xl font-bold capitalize">{item.name}</h3>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                            {getCategoryIcon(item.category)}
                          </div>
                        </div>
                      </div>

                      {/* Item Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="mb-4">
                          <p className="font-semibold text-pokemon-blue mb-1">{item.effect}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-4 text-sm">
                          <div className={`p-3 rounded-lg text-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <p className="text-gray-500 dark:text-gray-400">Price</p>
                            <p className="font-bold">
                              {item.price !== null ? `¥${item.price}` : "N/A"}
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <p className="text-gray-500 dark:text-gray-400">Gen</p>
                            <p className="font-bold">{item.generation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHover>
                ))}
              </StaggeredChildren>

              {/* Pagination */}
              {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-400 text-white hover:bg-pink-500'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2">
                    Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredItems.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === Math.ceil(filteredItems.length / itemsPerPage)
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-pink-400 text-white hover:bg-pink-500'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <FiShoppingBag className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No items found</h3>
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
              <h2 className="text-2xl font-bold mb-6 text-center">Item Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {categories.filter(cat => cat !== 'all').map(category => (
                  <div key={category}>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${getCategoryColor(category)} bg-clip-text text-transparent`}>
                      {items.filter(item => item.category === category).length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">{getCategoryName(category)}</div>
                  </div>
                ))}
              </div>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </div>
  );
}
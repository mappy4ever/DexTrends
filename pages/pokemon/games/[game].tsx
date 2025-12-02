import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../../components/ui/animations";
import { useTheme } from "../../../context/UnifiedAppContext";
import { FullBleedWrapper } from "../../../components/ui/FullBleedWrapper";
import StyledBackButton from "../../../components/ui/StyledBackButton";
import { TypeBadge } from "../../../components/ui/TypeBadge";
import { gameCovers } from "../../../data/gameCovers";
import { GiCardPickup, GiTrophy, GiGamepad, GiCrystalBall } from "react-icons/gi";
import { BsCalendar, BsGlobe, BsController, BsStar, BsStarFill, BsPeople, BsGraphUp } from "react-icons/bs";
import { FaGamepad, FaWifi, FaMountain, FaCity } from "react-icons/fa";

// Type definitions
interface GameData {
  id: string;
  names: string[];
  logos: string[];
  releaseDate: string;
  releaseDateUS?: string;
  region: string;
  platform: string;
  developer: string;
  publisher: string;
  director?: string;
  producer?: string;
  description: string;
  longDescription: string;
  features: string[];
  innovations: string[];
  starters: string[];
  starterTypes: string[][];
  legendaries: string[];
  gymLeaders?: number;
  trialCaptains?: number;
  wardens?: number;
  pokedexSize: number;
  color: string;
  sales: string;
  rating: number;
  reception: string;
  legacy: string;
  trivia: string[];
}

// Comprehensive game data with additional details
const gamesData: Record<string, GameData> = {
  "red-blue": {
    id: "red-blue",
    names: ["Pokémon Red", "Pokémon Blue"],
    logos: ["/images/game-logos/pokemon-red.png", "/images/game-logos/pokemon-blue.png"],
    releaseDate: "1996-02-27",
    releaseDateUS: "1998-09-28",
    region: "Kanto",
    platform: "Game Boy",
    developer: "Game Freak",
    publisher: "Nintendo",
    director: "Satoshi Tajiri",
    producer: "Shigeru Miyamoto",
    description: "The games that started it all. Catch and train 151 Pokémon in the Kanto region.",
    longDescription: "Pokémon Red and Blue are the games that started a global phenomenon. Set in the Kanto region, players embark on a journey to become a Pokémon Master, catching and training creatures while battling eight Gym Leaders and the Elite Four. These games introduced core mechanics that would define the series for decades to come.",
    features: [
      "Original 151 Pokémon",
      "Turn-based battles",
      "Trading via Link Cable",
      "Legendary birds and Mewtwo",
      "Team Rocket storyline"
    ],
    innovations: [
      "First Pokémon games ever",
      "Introduced trading mechanic",
      "Version exclusives concept",
      "Social gaming via Link Cable"
    ],
    starters: ["Bulbasaur", "Charmander", "Squirtle"],
    starterTypes: [["grass", "poison"], ["fire"], ["water"]],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    gymLeaders: 8,
    pokedexSize: 151,
    color: "from-red-500 to-blue-500",
    sales: "31.38 million",
    rating: 4.5,
    reception: "Revolutionary for its time, creating an entirely new genre of gaming",
    legacy: "Spawned the highest-grossing media franchise of all time",
    trivia: [
      "Mew was secretly added by programmer Shigeki Morimoto",
      "Originally going to have 65,535 different Pokémon",
      "Inspired by Satoshi Tajiri's childhood bug collecting",
      "Nearly bankrupted Game Freak during development"
    ]
  },
  "yellow": {
    id: "yellow",
    names: ["Pokémon Yellow"],
    logos: ["/images/game-logos/pokemon-yellow.png"],
    releaseDate: "1998-09-12",
    releaseDateUS: "1999-10-19",
    region: "Kanto",
    platform: "Game Boy",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Special Pikachu Edition following the anime storyline more closely.",
    longDescription: "Pokémon Yellow is an enhanced version of Red and Blue that more closely follows the anime series. Pikachu is your starter Pokémon and follows you around on the overworld. The game features updated graphics, altered gym leader teams, and the ability to obtain all three original starters.",
    features: [
      "Pikachu as starter",
      "Anime-inspired events",
      "Updated graphics",
      "Pikachu emotions system",
      "All three starters obtainable"
    ],
    innovations: [
      "First Pokémon to follow player",
      "Enhanced color palette",
      "Anime tie-in elements",
      "Surfing Pikachu mini-game"
    ],
    starters: ["Pikachu (with Bulbasaur, Charmander, Squirtle obtainable)"],
    starterTypes: [["electric"]],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    gymLeaders: 8,
    pokedexSize: 151,
    color: "from-yellow-400 to-yellow-600",
    sales: "14.64 million",
    rating: 4.6,
    reception: "Praised for improvements and anime connections",
    legacy: "Set precedent for third versions with enhancements",
    trivia: [
      "Jesse and James from Team Rocket appear",
      "Pikachu's voice samples from the anime",
      "Can't evolve your starter Pikachu",
      "Gym leaders use teams from the anime"
    ]
  },
  "gold-silver": {
    id: "gold-silver",
    names: ["Pokémon Gold", "Pokémon Silver"],
    logos: ["/images/game-logos/pokemon-gold.png", "/images/game-logos/pokemon-silver.png"],
    releaseDate: "1999-11-21",
    releaseDateUS: "2000-10-15",
    region: "Johto",
    platform: "Game Boy Color",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Explore Johto and return to Kanto with 100 new Pokémon.",
    longDescription: "Gold and Silver expanded the Pokémon world significantly, introducing the Johto region while allowing players to return to Kanto. With 100 new Pokémon, breeding, held items, and a real-time clock system, these games set new standards for sequels.",
    features: [
      "Day/Night cycle",
      "Breeding system",
      "Two regions to explore",
      "Held items",
      "New types: Dark and Steel",
      "Pokégear device"
    ],
    innovations: [
      "Real-time clock",
      "Pokémon breeding",
      "Two regions in one game",
      "Shiny Pokémon",
      "Phone system"
    ],
    starters: ["Chikorita", "Cyndaquil", "Totodile"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi"],
    gymLeaders: 16,
    pokedexSize: 251,
    color: "from-yellow-500 to-stone-400",
    sales: "23 million",
    rating: 4.8,
    reception: "Considered by many as the series peak",
    legacy: "Set the gold standard for Pokémon sequels",
    trivia: [
      "Originally planned as the last Pokémon games",
      "Satoru Iwata helped compress the game to fit Kanto",
      "Features the legendary Red battle on Mt. Silver",
      "Introduced the beloved shiny Pokémon mechanic"
    ]
  },
  "crystal": {
    id: "crystal",
    names: ["Pokémon Crystal"],
    logos: ["/images/game-logos/pokemon-crystal.png"],
    releaseDate: "2000-12-14",
    releaseDateUS: "2001-07-29",
    region: "Johto",
    platform: "Game Boy Color",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Enhanced version with animated Pokémon sprites and female protagonist option.",
    longDescription: "Crystal improved upon Gold and Silver with animated Pokémon sprites, the series' first female protagonist option, and an expanded storyline focusing on Suicune. The Battle Tower also made its debut, offering post-game challenges.",
    features: [
      "Animated sprites",
      "Battle Tower",
      "Suicune storyline",
      "Female protagonist",
      "Enhanced graphics"
    ],
    innovations: [
      "First animated battle sprites",
      "First female player option",
      "Battle Tower introduction",
      "Expanded legendary subplot"
    ],
    starters: ["Chikorita", "Cyndaquil", "Totodile"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi"],
    gymLeaders: 16,
    pokedexSize: 251,
    color: "from-blue-400 to-cyan-500",
    sales: "6.39 million",
    rating: 4.7,
    reception: "Praised for animations and gender choice",
    legacy: "Established pattern for enhanced third versions",
    trivia: [
      "Only Pokémon game exclusive to Game Boy Color",
      "First game with Mobile System GB in Japan",
      "Suicune appears throughout the journey",
      "Odd Egg has higher shiny chances"
    ]
  },
  "ruby-sapphire": {
    id: "ruby-sapphire",
    names: ["Pokémon Ruby", "Pokémon Sapphire"],
    logos: ["/images/game-logos/pokemon-ruby.png", "/images/game-logos/pokemon-sapphire.png"],
    releaseDate: "2002-11-21",
    releaseDateUS: "2003-03-19",
    region: "Hoenn",
    platform: "Game Boy Advance",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Discover the tropical Hoenn region with enhanced graphics and double battles.",
    longDescription: "Ruby and Sapphire brought Pokémon to the Game Boy Advance with dramatically improved graphics, double battles, abilities, natures, and weather effects. The tropical Hoenn region featured diverse environments and two villainous teams.",
    features: [
      "Double battles",
      "Abilities & Natures",
      "Secret bases",
      "Contests",
      "Weather effects",
      "135 new Pokémon"
    ],
    innovations: [
      "Double battle system",
      "Pokémon abilities",
      "Nature system",
      "Weather in battle",
      "Secret bases"
    ],
    starters: ["Treecko", "Torchic", "Mudkip"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Kyogre", "Groudon", "Rayquaza", "Regice", "Regirock", "Registeel", "Latias", "Latios"],
    gymLeaders: 8,
    pokedexSize: 386,
    color: "from-red-600 to-blue-600",
    sales: "16.22 million",
    rating: 4.5,
    reception: "Mixed due to lack of connectivity with older games",
    legacy: "Introduced many competitive battling staples",
    trivia: [
      "First Pokémon games with no backwards compatibility",
      "Introduced the Battle Frontier in Emerald",
      "Features the most water routes",
      "Braille puzzles for the Regis"
    ]
  },
  "emerald": {
    id: "emerald",
    names: ["Pokémon Emerald"],
    logos: ["/images/game-logos/pokemon-emerald.png"],
    releaseDate: "2004-09-16",
    releaseDateUS: "2005-05-01",
    region: "Hoenn",
    platform: "Game Boy Advance",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "The definitive Hoenn experience with Battle Frontier.",
    longDescription: "Emerald combined elements from Ruby and Sapphire while adding the Battle Frontier, one of the series' most beloved post-game facilities. Both villainous teams play a role in the story, culminating in a battle featuring Rayquaza.",
    features: [
      "Battle Frontier",
      "Both evil teams",
      "Rayquaza storyline",
      "Gym leader rematches",
      "Enhanced graphics"
    ],
    innovations: [
      "Battle Frontier facility",
      "Animated sprites return",
      "Tag battles",
      "Gym leader rematches"
    ],
    starters: ["Treecko", "Torchic", "Mudkip"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Kyogre", "Groudon", "Rayquaza", "Regice", "Regirock", "Registeel", "Latias", "Latios"],
    gymLeaders: 8,
    pokedexSize: 386,
    color: "from-emerald-500 to-emerald-700",
    sales: "7.06 million",
    rating: 4.7,
    reception: "Highly praised for Battle Frontier",
    legacy: "Battle Frontier became fan-favorite feature",
    trivia: [
      "Juan replaces Wallace as 8th gym leader",
      "Features the longest post-game content",
      "Both Latios and Latias can be caught",
      "Scott scouts you for the Battle Frontier"
    ]
  },
  "firered-leafgreen": {
    id: "firered-leafgreen",
    names: ["Pokémon FireRed", "Pokémon LeafGreen"],
    logos: ["/images/game-logos/pokemon-firered.png", "/images/game-logos/pokemon-leafgreen.png"],
    releaseDate: "2004-01-29",
    releaseDateUS: "2004-09-09",
    region: "Kanto",
    platform: "Game Boy Advance",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Remakes of the original games with modern features and Sevii Islands.",
    longDescription: "FireRed and LeafGreen brought the original Pokémon adventure to the Game Boy Advance with updated graphics, mechanics from Ruby/Sapphire, and the new Sevii Islands post-game area. These remakes allowed new players to experience Kanto.",
    features: [
      "Sevii Islands",
      "Updated graphics",
      "Wireless adapter support",
      "Help system",
      "Vs Seeker"
    ],
    innovations: [
      "First remakes in series",
      "Wireless trading/battling",
      "Sevii Islands post-game",
      "Help menu for newcomers"
    ],
    starters: ["Bulbasaur", "Charmander", "Squirtle"],
    starterTypes: [["grass", "poison"], ["fire"], ["water"]],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    gymLeaders: 8,
    pokedexSize: 386,
    color: "from-orange-500 to-green-500",
    sales: "12 million",
    rating: 4.6,
    reception: "Excellent modernization of classics",
    legacy: "Set standard for future remakes",
    trivia: [
      "Includes Johto Pokémon in Sevii Islands",
      "Features updated Team Rocket plot",
      "Champion uses different team based on starter",
      "First games with wireless communication"
    ]
  },
  "diamond-pearl": {
    id: "diamond-pearl",
    names: ["Pokémon Diamond", "Pokémon Pearl"],
    logos: ["/images/game-logos/pokemon-diamond.png", "/images/game-logos/pokemon-pearl.png"],
    releaseDate: "2006-09-28",
    releaseDateUS: "2007-04-22",
    region: "Sinnoh",
    platform: "Nintendo DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Experience Sinnoh with Wi-Fi battles and the Global Trade Station.",
    longDescription: "Diamond and Pearl brought Pokémon to the Nintendo DS with full 3D environments, online functionality via Nintendo Wi-Fi Connection, and the Global Trade Station. The mythological Sinnoh region featured the creation trio of legendary Pokémon.",
    features: [
      "Wi-Fi battles",
      "Global Trade Station",
      "Underground mining",
      "Super Contests",
      "Day/night returns",
      "107 new Pokémon"
    ],
    innovations: [
      "Online trading/battling",
      "GTS worldwide trading",
      "Touch screen integration",
      "3D environments",
      "Physical/Special split"
    ],
    starters: ["Turtwig", "Chimchar", "Piplup"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Dialga", "Palkia", "Giratina", "Uxie", "Mesprit", "Azelf", "Cresselia", "Darkrai"],
    gymLeaders: 8,
    pokedexSize: 493,
    color: "from-blue-500 to-pink-400",
    sales: "17.67 million",
    rating: 4.3,
    reception: "Criticized for slow pace, praised for online",
    legacy: "Brought Pokémon into the online era",
    trivia: [
      "First main games with online features",
      "Slowest battle speed in the series",
      "Features creation mythology",
      "Underground has secret bases and mining"
    ]
  },
  "platinum": {
    id: "platinum",
    names: ["Pokémon Platinum"],
    logos: ["/images/game-logos/pokemon-platinum.png"],
    releaseDate: "2008-09-13",
    releaseDateUS: "2009-03-22",
    region: "Sinnoh",
    platform: "Nintendo DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Enhanced Sinnoh adventure with Distortion World and Battle Frontier.",
    longDescription: "Platinum improved upon Diamond and Pearl with faster gameplay, an expanded Pokédex, the return of the Battle Frontier, and the mysterious Distortion World where Giratina dwells. The story was enhanced with more Team Galactic involvement.",
    features: [
      "Distortion World",
      "Battle Frontier",
      "Improved graphics",
      "Faster gameplay",
      "Wi-Fi Plaza",
      "Expanded Pokédex"
    ],
    innovations: [
      "Distortion World dungeon",
      "Wi-Fi Plaza minigames",
      "VS Recorder",
      "Improved online features"
    ],
    starters: ["Turtwig", "Chimchar", "Piplup"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Dialga", "Palkia", "Giratina", "Uxie", "Mesprit", "Azelf", "Cresselia", "Darkrai"],
    gymLeaders: 8,
    pokedexSize: 493,
    color: "from-stone-600 to-stone-800",
    sales: "7.6 million",
    rating: 4.6,
    reception: "Fixed most Diamond/Pearl issues",
    legacy: "Considered definitive Sinnoh experience",
    trivia: [
      "Giratina gets Origin Forme",
      "Distortion World has unique physics",
      "Battle Frontier returns from Emerald",
      "Looker makes his first appearance"
    ]
  },
  "heartgold-soulsilver": {
    id: "heartgold-soulsilver",
    names: ["Pokémon HeartGold", "Pokémon SoulSilver"],
    logos: ["/images/game-logos/pokemon-heartgold.png", "/images/game-logos/pokemon-soulsilver.png"],
    releaseDate: "2009-09-12",
    releaseDateUS: "2010-03-14",
    region: "Johto",
    platform: "Nintendo DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Beloved remakes with Pokémon following you and the Pokéwalker accessory.",
    longDescription: "HeartGold and SoulSilver are considered among the best Pokémon games, featuring any Pokémon following the player, 16 gym badges, the Battle Frontier, and the Pokéwalker pedometer accessory. These remakes beautifully modernized the Johto experience.",
    features: [
      "Pokémon followers",
      "Pokéwalker",
      "16 Gym battles",
      "Battle Frontier",
      "GB Sounds item",
      "Pokéathlon"
    ],
    innovations: [
      "All Pokémon can follow",
      "Pokéwalker accessory",
      "Touch screen menu",
      "Pokéathlon sports"
    ],
    starters: ["Chikorita", "Cyndaquil", "Totodile"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi"],
    gymLeaders: 16,
    pokedexSize: 493,
    color: "from-yellow-500 to-stone-500",
    sales: "12.72 million",
    rating: 4.9,
    reception: "Nearly universal acclaim",
    legacy: "Often cited as series' best games",
    trivia: [
      "Pokéwalker was innovative for its time",
      "GB Sounds plays original music",
      "Features events for many mythical Pokémon",
      "Red has the highest level team in series"
    ]
  },
  "black-white": {
    id: "black-white",
    names: ["Pokémon Black", "Pokémon White"],
    logos: ["/images/game-logos/pokemon-black.png", "/images/game-logos/pokemon-white.png"],
    releaseDate: "2010-09-18",
    releaseDateUS: "2011-03-06",
    region: "Unova",
    platform: "Nintendo DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "A fresh start with only new Pokémon and a deeper story.",
    longDescription: "Black and White represented a soft reboot for the series, featuring only new Pokémon until post-game, a more mature story dealing with the ethics of Pokémon training, and dynamic camera angles. The games emphasized story more than any previous entry.",
    features: [
      "156 new Pokémon",
      "Seasonal changes",
      "Triple/Rotation battles",
      "C-Gear",
      "Dream World",
      "Reusable TMs"
    ],
    innovations: [
      "Only new Pokémon until post-game",
      "Seasonal system",
      "Triple and Rotation battles",
      "Infinite TM uses",
      "Dream World online"
    ],
    starters: ["Snivy", "Tepig", "Oshawott"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Reshiram", "Zekrom", "Kyurem", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Landorus"],
    gymLeaders: 8,
    pokedexSize: 649,
    color: "from-stone-900 to-stone-100",
    sales: "15.64 million",
    rating: 4.4,
    reception: "Divisive but appreciated for innovation",
    legacy: "Most story-focused main series games",
    trivia: [
      "N is a unique rival character",
      "Features version-exclusive areas",
      "Team Plasma has noble intentions",
      "First games with animated sprites throughout"
    ]
  },
  "black2-white2": {
    id: "black2-white2",
    names: ["Pokémon Black 2", "Pokémon White 2"],
    logos: ["/images/game-logos/pokemon-black2.png", "/images/game-logos/pokemon-white2.png"],
    releaseDate: "2012-06-23",
    releaseDateUS: "2012-10-07",
    region: "Unova",
    platform: "Nintendo DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Direct sequels with new areas and Pokémon World Tournament.",
    longDescription: "Black 2 and White 2 are the only direct sequels in the main series, set two years after the original games. They featured an expanded Unova region, older Pokémon available from the start, and the Pokémon World Tournament where players could battle every gym leader and champion.",
    features: [
      "New storyline",
      "Pokémon World Tournament",
      "Hidden Grottos",
      "Medal system",
      "Pokéstar Studios",
      "Expanded Unova"
    ],
    innovations: [
      "First direct sequels",
      "PWT legacy battles",
      "Achievement medals",
      "Pokéstar Studios movies"
    ],
    starters: ["Snivy", "Tepig", "Oshawott"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Reshiram", "Zekrom", "Kyurem", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Landorus"],
    gymLeaders: 8,
    pokedexSize: 649,
    color: "from-stone-800 to-stone-200",
    sales: "8.52 million",
    rating: 4.5,
    reception: "Praised as improvement over originals",
    legacy: "Showed potential for sequel approach",
    trivia: [
      "Colress studies Pokémon potential",
      "Features memory link with B/W",
      "Iris is the new champion",
      "Last traditional 2D Pokémon games"
    ]
  },
  "x-y": {
    id: "x-y",
    names: ["Pokémon X", "Pokémon Y"],
    logos: ["/images/game-logos/pokemon-x.png", "/images/game-logos/pokemon-y.png"],
    releaseDate: "2013-10-12",
    releaseDateUS: "2013-10-12",
    region: "Kalos",
    platform: "Nintendo 3DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "The jump to 3D with Mega Evolution and character customization.",
    longDescription: "X and Y brought Pokémon into full 3D on the Nintendo 3DS, introducing Mega Evolution, the Fairy type, and character customization. Set in the France-inspired Kalos region, these games emphasized beauty and connection with a worldwide simultaneous release.",
    features: [
      "Full 3D graphics",
      "Mega Evolution",
      "Character customization",
      "Fairy type",
      "Pokémon-Amie",
      "Super Training"
    ],
    innovations: [
      "First 3D main series",
      "Mega Evolution mechanic",
      "Character customization",
      "Worldwide release",
      "New type after 14 years"
    ],
    starters: ["Chespin", "Fennekin", "Froakie"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Xerneas", "Yveltal", "Zygarde"],
    gymLeaders: 8,
    pokedexSize: 721,
    color: "from-blue-600 to-red-600",
    sales: "16.58 million",
    rating: 4.2,
    reception: "Praised for 3D, criticized for difficulty",
    legacy: "Brought series into modern 3D era",
    trivia: [
      "First worldwide simultaneous release",
      "Smallest new Pokémon count (69)",
      "Features Kanto starters too",
      "Based on beauty and life/death themes"
    ]
  },
  "omega-ruby-alpha-sapphire": {
    id: "omega-ruby-alpha-sapphire",
    names: ["Pokémon Omega Ruby", "Pokémon Alpha Sapphire"],
    logos: ["/images/game-logos/pokemon-omega-ruby.png", "/images/game-logos/pokemon-alpha-sapphire.png"],
    releaseDate: "2014-11-21",
    releaseDateUS: "2014-11-21",
    region: "Hoenn",
    platform: "Nintendo 3DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Hoenn remakes with Mega Evolutions and the Delta Episode.",
    longDescription: "Omega Ruby and Alpha Sapphire brought Hoenn to the 3DS with beautiful 3D graphics, new Mega Evolutions, and the Delta Episode post-game story featuring Rayquaza and Deoxys. These remakes added modern features while maintaining Hoenn's charm.",
    features: [
      "Mega Evolutions",
      "Delta Episode",
      "DexNav",
      "Soaring",
      "Secret bases online",
      "Primal Reversion"
    ],
    innovations: [
      "Primal forms",
      "Delta Episode story",
      "Soaring on Latios/Latias",
      "DexNav hunting"
    ],
    starters: ["Treecko", "Torchic", "Mudkip"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Kyogre", "Groudon", "Rayquaza", "Deoxys", "Regice", "Regirock", "Registeel", "Latias", "Latios"],
    gymLeaders: 8,
    pokedexSize: 721,
    color: "from-red-700 to-blue-700",
    sales: "14.46 million",
    rating: 4.5,
    reception: "Excellent remakes with great additions",
    legacy: "Set new standard for remakes",
    trivia: [
      "Delta Episode confirms multiverse",
      "Features most Mega Evolutions",
      "Can catch every non-event legendary",
      "Cosplay Pikachu exclusive feature"
    ]
  },
  "sun-moon": {
    id: "sun-moon",
    names: ["Pokémon Sun", "Pokémon Moon"],
    logos: ["/images/game-logos/pokemon-sun.png", "/images/game-logos/pokemon-moon.png"],
    releaseDate: "2016-11-18",
    releaseDateUS: "2016-11-18",
    region: "Alola",
    platform: "Nintendo 3DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Island trials replace gyms in the tropical Alola region.",
    longDescription: "Sun and Moon shook up the Pokémon formula by replacing gyms with island trials, introducing regional variants, and featuring a more cinematic story. Set in the Hawaii-inspired Alola region, these games emphasized the bond between trainers and Pokémon.",
    features: [
      "Island trials",
      "Z-Moves",
      "Alolan forms",
      "Ultra Beasts",
      "Ride Pokémon",
      "No HMs"
    ],
    innovations: [
      "Replaced gym system",
      "Regional variants",
      "Z-Move system",
      "Removed HMs",
      "Ultra Beast concept"
    ],
    starters: ["Rowlet", "Litten", "Popplio"],
    starterTypes: [["grass", "flying"], ["fire"], ["water"]],
    legendaries: ["Solgaleo", "Lunala", "Necrozma", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini"],
    gymLeaders: 0,
    trialCaptains: 7,
    pokedexSize: 802,
    color: "from-orange-500 to-purple-600",
    sales: "16.27 million",
    rating: 4.3,
    reception: "Divisive changes but fresh take",
    legacy: "Showed willingness to change formula",
    trivia: [
      "12-hour time difference between versions",
      "Lillie's character development praised",
      "No National Dex for first time",
      "Features Pokémon from other dimensions"
    ]
  },
  "ultra-sun-ultra-moon": {
    id: "ultra-sun-ultra-moon",
    names: ["Pokémon Ultra Sun", "Pokémon Ultra Moon"],
    logos: ["/images/game-logos/pokemon-ultra-sun.png", "/images/game-logos/pokemon-ultra-moon.png"],
    releaseDate: "2017-11-17",
    releaseDateUS: "2017-11-17",
    region: "Alola",
    platform: "Nintendo 3DS",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Enhanced versions with Ultra Wormholes and Rainbow Rocket.",
    longDescription: "Ultra Sun and Ultra Moon expanded the Alola story with new Ultra Beast encounters, Ultra Wormhole travel to find legendary Pokémon, and Episode Rainbow Rocket featuring all past villain team leaders. These were the last traditional Pokémon games on 3DS.",
    features: [
      "Ultra Wormholes",
      "Rainbow Rocket",
      "New Pokémon",
      "Mantine Surf",
      "Ultra Megalopolis",
      "Photo Club"
    ],
    innovations: [
      "Ultra Space exploration",
      "All villain teams return",
      "New forms mid-generation",
      "Legendary hunting wormholes"
    ],
    starters: ["Rowlet", "Litten", "Popplio"],
    starterTypes: [["grass", "flying"], ["fire"], ["water"]],
    legendaries: ["Solgaleo", "Lunala", "Necrozma", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Ultra Beasts"],
    gymLeaders: 0,
    trialCaptains: 7,
    pokedexSize: 807,
    color: "from-yellow-500 to-indigo-600",
    sales: "9.15 million",
    rating: 4.4,
    reception: "Good additions but too similar",
    legacy: "Final 3DS Pokémon games",
    trivia: [
      "Giovanni leads Rainbow Rocket",
      "Can catch every legendary via wormholes",
      "Features Ultra Necrozma boss",
      "Last games with all Pokémon programmed"
    ]
  },
  "lets-go": {
    id: "lets-go",
    names: ["Pokémon Let's Go, Pikachu!", "Pokémon Let's Go, Eevee!"],
    logos: ["/images/game-logos/pokemon-lets-go-pikachu.png", "/images/game-logos/pokemon-lets-go-eevee.png"],
    releaseDate: "2018-11-16",
    releaseDateUS: "2018-11-16",
    region: "Kanto",
    platform: "Nintendo Switch",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Kanto reimagined with Pokémon GO catching mechanics.",
    longDescription: "Let's Go games bridged Pokémon GO players to the main series, featuring GO-style catching, co-op play, and visible wild Pokémon. These simplified remakes of Yellow featured HD graphics and were the first main series games on Nintendo Switch.",
    features: [
      "GO-style catching",
      "Co-op play",
      "Ride Pokémon",
      "Visible wild Pokémon",
      "Poké Ball Plus",
      "Master Trainers"
    ],
    innovations: [
      "GO integration",
      "Two-player co-op",
      "Overworld Pokémon",
      "Motion controls"
    ],
    starters: ["Pikachu/Eevee"],
    starterTypes: [["electric"], ["normal"]],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    gymLeaders: 8,
    pokedexSize: 153,
    color: "from-yellow-400 to-amber-600",
    sales: "15.07 million",
    rating: 4.0,
    reception: "Great for newcomers, too simple for veterans",
    legacy: "Successfully bridged GO to main series",
    trivia: [
      "Partner Pokémon have perfect stats",
      "Includes Alolan forms",
      "Green makes appearance",
      "Simplified but beautiful remake"
    ]
  },
  "sword-shield": {
    id: "sword-shield",
    names: ["Pokémon Sword", "Pokémon Shield"],
    logos: ["/images/game-logos/pokemon-sword.png", "/images/game-logos/pokemon-shield.png"],
    releaseDate: "2019-11-15",
    releaseDateUS: "2019-11-15",
    region: "Galar",
    platform: "Nintendo Switch",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "The Wild Area and Dynamax raids bring new adventures to Galar.",
    longDescription: "Sword and Shield brought Pokémon to the Nintendo Switch proper with the Wild Area, Dynamax raids, and stadium-based gym battles. Despite controversy over the limited Pokédex, these games introduced many quality-of-life improvements and online features.",
    features: [
      "Wild Area",
      "Dynamax/Gigantamax",
      "Max Raid Battles",
      "Stadium gyms",
      "Camping",
      "Curry cooking"
    ],
    innovations: [
      "Open world Wild Area",
      "Raid battles",
      "Dynamax mechanic",
      "Live online features"
    ],
    starters: ["Grookey", "Scorbunny", "Sobble"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Zacian", "Zamazenta", "Eternatus"],
    gymLeaders: 8,
    pokedexSize: 400,
    color: "from-blue-600 to-red-600",
    sales: "25.92 million",
    rating: 3.9,
    reception: "Controversial but commercially successful",
    legacy: "First home console main series games",
    trivia: [
      "'Dexit' controversy over missing Pokémon",
      "DLC replaced third version",
      "Features version-exclusive gyms",
      "Leon is undefeated champion"
    ]
  },
  "brilliant-diamond-shining-pearl": {
    id: "brilliant-diamond-shining-pearl",
    names: ["Pokémon Brilliant Diamond", "Pokémon Shining Pearl"],
    logos: ["/images/game-logos/pokemon-brilliant-diamond.png", "/images/game-logos/pokemon-shining-pearl.png"],
    releaseDate: "2021-11-19",
    releaseDateUS: "2021-11-19",
    region: "Sinnoh",
    platform: "Nintendo Switch",
    developer: "ILCA",
    publisher: "Nintendo",
    description: "Faithful remakes of Diamond and Pearl with modern features.",
    longDescription: "Brilliant Diamond and Shining Pearl are faithful remakes developed by ILCA, featuring a chibi art style, the Grand Underground expansion, and modern conveniences. These games stayed very close to the originals while adding quality-of-life improvements.",
    features: [
      "Grand Underground",
      "Following Pokémon",
      "Elite Four rematches",
      "Ramanas Park",
      "Union Room",
      "Chibi art style"
    ],
    innovations: [
      "First outsourced remakes",
      "Grand Underground expansion",
      "Elite Four competitive teams",
      "HM app feature"
    ],
    starters: ["Turtwig", "Chimchar", "Piplup"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Dialga", "Palkia", "Giratina", "Uxie", "Mesprit", "Azelf", "Cresselia", "Darkrai"],
    gymLeaders: 8,
    pokedexSize: 493,
    color: "from-sky-500 to-pink-500",
    sales: "15.06 million",
    rating: 3.7,
    reception: "Too faithful for some, appreciated by others",
    legacy: "Showed different remake approach",
    trivia: [
      "Elite Four has competitive teams",
      "Affection system integrated",
      "Day-one patch added features",
      "Developed by ILCA, not Game Freak"
    ]
  },
  "legends-arceus": {
    id: "legends-arceus",
    names: ["Pokémon Legends: Arceus"],
    logos: ["/images/game-logos/pokemon-legends-arceus.png"],
    releaseDate: "2022-01-28",
    releaseDateUS: "2022-01-28",
    region: "Hisui",
    platform: "Nintendo Switch",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "A new take on Pokémon set in ancient Sinnoh (Hisui).",
    longDescription: "Legends: Arceus revolutionized the Pokémon formula with action-RPG gameplay, seamless catching and battling, and an ancient setting. Players help create the first Pokédex in the Hisui region, the ancient version of Sinnoh.",
    features: [
      "Open world exploration",
      "New catching mechanics",
      "Alpha Pokémon",
      "Noble Pokémon",
      "Crafting system",
      "Side quests"
    ],
    innovations: [
      "Action-RPG gameplay",
      "Seamless wild battles",
      "Strong/Agile styles",
      "Complete formula change"
    ],
    starters: ["Rowlet", "Cyndaquil", "Oshawott"],
    starterTypes: [["grass", "flying"], ["fire"], ["water"]],
    legendaries: ["Dialga", "Palkia", "Giratina", "Arceus"],
    gymLeaders: 0,
    wardens: 10,
    pokedexSize: 242,
    color: "from-stone-600 to-yellow-600",
    sales: "14.83 million",
    rating: 4.4,
    reception: "Praised for innovation and fresh take",
    legacy: "Showed potential for series evolution",
    trivia: [
      "Set in ancient Sinnoh",
      "Players can be knocked out",
      "Research tasks to complete Pokédex",
      "Features regional forms and evolutions"
    ]
  },
  "scarlet-violet": {
    id: "scarlet-violet",
    names: ["Pokémon Scarlet", "Pokémon Violet"],
    logos: ["/images/game-logos/pokemon-scarlet.png", "/images/game-logos/pokemon-violet.png"],
    releaseDate: "2022-11-18",
    releaseDateUS: "2022-11-18",
    region: "Paldea",
    platform: "Nintendo Switch",
    developer: "Game Freak",
    publisher: "Nintendo",
    description: "Open-world adventure with three storylines to explore.",
    longDescription: "Scarlet and Violet feature a fully open world where players can tackle three storylines in any order: Victory Road (Gyms), Path of Legends (Titans), and Starfall Street (Team Star). Despite technical issues, these games pushed the series forward with freedom and multiplayer.",
    features: [
      "Open world",
      "Three storylines",
      "Terastallization",
      "Auto battles",
      "Multiplayer co-op",
      "Picnics"
    ],
    innovations: [
      "True open world",
      "Non-linear progression",
      "4-player co-op",
      "Let's Go auto-battles"
    ],
    starters: ["Sprigatito", "Fuecoco", "Quaxly"],
    starterTypes: [["grass"], ["fire"], ["water"]],
    legendaries: ["Koraidon", "Miraidon"],
    gymLeaders: 8,
    pokedexSize: 400,
    color: "from-red-600 to-purple-600",
    sales: "24.36 million",
    rating: 3.5,
    reception: "Great ideas marred by technical issues",
    legacy: "First true open world Pokémon",
    trivia: [
      "Past/future theme with paradox Pokémon",
      "Three separate storylines",
      "Nemona is battle-obsessed rival",
      "Area Zero holds mysteries"
    ]
  }
};

export default function GameDetailPage() {
  const router = useRouter();
  const { game: gameId } = router.query;
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");

  const game = gamesData[Array.isArray(gameId) ? gameId[0] : String(gameId)];

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
          <p className="text-stone-600 dark:text-stone-300 mb-8">
            The game "{gameId}" does not exist.
          </p>
          <StyledBackButton 
            text="Back to Games" 
            onClick={() => router.push('/pokemon/games')} 
          />
        </div>
      </div>
    );
  }

  const getStarterImage = (starter: string): string => {
    const starterIds: Record<string, number> = {
      "Bulbasaur": 1, "Charmander": 4, "Squirtle": 7,
      "Pikachu": 25, "Eevee": 133,
      "Chikorita": 152, "Cyndaquil": 155, "Totodile": 158,
      "Treecko": 252, "Torchic": 255, "Mudkip": 258,
      "Turtwig": 387, "Chimchar": 390, "Piplup": 393,
      "Snivy": 495, "Tepig": 498, "Oshawott": 501,
      "Chespin": 650, "Fennekin": 653, "Froakie": 656,
      "Rowlet": 722, "Litten": 725, "Popplio": 728,
      "Grookey": 810, "Scorbunny": 813, "Sobble": 816,
      "Sprigatito": 906, "Fuecoco": 909, "Quaxly": 912
    };
    const id = starterIds[starter] || 1;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<BsStarFill key={i} className="text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<BsStar key="half" className="text-yellow-400" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<BsStar key={i + 5} className="text-stone-400" />);
    }
    return stars;
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>{game.names.join(" / ")} | Pokémon Games | DexTrends</title>
        <meta name="description" content={game.description} />
      </Head>

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <StyledBackButton 
              text="Back to Games" 
              onClick={() => router.push('/pokemon/games')} 
            />
          </div>

          {/* Game Header */}
          <SlideUp>
            <div className={`rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-stone-800' : 'bg-white'
            } shadow-xl mb-8`}>
              <div className={`h-48 bg-gradient-to-r ${game.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">
                      {game.names.join(" & ")}
                    </h1>
                    <p className="text-xl opacity-90">{game.region} Region</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                    {game.platform}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                    {new Date(game.releaseDate).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </SlideUp>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {["overview", "features", "development", "legacy", "trivia"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeTab === tab
                    ? `bg-gradient-to-r ${game.color} text-white scale-110`
                    : 'bg-stone-200 dark:bg-stone-700 hover:scale-105'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <StaggeredChildren className="space-y-8">
              {/* Description */}
              <SlideUp>
                <div className={`p-8 rounded-xl ${
                  theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
                }`}>
                  <h2 className="text-3xl font-bold mb-4">About {game.names.join(" & ")}</h2>
                  <p className="text-lg text-stone-600 dark:text-stone-300 mb-6">
                    {game.longDescription}
                  </p>
                  
                  {/* Key Info Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                      <BsCalendar className="text-2xl mb-2 text-pokemon-blue" />
                      <p className="text-sm text-stone-500 dark:text-stone-300">Release Date</p>
                      <p className="font-bold">{new Date(game.releaseDate).toLocaleDateString()}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                      <BsController className="text-2xl mb-2 text-pokemon-red" />
                      <p className="text-sm text-stone-500 dark:text-stone-300">Platform</p>
                      <p className="font-bold">{game.platform}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                      <BsGlobe className="text-2xl mb-2 text-pokemon-green" />
                      <p className="text-sm text-stone-500 dark:text-stone-300">Region</p>
                      <p className="font-bold">{game.region}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                      <GiCrystalBall className="text-2xl mb-2 text-pokemon-purple" />
                      <p className="text-sm text-stone-500 dark:text-stone-300">Pokédex Size</p>
                      <p className="font-bold">{game.pokedexSize} Pokémon</p>
                    </div>
                  </div>
                </div>
              </SlideUp>

              {/* Starter Pokemon */}
              <SlideUp>
                <div className={`p-8 rounded-xl ${
                  theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
                }`}>
                  <h2 className="text-3xl font-bold mb-6">Starter Pokémon</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {game.starters[0].split(", ").map((starter, idx) => {
                      const individualStarters = starter.includes("/") ? starter.split("/") : [starter];
                      return individualStarters.map((s, subIdx) => (
                        <CardHover key={`${s}-${idx}-${subIdx}`}>
                          <div className={`rounded-xl overflow-hidden ${
                            theme === 'dark' ? 'bg-stone-700' : 'bg-white'
                          } shadow-lg`}>
                            <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                              <Image
                                src={getStarterImage(s.trim())}
                                alt={s.trim()}
                                layout="fill"
                                objectFit="contain"
                                className="p-4"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="text-xl font-bold mb-2">{s.trim()}</h3>
                              {game.starterTypes[idx] && (
                                <div className="flex gap-2">
                                  {game.starterTypes[idx].map(type => (
                                    <TypeBadge key={type} type={type} size="sm" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHover>
                      ));
                    })}
                  </div>
                </div>
              </SlideUp>

              {/* Sales and Reception */}
              <SlideUp>
                <div className={`p-8 rounded-xl ${
                  theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
                }`}>
                  <h2 className="text-3xl font-bold mb-6">Sales & Reception</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Commercial Performance</h3>
                      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                        <BsGraphUp className="text-4xl mb-3 text-pokemon-green" />
                        <p className="text-3xl font-bold text-pokemon-green">{game.sales}</p>
                        <p className="text-stone-600 dark:text-stone-300">Units Sold Worldwide</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Critical Reception</h3>
                      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                        <div className="flex gap-1 mb-3 justify-center">
                          {renderStars(game.rating)}
                        </div>
                        <p className="text-3xl font-bold text-center">{game.rating}/5</p>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-3">
                          {game.reception}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </StaggeredChildren>
          )}

          {activeTab === "features" && (
            <StaggeredChildren className="space-y-8">
              {/* Key Features */}
              <SlideUp>
                <div className={`p-8 rounded-xl ${
                  theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
                }`}>
                  <h2 className="text-3xl font-bold mb-6">Key Features</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {game.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center text-white flex-shrink-0`}>
                          ✓
                        </div>
                        <p className="text-lg">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SlideUp>

              {/* Innovations */}
              <SlideUp>
                <div className={`p-8 rounded-xl ${
                  theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
                }`}>
                  <h2 className="text-3xl font-bold mb-6">Innovations</h2>
                  <div className="space-y-4">
                    {game.innovations.map((innovation, idx) => (
                      <div key={idx} className={`p-4 rounded-lg flex items-center gap-4 ${
                        theme === 'dark' ? 'bg-stone-700' : 'bg-white'
                      }`}>
                        <GiCrystalBall className="text-2xl text-pokemon-purple" />
                        <p className="text-lg">{innovation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SlideUp>

              {/* Game Stats */}
              <SlideUp>
                <div className={`p-8 rounded-xl ${
                  theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
                }`}>
                  <h2 className="text-3xl font-bold mb-6">Game Statistics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className={`text-4xl font-bold bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}>
                        {game.gymLeaders || game.trialCaptains || game.wardens || 0}
                      </div>
                      <div className="text-stone-600 dark:text-stone-300">
                        {game.gymLeaders ? "Gym Leaders" : game.trialCaptains ? "Trial Captains" : "Wardens"}
                      </div>
                    </div>
                    <div>
                      <div className={`text-4xl font-bold bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}>
                        {game.pokedexSize}
                      </div>
                      <div className="text-stone-600 dark:text-stone-300">Pokédex Size</div>
                    </div>
                    <div>
                      <div className={`text-4xl font-bold bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}>
                        {game.legendaries.length}
                      </div>
                      <div className="text-stone-600 dark:text-stone-300">Legendaries</div>
                    </div>
                    <div>
                      <div className={`text-4xl font-bold bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}>
                        {game.starters.length}
                      </div>
                      <div className="text-stone-600 dark:text-stone-300">Starters</div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </StaggeredChildren>
          )}

          {activeTab === "development" && (
            <SlideUp>
              <div className={`p-8 rounded-xl ${
                theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
              }`}>
                <h2 className="text-3xl font-bold mb-6">Development Team</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                    <h3 className="font-bold mb-2">Developer</h3>
                    <p className="text-xl">{game.developer}</p>
                  </div>
                  <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                    <h3 className="font-bold mb-2">Publisher</h3>
                    <p className="text-xl">{game.publisher}</p>
                  </div>
                  {game.director && (
                    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                      <h3 className="font-bold mb-2">Director</h3>
                      <p className="text-xl">{game.director}</p>
                    </div>
                  )}
                  {game.producer && (
                    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                      <h3 className="font-bold mb-2">Producer</h3>
                      <p className="text-xl">{game.producer}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-4">Release Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                      <p className="text-sm text-stone-500 dark:text-stone-300">Japan Release</p>
                      <p className="font-bold">{new Date(game.releaseDate).toLocaleDateString()}</p>
                    </div>
                    {game.releaseDateUS && (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                        <p className="text-sm text-stone-500 dark:text-stone-300">US Release</p>
                        <p className="font-bold">{new Date(game.releaseDateUS).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SlideUp>
          )}

          {activeTab === "legacy" && (
            <SlideUp>
              <div className={`p-8 rounded-xl ${
                theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
              }`}>
                <h2 className="text-3xl font-bold mb-6">Legacy & Impact</h2>
                <div className={`p-6 rounded-lg mb-6 ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`}>
                  <GiTrophy className="text-4xl mb-4 text-pokemon-yellow" />
                  <p className="text-lg">{game.legacy}</p>
                </div>

                <h3 className="text-2xl font-bold mb-4">Legendary Pokémon</h3>
                <div className="flex flex-wrap gap-3">
                  {game.legendaries.map((legendary) => (
                    <span key={legendary} className={`px-4 py-2 rounded-full font-semibold bg-gradient-to-r ${game.color} text-white`}>
                      {legendary}
                    </span>
                  ))}
                </div>
              </div>
            </SlideUp>
          )}

          {activeTab === "trivia" && (
            <SlideUp>
              <div className={`p-8 rounded-xl ${
                theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
              }`}>
                <h2 className="text-3xl font-bold mb-6">Did You Know?</h2>
                <div className="space-y-4">
                  {game.trivia.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {idx + 1}
                      </div>
                      <p className="text-lg text-stone-600 dark:text-stone-300 pt-2">
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>
          )}
        </div>
      </FadeIn>
    </FullBleedWrapper>
  );
}
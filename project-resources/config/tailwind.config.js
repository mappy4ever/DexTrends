/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}", // Keep if you have this folder
    "./utils/**/*.{js,ts,jsx,tsx}", // Include utils directory for type gradient classes
  ],
  safelist: [
    // Essential Pokémon type badge classes (most commonly used)
    "bg-poke-normal", "bg-poke-fire", "bg-poke-water", "bg-poke-electric", "bg-poke-grass", "bg-poke-ice", 
    "bg-poke-fighting", "bg-poke-poison", "bg-poke-ground", "bg-poke-flying", "bg-poke-psychic", "bg-poke-bug", 
    "bg-poke-rock", "bg-poke-ghost", "bg-poke-dragon", "bg-poke-dark", "bg-poke-steel", "bg-poke-fairy",
    "border-poke-normal", "border-poke-fire", "border-poke-water", "border-poke-electric", "border-poke-grass", "border-poke-ice",
    "border-poke-fighting", "border-poke-poison", "border-poke-ground", "border-poke-flying", "border-poke-psychic", "border-poke-bug",
    "border-poke-rock", "border-poke-ghost", "border-poke-dragon", "border-poke-dark", "border-poke-steel", "border-poke-fairy",
    "hover:bg-poke-normal", "hover:bg-poke-fire", "hover:bg-poke-water", "hover:bg-poke-electric", "hover:bg-poke-grass", "hover:bg-poke-ice",
    "hover:bg-poke-fighting", "hover:bg-poke-poison", "hover:bg-poke-ground", "hover:bg-poke-flying", "hover:bg-poke-psychic", "hover:bg-poke-bug",
    "hover:bg-poke-rock", "hover:bg-poke-ghost", "hover:bg-poke-dragon", "hover:bg-poke-dark", "hover:bg-poke-steel", "hover:bg-poke-fairy",
    
    // Pokemon Type Gradient System - Background gradients (for pokemon-type gradients)
    "bg-gradient-to-br", "from-red-50", "via-orange-50", "to-amber-50", "dark:from-red-950", "dark:via-orange-950", "dark:to-amber-950",
    "from-blue-50", "via-cyan-50", "to-sky-50", "dark:from-blue-950", "dark:via-cyan-950", "dark:to-sky-950",
    "from-yellow-50", "via-amber-50", "to-lime-50", "dark:from-yellow-950", "dark:via-amber-950", "dark:to-lime-950",
    "from-green-50", "via-emerald-50", "to-lime-50", "dark:from-green-950", "dark:via-emerald-950", "dark:to-lime-950",
    "from-cyan-100", "via-sky-200", "to-blue-200", "dark:from-cyan-900", "dark:via-sky-900", "dark:to-blue-900",
    "from-purple-100", "via-violet-100", "to-fuchsia-100", "dark:from-purple-900", "dark:via-violet-900", "dark:to-fuchsia-900",
    "from-stone-50", "via-gray-50", "to-slate-50", "dark:from-stone-950", "dark:via-gray-950", "dark:to-slate-950",
    "from-pink-50", "via-rose-50", "to-fuchsia-50", "dark:from-pink-950", "dark:via-rose-950", "dark:to-fuchsia-950",
    "from-sky-50", "via-blue-50", "to-indigo-50", "dark:from-sky-950", "dark:via-blue-950", "dark:to-indigo-950",
    "from-lime-50", "via-green-50", "to-emerald-50", "dark:from-lime-950", "dark:via-green-950", "dark:to-emerald-950",
    "from-indigo-50", "via-purple-50", "to-blue-50", "dark:from-indigo-950", "dark:via-purple-950", "dark:to-blue-950",
    "from-gray-50", "via-slate-50", "to-zinc-50", "dark:from-gray-950", "dark:via-slate-950", "dark:to-zinc-950",
    "from-slate-50", "via-zinc-50", "to-gray-50", "dark:from-slate-950", "dark:via-zinc-950", "dark:to-gray-950",
    "from-amber-50", "via-stone-50", "to-neutral-50", "dark:from-amber-950", "dark:via-stone-950", "dark:to-neutral-950",
    "from-red-50", "via-rose-50", "to-pink-50", "dark:from-red-950", "dark:via-rose-950", "dark:to-pink-950",
    "from-purple-50", "via-indigo-50", "to-violet-50", "dark:from-purple-950", "dark:via-indigo-950", "dark:to-violet-950",
    
    // Pokemon Type UI Colors - Card backgrounds
    "bg-gradient-to-br", "from-amber-50", "to-stone-50", "dark:from-amber-950/30", "dark:to-stone-950/30",
    "from-red-50", "to-orange-50", "dark:from-red-950/30", "dark:to-orange-950/30",
    "from-blue-50", "to-cyan-50", "dark:from-blue-950/30", "dark:to-cyan-950/30",
    "from-yellow-50", "to-amber-50", "dark:from-yellow-950/30", "dark:to-amber-950/30",
    "from-green-50", "to-emerald-50", "dark:from-green-950/30", "dark:to-emerald-950/30",
    "from-cyan-100", "to-sky-200", "dark:from-cyan-900/40", "dark:to-sky-900/40",
    "from-red-50", "to-rose-50", "dark:from-red-950/30", "dark:to-rose-950/30",
    "from-purple-100", "to-violet-100", "dark:from-purple-900/30", "dark:to-violet-900/30",
    "from-yellow-50", "to-orange-50", "dark:from-yellow-950/30", "dark:to-orange-950/30",
    "from-sky-50", "to-blue-50", "dark:from-sky-950/30", "dark:to-blue-950/30",
    "from-pink-50", "to-purple-50", "dark:from-pink-950/30", "dark:to-purple-950/30",
    "from-lime-50", "to-green-50", "dark:from-lime-950/30", "dark:to-green-950/30",
    "from-stone-50", "to-gray-50", "dark:from-stone-950/30", "dark:to-gray-950/30",
    "from-purple-50", "to-indigo-50", "dark:from-purple-950/30", "dark:to-indigo-950/30",
    "from-indigo-50", "to-purple-50", "dark:from-indigo-950/30", "dark:to-purple-950/30",
    "from-gray-50", "to-slate-50", "dark:from-gray-950/30", "dark:to-slate-950/30",
    "from-slate-50", "to-zinc-50", "dark:from-slate-950/30", "dark:to-zinc-950/30",
    "from-pink-50", "to-rose-50", "dark:from-pink-950/30", "dark:to-rose-950/30",
    
    // Pokemon Type UI Colors - Borders
    "border-amber-200/50", "dark:border-amber-700/50", "border-red-200/50", "dark:border-red-700/50",
    "border-blue-200/50", "dark:border-blue-700/50", "border-yellow-200/50", "dark:border-yellow-700/50",
    "border-green-200/50", "dark:border-green-700/50", "border-cyan-300/60", "dark:border-cyan-600/60",
    "border-purple-200/50", "dark:border-purple-700/50", "border-sky-200/50", "dark:border-sky-700/50",
    "border-pink-200/50", "dark:border-pink-700/50", "border-lime-200/50", "dark:border-lime-700/50",
    "border-stone-200/50", "dark:border-stone-700/50", "border-indigo-200/50", "dark:border-indigo-700/50",
    "border-gray-200/50", "dark:border-gray-700/50", "border-slate-200/50", "dark:border-slate-700/50",
    
    // Pokemon Type UI Colors - Button gradients
    "bg-gradient-to-r", "from-amber-500", "to-amber-600", "from-red-500", "to-orange-500",
    "from-blue-500", "to-cyan-500", "from-yellow-500", "to-amber-500", "from-green-500", "to-emerald-500",
    "from-cyan-500", "to-sky-500", "from-red-500", "to-rose-500", "from-purple-500", "to-violet-500",
    "from-yellow-500", "to-orange-500", "from-sky-500", "to-blue-500", "from-pink-500", "to-purple-500",
    "from-lime-500", "to-green-500", "from-stone-500", "to-gray-500", "from-purple-500", "to-indigo-500",
    "from-indigo-500", "to-purple-500", "from-gray-500", "to-slate-500", "from-slate-500", "to-zinc-500",
    "from-pink-500", "to-rose-500",
    
    // Type badge classes for Pocket mode
    "type-badge", "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-400", "bg-pink-500", "bg-cyan-400",
    "bg-indigo-600", "bg-gray-800", "bg-pink-400", "bg-gray-400", "bg-orange-600", "bg-indigo-400", "bg-purple-500",
    "bg-yellow-600", "bg-stone-500", "bg-lime-500", "bg-purple-600", "bg-slate-500", "bg-gray-300", "bg-emerald-500",
    "size-sm", "size-md", "size-lg", "size-list",
    
    // Core utility classes used in TypeBadge and cards
    "text-white", "bg-gray-100", "bg-gray-200", "border-gray-200", "border-gray-300", "hover:bg-gray-200", "hover:bg-gray-300",
    "bg-blue-100", "text-blue-900", "border-blue-200", "hover:bg-blue-200",
    "bg-yellow-100", "text-gray-800", "border-yellow-200", "hover:bg-yellow-200",
    
    // Pokemon image container border classes - solid, high contrast
    "border-4", "border-amber-500", "dark:border-amber-600", "border-red-500", "dark:border-red-600",
    "border-blue-500", "dark:border-blue-600", "border-yellow-500", "dark:border-yellow-600",
    "border-green-500", "dark:border-green-600", "border-cyan-500", "dark:border-cyan-600",
    "border-purple-500", "dark:border-purple-600", "border-sky-500", "dark:border-sky-600",
    "border-pink-500", "dark:border-pink-600", "border-lime-500", "dark:border-lime-600",
    "border-stone-500", "dark:border-stone-600", "border-indigo-500", "dark:border-indigo-600",
    "border-gray-500", "dark:border-gray-600", "border-slate-500", "dark:border-slate-600",
    
    // Ring classes for Pokemon type borders
    "ring-8", "ring-[32px]", "ring-inset", "ring-white", "dark:ring-gray-900",
    "ring-amber-500/40", "dark:ring-amber-600/50", "ring-red-500/40", "dark:ring-red-600/50",
    "ring-blue-500/40", "dark:ring-blue-600/50", "ring-yellow-500/40", "dark:ring-yellow-600/50",
    "ring-green-500/40", "dark:ring-green-600/50", "ring-cyan-500/40", "dark:ring-cyan-600/50",
    "ring-purple-500/40", "dark:ring-purple-600/50", "ring-sky-500/40", "dark:ring-sky-600/50",
    "ring-pink-500/40", "dark:ring-pink-600/50", "ring-lime-500/40", "dark:ring-lime-600/50",
    "ring-stone-500/40", "dark:ring-stone-600/50", "ring-indigo-500/40", "dark:ring-indigo-600/50",
    "ring-gray-500/40", "dark:ring-gray-600/50", "ring-slate-500/40", "dark:ring-slate-600/50",
    
    // Higher opacity ring colors
    "ring-4", "ring-amber-500/60", "dark:ring-amber-600/70", "ring-red-500/60", "dark:ring-red-600/70",
    "ring-blue-500/60", "dark:ring-blue-600/70", "ring-yellow-500/60", "dark:ring-yellow-600/70",
    "ring-green-500/60", "dark:ring-green-600/70", "ring-cyan-500/60", "dark:ring-cyan-600/70",
    "ring-purple-500/60", "dark:ring-purple-600/70", "ring-sky-500/60", "dark:ring-sky-600/70",
    "ring-pink-500/60", "dark:ring-pink-600/70", "ring-lime-500/60", "dark:ring-lime-600/70",
    "ring-stone-500/60", "dark:ring-stone-600/70", "ring-indigo-500/60", "dark:ring-indigo-600/70",
    "ring-gray-500/60", "dark:ring-gray-600/70", "ring-slate-500/60", "dark:ring-slate-600/70",
    
    // Pokemon image container fill colors - single types
    "bg-amber-500/25", "dark:bg-amber-600/35", "bg-red-500/25", "dark:bg-red-600/35",
    "bg-blue-500/25", "dark:bg-blue-600/35", "bg-yellow-500/25", "dark:bg-yellow-600/35",
    "bg-green-500/25", "dark:bg-green-600/35", "bg-cyan-500/25", "dark:bg-cyan-600/35",
    "bg-purple-500/25", "dark:bg-purple-600/35", "bg-sky-500/25", "dark:bg-sky-600/35",
    "bg-pink-500/25", "dark:bg-pink-600/35", "bg-lime-500/25", "dark:bg-lime-600/35",
    "bg-stone-500/25", "dark:bg-stone-600/35", "bg-indigo-500/25", "dark:bg-indigo-600/35",
    "bg-gray-500/25", "dark:bg-gray-600/35", "bg-slate-500/25", "dark:bg-slate-600/35",
    
    // Lighter opacity variants for cleaner look
    "bg-amber-500/20", "dark:bg-amber-600/30", "bg-red-500/20", "dark:bg-red-600/30",
    "bg-blue-500/20", "dark:bg-blue-600/30", "bg-yellow-500/20", "dark:bg-yellow-600/30",
    "bg-green-500/20", "dark:bg-green-600/30", "bg-cyan-500/20", "dark:bg-cyan-600/30",
    "bg-purple-500/20", "dark:bg-purple-600/30", "bg-sky-500/20", "dark:bg-sky-600/30",
    "bg-pink-500/20", "dark:bg-pink-600/30", "bg-lime-500/20", "dark:bg-lime-600/30",
    "bg-stone-500/20", "dark:bg-stone-600/30", "bg-indigo-500/20", "dark:bg-indigo-600/30",
    "bg-gray-500/20", "dark:bg-gray-600/30", "bg-slate-500/20", "dark:bg-slate-600/30",
    
    // Even lighter opacity - 15/20
    "bg-amber-500/15", "dark:bg-amber-600/20", "bg-red-500/15", "dark:bg-red-600/20",
    "bg-blue-500/15", "dark:bg-blue-600/20", "bg-yellow-500/15", "dark:bg-yellow-600/20",
    "bg-green-500/15", "dark:bg-green-600/20", "bg-cyan-500/15", "dark:bg-cyan-600/20",
    "bg-purple-500/15", "dark:bg-purple-600/20", "bg-sky-500/15", "dark:bg-sky-600/20",
    "bg-pink-500/15", "dark:bg-pink-600/20", "bg-lime-500/15", "dark:bg-lime-600/20",
    "bg-stone-500/15", "dark:bg-stone-600/20", "bg-indigo-500/15", "dark:bg-indigo-600/20",
    "bg-gray-500/15", "dark:bg-gray-600/20", "bg-slate-500/15", "dark:bg-slate-600/20",
    
    // Very subtle opacity - 10/15
    "bg-amber-500/10", "dark:bg-amber-600/15", "bg-red-500/10", "dark:bg-red-600/15",
    "bg-blue-500/10", "dark:bg-blue-600/15", "bg-yellow-500/10", "dark:bg-yellow-600/15",
    "bg-green-500/10", "dark:bg-green-600/15", "bg-cyan-500/10", "dark:bg-cyan-600/15",
    "bg-purple-500/10", "dark:bg-purple-600/15", "bg-sky-500/10", "dark:bg-sky-600/15",
    "bg-pink-500/10", "dark:bg-pink-600/15", "bg-lime-500/10", "dark:bg-lime-600/15",
    "bg-stone-500/10", "dark:bg-stone-600/15", "bg-indigo-500/10", "dark:bg-indigo-600/15",
    "bg-gray-500/10", "dark:bg-gray-600/15", "bg-slate-500/10", "dark:bg-slate-600/15",
    
    // Ultra subtle opacity - 5/10
    "bg-amber-500/5", "dark:bg-amber-600/10", "bg-red-500/5", "dark:bg-red-600/10",
    "bg-blue-500/5", "dark:bg-blue-600/10", "bg-yellow-500/5", "dark:bg-yellow-600/10",
    "bg-green-500/5", "dark:bg-green-600/10", "bg-cyan-500/5", "dark:bg-cyan-600/10",
    "bg-purple-500/5", "dark:bg-purple-600/10", "bg-sky-500/5", "dark:bg-sky-600/10",
    "bg-pink-500/5", "dark:bg-pink-600/10", "bg-lime-500/5", "dark:bg-lime-600/10",
    "bg-stone-500/5", "dark:bg-stone-600/10", "bg-indigo-500/5", "dark:bg-indigo-600/10",
    "bg-gray-500/5", "dark:bg-gray-600/10", "bg-slate-500/5", "dark:bg-slate-600/10",
    
    // Higher opacity variants for ring effect
    "bg-amber-500/40", "dark:bg-amber-600/50", "bg-red-500/40", "dark:bg-red-600/50",
    "bg-blue-500/40", "dark:bg-blue-600/50", "bg-yellow-500/40", "dark:bg-yellow-600/50",
    "bg-green-500/40", "dark:bg-green-600/50", "bg-cyan-500/40", "dark:bg-cyan-600/50",
    "bg-purple-500/40", "dark:bg-purple-600/50", "bg-sky-500/40", "dark:bg-sky-600/50",
    "bg-pink-500/40", "dark:bg-pink-600/50", "bg-lime-500/40", "dark:bg-lime-600/50",
    "bg-stone-500/40", "dark:bg-stone-600/50", "bg-indigo-500/40", "dark:bg-indigo-600/50",
    "bg-gray-500/40", "dark:bg-gray-600/50", "bg-slate-500/40", "dark:bg-slate-600/50",
    
    // Even higher opacity for outer ring - 60/70
    "bg-amber-500/60", "dark:bg-amber-600/70", "bg-red-500/60", "dark:bg-red-600/70",
    "bg-blue-500/60", "dark:bg-blue-600/70", "bg-yellow-500/60", "dark:bg-yellow-600/70",
    "bg-green-500/60", "dark:bg-green-600/70", "bg-cyan-500/60", "dark:bg-cyan-600/70",
    "bg-purple-500/60", "dark:bg-purple-600/70", "bg-sky-500/60", "dark:bg-sky-600/70",
    "bg-pink-500/60", "dark:bg-pink-600/70", "bg-lime-500/60", "dark:bg-lime-600/70",
    "bg-stone-500/60", "dark:bg-stone-600/70", "bg-indigo-500/60", "dark:bg-indigo-600/70",
    "bg-gray-500/60", "dark:bg-gray-600/70", "bg-slate-500/60", "dark:bg-slate-600/70",
    
    // Very high opacity - 90%
    "bg-amber-500/90", "dark:bg-amber-600/90", "bg-red-500/90", "dark:bg-red-600/90",
    "bg-blue-500/90", "dark:bg-blue-600/90", "bg-yellow-500/90", "dark:bg-yellow-600/90",
    "bg-green-500/90", "dark:bg-green-600/90", "bg-cyan-500/90", "dark:bg-cyan-600/90",
    "bg-purple-500/90", "dark:bg-purple-600/90", "bg-sky-500/90", "dark:bg-sky-600/90",
    "bg-pink-500/90", "dark:bg-pink-600/90", "bg-lime-500/90", "dark:bg-lime-600/90",
    "bg-stone-500/90", "dark:bg-stone-600/90", "bg-indigo-500/90", "dark:bg-indigo-600/90",
    "bg-gray-500/90", "dark:bg-gray-600/90", "bg-slate-500/90", "dark:bg-slate-600/90",
    
    // Pokemon dual-type gradient backgrounds
    "from-green-500/25", "to-purple-500/25", "dark:from-green-600/35", "dark:to-purple-600/35",
    "from-red-500/25", "to-sky-500/25", "dark:from-red-600/35", "dark:to-sky-600/35",
    "from-blue-500/25", "to-cyan-500/25", "dark:from-blue-600/35", "dark:to-cyan-600/35",
    "from-yellow-500/25", "to-slate-500/25", "dark:from-yellow-600/35", "dark:to-slate-600/35",
    "from-stone-500/25", "to-yellow-500/25", "dark:from-stone-600/35", "dark:to-yellow-600/35",
    "from-pink-500/25", "to-pink-400/25", "dark:from-pink-600/35", "dark:to-pink-500/35",
    "from-lime-500/25", "to-sky-500/25", "dark:from-lime-600/35", "dark:to-sky-600/35",
    "from-amber-500/25", "to-sky-500/25", "dark:from-amber-600/35", "dark:to-sky-600/35",
    "from-blue-500/25", "to-yellow-500/25", "dark:from-blue-600/35", "dark:to-yellow-600/35",
    "from-purple-500/25", "to-sky-500/25", "dark:from-purple-600/35", "dark:to-sky-600/35",
    "from-stone-500/25", "to-sky-500/25", "dark:from-stone-600/35", "dark:to-sky-600/35",
    "from-red-500/25", "to-stone-500/25", "dark:from-red-600/35", "dark:to-stone-600/35",
    "from-blue-500/25", "to-pink-500/25", "dark:from-blue-600/35", "dark:to-pink-600/35",
    "from-purple-500/25", "to-purple-600/25", "dark:from-purple-600/35", "dark:to-purple-700/35",
    "from-slate-500/25", "to-pink-500/25", "dark:from-slate-600/35", "dark:to-pink-600/35",
    "from-red-500/25", "to-slate-500/25", "dark:from-red-600/35", "dark:to-slate-600/35",
    "from-blue-500/25", "to-slate-500/25", "dark:from-blue-600/35", "dark:to-slate-600/35",
    "from-green-500/25", "to-slate-500/25", "dark:from-green-600/35", "dark:to-slate-600/35",
    
    // All possible fallback dual-type combinations (18 types × 18 types)
    // From colors (primary type) - /25 opacity
    "from-amber-500/25", "from-red-500/25", "from-blue-500/25", "from-yellow-500/25", "from-green-500/25", "from-cyan-500/25",
    "from-purple-500/25", "from-sky-500/25", "from-pink-500/25", "from-lime-500/25", "from-stone-500/25", "from-indigo-500/25",
    "from-gray-500/25", "from-slate-500/25",
    // To colors (secondary type) - /25 opacity  
    "to-amber-500/25", "to-red-500/25", "to-blue-500/25", "to-yellow-500/25", "to-green-500/25", "to-cyan-500/25",
    "to-purple-500/25", "to-sky-500/25", "to-pink-500/25", "to-lime-500/25", "to-stone-500/25", "to-indigo-500/25",
    "to-gray-500/25", "to-slate-500/25",
    
    // From colors (primary type) - /20 opacity for cleaner look
    "from-amber-500/20", "from-red-500/20", "from-blue-500/20", "from-yellow-500/20", "from-green-500/20", "from-cyan-500/20",
    "from-purple-500/20", "from-sky-500/20", "from-pink-500/20", "from-lime-500/20", "from-stone-500/20", "from-indigo-500/20",
    "from-gray-500/20", "from-slate-500/20",
    // To colors (secondary type) - /20 opacity  
    "to-amber-500/20", "to-red-500/20", "to-blue-500/20", "to-yellow-500/20", "to-green-500/20", "to-cyan-500/20",
    "to-purple-500/20", "to-sky-500/20", "to-pink-500/20", "to-lime-500/20", "to-stone-500/20", "to-indigo-500/20",
    "to-gray-500/20", "to-slate-500/20",
    
    // From colors - /15 opacity for even lighter look
    "from-amber-500/15", "from-red-500/15", "from-blue-500/15", "from-yellow-500/15", "from-green-500/15", "from-cyan-500/15",
    "from-purple-500/15", "from-sky-500/15", "from-pink-500/15", "from-lime-500/15", "from-stone-500/15", "from-indigo-500/15",
    "from-gray-500/15", "from-slate-500/15",
    // To colors - /15 opacity  
    "to-amber-500/15", "to-red-500/15", "to-blue-500/15", "to-yellow-500/15", "to-green-500/15", "to-cyan-500/15",
    "to-purple-500/15", "to-sky-500/15", "to-pink-500/15", "to-lime-500/15", "to-stone-500/15", "to-indigo-500/15",
    "to-gray-500/15", "to-slate-500/15",
    
    // From colors - /10 opacity for very subtle look
    "from-amber-500/10", "from-red-500/10", "from-blue-500/10", "from-yellow-500/10", "from-green-500/10", "from-cyan-500/10",
    "from-purple-500/10", "from-sky-500/10", "from-pink-500/10", "from-lime-500/10", "from-stone-500/10", "from-indigo-500/10",
    "from-gray-500/10", "from-slate-500/10",
    // To colors - /10 opacity  
    "to-amber-500/10", "to-red-500/10", "to-blue-500/10", "to-yellow-500/10", "to-green-500/10", "to-cyan-500/10",
    "to-purple-500/10", "to-sky-500/10", "to-pink-500/10", "to-lime-500/10", "to-stone-500/10", "to-indigo-500/10",
    "to-gray-500/10", "to-slate-500/10",
    
    // From colors - /5 opacity for ultra subtle look
    "from-amber-500/5", "from-red-500/5", "from-blue-500/5", "from-yellow-500/5", "from-green-500/5", "from-cyan-500/5",
    "from-purple-500/5", "from-sky-500/5", "from-pink-500/5", "from-lime-500/5", "from-stone-500/5", "from-indigo-500/5",
    "from-gray-500/5", "from-slate-500/5",
    // To colors - /5 opacity  
    "to-amber-500/5", "to-red-500/5", "to-blue-500/5", "to-yellow-500/5", "to-green-500/5", "to-cyan-500/5",
    "to-purple-500/5", "to-sky-500/5", "to-pink-500/5", "to-lime-500/5", "to-stone-500/5", "to-indigo-500/5",
    "to-gray-500/5", "to-slate-500/5",
    
    // From colors - /40 opacity for ring effect
    "from-amber-500/40", "from-red-500/40", "from-blue-500/40", "from-yellow-500/40", "from-green-500/40", "from-cyan-500/40",
    "from-purple-500/40", "from-sky-500/40", "from-pink-500/40", "from-lime-500/40", "from-stone-500/40", "from-indigo-500/40",
    "from-gray-500/40", "from-slate-500/40",
    // To colors - /40 opacity  
    "to-amber-500/40", "to-red-500/40", "to-blue-500/40", "to-yellow-500/40", "to-green-500/40", "to-cyan-500/40",
    "to-purple-500/40", "to-sky-500/40", "to-pink-500/40", "to-lime-500/40", "to-stone-500/40", "to-indigo-500/40",
    "to-gray-500/40", "to-slate-500/40",
    
    // From colors - /60 opacity for outer ring
    "from-amber-500/60", "from-red-500/60", "from-blue-500/60", "from-yellow-500/60", "from-green-500/60", "from-cyan-500/60",
    "from-purple-500/60", "from-sky-500/60", "from-pink-500/60", "from-lime-500/60", "from-stone-500/60", "from-indigo-500/60",
    "from-gray-500/60", "from-slate-500/60",
    // To colors - /60 opacity  
    "to-amber-500/60", "to-red-500/60", "to-blue-500/60", "to-yellow-500/60", "to-green-500/60", "to-cyan-500/60",
    "to-purple-500/60", "to-sky-500/60", "to-pink-500/60", "to-lime-500/60", "to-stone-500/60", "to-indigo-500/60",
    "to-gray-500/60", "to-slate-500/60",
    
    // From colors - /90 opacity for very strong ring
    "from-amber-500/90", "from-red-500/90", "from-blue-500/90", "from-yellow-500/90", "from-green-500/90", "from-cyan-500/90",
    "from-purple-500/90", "from-sky-500/90", "from-pink-500/90", "from-lime-500/90", "from-stone-500/90", "from-indigo-500/90",
    "from-gray-500/90", "from-slate-500/90",
    // To colors - /90 opacity  
    "to-amber-500/90", "to-red-500/90", "to-blue-500/90", "to-yellow-500/90", "to-green-500/90", "to-cyan-500/90",
    "to-purple-500/90", "to-sky-500/90", "to-pink-500/90", "to-lime-500/90", "to-stone-500/90", "to-indigo-500/90",
    "to-gray-500/90", "to-slate-500/90",
    // Dark mode variants - /35 opacity
    "dark:from-amber-600/35", "dark:from-red-600/35", "dark:from-blue-600/35", "dark:from-yellow-600/35", "dark:from-green-600/35", "dark:from-cyan-600/35",
    "dark:from-purple-600/35", "dark:from-sky-600/35", "dark:from-pink-600/35", "dark:from-lime-600/35", "dark:from-stone-600/35", "dark:from-indigo-600/35",
    "dark:from-gray-600/35", "dark:from-slate-600/35",
    "dark:to-amber-600/35", "dark:to-red-600/35", "dark:to-blue-600/35", "dark:to-yellow-600/35", "dark:to-green-600/35", "dark:to-cyan-600/35",
    "dark:to-purple-600/35", "dark:to-sky-600/35", "dark:to-pink-600/35", "dark:to-lime-600/35", "dark:to-stone-600/35", "dark:to-indigo-600/35",
    "dark:to-gray-600/35", "dark:to-slate-600/35",
    
    // Dark mode variants - /30 opacity for cleaner look
    "dark:from-amber-600/30", "dark:from-red-600/30", "dark:from-blue-600/30", "dark:from-yellow-600/30", "dark:from-green-600/30", "dark:from-cyan-600/30",
    "dark:from-purple-600/30", "dark:from-sky-600/30", "dark:from-pink-600/30", "dark:from-lime-600/30", "dark:from-stone-600/30", "dark:from-indigo-600/30",
    "dark:from-gray-600/30", "dark:from-slate-600/30",
    "dark:to-amber-600/30", "dark:to-red-600/30", "dark:to-blue-600/30", "dark:to-yellow-600/30", "dark:to-green-600/30", "dark:to-cyan-600/30",
    "dark:to-purple-600/30", "dark:to-sky-600/30", "dark:to-pink-600/30", "dark:to-lime-600/30", "dark:to-stone-600/30", "dark:to-indigo-600/30",
    "dark:to-gray-600/30", "dark:to-slate-600/30",
    
    // Dark mode variants - /15 opacity for very subtle look
    "dark:from-amber-600/15", "dark:from-red-600/15", "dark:from-blue-600/15", "dark:from-yellow-600/15", "dark:from-green-600/15", "dark:from-cyan-600/15",
    "dark:from-purple-600/15", "dark:from-sky-600/15", "dark:from-pink-600/15", "dark:from-lime-600/15", "dark:from-stone-600/15", "dark:from-indigo-600/15",
    "dark:from-gray-600/15", "dark:from-slate-600/15",
    "dark:to-amber-600/15", "dark:to-red-600/15", "dark:to-blue-600/15", "dark:to-yellow-600/15", "dark:to-green-600/15", "dark:to-cyan-600/15",
    "dark:to-purple-600/15", "dark:to-sky-600/15", "dark:to-pink-600/15", "dark:to-lime-600/15", "dark:to-stone-600/15", "dark:to-indigo-600/15",
    "dark:to-gray-600/15", "dark:to-slate-600/15",
    
    // Dark mode variants - /25 opacity
    "dark:from-amber-600/25", "dark:from-red-600/25", "dark:from-blue-600/25", "dark:from-yellow-600/25", "dark:from-green-600/25", "dark:from-cyan-600/25",
    "dark:from-purple-600/25", "dark:from-sky-600/25", "dark:from-pink-600/25", "dark:from-lime-600/25", "dark:from-stone-600/25", "dark:from-indigo-600/25",
    "dark:from-gray-600/25", "dark:from-slate-600/25",
    "dark:to-amber-600/25", "dark:to-red-600/25", "dark:to-blue-600/25", "dark:to-yellow-600/25", "dark:to-green-600/25", "dark:to-cyan-600/25",
    "dark:to-purple-600/25", "dark:to-sky-600/25", "dark:to-pink-600/25", "dark:to-lime-600/25", "dark:to-stone-600/25", "dark:to-indigo-600/25",
    "dark:to-gray-600/25", "dark:to-slate-600/25",
    
    // Dark mode variants - /50 opacity for ring effect
    "dark:from-amber-600/50", "dark:from-red-600/50", "dark:from-blue-600/50", "dark:from-yellow-600/50", "dark:from-green-600/50", "dark:from-cyan-600/50",
    "dark:from-purple-600/50", "dark:from-sky-600/50", "dark:from-pink-600/50", "dark:from-lime-600/50", "dark:from-stone-600/50", "dark:from-indigo-600/50",
    "dark:from-gray-600/50", "dark:from-slate-600/50",
    "dark:to-amber-600/50", "dark:to-red-600/50", "dark:to-blue-600/50", "dark:to-yellow-600/50", "dark:to-green-600/50", "dark:to-cyan-600/50",
    "dark:to-purple-600/50", "dark:to-sky-600/50", "dark:to-pink-600/50", "dark:to-lime-600/50", "dark:to-stone-600/50", "dark:to-indigo-600/50",
    "dark:to-gray-600/50", "dark:to-slate-600/50",
    
    // Dark mode /70 for outer ring
    "dark:from-amber-600/70", "dark:from-red-600/70", "dark:from-blue-600/70", "dark:from-yellow-600/70", "dark:from-green-600/70", "dark:from-cyan-600/70",
    "dark:from-purple-600/70", "dark:from-sky-600/70", "dark:from-pink-600/70", "dark:from-lime-600/70", "dark:from-stone-600/70", "dark:from-indigo-600/70",
    "dark:from-gray-600/70", "dark:from-slate-600/70",
    "dark:to-amber-600/70", "dark:to-red-600/70", "dark:to-blue-600/70", "dark:to-yellow-600/70", "dark:to-green-600/70", "dark:to-cyan-600/70",
    "dark:to-purple-600/70", "dark:to-sky-600/70", "dark:to-pink-600/70", "dark:to-lime-600/70", "dark:to-stone-600/70", "dark:to-indigo-600/70",
    "dark:to-gray-600/70", "dark:to-slate-600/70",
    
    // Darker ring gradients with higher opacity
    // From colors - 600/70 (light mode)
    "from-amber-600/70", "from-red-600/70", "from-blue-600/70", "from-yellow-600/70", "from-green-600/70", "from-cyan-600/70",
    "from-purple-600/70", "from-sky-600/70", "from-pink-600/70", "from-lime-600/70", "from-stone-600/70", "from-indigo-600/70",
    "from-gray-600/70", "from-slate-600/70",
    // To colors - 600/70 and 700/70 (light mode)
    "to-amber-600/70", "to-red-600/70", "to-blue-600/70", "to-yellow-600/70", "to-green-600/70", "to-cyan-600/70",
    "to-purple-600/70", "to-sky-600/70", "to-pink-600/70", "to-lime-600/70", "to-stone-600/70", "to-indigo-600/70",
    "to-gray-600/70", "to-slate-600/70",
    "to-amber-700/70", "to-red-700/70", "to-blue-700/70", "to-yellow-700/70", "to-green-700/70", "to-cyan-700/70",
    "to-purple-700/70", "to-sky-700/70", "to-pink-700/70", "to-lime-700/70", "to-stone-700/70", "to-indigo-700/70",
    "to-gray-700/70", "to-slate-700/70",
    // Dark mode - 700/80 and 800/80
    "dark:from-amber-700/80", "dark:from-red-700/80", "dark:from-blue-700/80", "dark:from-yellow-700/80", "dark:from-green-700/80", "dark:from-cyan-700/80",
    "dark:from-purple-700/80", "dark:from-sky-700/80", "dark:from-pink-700/80", "dark:from-lime-700/80", "dark:from-stone-700/80", "dark:from-indigo-700/80",
    "dark:from-gray-700/80", "dark:from-slate-700/80",
    "dark:to-amber-700/80", "dark:to-red-700/80", "dark:to-blue-700/80", "dark:to-yellow-700/80", "dark:to-green-700/80", "dark:to-cyan-700/80",
    "dark:to-purple-700/80", "dark:to-sky-700/80", "dark:to-pink-700/80", "dark:to-lime-700/80", "dark:to-stone-700/80", "dark:to-indigo-700/80",
    "dark:to-gray-700/80", "dark:to-slate-700/80",
    "dark:to-amber-800/80", "dark:to-red-800/80", "dark:to-blue-800/80", "dark:to-yellow-800/80", "dark:to-green-800/80", "dark:to-cyan-800/80",
    "dark:to-purple-800/80", "dark:to-sky-800/80", "dark:to-pink-800/80", "dark:to-lime-800/80", "dark:to-stone-800/80", "dark:to-indigo-800/80",
    "dark:to-gray-800/80", "dark:to-slate-800/80",
  ],
  theme: {
    extend: {
      colors: {
        // Clean base colors
        'white': 'var(--white)',
        'off-white': 'var(--off-white)',
        'light-grey': 'var(--light-grey)',
        'mid-grey': 'var(--mid-grey)',
        'border-grey': 'var(--border-grey)',
        'text-grey': 'var(--text-grey)',
        'dark-text': 'var(--dark-text)',
        'charcoal': 'var(--charcoal)',
        'black': 'var(--black)',
        
        // Strategic Pokémon colors
        'pokemon-red': 'var(--pokemon-red)',
        'pokemon-blue': 'var(--pokemon-blue)',
        'pokemon-yellow': 'var(--pokemon-yellow)',
        'pokemon-green': 'var(--pokemon-green)',
        
        // Layout colors
        'page-bg': 'var(--page-bg)',
        'card-bg': 'var(--card-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'border-color': 'var(--border-color)',
        'navbar-scrolled': 'var(--navbar-scrolled)',
        'text-navbar': 'var(--text-navbar)',
        
        // Clean semantic colors
        primary: {
          DEFAULT: 'var(--pokemon-red)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--text-grey)',
          foreground: 'var(--dark-text)',
        },
        
        // Clean backgrounds
        'page-bg': 'var(--page-bg)',
        'card-bg': 'var(--card-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'border-color': 'var(--border-color)',
        
        // Component colors
        background: 'var(--page-bg)',
        card: {
          DEFAULT: 'var(--card-bg)',
          foreground: 'var(--dark-text)',
        },
        
        // Official Pokémon type colors (for type badges only)
        'poke-normal': '#A8A77A',
        'poke-fire': '#EE8130',
        'poke-water': '#6390F0',
        'poke-electric': '#F7D02C',
        'poke-grass': '#7AC74C',
        'poke-ice': '#96D9D6',
        'poke-fighting': '#C22E28',
        'poke-poison': '#A33EA1',
        'poke-ground': '#E2BF65',
        'poke-flying': '#A98FF3',
        'poke-psychic': '#F95587',
        'poke-bug': '#A6B91A',
        'poke-rock': '#B6A136',
        'poke-ghost': '#735797',
        'poke-dragon': '#6F35FC',
        'poke-dark': '#4A4A4A',
        'poke-steel': '#B7B7CE',
        'poke-fairy': '#D685AD',
      },
      fontFamily: {
        // Ensure these CSS variables are defined in globals.css
        // Tailwind will automatically append the OS-default fallbacks
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular'],
        'pokemon': ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        // Extend Tailwind's default scale or use your 'app-' prefixed ones
        // If 'app-' is your design system, ensure they are used consistently
        'app-sm': 'var(--radius-sm, 0.25rem)', // Fallback to a sensible default
        'app-md': 'var(--radius-md, 0.5rem)',
        'app-lg': 'var(--radius-lg, 0.75rem)',
        'app-xl': 'var(--radius-xl, 1rem)',
        'app-full': '9999px',
        // You can also override Tailwind's defaults if 'app-' IS your default scale
        // DEFAULT: 'var(--radius-md)',
        // sm: 'var(--radius-sm)',
        // lg: 'var(--radius-lg)',
        // etc.
      },
      boxShadow: {
        // Define shadows using your CSS variable for shadow color for themeability
        'app': '0 2px 4px 0 var(--color-shadow-default)', // Simplified name
        'app-md': '0 4px 8px 0 var(--color-shadow-default)', // Simplified name
        // You can still use Tailwind's 'sm', 'md', 'lg', 'xl', '2xl' which are quite good.
        // This extend block adds your custom ones.
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem', // Added for more granular control
          lg: '3rem', // Previous was 2rem, potentially increased
          xl: '4rem', // Added for wider screens
        },
        // screens: { ... } // Only override if container breakpoints need to differ from global
      },
      // Custom animations for our application
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        slideUp: 'slideUp 0.5s ease-in-out',
        scale: 'scale 0.5s ease-in-out',
        pulse: 'pulse 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        bounce: 'bounce 1s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
        strategy: 'class', // Recommended: add .form-input, .form-select etc.
                           // Or 'base' to style inputs globally (less control)
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    // Consider: require('@tailwindcss/container-queries'),
  ],
};
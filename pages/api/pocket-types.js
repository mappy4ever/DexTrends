// pages/api/pocket-types.js
export default function handler(req, res) {
  res.status(200).json([
    { id: "pock-card-001", name: "Pocket Pikachu", image: "/placeholder-card.png", types: ["Electric"], rarity: "Rare Holo V" },
    { id: "pock-card-002", name: "Pocket Charmander", image: null, types: ["Fire"], rarity: "Common" },
    { id: "pock-card-003", name: "Pocket Squirtle", image: "/placeholder-card.png", types: ["Water"], rarity: "Uncommon" },
    { id: "pock-card-004", name: "Pocket Bulbasaur", image: null, types: ["Grass", "Poison"], rarity: "Common" },
    { id: "pock-card-005", name: "Pocket Eevee", image: "/placeholder-card.png", types: ["Normal"], rarity: "Rare" }
  ]);
}

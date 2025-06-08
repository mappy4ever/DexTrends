// pages/api/pocket-expansions.js
export default function handler(req, res) {
  res.status(200).json([
    {
      id: "pockexp001",
      name: "Pocket Genesis",
      description: "The first wave of Pocket Pokémon cards.",
      logoUrl: "/placeholder-logo.png",
      releaseDate: "2024-01-15",
      cardCount: 60,
      featuredPokemon: [
        { id: "pock-card-001", imageUrl: "/placeholder-card.png", name: "Pocket Pikachu", rarity: "Rare Holo V" },
        { id: "pock-card-002", imageUrl: null, name: "Pocket Charmander", rarity: "Common" }
      ]
    },
    {
      id: "pockexp002",
      name: "Pocket Evolution",
      description: "Unlock new powers and evolutions.",
      logoUrl: null,
      releaseDate: "2024-04-01",
      cardCount: 70,
      featuredPokemon: [
        { id: "pock-card-006", imageUrl: "/placeholder-card.png", name: "Pocket Raichu", rarity: "Rare Holo VMAX" },
        { id: "pock-card-007", imageUrl: "/placeholder-card.png", name: "Pocket Charizard", rarity: "Ultra Rare" }
      ]
    }
  ]);
}

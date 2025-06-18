// pages/api/pocket-decks.js
export default function handler(req, res) {
  res.status(200).json([
    {
      id: "pockdeck001",
      name: "Lightning Spark",
      winRate: "78%",
      types: ["Electric"],
      description: "A fast and shocking deck for quick wins.",
      keyCards: [
        { id: "pock-card-001", image: "/placeholder-card.png", name: "Pocket Pikachu", count: 3 },
        { id: "pock-item001", image: "/placeholder-item.png", name: "Pocket Battery", count: 2 },
      ],
      strategy: "Overwhelm the opponent with speedy Electric types.",
      creator: "Sparky",
      dateCreated: "2024-02-20"
    },
    {
      id: "pockdeck002",
      name: "Aqua Guard",
      winRate: "65%",
      types: ["Water", "Grass"],
      description: "A defensive deck with strong healing capabilities.",
      keyCards: [
        { id: "pock-card-003", image: "/placeholder-card.png", name: "Pocket Squirtle", count: 2 },
        { id: "pock-card-004", image: null, name: "Pocket Bulbasaur", count: 2 },
        { id: "pock-item002", image: "/placeholder-item.png", name: "Pocket Shield", count: 1 },
      ],
      strategy: "Outlast your opponent and control the board.",
      creator: "Misty Green",
      dateCreated: "2024-03-10"
    }
  ]);
}

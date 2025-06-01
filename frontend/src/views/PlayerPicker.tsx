import { useEffect, useState } from "react";

type ApiPlayer = {
  id: number;
  name: string;
  position: string;
  ratingAverage: number;
  club: number;
  nation: number;
  // …otros campos si quieres
};

type Player = {
  id: number;
  name: string;
  position: string;
  imageId: number;
  score?: number;
  team?: number;
  country?: number;
};

type Props = {
  onSelect: (player: Player) => void;
  position: string;
  usedIds: number[];
};

export default function PlayerPicker({ onSelect, position, usedIds }: Props) {
  const [players, setPlayers] = useState<ApiPlayer[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch(`/api/players/random/${position}`);
      const data = await res.json();
      setPlayers(data);
    };
    fetchPlayers();
  }, [position]);
  
  const availablePlayers = players.filter((p) => !usedIds.includes(p.id));

  const handleClick = (p: ApiPlayer) => {
    const mappedPlayer: Player = {
      id: p.id,
      name: p.name,
      position: p.position,
      imageId: p.id,
      score: p.ratingAverage ?? 0,
      team: p.club ?? 0,
      country: p.nation ?? 0,
    };
    onSelect(mappedPlayer);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Elige un {position}</h2>
      <div className="grid grid-cols-5 gap-4">
        {availablePlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => handleClick(player)}
            className="flex flex-col items-center border p-2 rounded hover:bg-gray-100"
          >
            <img
              src={`/api/players/${player.id}/image`}
              alt={player.name}
              style={{ width: "64px", height: "64px", objectFit: "contain" }}
            />
            <span className="text-xs mt-2 text-center">{player.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

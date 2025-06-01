import { useEffect, useState } from "react";
import "../styles/PlayerPicker.css";

type ApiPlayer = {
  id: number;
  name: string;
  position: string;
  ratingAverage: number;
  club: number;
  nation: number;
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
  index: number;
  formationPositions: string[];
};

export default function PlayerPicker({
  onSelect,
  position,
  usedIds,
  index,
  formationPositions,
}: Props) {
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

  const positionLabels: Record<string, string> = {
    GK: "portero",
    LB: "lateral izquierdo",
    CB: "central",
    RB: "lateral derecho",
    CM: "centrocampista",
    CDM: "centrocampista defensivo",
    CAM: "mediapunta",
    LW: "extremo izquierdo",
    RW: "extremo derecho",
    ST: "delantero",
    CF: "segunda punta",
    LM: "interior izquierdo",
    RM: "interior derecho",
    LWB: "carrilero izquierdo",
    RWB: "carrilero derecho",
    LCB: "central izquierdo",
    RCB: "central derecho",
  };

  const countSamePositions = formationPositions.reduce(
    (acc, pos, idx) => {
      if (pos === position) {
        acc.total++;
        if (idx < index) acc.before++;
      }
      return acc;
    },
    { total: 0, before: 0 }
  );

  const positionLabel = positionLabels[position] || position.toLowerCase();
  const positionText =
    countSamePositions.total === 1
      ? `Elige un ${positionLabel}`
      : countSamePositions.before === 0
      ? `Elige un ${positionLabel}`
      : `Elige otro ${positionLabel}`;

  return (
    <div className="player-picker-container">
      <h2 className="player-picker-title">{positionText}</h2>
      <div className="player-grid">
        {availablePlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => handleClick(player)}
            className="player-button"
          >
            <img
              src={`/api/players/${player.id}/image`}
              alt={player.name}
              loading="lazy"
              width={128}
              height={128}
            />
            <span className="player-name">{player.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

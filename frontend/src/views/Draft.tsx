import { useState } from "react";
import { useNavigate } from "npm:react-router";
import PlayerPicker from "../views/PlayerPicker";
import DraftGrid from "../views/DraftGrid";
import "../styles/Draft.css";

type Player = {
  id: number;
  name: string;
  position: string;
  imageId: number;
  score?: number;
  team?: number;
  country?: number;
};

const compatiblePositions: Record<string, string[]> = {
  GK: ["GK"],
  LB: ["LB", "LWB"],
  RB: ["RB", "RWB"],
  CB: ["CB", "LCB", "RCB"],
  CM: ["CM", "CDM", "CAM", "LM", "RM"],
  LW: ["LW", "LM"],
  RW: ["RW", "RM"],
  ST: ["ST", "CF", "LF", "RF"],
};

const formationPositions = [
  "GK",
  "LB",
  "CB",
  "CB",
  "RB",
  "CM",
  "CM",
  "CM",
  "LW",
  "ST",
  "RW",
];

export default function Draft({ user }: { user: any }) {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<(Player | null)[]>(Array(11).fill(null));
  const [loading, setLoading] = useState(false);

  const currentIndex = slots.findIndex((slot) => slot === null);
  const currentPosition = formationPositions[currentIndex];

  const handlePlayerSelect = (player: Player) => {
    const isCompatible = compatiblePositions[currentPosition]?.includes(
      player.position
    );

    if (!isCompatible) {
      alert(
        `El jugador no es compatible con la posición actual: ${currentPosition}`
      );
      return;
    }

    const updated = [...slots];
    updated[currentIndex] = player;
    setSlots(updated);
  };

  function calculateScore(slots: (Player | null)[]): number {
    const players = slots.filter((p): p is Player => p !== null);
    if (players.length === 0) return 0;

    const averageScore =
      players.reduce((acc, p) => acc + (p.score ?? 0), 0) / players.length;

    const teamCounts: Record<number, number> = {};
    players.forEach((p) => {
      if (p.team) teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
    });
    const teamBonus = Object.values(teamCounts).reduce(
      (acc, count) => acc + (count > 1 ? count * 2 : 0),
      0
    );

    const countryCounts: Record<number, number> = {};
    players.forEach((p) => {
      if (p.country)
        countryCounts[p.country] = (countryCounts[p.country] || 0) + 1;
    });
    const countryBonus = Object.values(countryCounts).reduce(
      (acc, count) => acc + (count > 1 ? count * 2 : 0),
      0
    );

    return averageScore + teamBonus + countryBonus;
  }

  const updateCoins = async (coinsToAdd: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/users/${user.username}/coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: coinsToAdd }),
      });
      if (!response.ok) {
        throw new Error("Error actualizando monedas");
      }
      const data = await response.json();
      console.log("Monedas actualizadas:", data);
    } catch (error) {
      console.error("Error al actualizar monedas:", error);
      alert("Hubo un error al actualizar tus monedas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const exitDraft = async () => {
    const totalScore = calculateScore(slots);
    const coinsToAdd = Math.round(totalScore) * 100;
    await updateCoins(coinsToAdd);

    setSlots(Array(11).fill(null));
    navigate("/");
  };

  if (currentIndex !== -1) {
    const usedIds = slots
      .filter((p): p is Player => p !== null)
      .map((p) => p.id);

    return (
      <PlayerPicker
        onSelect={handlePlayerSelect}
        position={currentPosition}
        usedIds={usedIds}
        index={currentIndex}
        formationPositions={formationPositions}
      />
    );
  }

  const totalScore = calculateScore(slots);
  const coinsToAdd = Math.round(totalScore) * 100;

  return (
    <div className="draft-container">
      <div className="draft-card">
        <div className="draft-header">
          <div className="score">Monedas ganadas: {coinsToAdd}</div>
          <div className="score">Puntuación total: {totalScore.toFixed(1)}</div>
        </div>

        <h3 className="section-title">Plantilla completa:</h3>
        <DraftGrid slots={slots} formationPositions={formationPositions} />

        <div className="action">
          <button
            onClick={exitDraft}
            disabled={loading}
            className={`exit-btn ${loading ? "disabled" : ""}`}
          >
            {loading ? "Actualizando monedas..." : "Volver al menú principal"}
          </button>
        </div>
      </div>
    </div>
  );
}

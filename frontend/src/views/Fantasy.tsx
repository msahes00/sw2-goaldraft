import { useState, useEffect } from "react";

type Player = {
  id: number;
  name: string;
  image: string;
};

type Team = {
  name: string;
  points: number;
};

type PlayerScore = {
  [playerId: number]: number[];
};

const NUM_TEAMS = 9;
const TEAM_SIZE = 11;
const MAX_SQUAD_SIZE = 18;
const INITIAL_MONEY = 0;
const PLAYER_PRICE = 1_000_000;
const MAX_MATCHDAYS = 18;

type GameState = {
  matchday: number;
  userTeam: Team;
  userPlayers: Player[];
  starters: number[];
  simulatedTeams: Team[];
  simulatedTeamsHistory: number[][];
  scores: PlayerScore;
  money: number;
  market: Player[];
  lastUserMatchdayPoints: number[];
};

function getRandomPlayers(count: number, pool: Player[], excludeIds: number[] = []): Player[] {
  const filteredPool = pool.filter(p => !excludeIds.includes(p.id));
  return [...filteredPool].sort(() => Math.random() - 0.5).slice(0, count);
}

function simulateAllPlayerScores(players: Player[], matchdays: number): PlayerScore {
  const scores: PlayerScore = {};
  players.forEach((player) => {
    scores[player.id] = [];
    for (let i = 0; i < matchdays; i++) {
      if (i === 0) {
        scores[player.id].push(Math.floor(Math.random() * 26) - 5);
      } else {
        const prevScores = scores[player.id];
        const avg =
          prevScores.length > 0
            ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length
            : 7.5;
        let val =
          Math.round(
            avg +
              (Math.random() - 0.5) * 8 +
              (Math.random() - 0.5) * 4
          );
        val = Math.max(-5, Math.min(20, val));
        scores[player.id].push(val);
      }
    }
  });
  return scores;
}

export default function Fantasy() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [state, setState] = useState<GameState | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"clasificacion" | "equipo" | "mercado">("clasificacion");

  useEffect(() => {
    fetch("/api/players")
      .then(res => res.json())
      .then(async (ids: { id: number }[]) => {
        const players: Player[] = await Promise.all(
          ids.map(async ({ id }) => {
            const nameRes = await fetch(`/api/players/${id}`);
            const { name } = await nameRes.json();
            const imgRes = await fetch(`/api/players/${id}/image`);
            const blob = await imgRes.blob();
            const image = URL.createObjectURL(blob);
            return { id, name, image };
          })
        );
        setAllPlayers(players);
        setLoadingPlayers(false);
      });
  }, []);

  useEffect(() => {
    if (!loadingPlayers && allPlayers.length > 0 && !state) {
      const simulatedTeams = Array.from({ length: NUM_TEAMS }, (_, i) => ({
        name: `Equipo ${i + 1}`,
        points: 0,
      }));
      const simulatedTeamsHistory = Array.from({ length: NUM_TEAMS }, () => [0]);
      const userPlayers = getRandomPlayers(TEAM_SIZE, allPlayers);
      const starters = userPlayers.map(p => p.id);
      const initialScores = simulateAllPlayerScores(allPlayers, 0);

      setState({
        matchday: 0,
        userTeam: { name: "Mi Equipo", points: 0 },
        simulatedTeams,
        simulatedTeamsHistory,
        userPlayers,
        starters,
        scores: initialScores,
        money: INITIAL_MONEY,
        market: getRandomPlayers(10, allPlayers, userPlayers.map(p => p.id)), // <-- aquí
        lastUserMatchdayPoints: [],
      });
    }
  }, [loadingPlayers, allPlayers, state]);

  if (loadingPlayers || !state) {
    return <div>Cargando jugadores...</div>;
  }

  const resetGame = () => {
    const simulatedTeams = Array.from({ length: NUM_TEAMS }, (_, i) => ({
      name: `Equipo ${i + 1}`,
      points: 0,
    }));
    const simulatedTeamsHistory = Array.from({ length: NUM_TEAMS }, () => [0]);

    const userPlayers = getRandomPlayers(TEAM_SIZE, allPlayers);
    const starters = userPlayers.map(p => p.id);

    const initialScores = simulateAllPlayerScores(allPlayers, 0);

    setState({
      matchday: 0,
      userTeam: { name: "Mi Equipo", points: 0 },
      simulatedTeams,
      simulatedTeamsHistory,
      userPlayers,
      starters,
      scores: initialScores,
      money: INITIAL_MONEY,
      market: getRandomPlayers(10, allPlayers, userPlayers.map(p => p.id)),
      lastUserMatchdayPoints: [],
    });
  };

  const buyPlayer = (player: Player) => {
    const average =
      state.scores[player.id]?.reduce((a, b) => a + b, 0) /
        state.scores[player.id]?.length || 1;

    const price = Math.round(Math.max(PLAYER_PRICE, PLAYER_PRICE * average));

    if (state.money < price) {
      setInfoMessage("No tienes suficiente dinero para fichar a este jugador.");
      return;
    }
    if (
      state.userPlayers.length >= MAX_SQUAD_SIZE ||
      state.userPlayers.some(p => p.id === player.id)
    ) {
      return;
    }

    setState((prev) => ({
      ...prev,
      money: Math.round(prev.money - price),
      userPlayers: [...prev.userPlayers, player],
      market: getRandomPlayers(
        10,
        allPlayers,
        [...prev.userPlayers.map(p => p.id), player.id]
      ),
    }));
  };

  const simulateMatchday = () => {
    if (state.starters.length !== TEAM_SIZE) {
      setShowConfirm(true);
      return;
    }

    doSimulateMatchday();
  };

  const doSimulateMatchday = (forceZeroPoints = false) => {
    if (state.matchday >= MAX_MATCHDAYS) {
      resetGame();
      return;
    }

    const newScores: PlayerScore = { ...state.scores };
    allPlayers.forEach((player) => {
      const prevScores = newScores[player.id] || [];
      let points;
      if (prevScores.length === 0) {
        points = Math.floor(Math.random() * 26) - 5;
      } else {
        const avg =
          prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
        points =
          Math.round(
            avg +
              (Math.random() - 0.5) * 8 +
              (Math.random() - 0.5) * 4
          );
        points = Math.max(-5, Math.min(20, points));
      }
      if (!newScores[player.id]) newScores[player.id] = [];
      newScores[player.id].push(points);
    });

    let userPoints = 0;
    if (!forceZeroPoints) {
      state.starters.forEach((id) => {
        const lastScore = newScores[id][newScores[id].length - 1];
        userPoints += lastScore;
      });
    }

    const updatedSimulatedTeams = state.simulatedTeams.map((team) => ({
      ...team,
      points:
        team.points +
        (Math.floor(Math.random() * ((20 * TEAM_SIZE) - (11 * -5))) + 11 * -5),
    }));

    const updatedSimulatedTeamsHistory = state.simulatedTeamsHistory.map((history, idx) => [
      ...history,
      updatedSimulatedTeams[idx].points,
    ]);

    const updatedMarket = getRandomPlayers(
      10,
      allPlayers,
      state.userPlayers.map(p => p.id)
    );

    setState((prev) => {
      const userPlayerIds = prev.userPlayers.map(p => p.id);
      return {
        ...prev,
        matchday: prev.matchday + 1,
        userTeam: {
          ...prev.userTeam,
          points: prev.userTeam.points + userPoints,
        },
        simulatedTeams: updatedSimulatedTeams,
        simulatedTeamsHistory: updatedSimulatedTeamsHistory,
        scores: newScores,
        market: getRandomPlayers(10, allPlayers, userPlayerIds),
        money: Math.round(prev.money + userPoints * 100000),
        lastUserMatchdayPoints: [
          ...(prev.lastUserMatchdayPoints || []),
          userPoints,
        ],
      };
    });
    setShowConfirm(false);
  };

  const sellPlayer = (id: number) => {
    const player = state.userPlayers.find((p) => p.id === id);
    if (!player) return;

    const average =
      state.scores[player.id]?.reduce((a, b) => a + b, 0) /
        state.scores[player.id]?.length || 1;

    const price = Math.round(Math.max(PLAYER_PRICE, PLAYER_PRICE * average));
    const newMoney = state.money + price;

    const newUserPlayers = state.userPlayers.filter((p) => p.id !== id);

    setState((prev) => ({
      ...prev,
      money: Math.round(newMoney),
      userPlayers: newUserPlayers,
      starters: prev.starters.filter((starterId) => starterId !== id),
      market: getRandomPlayers(10, allPlayers, newUserPlayers.map(p => p.id)), // <-- aquí
    }));
  };

  const makeStarter = (id: number) => {
    if (
      state.starters.length >= TEAM_SIZE ||
      state.starters.includes(id)
    )
      return;
    setState((prev) => ({
      ...prev,
      starters: [...prev.starters, id],
    }));
  };

  const makeSub = (id: number) => {
    if (!state.starters.includes(id)) return;
    setState((prev) => ({
      ...prev,
      starters: prev.starters.filter((starterId) => starterId !== id),
    }));
  };

  const getLastScore = (id: number) =>
    state.scores[id]?.[state.scores[id].length - 1] ?? "–";

  const getAverageScore = (id: number) =>
    state.scores[id]?.length
      ? (
          state.scores[id].reduce((a, b) => a + b, 0) /
          state.scores[id].length
        ).toFixed(1)
      : "–";

  return (
    <div className="fantasy-container">
      <style>{`
        .fantasy-container {
          font-family: 'Segoe UI', sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 1rem;
          color: #1e1e2f;
        }

        h1, h2, h3 {
          color: #0a3d62;
          margin-bottom: 0.5rem;
        }

        button {
          background: #0a3d62;
          color: white;
          border: none;
          padding: 0.4rem 0.75rem;
          margin-left: 0.25rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          align-items: center;
        }

        .tabs button.active {
          background: #1b9cfc;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          background: #f1f2f6;
          margin-bottom: 0.5rem;
          padding: 0.75rem;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
        }

        .player-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .player-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .money {
          font-weight: bold;
          color: green;
          margin-bottom: 0.5rem;
        }
      `}</style>

      <h1>Fantasy</h1>

      <div className="tabs">
        <button onClick={() => setTab("clasificacion")} className={tab === "clasificacion" ? "active" : ""}>Clasificación</button>
        <button onClick={() => setTab("equipo")} className={tab === "equipo" ? "active" : ""}>Equipo</button>
        <button onClick={() => setTab("mercado")} className={tab === "mercado" ? "active" : ""}>Mercado</button>
        <button
          onClick={simulateMatchday}
        >
          {state.matchday >= MAX_MATCHDAYS
            ? "Reiniciar"
            : `Simular Jornada ${state.matchday + 1}`}
        </button>
      </div>

      {}
      {infoMessage && (
        <div
          style={{
            background: "#fffbe6",
            border: "1px solid #e1b800",
            color: "#a67c00",
            borderRadius: "8px",
            padding: "1rem",
            margin: "1rem 0",
            textAlign: "center",
          }}
        >
          {infoMessage}
          <button
            style={{
              marginLeft: "1rem",
              background: "#0a3d62",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "0.2rem 0.7rem",
              cursor: "pointer",
            }}
            onClick={() => setInfoMessage(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      {showConfirm && (
        <div
          style={{
            background: "#fff",
            border: "2px solid #0a3d62",
            borderRadius: "8px",
            padding: "1.5rem",
            maxWidth: "400px",
            margin: "2rem auto",
            boxShadow: "0 2px 12px #0002",
            textAlign: "center",
            zIndex: 100,
          }}
        >
          <p>
            No tienes 11 titulares. ¿Estás seguro de que quieres simular la jornada? <br />
            <b>Vas a recibir 0 puntos.</b>
          </p>
          <button
            style={{ marginRight: "1rem", background: "#0a3d62" }}
            onClick={() => doSimulateMatchday(true)}
          >
            Sí, simular jornada
          </button>
          <button
            style={{ background: "#990000" }}
            onClick={() => setShowConfirm(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      {tab === "clasificacion" && (
        <div>
          <h2>Clasificación</h2>
          <ul>
            {[...state.simulatedTeams, state.userTeam]
              .sort((a, b) => b.points - a.points)
              .map((team, i) => {
                let lastPoints = 0;
                if (team.name === state.userTeam.name) {
                  if (state.matchday > 0 && state.lastUserMatchdayPoints.length > 0) {
                    lastPoints = state.lastUserMatchdayPoints[state.lastUserMatchdayPoints.length - 1];
                  }
                } else {
                  const teamIndex = state.simulatedTeams.findIndex(t => t.name === team.name);
                  if (teamIndex !== -1 && state.matchday > 0) {
                    const history = state.simulatedTeamsHistory[teamIndex];
                    lastPoints = history[history.length - 1] - history[history.length - 2];
                  }
                }
                return (
                  <li key={i}>
                    <div className="player-info">
                      <span>{i + 1}. {team.name}</span>
                      <span>{team.points} pts (Última jornada: {lastPoints})</span>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {tab === "equipo" && (
        <div>
          <h2>Mi Equipo</h2>
          <p className="money">Dinero: {state.money.toLocaleString()} €</p>

          <h3>Titulares ({state.starters.length}/11)</h3>
          <ul>
            {state.starters.map((id) => {
              const p = state.userPlayers.find(pl => pl.id === id);
              if (!p) return null;
              const avg = getAverageScore(p.id);
              const last = getLastScore(p.id);
              const price = Math.max(PLAYER_PRICE, PLAYER_PRICE * (parseFloat(avg) || 1));
              return (
                <li key={p.id}>
                  <div className="player-info" style={{ flexDirection: "column", alignItems: "center" }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        marginBottom: 8,
                        objectFit: "cover"
                      }}
                    />
                    <span style={{ fontWeight: "bold", marginBottom: 4 }}>{p.name}</span>
                    <span style={{ marginBottom: 8 }}>
                      Media: {avg} | Última: {last} | Precio: {price.toFixed(0)} €
                    </span>
                    <div className="player-actions" style={{ justifyContent: "center" }}>
                      <button onClick={() => makeSub(p.id)}>Mandar al banquillo</button>
                      <button onClick={() => sellPlayer(p.id)}>Vender</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <h3>Suplentes ({state.userPlayers.length - state.starters.length}/{MAX_SQUAD_SIZE - TEAM_SIZE})</h3>
          <ul>
            {state.userPlayers
              .filter((p) => !state.starters.includes(p.id))
              .map((p) => {
                const avg = getAverageScore(p.id);
                const last = getLastScore(p.id);
                const price = Math.max(PLAYER_PRICE, PLAYER_PRICE * (parseFloat(avg) || 1));
                return (
                  <li key={p.id}>
                    <div className="player-info" style={{ flexDirection: "column", alignItems: "center" }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          marginBottom: 8,
                          objectFit: "cover"
                        }}
                      />
                      <span style={{ fontWeight: "bold", marginBottom: 4 }}>{p.name}</span>
                      <span style={{ marginBottom: 8 }}>
                        Media: {avg} | Última: {last} | Precio: {price.toFixed(0)} €
                      </span>
                      <div className="player-actions" style={{ justifyContent: "center" }}>
                        <button
                          onClick={() => makeStarter(p.id)}
                          disabled={state.starters.length >= TEAM_SIZE}
                        >
                          Hacer titular
                        </button>
                        <button onClick={() => sellPlayer(p.id)}>Vender</button>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {tab === "mercado" && (
        <div>
          <h2>Mercado</h2>
          <p className="money">Dinero: {state.money.toLocaleString()} €</p>
          <ul>
            {state.market.map((p) => {
              const avg = getAverageScore(p.id);
              const last = getLastScore(p.id);
              const price = Math.max(PLAYER_PRICE, PLAYER_PRICE * (parseFloat(avg) || 1));
              return (
                <li key={p.id}>
                  <div className="player-info">
                    <span>{p.name}</span>
                    <span>Media: {avg} | Última: {last} | Precio: {price.toFixed(0)} €</span>
                  </div>
                  <div className="player-actions">
                    <button onClick={() => buyPlayer(p)}>Fichar</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
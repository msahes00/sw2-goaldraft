import { useState, useEffect } from "react";

type Player = {
  id: number;
  name: string;
  image: string;
  position: "Portero" | "Defensa" | "Centrocampista" | "Delantero";
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

function getPrizeByPosition(pos: number) {
  if (pos === 1) return 10000;
  if (pos === 2) return 9000;
  if (pos === 3) return 8000;
  if (pos === 4) return 7000;
  if (pos === 5) return 6000;
  if (pos === 6) return 5000;
  if (pos === 7) return 4000;
  if (pos === 8) return 3000;
  if (pos === 9) return 2000;
  return 0;
}

function mapPosition(pos: string): "Portero" | "Defensa" | "Centrocampista" | "Delantero" {
  if (pos === "GK") return "Portero";
  if (["CB", "LB", "RB", "LWB", "RWB"].includes(pos)) return "Defensa";
  if (["CDM", "CM", "LM", "RM", "CAM"].includes(pos)) return "Centrocampista";
  if (["ST", "CF", "LF", "RF", "LW", "RW"].includes(pos)) return "Delantero";
  return "Centrocampista";
}

const POSITION_ORDER = {
  "Portero": 0,
  "Defensa": 1,
  "Centrocampista": 2,
  "Delantero": 3,
};

export default function Fantasy({ loggedUser, setLoggedUser }) {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [state, setState] = useState<GameState | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<"clasificacion" | "equipo" | "mercado">("clasificacion");
  const [endMessage, setEndMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/players")
      .then(res => res.json())
      .then(async (ids: { id: number }[]) => {
        const players: Player[] = await Promise.all(
          ids.map(async ({ id }) => {
            const nameRes = await fetch(`/api/players/${id}`);
            const { name, position } = await nameRes.json();
            const imgRes = await fetch(`/api/players/${id}/image`);
            const blob = await imgRes.blob();
            const image = URL.createObjectURL(blob);
            return { id, name, image, position: mapPosition(position) };
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
      const userPlayers = getValidInitialTeam(allPlayers);
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

    const userPlayers = getValidInitialTeam(allPlayers);
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
      market: prev.market.filter(p => p.id !== player.id),
    }));
  };

  const validateLineup = (starters: Player[]) => {
    const counts = { Portero: 0, Defensa: 0, Centrocampista: 0, Delantero: 0 };
    starters.forEach(p => counts[p.position]++);
    const errors: string[] = [];
    if (counts.Portero !== 1) errors.push("Debes tener exactamente 1 portero.");
    if (counts.Defensa < 3 || counts.Defensa > 5) errors.push("Debes tener entre 3 y 5 defensas.");
    if (counts.Centrocampista < 3 || counts.Centrocampista > 5) errors.push("Debes tener entre 3 y 5 centrocampistas.");
    if (counts.Delantero < 1 || counts.Delantero > 3) errors.push("Debes tener entre 1 y 3 delanteros.");
    return errors;
  };

  const simulateMatchday = () => {
    const startersPlayers = state.starters
      .map((id) => state.userPlayers.find(pl => pl.id === id))
      .filter(Boolean) as Player[];

    const errors = validateLineup(startersPlayers);

    if (state.starters.length !== TEAM_SIZE) {
      setShowConfirm(true);
      setInfoMessage(null);
      return;
    }

    if (errors.length > 0) {
      setShowConfirm(true);
      setInfoMessage(
        `Tu alineación no cumple las condiciones: ${errors.join(" ")}`
      );
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
      const newMatchday = prev.matchday + 1;

      if (newMatchday === MAX_MATCHDAYS) {
        const allTeams = [...updatedSimulatedTeams, {
          ...prev.userTeam,
          points: prev.userTeam.points + userPoints,
          name: prev.userTeam.name,
        }];
        allTeams.sort((a, b) => b.points - a.points);
        const position = allTeams.findIndex(t => t.name === prev.userTeam.name) + 1;
        const prize = getPrizeByPosition(position);

        setEndMessage(
          `¡El Fantasy ha terminado! Has quedado en la posición ${position} y has ganado ${prize} monedas.`
        );

        if (loggedUser?.username && prize > 0) {
          fetch(`/users/${loggedUser.username}/coins`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ coins: prize }),
          })
            .then(res => res.json())
            .then(data => {
              if (setLoggedUser) {
                setLoggedUser((user) => ({ ...user, coins: data.coins }));
              }
            });
        }
      }

      return {
        ...prev,
        matchday: newMatchday,
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

  function getValidInitialTeam(pool: Player[]): Player[] {
    const posiciones: ("Portero" | "Defensa" | "Centrocampista" | "Delantero")[] = ["Portero"];
    let defensas = 3 + Math.floor(Math.random() * 3);
    let centrocampistas = 3 + Math.floor(Math.random() * 3);
    let delanteros = 11 - (1 + defensas + centrocampistas);

    if (delanteros < 1) {
      if (defensas > 3) {
        defensas--;
        delanteros++;
      } else if (centrocampistas > 3) {
        centrocampistas--;
        delanteros++;
      }
    }
    if (delanteros > 3) {
      if (defensas > 3) {
        defensas += 3 - delanteros;
        delanteros = 3;
      } else if (centrocampistas > 3) {
        centrocampistas += 3 - delanteros;
        delanteros = 3;
      } else {
        delanteros = 3;
      }
    }

    posiciones.push(...Array(defensas).fill("Defensa"));
    posiciones.push(...Array(centrocampistas).fill("Centrocampista"));
    posiciones.push(...Array(delanteros).fill("Delantero"));

    for (let i = posiciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posiciones[i], posiciones[j]] = [posiciones[j], posiciones[i]];
    }

    const disponibles = {
      Portero: pool.filter(p => p.position === "Portero"),
      Defensa: pool.filter(p => p.position === "Defensa"),
      Centrocampista: pool.filter(p => p.position === "Centrocampista"),
      Delantero: pool.filter(p => p.position === "Delantero"),
    };

    const pickRandom = (arr: Player[]) => {
      const idx = Math.floor(Math.random() * arr.length);
      return arr.splice(idx, 1)[0];
    };

    const equipo: Player[] = [];
    for (const pos of posiciones) {
      if (disponibles[pos].length === 0) {
        break;
      }
      equipo.push(pickRandom(disponibles[pos]));
    }

    if (equipo.length < 11) return [];

    return equipo;
  }

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
            {infoMessage
              ? infoMessage
              : "No tienes 11 titulares. ¿Estás seguro de que quieres simular la jornada? "}
            <br />
            <b>Vas a recibir 0 puntos.</b>
          </p>
          <button
            style={{ marginRight: "1rem", background: "#0a3d62" }}
            onClick={() => {
              setInfoMessage(null);
              doSimulateMatchday(true);
            }}
          >
            Sí, simular jornada
          </button>
          <button
            style={{ background: "#990000" }}
            onClick={() => {
              setShowConfirm(false);
              setInfoMessage(null);
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {endMessage && (
        <div
          style={{
            background: "#e6ffe6",
            border: "2px solid #009900",
            borderRadius: "8px",
            padding: "1.5rem",
            maxWidth: "400px",
            margin: "2rem auto",
            boxShadow: "0 2px 12px #0002",
            textAlign: "center",
            zIndex: 100,
          }}
        >
          <p>{endMessage}</p>
          <button
            style={{ background: "#0a3d62", color: "white", marginTop: "1rem" }}
            onClick={() => setEndMessage(null)}
          >
            Cerrar
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
            {state.starters
              .map((id) => state.userPlayers.find(pl => pl.id === id))
              .filter(Boolean)
              .sort((a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position])
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
                      <span style={{ marginBottom: 4, color: "#0a3d62" }}>
                        {p.position}
                      </span>
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
              .sort((a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position])
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
                      <span style={{ marginBottom: 4, color: "#0a3d62" }}>
                        {p.position}
                      </span>
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
            {state.market
              .sort((a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position])
              .map((p) => {
                const avg = getAverageScore(p.id);
                const last = getLastScore(p.id);
                const price = Math.max(PLAYER_PRICE, PLAYER_PRICE * (parseFloat(avg) || 1));
                return (
                  <li key={p.id}>
                    <div className="player-info">
                      <span>
                        {p.name} <span style={{ color: "#0a3d62", fontWeight: "bold" }}>({p.position})</span>
                      </span>
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
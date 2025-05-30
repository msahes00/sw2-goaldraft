import { useState, useEffect } from "react";

type Player = {
  id: number;
  name: string;
  imageId: number;
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
const MAX_SQUAD_SIZE = 18; // Nuevo máximo de plantilla
const INITIAL_MONEY = 0;
const PLAYER_PRICE = 1_000_000;
const MAX_MATCHDAYS = 18;

// Cambia el tipo GameState para añadir titulares y suplentes
type GameState = {
  matchday: number;
  userTeam: Team;
  userPlayers: Player[];
  starters: number[];
  simulatedTeams: Team[];
  simulatedTeamsHistory: number[][]; // <-- Añade esto
  scores: PlayerScore;
  money: number;
  market: Player[];
};

function getRandomPlayers(count: number, pool: Player[]): Player[] {
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

function generateFakePlayers(): Player[] {
  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Jugador ${i + 1}`,
    imageId: i + 1,
  }));
}

function simulateAllPlayerScores(players: Player[], matchdays: number): PlayerScore {
  const scores: PlayerScore = {};
  players.forEach((player) => {
    scores[player.id] = [];
    for (let i = 0; i < matchdays; i++) {
      if (i === 0) {
        // Primera jornada: aleatorio puro entre -5 y 20
        scores[player.id].push(Math.floor(Math.random() * 26) - 5);
      } else {
        // A partir de la segunda jornada: más probabilidad de puntuar cerca de la media
        const prevScores = scores[player.id];
        const avg =
          prevScores.length > 0
            ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length
            : 7.5; // Media de -5 a 20
        // Genera una puntuación normal alrededor de la media anterior
        let val =
          Math.round(
            avg +
              (Math.random() - 0.5) * 8 + // Desviación pequeña
              (Math.random() - 0.5) * 4 // Un poco más de aleatoriedad
          );
        // Limita entre -5 y 20
        val = Math.max(-5, Math.min(20, val));
        scores[player.id].push(val);
      }
    }
  });
  return scores;
}

export default function Fantasy() {
  const allPlayers = generateFakePlayers();

  const [tab, setTab] = useState<"clasificacion" | "equipo" | "mercado">("clasificacion");
  const [state, setState] = useState<GameState>(() => {
    const simulatedTeams = Array.from({ length: NUM_TEAMS }, (_, i) => ({
      name: `Equipo ${i + 1}`,
      points: 0,
    }));
    const simulatedTeamsHistory = Array.from({ length: NUM_TEAMS }, () => [0]); // Jornada 0

    const userPlayers = getRandomPlayers(TEAM_SIZE, allPlayers);
    const starters = userPlayers.map(p => p.id); // Los 11 primeros son titulares

    // Al iniciar, ningún jugador tiene puntuaciones (matchdays = 0)
    const initialScores = simulateAllPlayerScores(allPlayers, 0);

    return {
      matchday: 0,
      userTeam: { name: "Mi Equipo", points: 0 },
      simulatedTeams,
      simulatedTeamsHistory,
      userPlayers,
      starters,
      scores: initialScores,
      money: INITIAL_MONEY,
      market: getRandomPlayers(10, allPlayers),
    };
  });

  const resetGame = () => {
    const simulatedTeams = Array.from({ length: NUM_TEAMS }, (_, i) => ({
      name: `Equipo ${i + 1}`,
      points: 0,
    }));
    const simulatedTeamsHistory = Array.from({ length: NUM_TEAMS }, () => [0]);

    const userPlayers = getRandomPlayers(TEAM_SIZE, allPlayers);
    const starters = userPlayers.map(p => p.id);

    // Al reiniciar, ningún jugador tiene puntuaciones
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
      market: getRandomPlayers(10, allPlayers),
    });
  };

  // Cambia buyPlayer: los nuevos fichajes van a suplentes
  const buyPlayer = (player: Player) => {
    const average =
      state.scores[player.id]?.reduce((a, b) => a + b, 0) /
        state.scores[player.id]?.length || 1;

    const price = Math.round(Math.max(PLAYER_PRICE, PLAYER_PRICE * average));

    // No puedes fichar si tienes 18 jugadores
    if (
      state.money < price ||
      state.userPlayers.length >= MAX_SQUAD_SIZE ||
      state.userPlayers.some(p => p.id === player.id)
    )
      return;

    setState((prev) => ({
      ...prev,
      money: Math.round(prev.money - price),
      userPlayers: [...prev.userPlayers, player],
      market: prev.market.filter((p) => p.id !== player.id),
    }));
  };

  // Cambia simulateMatchday: solo puntúan los titulares
  const simulateMatchday = () => {
    if (
      state.matchday >= MAX_MATCHDAYS ||
      state.starters.length !== TEAM_SIZE // Solo puedes simular si hay 11 titulares
    ) {
      resetGame();
      return;
    }

    // Simula una nueva puntuación para todos los jugadores, ponderada por su media previa
    const newScores: PlayerScore = { ...state.scores };
    allPlayers.forEach((player) => {
      const prevScores = newScores[player.id] || [];
      let points;
      if (prevScores.length === 0) {
        // Primera jornada: aleatorio puro
        points = Math.floor(Math.random() * 26) - 5;
      } else {
        // A partir de la segunda jornada: más probabilidad de puntuar cerca de la media
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

    // Solo suman los titulares
    let userPoints = 0;
    state.starters.forEach((id) => {
      const lastScore = newScores[id][newScores[id].length - 1];
      userPoints += lastScore;
    });

    const updatedSimulatedTeams = state.simulatedTeams.map((team) => ({
      ...team,
      points:
        team.points +
        (Math.floor(Math.random() * ((20 * TEAM_SIZE) - (11 * -5))) + 11 * -5),
    }));

    // Guarda el histórico de puntos por jornada
    const updatedSimulatedTeamsHistory = state.simulatedTeamsHistory.map((history, idx) => [
      ...history,
      updatedSimulatedTeams[idx].points,
    ]);

    const updatedMarket = getRandomPlayers(10, allPlayers);

    setState((prev) => ({
      ...prev,
      matchday: prev.matchday + 1,
      userTeam: {
        ...prev.userTeam,
        points: prev.userTeam.points + userPoints,
      },
      simulatedTeams: updatedSimulatedTeams,
      simulatedTeamsHistory: updatedSimulatedTeamsHistory,
      scores: newScores,
      market: updatedMarket,
      money: Math.round(prev.money + userPoints * 100000),
    }));
  };

  // Cambia sellPlayer: si vendes un titular, lo quita de titulares
  const sellPlayer = (id: number) => {
    const player = state.userPlayers.find((p) => p.id === id);
    if (!player) return;

    const average =
      state.scores[player.id]?.reduce((a, b) => a + b, 0) /
        state.scores[player.id]?.length || 1;

    const price = Math.round(Math.max(PLAYER_PRICE, PLAYER_PRICE * average));
    const newMoney = state.money + price;

    setState((prev) => ({
      ...prev,
      money: Math.round(newMoney),
      userPlayers: prev.userPlayers.filter((p) => p.id !== id),
      starters: prev.starters.filter((starterId) => starterId !== id),
    }));
  };

  // Cambia titulares/suplentes
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
    <div className="p-4">
      <h1 className="text-2xl mb-4">Fantasy Simulado</h1>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab("clasificacion")}>Clasificación</button>
        <button onClick={() => setTab("equipo")}>Equipo</button>
        <button onClick={() => setTab("mercado")}>Mercado</button>
        <button
          onClick={simulateMatchday}
          className="ml-auto bg-blue-500 text-white px-4 py-2 rounded"
          disabled={state.starters.length !== TEAM_SIZE}
        >
          {state.matchday >= MAX_MATCHDAYS
            ? "Reiniciar"
            : `Simular Jornada ${state.matchday + 1}`}
        </button>
      </div>

      {tab === "clasificacion" && (
        <div>
          <h2 className="text-xl mb-2">Tabla</h2>
          <ul>
            {[...state.simulatedTeams, state.userTeam]
              .sort((a, b) => b.points - a.points)
              .map((team, i) => {
                let lastPoints = 0;
                if (team.name === state.userTeam.name) {
                  lastPoints = state.starters.reduce((sum, id) => {
                    const scores = state.scores[id];
                    const last = scores && scores.length > 0 ? scores[scores.length - 1] : 0;
                    return sum + last;
                  }, 0);
                } else {
                  // Busca el índice del equipo rival
                  const teamIndex = state.simulatedTeams.findIndex(t => t.name === team.name);
                  if (teamIndex !== -1 && state.matchday > 0) {
                    const history = state.simulatedTeamsHistory[teamIndex];
                    lastPoints = history[history.length - 1] - history[history.length - 2];
                  }
                }
                return (
                  <li key={i}>
                    {team.name}: {team.points} pts
                    {" "}
                    <span style={{ color: "#888" }}>
                      (Última jornada: {lastPoints})
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {tab === "equipo" && (
        <div>
          <h2 className="text-xl mb-2">Mi Equipo</h2>
          <div>
            <h3 className="font-bold">Titulares ({state.starters.length}/11)</h3>
            <ul>
              {state.starters.map((id) => {
                const p = state.userPlayers.find((pl) => pl.id === id);
                if (!p) return null;
                const hasScores = state.scores[p.id] && state.scores[p.id].length > 0;
                const avg = hasScores ? getAverageScore(p.id) : "–";
                const price = hasScores
                  ? Math.max(PLAYER_PRICE, PLAYER_PRICE * (parseFloat(avg) || 1))
                  : PLAYER_PRICE;
                const last = hasScores ? getLastScore(p.id) : "–";
                return (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.name}</span>
                    <span>
                      Media: {avg} | Última: {last} | Precio: {price.toFixed(0)} €
                    </span>
                    <button onClick={() => makeSub(p.id)}>Mandar al banquillo</button>
                    <button onClick={() => sellPlayer(p.id)}>Vender</button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="font-bold">Suplentes ({state.userPlayers.length - state.starters.length}/{MAX_SQUAD_SIZE - TEAM_SIZE})</h3>
            <ul>
              {state.userPlayers
                .filter((p) => !state.starters.includes(p.id))
                .map((p) => {
                  const hasScores = state.scores[p.id] && state.scores[p.id].length > 0;
                  const avg = hasScores ? getAverageScore(p.id) : "–";
                  const price = hasScores
                    ? Math.max(PLAYER_PRICE, PLAYER_PRICE * (parseFloat(avg) || 1))
                    : PLAYER_PRICE;
                  const last = hasScores ? getLastScore(p.id) : "–";
                  return (
                    <li key={p.id} className="flex justify-between">
                      <span>{p.name}</span>
                      <span>
                        Media: {avg} | Última: {last} | Precio: {price.toFixed(0)} €
                      </span>
                      <button
                        onClick={() => makeStarter(p.id)}
                        disabled={state.starters.length >= TEAM_SIZE}
                      >
                        Hacer titular
                      </button>
                      <button onClick={() => sellPlayer(p.id)}>Vender</button>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}

      {tab === "mercado" && (
        <div>
          <h2 className="text-xl mb-2">Mercado - Dinero: {state.money.toFixed(0)}</h2>
          <ul>
            {state.market.map((p) => {
              const hasScores = state.scores[p.id] && state.scores[p.id].length > 0;
              const avg = hasScores ? getAverageScore(p.id) : "–";
              // El precio nunca baja de 1.000.000 €
              const price = hasScores
                ? Math.max(PLAYER_PRICE, PLAYER_PRICE * (parseFloat(avg) || 1))
                : PLAYER_PRICE;
              const last = hasScores ? getLastScore(p.id) : "–";
              return (
                <li key={p.id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span>Media: {avg} | Última: {last}</span>
                  <span>Precio: {price.toFixed(0)} €</span>
                  <button onClick={() => buyPlayer(p)}>Fichar</button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
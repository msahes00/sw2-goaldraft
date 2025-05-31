import React, { useEffect, useState } from "react";
import PlayerCard from "../components/PlayerCard"; // Asegúrate de importar bien la ruta

export function Collection({ loggedUser, setLoggedUser })  {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = loggedUser.username;
  //console.log(loggedUser);
  useEffect(() => {
    fetch(`http://localhost:3000/users/${username}/players`)
        .then((res) => res.json())
        .then((data) => {
          setPlayers(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al cargar jugadores:", err);
          setLoading(false);
        });
  }, []);

  if (loading) return <p>Cargando colección...</p>;

  return (
      <div>
        <h2>Mi Colección</h2>
        <div style={styles.grid}>
          {players.map((player: any) => (
              <PlayerCard
                  key={player.id}
                  name={player.name}
                  image={player.image}
              />
          ))}
        </div>
      </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    padding: "20px",
  },
};

export default Collection;

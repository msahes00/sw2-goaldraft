import React, { useEffect, useState } from "react";
import PlayerCard from "../components/PlayerCard"; // Asegúrate de importar bien la ruta

export function Collection({ loggedUser, setLoggedUser })  {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // <- NUEVO ESTADO

    const username = loggedUser.username;

    useEffect(() => {
        fetch(`/users/${username}/players`)
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

    // FILTRADO
    const filteredPlayers = players.filter((player) =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2>Mi Colección</h2>

            {/* INPUT DE BÚSQUEDA */}
            <input
                type="text"
                placeholder="Buscar jugador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    margin: "16px",
                    padding: "8px",
                    width: "60%",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc"
                }}
            />

            <div style={styles.grid}>
                {filteredPlayers.map((player: any) => (
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
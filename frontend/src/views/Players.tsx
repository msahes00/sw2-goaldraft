import React, { useEffect, useState } from 'react';
import { PlayerCard } from '../Components/PlayerCard';

export const Players = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/players') // Ruta del backend
            .then(res => res.json())
            .then(data => setPlayers(data));
    }, []);

    return (
        <div className="players-grid">
            {players.map(player => (
                <PlayerCard key={player.id} player={player} />
            ))}
        </div>
    );
};
import React, { useEffect, useState } from 'react';
import { PlayerCard } from '../components/PlayerCard.tsx';

export const Players = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        fetch('/api/players') // Ruta del backend
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
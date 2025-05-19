// @ts-ignore
import React from 'react';

export const PlayerCard = ({ player }) => {
    return (
        <div className="card">
            <img src={`/assets/players/${player.image}`} alt={player.name} />
            <h3>{player.name}</h3>
        </div>
    );
};
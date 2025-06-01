import React from "react";

type PlayerCardProps = {
    name: string;
    image: string; // Base64
};

const PlayerCard: React.FC<PlayerCardProps> = ({ name, image, key}) => {
    return (
        <div style={styles.card}>
            <img src={image} alt={name} style={styles.image}/>
            <h3>{name}</h3>
        </div>
    );
};

const styles = {
    card: {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        textAlign: "center" as const,
        width: "150px",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
    },
    image: {
        width: "100%",
        height: "auto",
        borderRadius: "4px",
    },
};

export default PlayerCard;

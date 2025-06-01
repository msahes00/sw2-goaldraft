import { css } from "npm:@emotion/css";
import { useState } from "react";

// Modified from https://hachiiiiiiii.co/designs.html
import envelope1 from "../assets/1Star.svg";
import envelope2 from "../assets/2Star.svg";
import envelope3 from "../assets/3Star.svg";

import PlayerCard from "./PlayerCard.tsx";


const styles = {
  modal: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
  `,
  hidden: css`
    display: none;
  `,
  closeBtn: css`
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
    border-radius: 5px;
  `,
  innerContainer: css`
    position: absolute;
    min-width: 475px;
    min-height: 600px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 75%;
    background-color: rgb(255,255,255,01);
    padding: 20px;
    border-radius: 10px;
  `,
  envelope: css`
    align-self: center;
    width: 100%;
    height: 100%;
    object-fit: fit;
  `,
  playerGrid: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    padding: 20px;
  `,
  button: css`
    position: absolute;
    left: 50%;
    bottom: 10%;
    transform: translate(-50%, 0%);
    height: 27%;
    width: 75%;
    background-color: rgb(100,150,255,0.5);
    border: blue dotted 1px;
  `,
  oneStar: css`
    background-color: rgb(100,150,255,0.5);
    border: blue dotted 1px;
  `,
  twoStar: css`
    background-color: rgb(150, 150, 50, 0.5);
    border: yellow dotted 1px;
  `,
  triStar: css`
    background-color: rgb(100 200 200 / 50%);
    border: blue dotted 1px;
  `,
};

function Gacha ({ visible = false, level = 0, setVisible, user }) {

  const price = 1000 * level;
  const modal = [styles.modal];
  const pull = [styles.button];
  const [players, setPlayers] = useState([]);

  
  if (!visible) 
    modal.push(styles.hidden);
  
  const handleOnePull = async () => {

    if (!user || user.coins < price) return;

    const response = await fetch('/api/players/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: 5, random: true, rarity: level }),
    });

    const result = await response.json();
    setPlayers(result);

    if (!result) return;

    // Update user and send updated data
    user.coins  -= price;
    user.players = result;

    await fetch(`/users/${user.username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });


    setTimeout(() => setPlayers([]), 3000);
  }

  let envelope = envelope1;
  switch (level) {
    case 1: envelope = envelope1; pull.push(styles.oneStar); break;
    case 2: envelope = envelope2; pull.push(styles.twoStar); break;
    case 3: envelope = envelope3; pull.push(styles.triStar); break;
  }

  return (
    <div className={modal.join(" ")}>
      {players.length === 0 ? 
        <div className={styles.innerContainer}>
          <button className={styles.closeBtn} onClick={() => { setVisible(false); }}>X</button>
          <img className={styles.envelope} src={envelope} alt="Envelope" />
          <button className={pull.join(" ")} onClick={handleOnePull}>{price} Monedas</button>
        </div>
      : 
        <div className={[styles.innerContainer, styles.playerGrid].join(" ")}>
          {players.map(player => ( 
            <PlayerCard key={player.id} name={player.name} image={`/api/players/${player.id}/image`} />
          ))}
        </div>
      }
    </div>
  );
};

export default Gacha;

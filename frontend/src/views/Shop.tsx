import { useState } from "react";
import { css } from "npm:@emotion/css";
import Gacha from "../components/Gacha.tsx";

const styles = {
  container: css`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 100%;
  `,
  button: css`
    border: black 1px solid;
    width: 35%;
    height: 100%;
    justify-content: center;
    display: flex;
    text-decoration: none;
  `,
  yellow: css`
    background-color: #909000;
    color: #ffffff;
  `,
  blue: css`
    background-color: #009090;
    color: #ffffff;
  `,
  purple: css`
    background-color: #906090;
    color: #ffffff;
  `,
};

function Shop({ user }) {
  const [gachaVisible, setGachaVisible] = useState(false);
  const [gachaLevel  , setGachaLevel  ] = useState(0);

  return (
    <>
      <div className={styles.container}>
        <div
          className={[styles.button, styles.blue].join(" ")}
          onClick={() => { setGachaVisible(true); setGachaLevel(1); }}
        >
          <p>Sobre Basico</p>
        </div>
        <div
          className={[styles.button, styles.yellow].join(" ")}
          onClick={() => { setGachaVisible(true); setGachaLevel(2); }}
        >
          <p>Sobre Avanzado</p>
        </div>
        <div
          className={[styles.button, styles.purple].join(" ")}
          onClick={() => { setGachaVisible(true); setGachaLevel(3); }}
        >
          <p>Sobre Pro</p>
        </div>
      </div>
      <Gacha user={user} visible={gachaVisible} setVisible={setGachaVisible} level={gachaLevel}/>
    </>
  );
}

export default Shop;

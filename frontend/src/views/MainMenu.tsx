import { css } from "npm:@emotion/css";

const styles = {
  container: css`
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 100%;
  `,
  button: css`
    border: black 1px solid;
    width: 25%;
    height: 100%;
    justify-content: center;
    display: flex;
    text-decoration: none;
  `,
  red: css`
    background-color: #990000;
    color: #ffffff;
  `,
  blue: css`
    background-color: #000099;
    color: #ffffff;
  `,
  green: css`
    background-color: #009900;
    color: #ffffff;
  `,
  yellow: css`
    background-color: #ff9900;
    color: #ffffff;
  `,
};

function MainMenu() {
  return (
    <>
      <div className={styles.container}>
        <a className={[styles.button, styles.red].join(' ')} href="/shop">
          <p>Tienda</p>
        </a>
        <a className={[styles.button, styles.blue].join(' ')} href="/collection">
          <p>Colleccion</p>
        </a>
        <a className={[styles.button, styles.yellow].join(' ')} href="/draft">
          <p>Draft</p>
        </a>
        <a className={[styles.button, styles.green].join(' ')} href="/fantasy">
          <p>Fantasy</p>
        </a>
      </div>
    </>
  );
}

export default MainMenu;

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
};

function MainMenu() {
  return (
    <>
      <div className={styles.container}>
        <a className={styles.button} href="/shop">
          <p>Tienda</p>
        </a>
        <a className={styles.button} href="/collection">
          <p>Colleccion</p>
        </a>
        <a className={styles.button} href="/draft">
          <p>Draft</p>
        </a>
        <a className={styles.button} href="/fantasy">
          <p>Fantasy</p>
        </a>
      </div>
    </>
  );
}

export default MainMenu;

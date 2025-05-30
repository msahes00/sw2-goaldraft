import { css } from "npm:@emotion/css";
import { Link } from "npm:react-router-dom";

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
        <Link className={[styles.button, styles.red].join(" ")} to="/shop">
          <p>Tienda</p>
        </Link>
        <Link className={[styles.button, styles.blue].join(" ")} to="/collection">
          <p>Colleccion</p>
        </Link>
        <Link className={[styles.button, styles.yellow].join(" ")} to="/draft">
          <p>Draft</p>
        </Link>
        <Link className={[styles.button, styles.green].join(" ")} to="/fantasy">
          <p>Fantasy</p>
        </Link>
      </div>
    </>
  );
}

export default MainMenu;

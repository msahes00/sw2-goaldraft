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
    overflow: hidden; // <-- Añade esto para recortar la imagen
    align-items: center; // Centra la imagen verticalmente
    position: relative; // Para posicionar la imagen si lo necesitas
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
          <img
            src="/tienda.jpg"
            alt="Tienda"
            style={{
              width: "140%",
              height: "140%",
              objectFit: "cover",
              display: "block",
              margin: "auto",
              position: "relative",
              left: "-20%",
              top: "-20%",
            }}
          />
        </Link>
        <Link className={[styles.button, styles.blue].join(" ")} to="/collection">
          <img
            src="/coleccion.jpg"
            alt="Colección"
            style={{
              width: "140%",
              height: "140%",
              objectFit: "cover",
              display: "block",
              margin: "auto",
              position: "relative",
              left: "-20%",
              top: "-20%",
            }}
          />
        </Link>
        <Link className={[styles.button, styles.yellow].join(" ")} to="/draft">
          <img
            src="/draft.jpg"
            alt="Draft"
            style={{
              width: "140%",
              height: "140%",
              objectFit: "cover",
              display: "block",
              margin: "auto",
              position: "relative",
              left: "-20%",
              top: "-20%",
            }}
          />
        </Link>
        <Link className={[styles.button, styles.green].join(" ")} to="/fantasy">
          <img
            src="/fantasy.jpg"
            alt="Fantasy"
            style={{
              width: "140%",
              height: "140%",
              objectFit: "cover",
              display: "block",
              margin: "auto",
              position: "relative",
              left: "-20%",
              top: "-20%",
            }}
          />
        </Link>
      </div>
    </>
  );
}

export default MainMenu;

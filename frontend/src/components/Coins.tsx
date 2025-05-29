import { css } from "npm:@emotion/css";

const styles = {
  container: css`
    background-color: #f0f0f0;
    overflow: hidden;
    border-radius: 10px;
    padding: 5px;
    width: 55px;
    min-width: 55px;
  `,
  text: css`
    margin: 0px;
  `,
};

function Coins() {
  return (
    <>
      <div className={styles.container}>
        <p className={styles.text}>9999+</p>
      </div>
    </>
  );
}

export default Coins;

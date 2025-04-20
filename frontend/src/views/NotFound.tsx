import { css } from "npm:@emotion/css";

const styles = {
  centered: css`
    text-align: center;
    width: 100%;
  `,
};

function NotFound() {
  return (
    <>
      <h1 className={styles.centered}>404 - Not Found</h1>
    </>
  );
}

export default NotFound;

import { css } from "npm:@emotion/css";

import logo from "../assets/logo.svg";

const styles = {
    container: css`
    background-color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border-radius: 25px;
    max-width: 50px;
    max-height: 50px;
    min-width: 50px;
    min-height: 50px;
  `,
};

function Avatar() {
    return (
        <>
            <div className={styles.container}>
                <img src={logo} alt="My Account" />
            </div>
        </>
    );
}

export default Avatar;
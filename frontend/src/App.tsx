import { Route, Routes, useNavigate } from "npm:react-router";
import { css } from "npm:@emotion/css";
import UserView from "./views/UserView.tsx";

import Avatar from "./components/Avatar.tsx";
import Coins from "./components/Coins.tsx";
import LogView from "./views/LogView";
import MainMenu from "./views/MainMenu.tsx";
import NotFound from "./views/NotFound.tsx";

const styles = {
  header: css`
    background-color: #333333;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0px 20px 0px 20px;
    height: 12vh;
    min-height: 80px;
  `,
  title: css`
    margin: 10vw;
  `,
  content: css`
    height: 80vh;
  `,
  footer: css`
    background-color: #333333;
    color: white;
    text-align: center;
    position: fixed;
    padding: 0px;
    bottom: 0;
    width: 100vw;
    height: 8vh;
    min-height: 50px;
  `,
};

function App() {
  const navigate = useNavigate();

  return (
    <>
      <header className={styles.header}>
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/user")}>
          <Avatar />
        </span>
        <h1 className={styles.title}>Goaldraft</h1>
        <Coins />
      </header>
      <main className={styles.content}>
        <Routes>
          <Route path="/login" element={<LogView />} />
          <Route path="/user" element={<UserView />} />
          <Route path="/" element={<MainMenu />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className={styles.footer}>
        <p>&copy; 2025 Goaldraft. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;

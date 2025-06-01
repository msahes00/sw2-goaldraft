import {
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
} from "npm:react-router";
import { useState, useEffect } from "react";
import { css } from "npm:@emotion/css";
import UserView from "./views/UserView.tsx";
import Avatar from "./components/Avatar.tsx";
import Coins from "./components/Coins.tsx";
import LogView from "./views/LogView.tsx";
import MainMenu from "./views/MainMenu.tsx";
import NotFound from "./views/NotFound.tsx";
import Draft from "./views/Draft.tsx";
import Shop from "./views/Shop.tsx";
import Collection from "./views/Collection.tsx";
import Fantasy from "./views/Fantasy.tsx";

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
  const location = useLocation();

  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    if (!loggedUser && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
    if (loggedUser && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [loggedUser, location.pathname, navigate]);

  return (
    <>
      <header className={styles.header}>
        <span style={{ cursor: "pointer" }} onClick={() => navigate("/user")}>
          <Avatar />
        </span>
        <h1 className={styles.title}>Goaldraft</h1>
        <Coins user={loggedUser} />
      </header>
      <main className={styles.content}>
        <Routes>
          <Route
            path="/login"
            element={<LogView setLoggedUser={setLoggedUser} />}
          />
          <Route
            path="/user"
            element={
              loggedUser ? (
                <UserView user={loggedUser} setLoggedUser={setLoggedUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              loggedUser ? <MainMenu /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/draft"
            element={
              loggedUser ? (
                <Draft user={loggedUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/shop"
            element={loggedUser ? <Shop user={loggedUser}/> : <Navigate to="/login" replace />}
          />
            <Route
                path="/collection"
                element={
                    loggedUser ? (
                        <Collection loggedUser={loggedUser} setLoggedUser={setLoggedUser} />
                    ):(
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
            path="/fantasy"
            element={
              loggedUser ? <Fantasy /> : <Navigate to="/login" replace />
            }
          />
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

import { useState } from "react";
import "./styles/App.css";
import viteLogo from "./assets/vite.svg";
import reactLogo from "./assets/react.svg";
import UserView from "./components/UserView";


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <UserView />
      </div>
    </>
  );
}

export default App;

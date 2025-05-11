import { useState } from "react";
import "./styles/App.css";
import LogView from "./components/LogView";
import React from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <LogView />
      </div>
    </>
  );
}

export default App;

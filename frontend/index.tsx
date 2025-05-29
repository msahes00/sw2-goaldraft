import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "npm:react-router";
import App from "./src/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

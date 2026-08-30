import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { RotateNotice } from "./components/RotateNotice";
import "./tailwind.generated.css";
import "./style.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root element not found");

createRoot(container).render(
  <StrictMode>
    {/* Sibling of the game rather than part of it: it replaces both the
        character select and the board when a phone is held sideways. */}
    <RotateNotice />
    <App />
  </StrictMode>,
);

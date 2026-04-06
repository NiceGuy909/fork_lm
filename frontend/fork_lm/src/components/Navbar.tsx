// src/components/Navbar.tsx

import "./Navbar.css";

export function Navbar({
  currentView,
  onViewChange,
}: {
  currentView: "chat" | "tree";
  onViewChange: (view: "chat" | "tree") => void;
}) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>ForkLM</h1>
        </div>

        <div className="navbar-toggle-container">
          <span
            className={`view-label ${currentView === "chat" ? "active" : ""}`}
          >
            Chat
          </span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="view-toggle"
              checked={currentView === "tree"}
              onChange={(e) => {
                onViewChange(e.target.checked ? "tree" : "chat");
              }}
            />
            <label htmlFor="view-toggle" className="toggle-slider"></label>
          </div>
          <span
            className={`view-label ${currentView === "tree" ? "active" : ""}`}
          >
            Tree
          </span>
        </div>
      </div>
    </nav>
  );
}

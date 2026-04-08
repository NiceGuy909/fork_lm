import { useState } from "react";

export function PromptBar({
  onSend,
  isDarkMode,
}: {
  onSend: (prompt: string) => Promise<void>;
  isDarkMode: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    const value = prompt;
    setPrompt("");
    await onSend(value);
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        display: "flex", 
        gap: 8, 
        padding: 16,
        backgroundColor: isDarkMode ? "#2a2a2a" : "#f0f0f0",
        borderTop: `1px solid ${isDarkMode ? "#3a3a3a" : "#d0d0d0"}`,
      }}
    >
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type a prompt..."
        style={{ 
          flex: 1, 
          padding: 8,
          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
          color: isDarkMode ? "#e0e0e0" : "#000",
          border: `1px solid ${isDarkMode ? "#3a3a3a" : "#ccc"}`,
          borderRadius: 4,
        }}
      />
      <button 
        type="submit"
        style={{
          padding: "8px 16px",
          backgroundColor: isDarkMode ? "#667eea" : "#667eea",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </form>
  );
}
import { useState } from "react";

export function PromptBar({
  onSend,
  isDarkMode,
  isLoading,
}: {
  onSend: (prompt: string) => Promise<void>;
  isDarkMode: boolean;
  isLoading: boolean;
}) {
  const [prompt, setPrompt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    const value = prompt;
    setPrompt("");
    await onSend(value);
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        display: "flex", 
        gap: 12, 
        padding: "16px 24px",
        backgroundColor: "#0F1419",
        borderTop: "1px solid #2D3548",
        alignItems: "center",
      }}
    >
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={isLoading ? "Waiting for response..." : "Ask anything..."}
        disabled={isLoading}
        style={{ 
          flex: 1, 
          padding: "11px 14px",
          backgroundColor: "#16192B",
          color: "#E4E4E7",
          border: "1px solid #3A3F51",
          borderRadius: "8px",
          fontSize: "15px",
          fontFamily: "inherit",
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? "not-allowed" : "text",
          transition: "all 0.2s ease",
          outline: "none",
        }}
        onFocus={(e) => {
          if (!isLoading) {
            e.currentTarget.style.borderColor = "#A78BFA";
            e.currentTarget.style.backgroundColor = "#1A1F3A";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#3A3F51";
          e.currentTarget.style.backgroundColor = "#16192B";
        }}
      />
      <button 
        type="submit"
        disabled={isLoading}
        style={{
          padding: "11px 20px",
          backgroundColor: isLoading ? "#3A3F51" : "#A78BFA",
          color: isLoading ? "#8B8B8B" : "#FFFFFF",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "500",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          transition: "all 0.2s ease",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = "#8B5CF6";
            e.currentTarget.style.opacity = "0.9";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = "#A78BFA";
            e.currentTarget.style.opacity = "1";
          }
        }}
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
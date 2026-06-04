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

  const formBg = isDarkMode ? "#0F1419" : "#FFFFFF";
  const formBorder = isDarkMode ? "#2D3548" : "#E5E7EB";
  const inputBg = isDarkMode ? "#16192B" : "#F9FAFB";
  const inputColor = isDarkMode ? "#E4E4E7" : "#1F2937";
  const inputBorder = isDarkMode ? "#3A3F51" : "#D1D5DB";
  const inputFocusBorder = isDarkMode ? "#A78BFA" : "#7C3AED";
  const inputFocusBg = isDarkMode ? "#1A1F3A" : "#FFFFFF";
  const accentColor = isDarkMode ? "#A78BFA" : "#7C3AED";
  const accentHover = isDarkMode ? "#8B5CF6" : "#6D28D9";
  const btnDisabledBg = isDarkMode ? "#3A3F51" : "#D1D5DB";
  const btnDisabledColor = isDarkMode ? "#8B8B8B" : "#9CA3AF";

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{ 
        display: "flex", 
        gap: 12, 
        padding: "16px 24px",
        backgroundColor: formBg,
        borderTop: `1px solid ${formBorder}`,
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
          backgroundColor: inputBg,
          color: inputColor,
          border: `1px solid ${inputBorder}`,
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
            e.currentTarget.style.borderColor = inputFocusBorder;
            e.currentTarget.style.backgroundColor = inputFocusBg;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = inputBorder;
          e.currentTarget.style.backgroundColor = inputBg;
        }}
      />
      <button 
        type="submit"
        disabled={isLoading}
        style={{
          padding: "11px 20px",
          backgroundColor: isLoading ? btnDisabledBg : accentColor,
          color: isLoading ? btnDisabledColor : "#FFFFFF",
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
            e.currentTarget.style.backgroundColor = accentHover;
            e.currentTarget.style.opacity = "0.9";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = accentColor;
            e.currentTarget.style.opacity = "1";
          }
        }}
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
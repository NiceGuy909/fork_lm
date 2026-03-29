import { useState } from "react";

export function PromptBar({
  onSend,
}: {
  onSend: (prompt: string) => Promise<void>;
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
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, padding: 16 }}>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type a prompt..."
        style={{ flex: 1, padding: 8 }}
      />
      <button type="submit">Send</button>
    </form>
  );
}
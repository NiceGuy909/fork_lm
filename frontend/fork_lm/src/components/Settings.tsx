import { useState, useEffect } from "react";
import { saveApiKey, getApiKey, clearApiKey, setApiKeyOnServer } from "../api/chatApi";
import "./Settings.css";

export function Settings({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const savedKey = getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySet(true);
    }
  }, [isOpen]);

  async function handleSaveApiKey() {
    if (!apiKey.trim()) {
      setSaveMessage("Please enter an API key");
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");
      
      // Save to localStorage
      saveApiKey(apiKey);
      
      // Save to backend
      await setApiKeyOnServer(apiKey);
      
      setIsKeySet(true);
      setSaveMessage("[OK] API key saved successfully!");
      
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      setSaveMessage("Failed to save API key. Please try again.");
      console.error("Error saving API key:", error);
    } finally {
      setIsSaving(false);
    }
  }

  function handleClearApiKey() {
    if (confirm("Are you sure you want to remove your API key? You'll need to set it again to use the service.")) {
      clearApiKey();
      setApiKey("");
      setIsKeySet(false);
      setSaveMessage("API key removed");
      setTimeout(() => setSaveMessage(""), 2000);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Gemini API Key</h3>
            <p className="settings-description">
              Enter your Gemini API key to enable the chat service. Get your key at{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                Google AI Studio
              </a>
            </p>

            <div className="api-key-input-group">
              <input
                type={apiKey.includes("sk-") || apiKey.length > 30 ? "password" : "text"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Gemini API key here..."
                className="api-key-input"
                disabled={isSaving}
              />
            </div>

            {saveMessage && (
              <div className={`save-message ${saveMessage.startsWith("[OK]") ? "success" : "error"}`}>
                {saveMessage}
              </div>
            )}

            {isKeySet && (
              <div className="api-key-status">
                <span className="status-indicator">[OK]</span>
                <span>API key is set</span>
              </div>
            )}

            <div className="button-group">
              <button
                onClick={handleSaveApiKey}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? "Saving..." : "Save API Key"}
              </button>
              {isKeySet && (
                <button
                  onClick={handleClearApiKey}
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  Remove API Key
                </button>
              )}
            </div>
          </div>

          <div className="settings-section">
            <h3>About</h3>
            <p className="settings-description">
              ForkLM is a branching LLM conversation platform that lets you explore multiple conversation paths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

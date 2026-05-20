import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AppLayout, layoutStyles } from "../components/Layout";
import useChatStore from "../stores/useChatStore";
import useAuthStore from "../stores/useAuthStore";
import useSettingsStore from "../stores/useSettingsStore";
import { useActiveLocation } from "../stores/useLocationStore";
import SpeechRecognizer from "../utils/SpeechRecognizer";
import { getLanguageCode, detectLanguage } from "../utils/languageUtils";

const API = import.meta.env.VITE_API_URL ?? "";

const styles = `
  ${layoutStyles}

  @keyframes msgIn     { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
  @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-7px);} }
  @keyframes leafFloat { 0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(-14px) rotate(2deg);} }
  @keyframes chipPop   { from{opacity:0;transform:scale(0.88) translateY(6px);}to{opacity:1;transform:scale(1) translateY(0);} }

  /* ── CHAT SHELL ── */
  .chat-shell {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  /* ── HISTORY SIDEBAR ── */
  .hist-panel {
    width: 280px;
    flex-shrink: 0;
    border-right: 0.5px solid var(--border);
    background: var(--topbar-bg);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    transition: background 0.35s, border-color 0.35s;
  }
  .hist-header {
    padding: 22px 18px 16px;
    border-bottom: 0.5px solid var(--border);
    flex-shrink: 0;
  }
  .hist-title {
    font-family: 'DM Serif Display', serif;
    font-size: 20px; color: var(--primary);
    margin-bottom: 14px;
  }

  /* New Chat pill button */
  .new-chat-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%;
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600;
    background: var(--primary); color: var(--sidebar-text);
    border: none; border-radius: 28px; padding: 11px 18px;
    cursor: pointer; transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 14px rgba(26,71,49,0.28);
  }
  .new-chat-btn:hover  { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,71,49,0.36); }
  .new-chat-btn:active { transform: scale(0.96); }
  .new-chat-btn .nc-icon {
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 12px;
  }

  /* Chat history items */
  .hist-list { flex:1; overflow-y:auto; padding: 10px; }
  .hist-list::-webkit-scrollbar { width:4px; }
  .hist-list::-webkit-scrollbar-thumb { background: var(--border); border-radius:4px; }

  .hist-item {
    padding: 12px 14px; border-radius: 16px; cursor: pointer;
    margin-bottom: 4px; transition: background 0.15s; position: relative;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .hist-item:hover  { background: var(--bg); }
  .hist-item.active { background: var(--nav-active-bg); }

  .hist-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--primary); color: var(--sidebar-text);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
    flex-shrink: 0;
  }
  .hist-item-content { min-width: 0; flex: 1; }
  .hist-crop {
    font-size: 14px; font-weight: 600; color: var(--primary);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 2px;
  }
  .hist-preview {
    font-size: 12px; color: var(--text-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .hist-time  { font-size: 10px; color: var(--text-light); margin-top: 2px; }

  .hist-del-btn {
    background: none; border: none; cursor: pointer; padding: 2px 4px;
    color: var(--text-light); font-size: 11px; border-radius: 6px; flex-shrink: 0;
    opacity: 0; transition: opacity 0.15s, color 0.15s;
    margin-top: 2px;
  }
  .hist-item:hover .hist-del-btn { opacity: 1; }
  .hist-del-btn:hover { color: #E57373; }

  .hist-empty { text-align:center; padding:28px 14px; color:var(--text-light); font-size:13px; }

  /* ── CHAT MAIN ── */
  .chat-main {
    flex: 1; display: flex; flex-direction: column;
    min-width: 0; height: 100%; overflow: hidden;
    background: var(--bg); transition: background 0.35s;
  }

  /* Chat header */
  .chat-header {
    background: var(--topbar-bg); border-bottom: 0.5px solid var(--border);
    padding: 14px 24px; display: flex; align-items: center;
    justify-content: space-between; flex-shrink: 0;
    transition: background 0.35s, border-color 0.35s;
  }
  .chat-header-left { display: flex; align-items: center; gap: 12px; }
  .ai-avatar {
    width: 42px; height: 42px; border-radius: 14px;
    background: var(--primary); display: flex; align-items: center;
    justify-content: center; color: var(--accent); font-size: 18px;
    box-shadow: 0 4px 12px rgba(26,71,49,0.3);
  }
  .ai-name   { font-family: 'DM Serif Display', serif; font-size: 17px; color: var(--primary); }
  .ai-status { font-size: 11px; color: var(--text-light); display: flex; align-items: center; gap: 5px; margin-top: 2px; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #2ECC71; animation: pulse 2s infinite; }

  .model-badge {
    font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600;
    background: var(--accent-light); color: var(--primary); padding: 5px 12px;
    border-radius: 20px; display: flex; align-items: center; gap: 5px;
  }

  /* Chat messages area */
  .chat-body {
    flex: 1; overflow-y: auto; padding: 20px 24px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .chat-body::-webkit-scrollbar { width: 4px; }
  .chat-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* Message rows */
  .msg-row {
    display: flex; gap: 8px;
    animation: msgIn 0.18s ease both;
    margin-bottom: 2px;
  }
  .msg-row.user-row { flex-direction: row-reverse; }

  .msg-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0; align-self: flex-end; margin-bottom: 18px;
  }
  .msg-avatar.ai-av   { background: var(--primary); color: var(--accent); }
  .msg-avatar.user-av { background: var(--accent); color: var(--sidebar-text); font-size: 11px; font-weight: 700; }

  /* User bubble: dark forest green, unique radius */
  .msg-bubble {
    max-width: 70%; padding: 12px 16px;
    font-size: 15px; line-height: 1.65; word-wrap: break-word;
  }
  .msg-bubble.user-bubble {
    background: var(--primary); color: var(--sidebar-text);
    border-radius: 20px 4px 20px 20px;
    box-shadow: 0 2px 8px rgba(26,71,49,0.22);
  }
  /* AI bubble: white card, green left border accent */
  .msg-bubble.ai-bubble {
    background: var(--topbar-bg); color: var(--text);
    border: 0.5px solid var(--border);
    border-radius: 4px 20px 20px 20px;
    border-left: 3px solid var(--primary);
    box-shadow: 0 2px 8px rgba(26,71,49,0.07);
  }
  .msg-time {
    font-size: 10px; color: var(--text-light); margin-top: 4px;
    display: block; text-align: right;
  }
  .user-row .msg-time { text-align: left; }

  /* Timestamp separator */
  .ts-sep {
    text-align: center; font-size: 11px; color: var(--text-light);
    padding: 8px 0; display: flex; align-items: center; gap: 8px;
  }
  .ts-sep::before, .ts-sep::after {
    content: ''; flex: 1; height: 0.5px; background: var(--border);
  }

  /* Typing indicator */
  .typing-bubble {
    display: flex; align-items: center; gap: 5px;
    padding: 14px 18px; background: var(--topbar-bg);
    border: 0.5px solid var(--border);
    border-radius: 4px 20px 20px 20px;
    border-left: 3px solid var(--primary);
    box-shadow: 0 2px 8px rgba(26,71,49,0.07);
  }
  .typing-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--text-light);
    animation: dotBounce 1.2s ease infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .typing-dot:nth-child(3) { animation-delay: 0.3s; }

  /* ── WELCOME / EMPTY STATE ── */
  .empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px; text-align: center;
    animation: fadeUp 0.5s ease both;
  }
  .leaf-logo {
    font-size: 54px; line-height: 1; margin-bottom: 22px;
    animation: leafFloat 3.5s ease-in-out infinite;
    display: inline-block;
    filter: drop-shadow(0 8px 16px rgba(26,71,49,0.2));
  }
  .empty-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(22px, 3vw, 30px); color: var(--primary);
    margin-bottom: 10px; line-height: 1.2;
  }
  .empty-subtitle {
    font-size: 15px; font-weight: 300; color: var(--text-muted);
    max-width: 340px; line-height: 1.7; margin-bottom: 28px;
  }

  /* Suggestion chips */
  .suggestions {
    display: flex; flex-wrap: wrap; gap: 10px;
    justify-content: center; max-width: 560px;
  }
  .suggestion-btn {
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
    background: var(--topbar-bg); color: var(--text-muted);
    border: 1.5px solid var(--border); border-radius: 28px;
    padding: 9px 18px; cursor: pointer;
    transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.15s, box-shadow 0.18s;
    animation: chipPop 0.35s ease both;
    box-shadow: 0 2px 6px rgba(26,71,49,0.06);
    display: flex; align-items: center; gap: 6px;
  }
  .suggestion-btn:hover {
    background: var(--accent-light); border-color: var(--accent);
    color: var(--primary); transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(200,151,58,0.2);
  }
  .suggestion-btn:active { transform: scale(0.95); }

  /* ── INPUT BAR ── */
  .chat-input-area {
    flex-shrink: 0;
    background: var(--topbar-bg); border-top: 0.5px solid var(--border);
    padding: 14px 24px 18px; transition: background 0.35s, border-color 0.35s;
  }
  /* Floating card style */
  .input-row {
    display: flex; align-items: flex-end; gap: 10px;
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 28px; padding: 10px 10px 10px 18px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 10px rgba(26,71,49,0.06);
  }
  .input-row:focus-within {
    border-color: var(--primary);
    box-shadow: 0 4px 18px rgba(26,71,49,0.1);
  }

  .chat-input {
    flex: 1; background: none; border: none; outline: none;
    font-family: 'Outfit', sans-serif; font-size: 15px; color: var(--text);
    resize: none; max-height: 120px; line-height: 1.5; padding: 2px 0;
  }
  .chat-input::placeholder { color: var(--text-light); }

  .input-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

  /* Mic button */
  .mic-btn {
    width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
    transition: background 0.18s, color 0.18s, transform 0.15s;
    background: none; color: var(--text-light);
  }
  .mic-btn:hover  { background: var(--bg-secondary); color: var(--primary); }
  .mic-btn:active { transform: scale(0.9); }
  .mic-btn.active { color: var(--accent); background: rgba(200,151,58,0.12); }

  /* Circular send button */
  .send-btn {
    width: 42px; height: 42px; border-radius: 50%; border: none; cursor: pointer;
    background: var(--primary); color: var(--sidebar-text); font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
    box-shadow: 0 3px 10px rgba(26,71,49,0.3); flex-shrink: 0;
  }
  .send-btn:hover   { background: var(--primary-hover); transform: scale(1.06); box-shadow: 0 5px 16px rgba(26,71,49,0.4); }
  .send-btn:active  { transform: scale(0.94); }
  .send-btn:disabled { background: var(--border); color: var(--text-light); cursor: not-allowed; box-shadow: none; transform: none; }

  /* Input row extras (lang selector inside) */
  .input-extras {
    display: flex; align-items: center; gap: 6px; padding-left: 4px;
  }
  .lang-select-sm {
    font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600;
    background: var(--bg-secondary); color: var(--text-muted);
    border: 1px solid var(--border); border-radius: 8px;
    padding: 4px 8px; cursor: pointer; outline: none;
    transition: border-color 0.2s;
  }
  .lang-select-sm:hover, .lang-select-sm:focus { border-color: var(--primary); }

  .input-hint {
    font-size: 11px; color: var(--text-light); margin-top: 7px; text-align: center;
  }

  /* AI markdown */
  .ai-content h1,.ai-content h2,.ai-content h3 {
    font-family:'DM Serif Display',serif; color:var(--primary);
    margin: 10px 0 5px; font-size: 16px;
  }
  .ai-content p   { margin-bottom: 6px; }
  .ai-content ul,.ai-content ol { padding-left: 18px; margin-bottom: 6px; }
  .ai-content li  { margin-bottom: 4px; }
  .ai-content strong { font-weight: 700; color: var(--text); }
  .ai-content code {
    background: var(--bg-secondary); border-radius: 6px; padding: 2px 6px;
    font-size: 12px; font-family: monospace;
  }

  /* Lang selector in header */
  .lang-select {
    font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500;
    background: var(--bg); color: var(--text); border: 1.5px solid var(--border);
    border-radius: 12px; padding: 6px 12px; cursor: pointer; outline: none;
    transition: border-color 0.2s;
  }
  .lang-select:hover, .lang-select:focus { border-color: var(--primary); }

  @media(max-width:768px){
    .hist-panel { display: none; }
    .chat-body { padding: 16px 16px; }
    .chat-input-area { padding: 12px 16px 16px; }
    .chat-header { padding: 12px 16px; }
    .msg-bubble { max-width: 82%; font-size: 14px; }
  }
`;

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^[\-\*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function fmtTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtRelative(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada", "Bengali"];

const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const MsgBubble = memo(({ msg, userInitials }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`msg-row${isUser ? " user-row" : ""}`}>
      <div className={`msg-avatar${isUser ? " user-av" : " ai-av"}`}>
        {isUser ? userInitials : <i className="fa-solid fa-wheat-awn" />}
      </div>
      <div>
        <div className={`msg-bubble${isUser ? " user-bubble" : " ai-bubble"}`}>
          {isUser ? (
            msg.content
          ) : (
            <div className="ai-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
          )}
        </div>
        {msg.createdAt && <span className="msg-time">{fmtTime(msg.createdAt)}</span>}
      </div>
    </div>
  );
});
MsgBubble.displayName = "MsgBubble";

const SUGGESTION_CHIPS = [
  { emoji: "🌾", text: "Best crops for June" },
  { emoji: "🐛", text: "Pest treatment guide" },
  { emoji: "💧", text: "Irrigation tips" },
  { emoji: "🌡️", text: "Weather impact on crops" },
  { emoji: "💰", text: "How to increase yield profit" },
  { emoji: "🌱", text: "Organic farming basics" },
];

export default function Chat() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { language: settingsLang } = useSettingsStore();
  const activeLoc = useActiveLocation();
  const chatLocation = activeLoc?.display || user?.location || "India";

  const {
    chats, activeChatId, activeMessages,
    isLoading, isSending,
    fetchChats, loadChat, newChat, sendMessage, deleteChat,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [chatLang, setChatLang] = useState(settingsLang || user?.language || "English");
  const [isListening, setListening] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const recognizer = useRef(null);

  const userInitials = getInitials(user?.name || "U");

  useEffect(() => {
    if (settingsLang) setChatLang(settingsLang);
  }, [settingsLang]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [activeMessages, isSending]);

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || isSending) return;
    const detected = detectLanguage(msg);
    const effectiveLang = detected || chatLang;
    if (detected && detected !== chatLang) setChatLang(detected);
    setInput("");

    const isPlanRequest = /\b(plan|plan for|farming plan|generate plan)\b/i.test(msg);
    if (isPlanRequest) {
      const cropMatch = msg.match(/plan for\s+([a-zA-Z\s]+)/i);
      const cropName = cropMatch?.[1]?.trim();
      if (cropName) { await handleGeneratePlan(cropName); return; }
    }

    try {
      await sendMessage(msg, { language: effectiveLang, location: chatLocation });
    } catch (err) {
      setInput(msg);
      console.error("Chat error:", err.message);
    }
  }, [input, isSending, chatLang, chatLocation, sendMessage]);

  const handleGeneratePlan = async (cropName) => {
    setPlanLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/chat/generate-plan`, {
        cropName,
        location: chatLocation,
        season: "current",
      });
      if (data.success) {
        await sendMessage(`Generate a farming plan for ${cropName}`, {
          language: chatLang,
          location: chatLocation,
        });
      }
    } catch (err) {
      console.error("Plan generation error:", err.message);
    } finally {
      setPlanLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognizer.current?.stop();
      setListening(false);
      return;
    }
    const lang = "";
    recognizer.current = new SpeechRecognizer(lang);
    recognizer.current.onResult = (transcript) => {
      setInput(prev => prev + transcript);
    };
    recognizer.current.onError = (msg) => {
      alert(msg);
      setListening(false);
    };
    recognizer.current.onEnd = () => {
      setListening(false);
    };
    recognizer.current.start();
    setListening(true);
  };

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    await deleteChat(chatId);
  };

  return (
    <AppLayout pageId="chat">
      <style>{styles}</style>

      <div className="chat-shell">

        {/* ── History sidebar ── */}
        <div className="hist-panel">
          <div className="hist-header">
            <div className="hist-title">{t("chat.history")}</div>
            <button className="new-chat-btn" onClick={newChat}>
              <span className="nc-icon"><i className="fa-solid fa-plus" /></span>
              {t("chat.newChat")}
            </button>
          </div>

          <div className="hist-list">
            {isLoading && !chats.length ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: 16, marginBottom: 4,
                  background: "var(--bg-secondary)", height: 66,
                  animation: "pulse 1.4s ease infinite",
                }} />
              ))
            ) : chats.length === 0 ? (
              <div className="hist-empty">
                <div style={{ fontSize: 28, marginBottom: 8 }}>🌾</div>
                {t("chat.noHistory")}
              </div>
            ) : (
              chats.map(c => (
                <div
                  key={c._id}
                  className={`hist-item${activeChatId === c._id ? " active" : ""}`}
                  onClick={() => loadChat(c._id)}
                >
                  <div className="hist-avatar">
                    {getInitials(c.title || "C")}
                  </div>
                  <div className="hist-item-content">
                    <div className="hist-crop">{c.title}</div>
                    {c.lastMessage && (
                      <div className="hist-preview">{c.lastMessage}</div>
                    )}
                    <div className="hist-time">{fmtRelative(c.updatedAt)}</div>
                  </div>
                  <button
                    className="hist-del-btn"
                    title="Delete"
                    onClick={(e) => handleDelete(e, c._id)}
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Chat main ── */}
        <div className="chat-main">

          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="ai-avatar"><i className="fa-solid fa-wheat-awn" /></div>
              <div>
                <div className="ai-name">{t("chat.title")}</div>
                <div className="ai-status">
                  <div className="status-dot" />
                  {t("chat.online")}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select
                className="lang-select"
                value={chatLang}
                onChange={e => setChatLang(e.target.value)}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div className="model-badge">
                <i className="fa-solid fa-microchip" /> {t("chat.modelBadge")}
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="chat-body" ref={bodyRef}>
            {activeMessages.length === 0 ? (
              <div className="empty-state">
                <div className="leaf-logo">🌿</div>
                <div className="empty-title">{t("chat.emptyState")}</div>
                <div className="empty-subtitle">{t("chat.emptySubtitle")}</div>
                <div className="suggestions">
                  {SUGGESTION_CHIPS.map((chip, i) => (
                    <button
                      key={i}
                      className="suggestion-btn"
                      style={{ animationDelay: `${i * 60}ms` }}
                      onClick={() => { setInput(chip.text); inputRef.current?.focus(); }}
                    >
                      <span>{chip.emoji}</span>
                      {chip.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {activeMessages.map((msg, i) => (
                  <MsgBubble
                    key={msg._id || i}
                    msg={msg}
                    userInitials={userInitials}
                  />
                ))}
                {(isSending || planLoading) && (
                  <div className="msg-row">
                    <div className="msg-avatar ai-av">
                      <i className="fa-solid fa-wheat-awn" />
                    </div>
                    <div className="typing-bubble">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sticky floating input */}
          <div className="chat-input-area">
            <div className="input-row">
              {/* Mic left */}
              <button
                className={`mic-btn${isListening ? " active" : ""}`}
                onClick={toggleVoice}
                title={isListening ? t("common.stopRecording") : t("common.voiceInput")}
              >
                <i className={`fa-solid ${isListening ? "fa-stop" : "fa-microphone"}`} />
              </button>

              {/* Text area center */}
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder={t("chat.inputPlaceholder")}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{ height: "auto" }}
                onInput={e => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />

              {/* Lang selector + send right */}
              <div className="input-actions">
                <select
                  className="lang-select-sm"
                  value={chatLang}
                  onChange={e => setChatLang(e.target.value)}
                  title="Response language"
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l.slice(0, 3)}</option>)}
                </select>
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  title={t("chat.send")}
                >
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </div>
            </div>
            <div className="input-hint">{t("chat.inputHint")}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

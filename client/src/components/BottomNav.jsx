import { useNavigate, useLocation } from "react-router-dom";

const S = `
  .bn-shell {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,255,255,0.94);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-top: 0.5px solid var(--border);
    padding-bottom: max(6px, env(safe-area-inset-bottom));
    transition: background 0.35s;
  }
  .bn-bar {
    display: flex; align-items: flex-end; height: 58px;
  }
  .bn-tab {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: flex-end;
    gap: 3px; padding-bottom: 7px;
    background: none; border: none; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1);
  }
  .bn-tab:active { transform: scale(0.84); }
  .bn-tab-icon {
    font-size: 21px; line-height: 1;
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), color 0.18s;
    color: var(--text-light);
    display: block;
  }
  .bn-tab.active .bn-tab-icon {
    color: var(--primary);
    transform: scale(1.15);
  }
  .bn-tab-lbl {
    font-family: 'Outfit', sans-serif; font-size: 10px;
    font-weight: 500; color: var(--text-light);
    transition: color 0.18s, font-weight 0.18s;
    line-height: 1;
  }
  .bn-tab.active .bn-tab-lbl { color: var(--primary); font-weight: 700; }

  /* FAB Chat */
  .bn-fab-wrap {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; padding-bottom: 4px;
    cursor: pointer; background: none; border: none;
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }
  .bn-fab {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--primary); color: #fff;
    font-size: 23px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 18px rgba(26,71,49,0.44), 0 10px 36px rgba(26,71,49,0.18);
    transform: translateY(-16px);
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
    position: relative; z-index: 1;
  }
  .bn-fab-wrap:active .bn-fab {
    transform: translateY(-16px) scale(0.91);
    box-shadow: 0 2px 8px rgba(26,71,49,0.3);
  }
  .bn-fab.fab-active { background: var(--primary-hover); }
  .bn-fab-lbl {
    font-family: 'Outfit', sans-serif; font-size: 10px;
    font-weight: 700; color: var(--primary);
    transform: translateY(-8px);
    display: block; line-height: 1;
  }

  @media (max-width: 768px) {
    .bn-shell { display: block; }
  }

  @media (prefers-reduced-motion: reduce) {
    .bn-tab, .bn-fab { transition: none !important; }
    .bn-tab:active { transform: none; }
    .bn-fab-wrap:active .bn-fab { transform: translateY(-16px); }
  }
`;

const TABS = [
  { id: "dashboard", emoji: "🏠", label: "Home",  path: "/dashboard" },
  { id: "crops",     emoji: "🌿", label: "Crops", path: "/crops"     },
  { id: "chat",      emoji: "💬", label: "Chat",  path: "/chat", fab: true },
  { id: "plans",     emoji: "📋", label: "Plans", path: "/plans"     },
  { id: "profile",   emoji: "⋯",  label: "More",  path: "/profile"   },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = TABS.find(t => location.pathname.startsWith(t.path))?.id || "dashboard";

  return (
    <>
      <style>{S}</style>
      <nav className="bn-shell" aria-label="Main navigation">
        <div className="bn-bar">
          {TABS.map(tab =>
            tab.fab ? (
              <button
                key={tab.id}
                className="bn-fab-wrap"
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
              >
                <div className={`bn-fab${active === tab.id ? " fab-active" : ""}`}>
                  {tab.emoji}
                </div>
                <span className="bn-fab-lbl">{tab.label}</span>
              </button>
            ) : (
              <button
                key={tab.id}
                className={`bn-tab${active === tab.id ? " active" : ""}`}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                aria-current={active === tab.id ? "page" : undefined}
              >
                <span className="bn-tab-icon">{tab.emoji}</span>
                <span className="bn-tab-lbl">{tab.label}</span>
              </button>
            )
          )}
        </div>
      </nav>
    </>
  );
}

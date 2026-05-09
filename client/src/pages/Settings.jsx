import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout, layoutStyles } from "../components/Layout";
import { useTheme } from "../context/ThemeContext";
import useAuthStore from "../stores/useAuthStore";
import useSettingsStore from "../stores/useSettingsStore";

const styles = `
  ${layoutStyles}

  @keyframes fadeUp {from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pop    {0%{transform:scale(0.85);opacity:0;}70%{transform:scale(1.05);}100%{transform:scale(1);opacity:1;}}

  .page-pad{padding:22px 26px 56px;max-width:820px;margin:0 auto;}

  /* PAGE HEADER */
  .page-header{margin-bottom:18px;animation:fadeUp 0.35s ease both;}
  .page-title{font-family:'DM Serif Display',serif;font-size:clamp(22px,2.6vw,28px);color:var(--primary);}
  .page-sub  {font-size:13.5px;font-weight:300;color:var(--text-muted);margin-top:4px;}

  /* SECTION */
  .section{
    background:var(--card);border:0.5px solid var(--border);border-radius:14px;
    margin-bottom:14px;overflow:hidden;animation:fadeUp 0.35s ease both;
  }
  .section-head{
    padding:14px 20px;border-bottom:0.5px solid var(--border-light);
    display:flex;align-items:center;gap:11px;
  }
  .section-icon{
    width:32px;height:32px;border-radius:8px;background:var(--bg-secondary);
    display:flex;align-items:center;justify-content:center;
    color:var(--accent);font-size:14px;flex-shrink:0;
  }
  .section-title{font-family:'DM Serif Display',serif;font-size:16px;color:var(--primary);line-height:1.2;}
  .section-sub  {font-size:11.5px;color:var(--text-light);margin-top:2px;}
  .section-body {padding:18px 20px;}

  /* THEME GRID */
  .theme-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

  /* THEME CARD */
  .theme-card{
    border-radius:12px;overflow:hidden;cursor:pointer;
    border:1.5px solid var(--border);background:var(--card);
    transition:border-color 0.2s,transform 0.2s,box-shadow 0.2s;
    position:relative;
  }
  .theme-card:hover{
    border-color:var(--accent-light);
    transform:translateY(-2px);
    box-shadow:0 8px 22px var(--shadow);
  }
  .theme-card.selected{
    border-color:var(--accent);
    box-shadow:0 0 0 3px var(--accent-light), 0 8px 22px var(--shadow);
  }

  /* SELECTED TICK */
  .theme-tick{
    position:absolute;top:9px;right:9px;z-index:10;
    width:22px;height:22px;border-radius:50%;
    background:var(--accent);color:#fff;
    display:flex;align-items:center;justify-content:center;
    font-size:10px;animation:pop 0.25s ease;
    box-shadow:0 2px 6px rgba(0,0,0,0.18);
  }

  /* THEME PREVIEW */
  .theme-preview{height:108px;position:relative;overflow:hidden;display:flex;}
  .prev-sidebar{
    width:38px;height:100%;display:flex;flex-direction:column;
    align-items:center;padding:8px 0;gap:5px;flex-shrink:0;
  }
  .prev-logo{width:18px;height:18px;border-radius:5px;margin-bottom:3px;}
  .prev-nav-dot{width:14px;height:4px;border-radius:3px;}
  .prev-main{flex:1;display:flex;flex-direction:column;}
  .prev-topbar{height:18px;display:flex;align-items:center;padding:0 8px;gap:5px;border-bottom:0.5px solid rgba(0,0,0,0.08);}
  .prev-content{flex:1;padding:7px 8px;display:flex;flex-direction:column;gap:5px;}
  .prev-card{border-radius:5px;padding:6px 7px;}
  .prev-card-bar{height:3px;border-radius:2px;margin-bottom:4px;width:65%;}
  .prev-card-bar-sm{height:3px;border-radius:2px;width:40%;}
  .prev-chips{display:flex;gap:4px;margin-top:3px;}
  .prev-chip{height:7px;border-radius:8px;}

  /* THEME META */
  .theme-meta{padding:10px 12px;border-top:0.5px solid var(--border-light);}
  .theme-name{font-family:'DM Serif Display',serif;font-size:13.5px;color:var(--primary);margin-bottom:2px;}
  .theme-desc{font-size:11px;font-weight:300;color:var(--text-light);line-height:1.45;}

  /* ACTIVE LINE */
  .active-line{
    margin-top:12px;display:flex;align-items:center;gap:7px;
    font-size:12.5px;color:var(--text-light);
  }

  /* APPLY BTN */
  .apply-btn{
    width:100%;font-family:'Outfit',sans-serif;font-weight:600;font-size:14px;
    background:var(--primary);color:var(--sidebar-text);border:none;
    padding:11px;border-radius:9px;cursor:pointer;margin-top:14px;
    display:flex;align-items:center;justify-content:center;gap:7px;
    transition:background 0.2s,transform 0.15s;
  }
  .apply-btn:hover{background:var(--primary-hover);transform:translateY(-1px);}
  .apply-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none;}

  /* FORM */
  .form-label{
    font-size:12.5px;font-weight:500;color:var(--text-muted);
    margin-bottom:6px;display:flex;align-items:center;gap:6px;
  }
  .form-label i{color:var(--accent);font-size:11px;}
  .form-select{
    width:100%;font-family:'Outfit',sans-serif;font-size:13.5px;color:var(--text);
    background:var(--input-bg);border:1.5px solid var(--border);border-radius:8px;
    padding:9px 12px;outline:none;cursor:pointer;
    appearance:none;-webkit-appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237A9080' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 13px center;padding-right:32px;
    transition:border-color 0.2s;
  }
  .form-select:focus{border-color:var(--primary);}
  .lang-hint{
    margin-top:8px;font-size:11.5px;color:var(--text-light);
    display:flex;align-items:center;gap:6px;
  }
  .lang-hint i{font-size:10px;}

  /* ACCOUNT ROWS */
  .acct-info{
    display:flex;align-items:center;gap:12px;
    padding:4px 0 14px;border-bottom:0.5px solid var(--border-light);margin-bottom:14px;
  }
  .acct-avatar{
    width:42px;height:42px;border-radius:50%;background:var(--accent-light);
    color:var(--primary);display:flex;align-items:center;justify-content:center;
    font-family:'DM Serif Display',serif;font-size:17px;flex-shrink:0;
  }
  .acct-name{font-size:14px;font-weight:600;color:var(--text);line-height:1.2;}
  .acct-email{font-size:12px;color:var(--text-light);margin-top:2px;}

  .acct-actions{display:flex;gap:10px;}
  .acct-btn{
    flex:1;font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;
    padding:10px 12px;border-radius:9px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:7px;
    transition:background 0.18s,border-color 0.18s,color 0.18s;
  }
  .acct-btn.primary{
    background:var(--primary);color:var(--sidebar-text);border:1.5px solid var(--primary);
  }
  .acct-btn.primary:hover{background:var(--primary-hover);border-color:var(--primary-hover);}
  .acct-btn.ghost{
    background:transparent;color:var(--text-muted);border:1.5px solid var(--border);
  }
  .acct-btn.ghost:hover{border-color:var(--primary);color:var(--primary);}

  /* TOAST */
  .toast{
    position:fixed;bottom:24px;right:24px;z-index:500;
    background:var(--primary);color:var(--sidebar-text);
    padding:11px 18px;border-radius:10px;
    font-size:13px;font-weight:500;display:flex;align-items:center;gap:8px;
    box-shadow:0 8px 24px var(--shadow-hover);animation:pop 0.25s ease;
  }

  @media(max-width:700px){
    .page-pad {padding:16px 14px 88px!important;}
    .theme-grid{grid-template-columns:1fr!important;}
    .section-body{padding:14px 16px!important;}
    .acct-actions{flex-direction:column;}
  }
`;

function ThemePreview({ theme }) {
  const v = theme.preview;
  return (
    <div className="theme-preview" style={{ background: v.bg }}>
      <div className="prev-sidebar" style={{ background: v.sidebar }}>
        <div className="prev-logo" style={{ background: v.accent }} />
        {[1,2,3,4].map(i => (
          <div key={i} className="prev-nav-dot"
            style={{ background: i===1 ? v.accent : "rgba(255,255,255,0.22)" }} />
        ))}
      </div>
      <div className="prev-main">
        <div className="prev-topbar" style={{ background:"#FFFFFF" }}>
          <div style={{ height:5, width:30, background:"rgba(0,0,0,0.08)", borderRadius:3 }} />
          <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"rgba(0,0,0,0.1)" }} />
            <div style={{ width:8, height:8, borderRadius:"50%", background: v.sidebar }} />
          </div>
        </div>
        <div className="prev-content">
          <div style={{ background: v.sidebar, borderRadius:5, padding:"6px 8px" }}>
            <div style={{ height:3, width:"55%", background:"rgba(255,255,255,0.55)", borderRadius:2, marginBottom:3 }} />
            <div style={{ height:3, width:"35%", background:"rgba(255,255,255,0.32)", borderRadius:2 }} />
          </div>
          <div style={{ display:"flex", gap:5 }}>
            {[0.9,0.7,0.5].map((o,i) => (
              <div key={i} className="prev-card"
                style={{ flex:1, background:"#FFFFFF", border:"0.5px solid rgba(0,0,0,0.07)" }}>
                <div className="prev-card-bar"    style={{ background: v.text, opacity: o }} />
                <div className="prev-card-bar-sm" style={{ background: v.accent, opacity: 0.85 }} />
              </div>
            ))}
          </div>
          <div className="prev-chips">
            <div className="prev-chip" style={{ width:26, background: v.accent, opacity:0.85 }} />
            <div className="prev-chip" style={{ width:36, background: v.sidebar, opacity:0.5 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { themeId, setTheme, themes } = useTheme();
  const { user, logout, updateLanguage } = useAuthStore();
  const { language: lang, setLanguage } = useSettingsStore();

  const [pending, setPending] = useState(themeId);
  const [toast, setToast] = useState("");
  const [langSaving, setLangSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const applyTheme = () => {
    setTheme(pending);
    showToast(t("settings.theme.isActive", { name: themes[pending].name }));
  };

  const saveLanguage = async () => {
    setLangSaving(true);
    try {
      await updateLanguage(lang);
      showToast(t("settings.language.saved"));
    } catch {
      showToast(t("common.error"));
    } finally {
      setLangSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const themeList = Object.values(themes);
  const initial = (user?.name || user?.email || "A").trim().charAt(0).toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="settings">
        <div className="page-pad">

          <div className="page-header">
            <h1 className="page-title">
              <i className="fa-solid fa-gear" style={{ marginRight:10, color:"var(--accent)" }} />
              {t("settings.title")}
            </h1>
            <p className="page-sub">{t("settings.subtitle")}</p>
          </div>

          {/* THEME */}
          <div className="section">
            <div className="section-head">
              <div className="section-icon"><i className="fa-solid fa-palette" /></div>
              <div>
                <div className="section-title">{t("settings.theme.sectionTitle")}</div>
                <div className="section-sub">{t("settings.theme.sectionSubtitle")}</div>
              </div>
            </div>
            <div className="section-body">
              <div className="theme-grid">
                {themeList.map(theme => (
                  <div key={theme.id}
                    className={`theme-card${pending===theme.id?" selected":""}`}
                    onClick={() => setPending(theme.id)}>
                    {pending === theme.id && (
                      <div className="theme-tick"><i className="fa-solid fa-check" /></div>
                    )}
                    <ThemePreview theme={theme} />
                    <div className="theme-meta">
                      <div className="theme-name">{theme.name}</div>
                      <div className="theme-desc">{theme.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {pending !== themeId ? (
                <button className="apply-btn" onClick={applyTheme}>
                  <i className="fa-solid fa-wand-magic-sparkles" />
                  {t("settings.theme.applyBtn", { name: themes[pending]?.name })}
                </button>
              ) : (
                <div className="active-line">
                  <i className="fa-solid fa-circle-check" style={{ color:"var(--accent)" }} />
                  <span dangerouslySetInnerHTML={{ __html:
                    t("settings.theme.isActive", { name: `<strong style="color:var(--primary)">${themes[themeId]?.name}</strong>` })
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* LANGUAGE */}
          <div className="section">
            <div className="section-head">
              <div className="section-icon"><i className="fa-solid fa-language" /></div>
              <div>
                <div className="section-title">{t("settings.language.sectionTitle")}</div>
                <div className="section-sub">{t("settings.language.sectionSubtitle")}</div>
              </div>
            </div>
            <div className="section-body">
              <label className="form-label" htmlFor="app-language">
                <i className="fa-solid fa-globe" /> {t("settings.language.appLanguage")}
              </label>
              <select id="app-language" className="form-select" value={lang}
                onChange={e => setLanguage(e.target.value)}>
                {["English","Hindi","Marathi","Tamil","Telugu","Kannada","Bengali","Gujarati"].map(l=>(
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <div className="lang-hint">
                <i className="fa-solid fa-circle-info" />
                {t("settings.language.aiHint")}
              </div>
              <button className="apply-btn" onClick={saveLanguage} disabled={langSaving}>
                {langSaving
                  ? <><i className="fa-solid fa-spinner fa-spin" /> {t("settings.language.saving")}</>
                  : <><i className="fa-solid fa-floppy-disk" /> {t("settings.language.saveBtn")}</>}
              </button>
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="section">
            <div className="section-head">
              <div className="section-icon"><i className="fa-solid fa-user" /></div>
              <div>
                <div className="section-title">{t("settings.account.title")}</div>
                <div className="section-sub">{t("settings.account.subtitle")}</div>
              </div>
            </div>
            <div className="section-body">
              <div className="acct-info">
                <div className="acct-avatar">{initial}</div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div className="acct-name" style={{
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"
                  }}>
                    {user?.name || t("settings.account.guest")}
                  </div>
                  {user?.email && (
                    <div className="acct-email" style={{
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"
                    }}>
                      {user.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="acct-actions">
                <button className="acct-btn ghost" onClick={() => navigate("/profile")}>
                  <i className="fa-solid fa-user-pen" />
                  {t("settings.account.editProfile")}
                </button>
                <button className="acct-btn primary" onClick={handleSignOut}>
                  <i className="fa-solid fa-arrow-right-from-bracket" />
                  {t("settings.account.signOut")}
                </button>
              </div>
            </div>
          </div>

        </div>
      </AppLayout>

      {toast && (
        <div className="toast">
          <i className="fa-solid fa-circle-check" style={{ color:"var(--accent)" }} />
          {toast}
        </div>
      )}
    </>
  );
}

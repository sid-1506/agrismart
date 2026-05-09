import { useEffect, useRef, useState } from "react";
import useLocation, { GEO_STATUS_KEY } from "../hooks/useLocation";

/* ──────────────────────────────────────────────
   <LocationInput />  — shared smart location field
   • Browser geolocation auto-detect
   • Debounced India-focused search
   • Keyboard nav, click select, outside-click close
   • Self-contained styles
   ────────────────────────────────────────────── */

const styles = `
  .loc-wrap-inline { position: relative; width: 100%; }

  .loc-detect-chip {
    position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
    width: 32px; height: 32px; border-radius: 7px;
    background: #E8D5B4; color: #1A4731; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; transition: background 0.18s, color 0.18s;
    z-index: 2;
  }
  .loc-detect-chip:hover:not(:disabled) { background: #C8973A; color: #FFFFFF; }
  .loc-detect-chip:disabled { opacity: 0.7; cursor: wait; }

  .loc-dropdown {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
    background: #FFFFFF; border: 1px solid #E0D8CC; border-radius: 10px;
    max-height: 280px; overflow-y: auto;
    box-shadow: 0 12px 32px rgba(26,71,49,0.14);
    animation: locPop 0.15s ease;
  }
  @keyframes locPop {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .loc-state {
    padding: 12px 14px; font-size: 13px; color: #7A9080;
    display: flex; align-items: center; gap: 8px;
  }
  .loc-section {
    padding: 9px 14px 4px; font-size: 10px; font-weight: 600;
    color: #7A9080; text-transform: uppercase; letter-spacing: 0.08em;
  }
  .loc-item {
    width: 100%; background: none; border: none; padding: 10px 14px;
    cursor: pointer; text-align: left;
    display: flex; align-items: center; gap: 10px;
    font-family: 'Outfit', sans-serif; color: #1A1A16;
    transition: background 0.14s;
  }
  .loc-item.active, .loc-item:hover { background: #F7F3ED; }
  .loc-item > i { color: #C8973A; font-size: 12px; flex-shrink: 0; }
  .loc-item-text { flex: 1; min-width: 0; }
  .loc-item-main {
    font-size: 14px; font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .loc-item-sub { font-size: 11px; color: #7A9080; margin-top: 2px; }

  .loc-spin {
    width: 12px; height: 12px; border: 2px solid #E8D5B4;
    border-top-color: #1A4731; border-radius: 50%;
    animation: locSpin 0.7s linear infinite; display: inline-block;
  }
  @keyframes locSpin { to { transform: rotate(360deg); } }

  .loc-dropdown::-webkit-scrollbar { width: 4px; }
  .loc-dropdown::-webkit-scrollbar-thumb { background: #D8D0C4; border-radius: 4px; }

  @media (max-width: 600px) {
    .loc-detect-chip { width: 30px; height: 30px; font-size: 12px; }
    .loc-dropdown { max-height: 240px; }
  }
`;

let stylesInjected = false;
const ensureStyles = () => {
  if (stylesInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.setAttribute("data-loc-input", "true");
  tag.textContent = styles;
  document.head.appendChild(tag);
  stylesInjected = true;
};

export default function LocationInput({
  value,
  onChange,
  onSelect,
  placeholder = "Search city, village or pincode",
  inputClass = "input-field",
  inputStyle,
  autoDetectOnMount = false,
  showDetectButton = true,
  disabled = false,
}) {
  const {
    detect, search, addRecent,
    detecting, searching, suggestions, recent,
  } = useLocation();

  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const wrapRef = useRef(null);
  const autoRan = useRef(false);

  useEffect(ensureStyles, []);

  /* Auto-detect once on mount when caller asks for it */
  useEffect(() => {
    if (!autoDetectOnMount || autoRan.current) return;
    autoRan.current = true;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(GEO_STATUS_KEY) === "denied") return;
    if ((value || "").trim()) return;
    (async () => {
      const place = await detect();
      if (place && place.display) {
        onChange?.(place.display);
        onSelect?.(place);
        addRecent(place);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetectOnMount]);

  /* Outside click closes dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange?.(v);
    setOpen(true);
    setHi(-1);
    search(v);
  };

  const choose = (item) => {
    if (!item) return;
    onChange?.(item.display);
    onSelect?.(item);
    addRecent(item);
    setOpen(false);
    setHi(-1);
  };

  const runDetect = async () => {
    setOpen(false);
    const place = await detect();
    if (place && place.display) {
      onChange?.(place.display);
      onSelect?.(place);
      addRecent(place);
    }
  };

  const trimmed = (value || "").trim();
  const showRecent = open && !trimmed && recent.length > 0;
  const list = trimmed.length >= 3 ? suggestions : (showRecent ? recent : []);

  const onKey = (e) => {
    if (!open) {
      if (e.key === "ArrowDown") { setOpen(true); return; }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(list.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      if (hi >= 0 && list[hi]) { e.preventDefault(); choose(list[hi]); }
    } else if (e.key === "Escape") {
      setOpen(false); setHi(-1);
    }
  };

  const showDropdown =
    open && (
      searching ||
      list.length > 0 ||
      (trimmed.length >= 3 && !searching)
    );

  return (
    <div ref={wrapRef} className="loc-wrap-inline">
      <input
        className={inputClass}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder={detecting ? "Detecting your location…" : placeholder}
        value={value || ""}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        disabled={disabled || detecting}
        style={{
          paddingRight: showDetectButton ? 46 : undefined,
          ...inputStyle,
        }}
      />
      {showDetectButton && (
        <button
          type="button"
          className="loc-detect-chip"
          onClick={runDetect}
          disabled={disabled || detecting}
          title="Detect my location"
          aria-label="Detect my location"
        >
          {detecting
            ? <span className="loc-spin" />
            : <i className="fa-solid fa-location-crosshairs" />}
        </button>
      )}

      {showDropdown && (
        <div className="loc-dropdown" role="listbox">
          {searching && (
            <div className="loc-state">
              <span className="loc-spin" /> Searching…
            </div>
          )}

          {!searching && trimmed.length >= 3 && suggestions.length === 0 && (
            <div className="loc-state">
              <i className="fa-solid fa-circle-info" style={{ color: "#7A9080" }} />
              No matches. Try a different city or pincode.
            </div>
          )}

          {!searching && showRecent && (
            <div className="loc-section">Recent</div>
          )}

          {!searching && list.map((item, idx) => (
            <button
              key={`${item.id || "r"}-${idx}-${item.display}`}
              type="button"
              role="option"
              aria-selected={hi === idx}
              className={`loc-item${hi === idx ? " active" : ""}`}
              onMouseEnter={() => setHi(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(item)}
            >
              <i className="fa-solid fa-location-dot" />
              <div className="loc-item-text">
                <div className="loc-item-main">{item.display}</div>
                {item.country && item.country !== "India" && (
                  <div className="loc-item-sub">{item.country}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import { MapContainer, TileLayer, Polygon, CircleMarker, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AppLayout, layoutStyles } from "../components/Layout";
import client from "../api/client";
import useLocationStore, { useActiveLocation, useLocationCoords } from "../stores/useLocationStore";

const CROPS = ["Wheat","Rice","Cotton","Soybean","Mustard","Maize","Tomato","Sugarcane"];
const INDIA_CENTER = [20.5937, 78.9629];

const pulsingDotIcon = L.divIcon({
  className: "",
  html: '<div class="uloc-dot"><div class="uloc-ring"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const styles = `
  ${layoutStyles}
  .sat-page{padding:28px;max-width:1100px;margin:0 auto;animation:fadeUp 0.4s ease both;}
  .sat-header{margin-bottom:24px;}
  .sat-title{font-size:24px;font-weight:700;color:var(--primary);}
  .sat-subtitle{font-size:14px;color:var(--text-muted);margin-top:2px;}

  .instr-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px 22px;margin-bottom:20px;display:flex;align-items:center;gap:16px;box-shadow:var(--card-shadow);}
  .instr-icon{width:44px;height:44px;background:#E8F5E9;color:#2E7D32;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
  .instr-text{font-size:14px;color:var(--text-muted);line-height:1.6;}
  .instr-text strong{color:var(--text);}

  .map-wrap{border-radius:18px;overflow:hidden;border:1px solid var(--border);box-shadow:var(--card-shadow);margin-bottom:20px;position:relative;}
  .map-overlay-badge{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:1000;background:rgba(26,71,49,0.9);color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;backdrop-filter:blur(4px);pointer-events:none;white-space:nowrap;}

  .map-actions{display:flex;align-items:center;gap:12px;margin-bottom:24px;flex-wrap:wrap;}
  .crop-select{height:42px;padding:0 14px;border:1.5px solid var(--border);border-radius:12px;background:var(--card);font-family:'Outfit',sans-serif;font-size:14px;color:var(--text);outline:none;cursor:pointer;transition:border-color 0.2s;}
  .crop-select:focus{border-color:var(--primary);}
  .btn-primary{height:42px;padding:0 22px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;transition:background 0.2s,transform 0.15s;}
  .btn-primary:hover:not(:disabled){background:var(--primary-hover);transform:translateY(-1px);}
  .btn-primary:disabled{opacity:0.5;cursor:not-allowed;}
  .btn-ghost{height:42px;padding:0 18px;background:transparent;color:var(--text-muted);border:1.5px solid var(--border);border-radius:12px;font-family:'Outfit',sans-serif;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:border-color 0.2s,color 0.2s;}
  .btn-ghost:hover{border-color:var(--primary);color:var(--primary);}
  .pts-badge{font-size:12px;color:var(--text-muted);background:var(--bg-secondary);padding:6px 12px;border-radius:8px;}

  /* Blue pulsing location dot */
  .uloc-dot{width:16px;height:16px;background:#2196F3;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(33,150,243,0.6);position:relative;}
  .uloc-ring{position:absolute;top:50%;left:50%;width:40px;height:40px;background:rgba(33,150,243,0.18);border:2px solid rgba(33,150,243,0.4);border-radius:50%;transform:translate(-50%,-50%);animation:ulocPulse 2s ease-out infinite;}
  @keyframes ulocPulse{0%{transform:translate(-50%,-50%) scale(0.4);opacity:1;}100%{transform:translate(-50%,-50%) scale(1.8);opacity:0;}}

  /* Location toast */
  .loc-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(25,25,25,0.88);color:#fff;padding:10px 22px;border-radius:24px;font-size:13px;font-weight:600;z-index:99999;backdrop-filter:blur(8px);white-space:nowrap;animation:toastIn 0.3s ease both;}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(14px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

  /* Results */
  .results-section{animation:fadeUp 0.4s ease both;}
  .results-grid{display:grid;grid-template-columns:auto 1fr;gap:20px;margin-bottom:20px;}
  @media(max-width:700px){.results-grid{grid-template-columns:1fr;}}

  .ndvi-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--card-shadow);display:flex;flex-direction:column;align-items:center;gap:12px;min-width:200px;}
  .ndvi-label{font-size:13px;font-weight:600;color:var(--text-muted);}
  .ndvi-val{font-size:28px;font-weight:700;}
  .health-pct{font-size:20px;font-weight:700;color:var(--primary);}
  .health-lbl{font-size:13px;color:var(--text-muted);}
  .last-pass{font-size:11px;color:var(--text-light);}

  .interp-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:22px;box-shadow:var(--card-shadow);display:flex;flex-direction:column;gap:12px;}
  .interp-head{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;color:var(--text);}
  .interp-icon{width:36px;height:36px;background:#E8F5E9;color:#2E7D32;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;}
  .interp-text{font-size:14px;color:var(--text-muted);line-height:1.7;}

  .tip-card{background:#F0F7FF;border:1px solid #BBDEFB;border-radius:12px;padding:14px 18px;font-size:13px;color:#1565C0;display:flex;align-items:center;gap:10px;}

  .loading-box{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 20px;gap:14px;}
  .spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 0.7s linear infinite;}
  .load-txt{font-size:14px;color:var(--text-muted);}
  .error-box{background:#FFF3F3;border:1px solid #FFCDD2;border-radius:12px;padding:16px;color:#C62828;font-size:14px;display:flex;align-items:center;gap:10px;margin-bottom:16px;}
`;

// SVG semicircle NDVI gauge
function NDVIGauge({ value }) {
  const pct    = (value + 1) / 2;           // 0..1
  const angle  = pct * 180;                 // 0..180 degrees
  const rad    = ((angle - 180) * Math.PI) / 180;
  const cx = 100, cy = 90, r = 68;
  const nx = cx + r * 0.65 * Math.cos(rad);
  const ny = cy + r * 0.65 * Math.sin(rad);

  const arcPath = (startDeg, endDeg, color) => {
    const s = ((startDeg - 180) * Math.PI) / 180;
    const e = ((endDeg   - 180) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return <path d={`M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />;
  };

  const valColor = value < 0.2 ? "#EF5350" : value < 0.5 ? "#FFB74D" : "#4CAF50";

  return (
    <svg width="200" height="110" viewBox="0 0 200 110">
      {arcPath(0,  54,  "#EF5350")}
      {arcPath(54, 108, "#FFB74D")}
      {arcPath(108,180, "#4CAF50")}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1A4731" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#1A4731" />
      {/* Labels */}
      <text x="12"  y="104" fontSize="10" fill="#EF5350"  fontFamily="Outfit,sans-serif">-1</text>
      <text x="94"  y="24"  fontSize="10" fill="#FFB74D"  fontFamily="Outfit,sans-serif" textAnchor="middle">0</text>
      <text x="184" y="104" fontSize="10" fill="#4CAF50"  fontFamily="Outfit,sans-serif">+1</text>
      {/* Value */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="16" fontWeight="700" fill={valColor} fontFamily="Outfit,sans-serif">{value.toFixed(2)}</text>
    </svg>
  );
}

// Flies the map to the user's location from the unified store.
// If coords aren't ready yet, asks the store to refresh GPS.
function LocationDetector({ onFound, onError }) {
  const map = useMap();
  const coords = useLocationCoords();

  useEffect(() => {
    if (coords) {
      map.flyTo([coords.lat, coords.lon], 15, { duration: 1.5 });
      onFound([coords.lat, coords.lon]);
      return;
    }
    // Trigger a refresh; coords will arrive via the subscription above.
    useLocationStore.getState().refreshLive().then((p) => {
      if (!p) onError();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lon]);

  return null;
}

// Blue pulsing dot at the user's GPS position
function UserLocationMarker({ position }) {
  if (!position) return null;
  return <Marker position={position} icon={pulsingDotIcon} />;
}

// Inner component — must be child of MapContainer
function DrawingLayer({ points, onAddPoint, onComplete }) {
  useMapEvents({
    click(e) {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
    dblclick(e) {
      e.originalEvent.preventDefault();
      onComplete();
    },
  });

  return (
    <>
      {points.length > 1 && (
        <Polygon positions={points} pathOptions={{ color: "#C8973A", fillColor: "#C8973A", fillOpacity: 0.18, weight: 2 }} />
      )}
      {points.map((p, i) => (
        <CircleMarker key={i} center={p} radius={6}
          pathOptions={{ color: "#C8973A", fillColor: "#C8973A", fillOpacity: 1 }} />
      ))}
    </>
  );
}

export default function Satellite() {
  const { t } = useTranslation();
  const [points, setPoints]           = useState([]);
  const [polygonDone, setPolygonDone] = useState(false);
  const [crop, setCrop]               = useState("Wheat");
  const [analyzing, setAnalyzing]     = useState(false);
  const [ndviData, setNdviData]       = useState(null);
  const [interpretation, setInterp]   = useState("");
  const [interpLoading, setInterpLoading] = useState(false);
  const [error, setError]             = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [showToast, setShowToast]     = useState(false);
  const activeLoc = useActiveLocation();

  const handleLocationFound = useCallback((pos) => {
    setUserLocation(pos);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const handleLocationError = useCallback(() => {
    // Map stays at INDIA_CENTER zoom 5 (the MapContainer default)
  }, []);

  const handleAddPoint = useCallback((pt) => {
    if (polygonDone) return;
    setPoints(prev => [...prev, pt]);
  }, [polygonDone]);

  const handleComplete = useCallback(() => {
    if (points.length >= 3) setPolygonDone(true);
  }, [points]);

  const clearPolygon = () => {
    setPoints([]);
    setPolygonDone(false);
    setNdviData(null);
    setInterp("");
    setError("");
  };

  const analyzeField = async () => {
    if (points.length < 3) return;
    setAnalyzing(true);
    setError("");
    setNdviData(null);
    setInterp("");
    try {
      // Convert [lat, lon] pairs to [lon, lat] for GeoJSON
      const geoPolygon = points.map(([lat, lng]) => [lng, lat]);
      geoPolygon.push(geoPolygon[0]); // close ring

      const res = await client.post("/api/satellite/ndvi", { polygon: geoPolygon, cropName: crop });
      setNdviData(res.data);

      // Get AI interpretation
      setInterpLoading(true);
      const interRes = await client.post("/api/satellite/interpret", {
        ndviValue: res.data.ndviValue,
        cropName:  crop,
        location:  activeLoc?.display || "India",
      });
      setInterp(interRes.data.interpretation);
    } catch (err) {
      setError("Analysis failed: " + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
      setInterpLoading(false);
    }
  };

  const healthColor = (label) => {
    if (label === "Poor")      return "#EF5350";
    if (label === "Fair")      return "#FFB74D";
    if (label === "Good")      return "#66BB6A";
    return "#4CAF50";
  };

  const instrText = polygonDone
    ? t("satellite.instrDone", { count: points.length })
    : points.length === 0
      ? t("satellite.instrStart")
      : t("satellite.instrPoints", { count: points.length, s: points.length > 1 ? "s" : "" });

  return (
    <AppLayout pageId="satellite">
      <style>{styles}</style>
      <div className="sat-page">

        <div className="sat-header">
          <div className="sat-title">{t("satellite.title")}</div>
          <div className="sat-subtitle">{t("satellite.subtitle")}</div>
        </div>

        <div className="instr-card">
          <div className="instr-icon"><i className="fa-solid fa-satellite-dish" /></div>
          <div className="instr-text">
            <strong>{t("satellite.step1")}</strong> {instrText}
          </div>
        </div>

        {/* Map */}
        <div className="map-wrap">
          {!polygonDone && points.length === 0 && (
            <div className="map-overlay-badge">
              <i className="fa-solid fa-hand-pointer" style={{ marginRight: 6 }} />
              {t("satellite.drawBoundary")}
            </div>
          )}
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            style={{ height: 450, width: "100%" }}
            doubleClickZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationDetector onFound={handleLocationFound} onError={handleLocationError} />
            <UserLocationMarker position={userLocation} />
            <DrawingLayer points={points} onAddPoint={handleAddPoint} onComplete={handleComplete} />
          </MapContainer>
        </div>

        {/* Actions */}
        <div className="map-actions">
          <select className="crop-select" value={crop} onChange={e => setCrop(e.target.value)}>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {points.length > 0 && (
            <span className="pts-badge">
              <i className="fa-solid fa-vector-square" style={{ marginRight: 6 }} />
              {t("satellite.pointsBadge", { count: points.length })}
            </span>
          )}

          <button className="btn-primary" onClick={analyzeField}
            disabled={analyzing || points.length < 3}>
            {analyzing
              ? <><div style={{ width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /> {t("satellite.fetchingSatData")}</>
              : <><i className="fa-solid fa-satellite" /> {t("satellite.analyzeBtn")}</>}
          </button>

          {points.length > 0 && (
            <button className="btn-ghost" onClick={clearPolygon}>
              <i className="fa-solid fa-rotate-left" /> {t("satellite.clearBtn")}
            </button>
          )}
        </div>

        {error && <div className="error-box"><i className="fa-solid fa-circle-exclamation" />{error}</div>}

        {/* Results */}
        {analyzing && !ndviData && (
          <div className="loading-box">
            <div className="spinner" />
            <div className="load-txt">{t("satellite.contactingSat")}</div>
          </div>
        )}

        {ndviData && (
          <div className="results-section">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 12 }}>
              {t("satellite.analysisResults")}
            </div>
            <div className="results-grid">
              {/* NDVI Gauge Card */}
              <div className="ndvi-card">
                <div className="ndvi-label">{t("satellite.ndviIndex")}</div>
                <NDVIGauge value={ndviData.ndviValue} />
                <div className="ndvi-val" style={{ color: healthColor(ndviData.interpretation) }}>
                  {ndviData.interpretation}
                </div>
                <div>
                  <div className="health-pct">{ndviData.healthPercentage}%</div>
                  <div className="health-lbl" style={{ textAlign: "center" }}>{t("satellite.cropHealth")}</div>
                </div>
                {ndviData.estimated && (
                  <div className="last-pass">
                    <i className="fa-solid fa-info-circle" style={{ marginRight: 4 }} />
                    {t("satellite.estimatedValue")}
                  </div>
                )}
                <div className="last-pass">
                  <i className="fa-solid fa-satellite" style={{ marginRight: 4 }} />
                  {t("satellite.lastPass", { date: ndviData.lastSatellitePass })}
                </div>
              </div>

              {/* Interpretation Card */}
              <div className="interp-card">
                <div className="interp-head">
                  <div className="interp-icon"><i className="fa-solid fa-brain" /></div>
                  {t("satellite.aiInterpTitle")}
                </div>

                {interpLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("satellite.generatingInterp")}</span>
                  </div>
                )}

                {interpretation && (
                  <div className="interp-text">{interpretation}</div>
                )}

                {/* NDVI reference scale */}
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>{t("satellite.ndviReference")}</div>
                  {[
                    { range: "< 0.2", label: "Poor — Bare soil or stressed crop", color: "#EF5350" },
                    { range: "0.2–0.4", label: "Fair — Sparse or early-stage crop", color: "#FFB74D" },
                    { range: "0.4–0.6", label: "Good — Healthy moderate growth", color: "#66BB6A" },
                    { range: "> 0.6",  label: "Excellent — Dense healthy vegetation", color: "#4CAF50" },
                  ].map(item => (
                    <div key={item.range} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                      <span style={{ color: item.color, fontWeight: 600, minWidth: 60 }}>{item.range}</span>
                      <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="tip-card">
              <i className="fa-solid fa-lightbulb" />
              <span><strong>Tip:</strong> {t("satellite.tipText")}</span>
            </div>
          </div>
        )}

      </div>

      {/* Location toast */}
      {showToast && (
        <div className="loc-toast">{t("satellite.centeredLocation")}</div>
      )}
    </AppLayout>
  );
}

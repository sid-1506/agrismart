import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AppLayout, layoutStyles } from "../components/Layout";
import useSettingsStore from "../stores/useSettingsStore";

const API = import.meta.env.VITE_API_URL ?? "";

// Resize + compress image to stay under ~1MB base64 payload
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_SIDE = 1024;
      let { width, height } = img;

      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width >= height) {
          height = Math.round(height * MAX_SIDE / width);
          width  = MAX_SIDE;
        } else {
          width  = Math.round(width * MAX_SIDE / height);
          height = MAX_SIDE;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      let quality = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      // ~1,400,000 chars ≈ 1 MB binary after base64 decode
      while (dataUrl.length > 1_400_000 && quality > 0.3) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }

      resolve(dataUrl.split(",")[1]);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image load failed"));
    };

    img.src = objectUrl;
  });
}

const styles = `
  ${layoutStyles}

  @keyframes fadeUp   { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes pop      { 0%{transform:scale(0.9);opacity:0;}70%{transform:scale(1.03);}100%{transform:scale(1);opacity:1;} }
  @keyframes shimmer  { 0%{background-position:-400px 0;}100%{background-position:400px 0;} }

  .dd-wrap  { max-width:860px; margin:0 auto; padding:26px 28px 60px; }

  /* Header */
  .dd-header { margin-bottom:24px; animation:fadeUp 0.4s ease both; }
  .dd-title  { font-family:'DM Serif Display',serif; font-size:clamp(22px,3vw,28px); color:var(--primary); }
  .dd-sub    { font-size:14px; font-weight:300; color:var(--text-muted); margin-top:5px; }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed var(--border); border-radius:16px; padding:40px 24px;
    text-align:center; cursor:pointer; transition:border-color 0.2s, background 0.2s;
    background:var(--card); animation:fadeUp 0.4s 0.05s ease both;
  }
  .upload-zone:hover,.upload-zone.drag-over {
    border-color:var(--primary); background:var(--bg-secondary);
  }
  .upload-zone.has-image { border-style:solid; border-color:var(--primary); }

  .upload-icon {
    width:72px; height:72px; border-radius:18px;
    background:var(--accent-light); display:flex; align-items:center;
    justify-content:center; font-size:30px; margin:0 auto 16px;
  }
  .upload-title  { font-family:'DM Serif Display',serif; font-size:20px; color:var(--primary); margin-bottom:6px; }
  .upload-hint   { font-size:13px; color:var(--text-muted); }
  .upload-limit  { font-size:11px; color:var(--text-light); margin-top:4px; }

  /* Preview */
  .preview-wrap {
    position:relative; border-radius:12px; overflow:hidden; margin-bottom:16px;
    animation: pop 0.35s ease both;
  }
  .preview-img  { width:100%; max-height:340px; object-fit:contain; display:block; background:var(--bg-secondary); }
  .preview-clear {
    position:absolute; top:10px; right:10px; width:32px; height:32px;
    border-radius:8px; background:rgba(0,0,0,0.55); color:#fff; border:none;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:13px; transition:background 0.2s;
  }
  .preview-clear:hover { background:rgba(192,57,43,0.85); }

  /* Crop name input */
  .crop-input-wrap { margin:16px 0; animation:fadeUp 0.4s 0.08s ease both; }
  .crop-label { font-size:13px; font-weight:500; color:var(--text-muted); margin-bottom:7px; display:block; }
  .crop-input {
    width:100%; font-family:'Outfit',sans-serif; font-size:14px; color:var(--text);
    background:var(--card); border:1.5px solid var(--border); border-radius:8px;
    padding:10px 13px; outline:none; transition:border-color 0.2s;
  }
  .crop-input:focus { border-color:var(--primary); }
  .crop-input::placeholder { color:var(--text-light); }

  /* Analyze button */
  .analyze-btn {
    width:100%; font-family:'Outfit',sans-serif; font-weight:600; font-size:15px;
    background:var(--primary); color:var(--sidebar-text); border:none;
    padding:14px; border-radius:10px; cursor:pointer; margin-top:6px;
    display:flex; align-items:center; justify-content:center; gap:9px;
    transition:background 0.2s, transform 0.15s;
    animation:fadeUp 0.4s 0.12s ease both;
  }
  .analyze-btn:hover   { background:var(--primary-hover); transform:translateY(-1px); }
  .analyze-btn:active  { transform:translateY(0); }
  .analyze-btn:disabled{ background:var(--border); color:var(--text-light); cursor:not-allowed; transform:none; }

  /* Result card */
  .result-card {
    background:var(--card); border:0.5px solid var(--border); border-radius:16px;
    padding:24px 26px; margin-top:24px; animation:pop 0.4s ease both;
    box-shadow:0 4px 18px var(--shadow);
  }
  .result-head {
    display:flex; align-items:center; gap:12px; margin-bottom:18px;
    padding-bottom:14px; border-bottom:0.5px solid var(--border);
  }
  .result-icon {
    width:44px; height:44px; border-radius:12px;
    background:rgba(46,204,113,0.12); display:flex; align-items:center;
    justify-content:center; font-size:20px; flex-shrink:0;
  }
  .result-title { font-family:'DM Serif Display',serif; font-size:20px; color:var(--primary); }
  .result-sub   { font-size:12px; color:var(--text-light); margin-top:2px; }
  .result-body  {
    font-size:14px; line-height:1.75; color:var(--text-muted); white-space:pre-wrap;
  }
  .result-body h1,.result-body h2,.result-body h3 {
    font-family:'DM Serif Display',serif; color:var(--primary);
    font-size:16px; margin:12px 0 5px;
  }
  .result-body strong { font-weight:600; color:var(--text); }
  .result-body ul  { padding-left:18px; margin:6px 0; }
  .result-body li  { margin-bottom:4px; }

  .try-again-btn {
    font-family:'Outfit',sans-serif; font-size:13px; font-weight:500;
    background:none; color:var(--accent); border:1.5px solid var(--accent);
    border-radius:8px; padding:9px 20px; cursor:pointer; margin-top:18px;
    transition:background 0.18s, color 0.18s;
  }
  .try-again-btn:hover { background:var(--accent); color:var(--sidebar-text); }

  /* Analysis skeleton */
  .skel { background:linear-gradient(90deg,var(--bg-secondary) 25%,var(--surface) 50%,var(--bg-secondary) 75%);
    background-size:400px 100%; animation:shimmer 1.4s ease infinite; border-radius:8px; }

  /* Error */
  .error-banner {
    background:rgba(192,57,43,0.1); border:1px solid rgba(192,57,43,0.25);
    border-radius:10px; padding:12px 16px; font-size:13px; color:#C0392B;
    display:flex; align-items:center; gap:9px; margin-top:12px;
    animation:fadeUp 0.3s ease;
  }

  @media(max-width:700px){
    .dd-wrap { padding:18px 16px 88px; }
  }
`;

function renderResult(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm,  "<h2>$1</h2>")
    .replace(/^# (.+)$/gm,   "<h1>$1</h1>")
    .replace(/^[\-\*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g,   "<br/>");
}

export default function DiseaseDetection() {
  const { t } = useTranslation();
  const { language } = useSettingsStore();

  const [image,      setImage]      = useState(null);  // compressed base64
  const [imageURL,   setImageURL]   = useState(null);  // object URL for preview
  const [cropName,   setCropName]   = useState("");
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [processing, setProcessing] = useState(false); // image compression
  const [error,      setError]      = useState(null);
  const [dragging,   setDragging]   = useState(false);

  const fileRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG or PNG).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Image too large — maximum original size is 15MB.");
      return;
    }
    setError(null);
    setResult(null);
    setImage(null);

    const url = URL.createObjectURL(file);
    setImageURL(url);

    setProcessing(true);
    try {
      const base64 = await compressImage(file);
      setImage(base64);
    } catch {
      setError("Could not process image — try a different file.");
      setImageURL(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const clearImage = () => {
    setImage(null);
    setImageURL(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const analyze = async () => {
    if (!image) {
      setError(t("disease.noImage"));
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await axios.post(`${API}/api/disease`, {
        imageBase64: image,
        cropName:    cropName.trim() || undefined,
        lang:        language,
      });
      if (data.success) {
        setResult(data.analysis);
      } else {
        setError(data.message || "Analysis failed.");
      }
    } catch (err) {
      if (err.response?.status === 413) {
        setError("Image still too large — try a lower-resolution photo.");
      } else if (err.response?.status === 429) {
        setError("AI rate limit reached — please wait a moment and try again.");
      } else {
        setError(err.response?.data?.message || err.message || "Analysis failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout pageId="disease">
      <style>{styles}</style>

      <div className="dd-wrap">
        {/* Header */}
        <div className="dd-header">
          <h1 className="dd-title">
            <i className="fa-solid fa-microscope" style={{ marginRight:10, color:"var(--accent)" }}/>
            {t("disease.title")}
          </h1>
          <p className="dd-sub">{t("disease.subtitle")}</p>
        </div>

        {/* Upload zone */}
        <div
          className={`upload-zone${imageURL ? " has-image" : ""}${dragging ? " drag-over" : ""}`}
          onClick={() => !imageURL && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display:"none" }}
            onChange={handleFileChange}
          />

          {imageURL ? (
            <div className="preview-wrap" onClick={e => e.stopPropagation()}>
              <img src={imageURL} alt="Crop preview" className="preview-img"/>
              <button className="preview-clear" onClick={clearImage} title="Remove">
                <i className="fa-solid fa-xmark"/>
              </button>
            </div>
          ) : (
            <>
              <div className="upload-icon">🌿</div>
              <div className="upload-title">{t("disease.dragDrop")}</div>
              <div className="upload-hint">{t("disease.upload")}</div>
              <div className="upload-limit">{t("disease.supported")}</div>
            </>
          )}
        </div>

        {/* Crop name input */}
        <div className="crop-input-wrap">
          <label className="crop-label">
            <i className="fa-solid fa-seedling" style={{ color:"var(--accent)", marginRight:5 }}/>
            {t("disease.cropName")}
          </label>
          <input
            className="crop-input"
            placeholder={t("disease.cropNamePlaceholder")}
            value={cropName}
            onChange={e => setCropName(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="error-banner">
            <i className="fa-solid fa-triangle-exclamation"/>
            {error}
          </div>
        )}

        {/* Analyze button */}
        <button
          className="analyze-btn"
          onClick={analyze}
          disabled={!image || loading || processing}
        >
          {processing ? (
            <><i className="fa-solid fa-spinner fa-spin"/> Compressing image…</>
          ) : loading ? (
            <><i className="fa-solid fa-spinner fa-spin"/> {t("disease.analyzing")}</>
          ) : (
            <><i className="fa-solid fa-magnifying-glass"/> {t("disease.analyze")}</>
          )}
        </button>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ marginTop:24 }}>
            {[180, 24, 120, 24, 80].map((h, i) => (
              <div key={i} className="skel" style={{ height:h, marginBottom:10 }}/>
            ))}
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="result-card">
            <div className="result-head">
              <div className="result-icon">🔬</div>
              <div>
                <div className="result-title">{t("disease.result")}</div>
                <div className="result-sub">
                  {cropName ? `Analysis for ${cropName}` : "AI-powered crop analysis"}
                </div>
              </div>
            </div>
            <div
              className="result-body"
              dangerouslySetInnerHTML={{ __html: renderResult(result) }}
            />
            <button className="try-again-btn" onClick={clearImage}>
              <i className="fa-solid fa-rotate-left" style={{ marginRight:6 }}/>
              {t("disease.tryAnother")}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppLayout, layoutStyles } from "../components/Layout";
import { useActiveLocation } from "../stores/useLocationStore";

import wheatImg     from "../assets/crops/wheat.png";
import soybeanImg   from "../assets/crops/soybean.png";
import cottonImg    from "../assets/crops/cotton.png";
import riceImg      from "../assets/crops/rice.png";
import tomatoImg    from "../assets/crops/tomato.png";
import mustardImg   from "../assets/crops/mustard.png";
import sugarcaneImg from "../assets/crops/sugarcane.png";
import maizeImg     from "../assets/crops/maize.png";
import chickpeaImg  from "../assets/crops/chickpea.png";
import bananaImg    from "../assets/crops/banana.png";
import mangoImg     from "../assets/crops/mango.png";
import onionImg     from "../assets/crops/onion.png";
import groundnutImg from "../assets/crops/groundnut.png";
import potatoImg    from "../assets/crops/potato.png";
import turmericImg  from "../assets/crops/turmeric.png";
import sunflowerImg from "../assets/crops/sunflower.png";
import fallbackImg  from "../assets/crops/fallback.png";

const C = {
  primary: "#1A4731", primaryDark: "#0D2A1F", secondary: "#2E6B49",
  accent: "#C8973A", accentLight: "#E8D5B4", bg: "#F7F3ED",
  surface: "#EDE8E0", text: "#1A1A16", textMuted: "#4A5E50",
  textLight: "#7A9080", white: "#FFFFFF",
};

const API = import.meta.env.VITE_API_URL ?? "";

/* ═══════════════════════════════════════════════════════════════
   CROP ICON RESOLUTION SYSTEM
   ─────────────────────────────────────────────────────────────
   The backend Crop model does NOT store icon/iconColor fields.
   When crops arrive from the API, they have no icon data.
   This system resolves icons by normalized crop name so every
   crop ALWAYS renders a valid, consistent icon.
   ═══════════════════════════════════════════════════════════════ */

/** Master icon registry — keyed by lowercase trimmed crop name */
const CROP_ICON_MAP = {
  wheat:        { icon: "fa-wheat-awn",           iconColor: "#C8973A", bgHue: "#FDF3E0" },
  soybean:      { icon: "fa-circle-dot",          iconColor: "#2E6B49", bgHue: "#E8F5E4" },
  cotton:       { icon: "fa-cloud",               iconColor: "#7A9080", bgHue: "#EAF0F0" },
  rice:         { icon: "fa-bowl-rice",            iconColor: "#C8973A", bgHue: "#FEF9E7" },
  tomato:       { icon: "fa-circle",              iconColor: "#E74C3C", bgHue: "#FDEDEC" },
  mustard:      { icon: "fa-sun",                 iconColor: "#F1C40F", bgHue: "#FEFDE7" },
  sugarcane:    { icon: "fa-bars-staggered",       iconColor: "#2E6B49", bgHue: "#E8F5E4" },
  maize:        { icon: "fa-seedling",            iconColor: "#F39C12", bgHue: "#FEF9E7" },
  corn:         { icon: "fa-seedling",            iconColor: "#F39C12", bgHue: "#FEF9E7" },
  chickpea:     { icon: "fa-circle-half-stroke",  iconColor: "#8B6914", bgHue: "#F5EDD6" },
  chana:        { icon: "fa-circle-half-stroke",  iconColor: "#8B6914", bgHue: "#F5EDD6" },
  banana:       { icon: "fa-leaf",                iconColor: "#F1C40F", bgHue: "#FEFDE7" },
  mango:        { icon: "fa-apple-whole",         iconColor: "#F39C12", bgHue: "#FEF9E7" },
  onion:        { icon: "fa-circle-dot",          iconColor: "#C0392B", bgHue: "#FDEDEC" },
  groundnut:    { icon: "fa-ellipsis",            iconColor: "#A0522D", bgHue: "#F5EDD6" },
  peanut:       { icon: "fa-ellipsis",            iconColor: "#A0522D", bgHue: "#F5EDD6" },
  turmeric:     { icon: "fa-mortar-pestle",       iconColor: "#DAA520", bgHue: "#FEFDE7" },
  potato:       { icon: "fa-cubes-stacked",       iconColor: "#8B7355", bgHue: "#F5EDD6" },
  lentil:       { icon: "fa-circle-half-stroke",  iconColor: "#D35400", bgHue: "#FDEDEC" },
  masoor:       { icon: "fa-circle-half-stroke",  iconColor: "#D35400", bgHue: "#FDEDEC" },
  sunflower:    { icon: "fa-sun",                 iconColor: "#F4D03F", bgHue: "#FEFDE7" },
  "bitter gourd":{ icon: "fa-leaf",               iconColor: "#27AE60", bgHue: "#E8F5E4" },
  garlic:       { icon: "fa-burst",               iconColor: "#BDC3C7", bgHue: "#F0EFED" },
  "pigeon pea": { icon: "fa-circle-dot",          iconColor: "#27AE60", bgHue: "#E8F5E4" },
  arhar:        { icon: "fa-circle-dot",          iconColor: "#27AE60", bgHue: "#E8F5E4" },
  tur:          { icon: "fa-circle-dot",          iconColor: "#27AE60", bgHue: "#E8F5E4" },
  jowar:        { icon: "fa-wheat-awn",           iconColor: "#C8973A", bgHue: "#FDF3E0" },
  sorghum:      { icon: "fa-wheat-awn",           iconColor: "#C8973A", bgHue: "#FDF3E0" },
  bajra:        { icon: "fa-wheat-awn",           iconColor: "#8B6914", bgHue: "#F5EDD6" },
  millet:       { icon: "fa-wheat-awn",           iconColor: "#8B6914", bgHue: "#F5EDD6" },
  tea:          { icon: "fa-mug-hot",             iconColor: "#2E6B49", bgHue: "#E8F5E4" },
  coffee:       { icon: "fa-mug-saucer",          iconColor: "#6F4E37", bgHue: "#F5EDD6" },
  coconut:      { icon: "fa-tree",                iconColor: "#2E6B49", bgHue: "#E8F5E4" },
  papaya:       { icon: "fa-apple-whole",         iconColor: "#E67E22", bgHue: "#FEF9E7" },
  guava:        { icon: "fa-apple-whole",         iconColor: "#27AE60", bgHue: "#E8F5E4" },
  chilli:       { icon: "fa-pepper-hot",          iconColor: "#E74C3C", bgHue: "#FDEDEC" },
  pepper:       { icon: "fa-pepper-hot",          iconColor: "#E74C3C", bgHue: "#FDEDEC" },
  ginger:       { icon: "fa-root",                iconColor: "#DAA520", bgHue: "#FEFDE7" },
  jute:         { icon: "fa-bars-staggered",       iconColor: "#8B6914", bgHue: "#F5EDD6" },
  rubber:       { icon: "fa-tree",                iconColor: "#2C3E50", bgHue: "#EAF0F0" },
};

/** Default fallback for crops not in the registry */
const FALLBACK_ICON = { icon: "fa-seedling", iconColor: "#2E6B49", bgHue: "#E8F5E4" };

/** PNG image map — keyed by lowercase trimmed crop name */
const CROP_IMAGE_MAP = {
  wheat:      wheatImg,
  soybean:    soybeanImg,
  cotton:     cottonImg,
  rice:       riceImg,
  tomato:     tomatoImg,
  mustard:    mustardImg,
  sugarcane:  sugarcaneImg,
  maize:      maizeImg,
  corn:       maizeImg,
  chickpea:   chickpeaImg,
  chana:      chickpeaImg,
  banana:     bananaImg,
  mango:      mangoImg,
  onion:      onionImg,
  groundnut:  groundnutImg,
  peanut:     groundnutImg,
  potato:     potatoImg,
  turmeric:   turmericImg,
  sunflower:  sunflowerImg,
};

function resolveCropImage(cropName) {
  if (!cropName) return fallbackImg;
  const key = String(cropName).trim().toLowerCase();
  return CROP_IMAGE_MAP[key] || fallbackImg;
}

/**
 * Resolves icon data for any crop name.
 * Handles case insensitivity, leading/trailing whitespace, and
 * returns a guaranteed non-null { icon, iconColor, bgHue } object.
 */
function resolveCropIcon(cropName) {
  if (!cropName) return FALLBACK_ICON;
  const key = String(cropName).trim().toLowerCase();
  return CROP_ICON_MAP[key] || FALLBACK_ICON;
}

/**
 * Enriches a crop object with resolved icon data.
 * Safe to call on both seed crops AND API crops.
 */
function enrichCropWithIcon(crop) {
  const resolved = resolveCropIcon(crop?.name);
  return {
    ...crop,
    icon:      resolved.icon,
    iconColor: resolved.iconColor,
    bgHue:     resolved.bgHue,
  };
}

/* ── Static seed crops (shown while API loads or if empty) ── */
const SEED_CROPS = [
  { _id:"1", name:"Wheat",     season:"Rabi",   category:"Cereal",    duration:"120-150 days", regions:["Punjab","Haryana","UP","MP"],
    conditions:{ soil:"Loamy",temperature:"10-25°C",rainfall:"250-500mm",humidity:"60-70%" },
    description:"Wheat is India's most important rabi crop, grown across northern plains. Rich in carbohydrates and protein." },
  { _id:"2", name:"Soybean",   season:"Kharif", category:"Oilseed",   duration:"90-120 days",  regions:["Maharashtra","MP","Rajasthan"],
    conditions:{ soil:"Well-drained loam",temperature:"25-30°C",rainfall:"600-800mm",humidity:"65-75%" },
    description:"Soybean is a major oilseed and protein crop. Highly profitable in Kharif season across central India." },
  { _id:"3", name:"Cotton",    season:"Kharif", category:"Cash Crop",  duration:"150-180 days", regions:["Gujarat","Maharashtra","Telangana"],
    conditions:{ soil:"Black cotton soil",temperature:"21-35°C",rainfall:"500-700mm",humidity:"55-65%" },
    description:"Cotton is India's white gold. A major cash crop that supports millions of farmers across the Deccan." },
  { _id:"4", name:"Rice",      season:"Kharif", category:"Cereal",    duration:"100-130 days", regions:["WB","Odisha","Tamil Nadu","AP"],
    conditions:{ soil:"Clayey, water retentive",temperature:"20-35°C",rainfall:"1000-2000mm",humidity:"70-80%" },
    description:"Rice is the staple food of over half of India's population, grown in flooded paddy fields." },
  { _id:"5", name:"Tomato",    season:"All Season", category:"Vegetable", duration:"60-90 days", regions:["Maharashtra","Karnataka","AP","HP"],
    conditions:{ soil:"Sandy loam",temperature:"18-27°C",rainfall:"400-600mm",humidity:"60-70%" },
    description:"Tomato is a high-value vegetable crop cultivated year-round. Widely grown across India in varied climates." },
  { _id:"6", name:"Mustard",   season:"Rabi",   category:"Oilseed",   duration:"90-110 days",  regions:["Rajasthan","UP","Haryana","MP"],
    conditions:{ soil:"Sandy loam to loam",temperature:"10-25°C",rainfall:"250-400mm",humidity:"55-65%" },
    description:"Mustard is India's second most important oilseed crop, thriving in the cool dry winters of northern India." },
  { _id:"7", name:"Sugarcane", season:"All Season", category:"Cash Crop", duration:"300-365 days", regions:["UP","Maharashtra","Karnataka","TN"],
    conditions:{ soil:"Deep loamy",temperature:"20-35°C",rainfall:"1000-1500mm",humidity:"65-80%" },
    description:"Sugarcane is India's most important commercial crop, forming the backbone of the sugar industry." },
  { _id:"8", name:"Maize",     season:"Kharif", category:"Cereal",    duration:"80-110 days",  regions:["Karnataka","MP","Bihar","Rajasthan"],
    conditions:{ soil:"Well-drained loam",temperature:"20-30°C",rainfall:"500-900mm",humidity:"60-70%" },
    description:"Maize is a versatile crop used as food, fodder, and industrial raw material across India." },
  { _id:"9", name:"Chickpea",  season:"Rabi",   category:"Pulse",     duration:"90-120 days",  regions:["MP","Rajasthan","Maharashtra","UP"],
    conditions:{ soil:"Sandy loam to medium black",temperature:"15-25°C",rainfall:"250-400mm",humidity:"50-60%" },
    description:"Chickpea (Chana) is India's most important pulse crop, grown extensively in central and northern India." },
  { _id:"10", name:"Banana",   season:"All Season", category:"Fruit",  duration:"300-400 days", regions:["Tamil Nadu","Maharashtra","Gujarat","AP"],
    conditions:{ soil:"Rich loamy",temperature:"20-35°C",rainfall:"1200-2200mm",humidity:"70-85%" },
    description:"Banana is India's largest produced fruit, grown in tropical and subtropical regions with high humidity." },
  { _id:"11", name:"Mango",    season:"Zaid",   category:"Fruit",     duration:"365+ days",    regions:["UP","Maharashtra","AP","Gujarat"],
    conditions:{ soil:"Deep alluvial or sandy loam",temperature:"24-27°C",rainfall:"750-1200mm",humidity:"55-70%" },
    description:"India is the world's largest mango producer. Known as the king of fruits, it has over 1000 varieties." },
  { _id:"12", name:"Onion",    season:"Rabi",   category:"Vegetable", duration:"100-120 days", regions:["Maharashtra","Karnataka","MP","Gujarat"],
    conditions:{ soil:"Sandy loam to clay loam",temperature:"13-24°C",rainfall:"350-500mm",humidity:"55-65%" },
    description:"Onion is a critically important vegetable crop in India, both for domestic consumption and export." },
].map(enrichCropWithIcon);

const SEASONS    = ["All", "Kharif", "Rabi", "Zaid", "All Season"];
const CATEGORIES = ["All", "Cereal", "Pulse", "Oilseed", "Vegetable", "Fruit", "Cash Crop"];

const styles = `
  ${layoutStyles}

  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.96);}to{opacity:1;transform:scale(1);} }
  @keyframes spin    { to{transform:rotate(360deg);} }

  .page-pad { padding: 26px 28px 52px; }

  /* ── PAGE HEADER ── */
  .page-header { margin-bottom: 24px; animation: fadeUp 0.4s ease both; }
  .page-title  { font-family:'DM Serif Display',serif; font-size:clamp(24px,3vw,32px); color:${C.primary}; }
  .page-sub    { font-size:14px; font-weight:300; color:${C.textMuted}; margin-top:5px; }

  /* ── FILTER BAR ── */
  .filter-bar {
    display:flex; align-items:center; gap:12px; flex-wrap:wrap;
    margin-bottom:22px; animation:fadeUp 0.4s 0.06s ease both;
  }
  .search-input-wrap {
    display:flex; align-items:center; gap:8px; flex:1; min-width:200px; max-width:320px;
    background:${C.white}; border:1.5px solid #D8D0C4; border-radius:9px; padding:9px 14px;
    transition:border-color 0.2s,box-shadow 0.2s;
  }
  .search-input-wrap:focus-within { border-color:${C.primary}; box-shadow:0 0 0 3px rgba(26,71,49,0.07); }
  .search-input-wrap i     { color:${C.textLight}; font-size:13px; flex-shrink:0; }
  .search-input-wrap input {
    background:none; border:none; outline:none;
    font-family:'Outfit',sans-serif; font-size:14px; color:${C.text}; width:100%;
  }
  .search-input-wrap input::placeholder { color:${C.textLight}; }

  .filter-group { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .filter-chip {
    font-family:'Outfit',sans-serif; font-size:12px; font-weight:500;
    padding:7px 14px; border-radius:20px; cursor:pointer;
    border:1.5px solid #D8D0C4; background:${C.white}; color:${C.textMuted};
    transition:all 0.18s; white-space:nowrap;
  }
  .filter-chip:hover  { border-color:${C.primary}; color:${C.primary}; }
  .filter-chip.active { background:${C.primary}; color:${C.bg}; border-color:${C.primary}; }

  .results-count { font-size:13px; color:${C.textLight}; margin-left:auto; white-space:nowrap; }

  /* ── CROPS GRID ── */
  .crops-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
    gap:16px; animation:fadeUp 0.4s 0.12s ease both;
  }

  /* ── CROP CARD ── */
  .crop-card {
    background:${C.white}; border:0.5px solid #E0D8CC; border-radius:16px;
    overflow:hidden; cursor:pointer;
    transition:transform 0.22s,box-shadow 0.22s,border-color 0.22s;
  }
  .crop-card:hover { transform:translateY(-5px); box-shadow:0 14px 40px rgba(26,71,49,0.13); border-color:${C.secondary}; }

  .crop-card-top {
    height:96px; display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden;
  }
  .crop-card-icon {
    width:78px; height:78px; object-fit:contain;
    position:relative; z-index:1; display:block;
    transition:transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
    filter:drop-shadow(0 4px 8px rgba(0,0,0,0.10));
  }
  .crop-card:hover .crop-card-icon {
    transform:scale(1.1) translateY(-4px);
  }
  .crop-card-body { padding:16px 18px; }

  .crop-name    { font-family:'DM Serif Display',serif; font-size:18px; color:${C.primary}; margin-bottom:5px; }
  .crop-tags    { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px; }
  .crop-tag     {
    font-size:10px; font-weight:600; padding:3px 9px; border-radius:20px;
    letter-spacing:0.04em; text-transform:uppercase;
  }
  .crop-desc    { font-size:12px; font-weight:300; color:${C.textMuted}; line-height:1.65;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .crop-footer  { display:flex; align-items:center; justify-content:space-between; margin-top:12px; }
  .crop-duration{ font-size:11px; color:${C.textLight}; display:flex; align-items:center; gap:5px; }
  .crop-cta     { font-size:12px; font-weight:600; color:${C.accent}; display:flex; align-items:center; gap:4px; }

  /* ── MODAL OVERLAY ── */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(10,26,18,0.55);
    z-index:200; display:flex; align-items:center; justify-content:center;
    padding:20px; animation:fadeIn 0.2s ease;
    backdrop-filter:blur(3px);
  }
  .modal {
    background:${C.white}; border-radius:20px; width:100%; max-width:620px;
    max-height:90vh; overflow-y:auto; animation:scaleIn 0.25s ease;
    box-shadow:0 32px 80px rgba(0,0,0,0.2);
  }
  .modal::-webkit-scrollbar{width:5px;}
  .modal::-webkit-scrollbar-thumb{background:#D8D0C4;border-radius:4px;}

  .modal-hero {
    height:140px; display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden; border-radius:20px 20px 0 0;
  }
  .modal-hero-icon {
    width:110px; height:110px; object-fit:contain;
    position:relative; z-index:1; display:block;
    filter:drop-shadow(0 6px 14px rgba(0,0,0,0.12));
  }
  .modal-close {
    position:absolute; top:14px; right:14px; z-index:2;
    width:32px; height:32px; border-radius:50%; background:rgba(0,0,0,0.18);
    border:none; cursor:pointer; color:${C.white}; font-size:14px;
    display:flex; align-items:center; justify-content:center;
    transition:background 0.18s;
  }
  .modal-close:hover { background:rgba(0,0,0,0.35); }
  .modal-body  { padding:24px 28px 28px; }
  .modal-name  { font-family:'DM Serif Display',serif; font-size:26px; color:${C.primary}; margin-bottom:8px; }
  .modal-desc  { font-size:14px; font-weight:300; color:${C.textMuted}; line-height:1.75; margin-bottom:20px; }

  .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:22px; }
  .detail-item {
    background:${C.bg}; border-radius:10px; padding:13px 15px;
    border:0.5px solid ${C.accentLight};
  }
  .detail-label { font-size:10px; font-weight:600; text-transform:uppercase;
    letter-spacing:0.08em; color:${C.textLight}; margin-bottom:5px;
    display:flex; align-items:center; gap:5px; }
  .detail-val { font-size:14px; font-weight:500; color:${C.primary}; }

  .regions-list { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:22px; }
  .region-chip  { font-size:12px; font-weight:500; background:rgba(26,71,49,0.07);
    color:${C.primary}; padding:4px 12px; border-radius:20px; }

  .modal-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .btn-plan {
    flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
    font-family:'Outfit',sans-serif; font-weight:600; font-size:15px;
    background:${C.primary}; color:${C.bg}; border:none;
    padding:13px 24px; border-radius:10px; cursor:pointer;
    transition:background 0.2s,transform 0.15s; min-width:160px;
  }
  .btn-plan:hover:not(:disabled) { background:${C.secondary}; transform:translateY(-1px); }
  .btn-plan:disabled { opacity:0.65; cursor:not-allowed; }
  .btn-chat {
    display:flex; align-items:center; justify-content:center; gap:8px;
    font-family:'Outfit',sans-serif; font-weight:500; font-size:15px;
    background:transparent; color:${C.primary};
    border:1.5px solid ${C.accentLight}; padding:13px 20px;
    border-radius:10px; cursor:pointer;
    transition:background 0.2s,border-color 0.2s;
  }
  .btn-chat:hover { background:${C.accentLight}; border-color:${C.accent}; }

  /* Plan generating state */
  .plan-progress {
    background:${C.bg}; border:0.5px solid ${C.accentLight};
    border-radius:10px; padding:16px 18px; margin-top:16px;
    display:flex; align-items:center; gap:12px;
  }
  .plan-spinner {
    width:20px; height:20px; border:2px solid #D8D0C4;
    border-top-color:${C.primary}; border-radius:50%;
    animation:spin 0.7s linear infinite; flex-shrink:0;
  }
  .plan-prog-text { font-size:13px; color:${C.textMuted}; }
  .plan-prog-text strong { color:${C.primary}; }

  /* Empty / error */
  .empty-state { text-align:center; padding:60px 20px; }
  .empty-icon  { font-size:40px; color:${C.accentLight}; margin-bottom:14px; }
  .empty-title { font-family:'DM Serif Display',serif; font-size:20px; color:${C.primary}; margin-bottom:6px; }
  .empty-desc  { font-size:13px; color:${C.textLight}; line-height:1.7; }

  /* Responsive */
  @media(max-width:860px) {
    .crops-grid { grid-template-columns:repeat(auto-fill,minmax(200px,1fr))!important; }
    .detail-grid{ grid-template-columns:1fr 1fr!important; }
  }
  @media(max-width:600px) {
    .page-pad   { padding:18px 16px 88px!important; }
    .crops-grid { grid-template-columns:1fr 1fr!important; gap:12px!important; }
    .filter-bar { gap:8px!important; }
    .modal-body { padding:18px 18px 22px!important; }
    .detail-grid{ grid-template-columns:1fr!important; }
    .modal-actions { flex-direction:column!important; }
    .btn-plan, .btn-chat { min-width:unset!important; }
    .modal      { border-radius:16px!important; }
  }
`;

/* ── Season tag color map ── */
const seasonStyle = (s) => ({
  Kharif:      { bg:"rgba(26,71,49,0.1)",    color:C.primary },
  Rabi:        { bg:"rgba(200,151,58,0.15)",  color:"#7A5000" },
  Zaid:        { bg:"rgba(231,76,60,0.1)",    color:"#922B21" },
  "All Season":{ bg:"rgba(46,204,113,0.1)",   color:"#1A6B3C" },
}[s] || { bg:C.surface, color:C.textMuted });

const categoryStyle = (c) => ({
  Cereal:     { bg:"rgba(241,196,15,0.12)",  color:"#7D6608" },
  Pulse:      { bg:"rgba(46,204,113,0.1)",   color:"#1A6B3C" },
  Oilseed:    { bg:"rgba(200,151,58,0.12)",  color:"#7A5000" },
  Vegetable:  { bg:"rgba(26,71,49,0.1)",     color:C.primary },
  Fruit:      { bg:"rgba(231,76,60,0.1)",    color:"#922B21" },
  "Cash Crop":{ bg:"rgba(122,144,128,0.12)", color:"#3A5040" },
}[c] || { bg:C.surface, color:C.textMuted });

/* ── Helper: translate crop fields with fallback ── */
function tc(t, key, fallback) {
  const v = t(key, { defaultValue: "" });
  return v || fallback || "";
}

/* ── Crop Card ── */
function CropCard({ crop, onClick }) {
  const { t } = useTranslation();
  const cropName = tc(t, `crops.data.cropNames.${crop.name}`, crop.name);
  const cropSeason = tc(t, `crops.data.seasons.${crop.season}`, crop.season);
  const cropCategory = tc(t, `crops.data.categories.${crop.category}`, crop.category);
  const cropDesc = tc(t, `crops.data.cropDescriptions.${crop.name}`, crop.description);
  const cropDuration = tc(t, `crops.data.durations.${crop.duration}`, crop.duration);
  const ss = seasonStyle(crop.season);
  const cs = categoryStyle(crop.category);
  const resolved = resolveCropIcon(crop.name);
  const topBg    = crop.bgHue || resolved.bgHue;

  return (
    <div className="crop-card" onClick={() => onClick(crop)}>
      <div className="crop-card-top" style={{ background:topBg }}>
        <img
          src={resolveCropImage(crop.name)}
          alt={cropName}
          className="crop-card-icon"
          onError={e => { e.currentTarget.src = fallbackImg; }}
        />
      </div>
      <div className="crop-card-body">
        <div className="crop-name">{cropName}</div>
        <div className="crop-tags">
          <span className="crop-tag" style={{ background:ss.bg, color:ss.color }}>{cropSeason}</span>
          <span className="crop-tag" style={{ background:cs.bg, color:cs.color }}>{cropCategory}</span>
        </div>
        <div className="crop-desc">{cropDesc}</div>
        <div className="crop-footer">
          <span className="crop-duration">
            <i className="fa-regular fa-clock" style={{ fontSize:10 }} />
            {cropDuration}
          </span>
          <span className="crop-cta">
            {t("crops.viewDetails")} <i className="fa-solid fa-arrow-right" style={{ fontSize:10 }} />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Crop Detail Modal ── */
function CropModal({ crop, onClose, onPlanGenerated }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [progMsg,    setProgMsg]    = useState("");
  const activeLoc = useActiveLocation();
  const userLocation = activeLoc?.display
    || (() => { try { return JSON.parse(localStorage.getItem("user")||"{}").location; } catch { return ""; } })()
    || "India";

  const cropName = tc(t, `crops.data.cropNames.${crop.name}`, crop.name);
  const cropSeason = tc(t, `crops.data.seasons.${crop.season}`, crop.season);
  const cropCategory = tc(t, `crops.data.categories.${crop.category}`, crop.category);
  const cropDesc = tc(t, `crops.data.cropDescriptions.${crop.name}`, crop.description);
  const cropDuration = tc(t, `crops.data.durations.${crop.duration}`, crop.duration);
  const cropSoil = tc(t, `crops.data.soilTypes.${crop.conditions?.soil}`, crop.conditions?.soil);

  const ss = seasonStyle(crop.season);
  const cs = categoryStyle(crop.category);
  const resolved = resolveCropIcon(crop.name);
  const topBg    = crop.bgHue || resolved.bgHue;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const generatePlan = async () => {
    setGenerating(true);
    setProgMsg(t("crops.planProgress.askingAI"));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("crops.planProgress.loginRequired"));
      }

      // Step 1 — generate AI plan
      setProgMsg(t("crops.planProgress.generatingTimeline"));
      const { data: planData } = await axios.post(
        `${API}/api/chat/generate-plan`,
        { cropName: crop.name, location: userLocation, season: crop.season },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Step 2 — save plan
      setProgMsg(t("crops.planProgress.savingPlan"));
      const planPayload = {
        cropName: planData.plan.cropName || crop.name,
        crop: crop._id?.length === 24 ? crop._id : undefined,
        season: planData.plan.season || crop.season,
        location: planData.plan.location || userLocation,
        timeline: Array.isArray(planData.plan.timeline) ? planData.plan.timeline : [],
        aiPlan: planData.plan.aiPlan || (typeof planData.plan === "string" ? planData.plan : ""),
      };

      const { data: saved } = await axios.post(
        `${API}/api/plans`,
        planPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProgMsg(t("crops.planProgress.done"));
      setTimeout(() => {
        onClose();
        navigate(`/plans/${saved.plan._id}`);
      }, 800);
    } catch (err) {
      setProgMsg("");
      setGenerating(false);
      alert(err.response?.data?.message || err.message || t("crops.planProgress.failed"));
    }
  };

  const askAboutCrop = () => {
    onClose();
    navigate("/chat", { state:{ prefill: t("crops.askAboutCropPrompt", { crop: cropName, location: userLocation }) } });
  };

  return (
    <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal">
        {/* Hero */}
        <div className="modal-hero" style={{ background:topBg }}>
          <img
            src={resolveCropImage(crop.name)}
            alt={cropName}
            className="modal-hero-icon"
            onError={e => { e.currentTarget.src = fallbackImg; }}
          />
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-name">{cropName}</div>
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            <span className="crop-tag" style={{ background:ss.bg, color:ss.color }}>{cropSeason}</span>
            <span className="crop-tag" style={{ background:cs.bg, color:cs.color }}>{cropCategory}</span>
          </div>
          <div className="modal-desc">{cropDesc}</div>

          {/* Conditions grid */}
          <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,color:C.primary,marginBottom:12 }}>
            {t("crops.modal.growingConditions")}
          </div>
          <div className="detail-grid">
            {[
              { icon:"fa-earth-asia",      label:t("crops.conditions.soilType"),    val:cropSoil        || "—" },
              { icon:"fa-thermometer-half",label:t("crops.conditions.temperature"), val:crop.conditions?.temperature || "—" },
              { icon:"fa-cloud-rain",      label:t("crops.conditions.rainfall"),    val:crop.conditions?.rainfall    || "—" },
              { icon:"fa-droplet",         label:t("crops.conditions.humidity"),    val:crop.conditions?.humidity    || "—" },
              { icon:"fa-clock",           label:t("crops.conditions.duration"),    val:cropDuration                || "—" },
              { icon:"fa-calendar",        label:t("crops.conditions.season"),      val:cropSeason                  || "—" },
            ].map(({ icon,label,val }) => (
              <div key={label} className="detail-item">
                <div className="detail-label">
                  <i className={`fa-solid ${icon}`} style={{ color:C.accent }} /> {label}
                </div>
                <div className="detail-val">{val}</div>
              </div>
            ))}
          </div>

          {/* Regions */}
          {crop.regions?.length > 0 && (
            <>
              <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:16,
                color:C.primary,marginBottom:10 }}>
                {t("crops.modal.bestRegions")}
              </div>
              <div className="regions-list">
                {crop.regions.map(r => (
                  <span key={r} className="region-chip">
                    <i className="fa-solid fa-location-dot" style={{ fontSize:10,marginRight:4 }} />
                    {tc(t, `crops.data.regions.${r}`, r)}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div style={{ borderTop:`0.5px solid #E0D8CC`, paddingTop:20 }}>
            <div className="modal-actions">
              <button className="btn-plan" onClick={generatePlan} disabled={generating}>
                {generating
                  ? <><div className="plan-spinner" /> {t("crops.modal.generating")}</>
                  : <><i className="fa-solid fa-file-circle-plus" /> {t("crops.modal.generatePlan")}</>}
              </button>
              <button className="btn-chat" onClick={askAboutCrop}>
                <i className="fa-solid fa-comments" /> {t("crops.modal.askAI")}
              </button>
            </div>

            {generating && (
              <div className="plan-progress">
                <div className="plan-spinner" />
                <div className="plan-prog-text">
                  <strong>{t("crops.modal.building")}</strong>{progMsg}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN CROPS PAGE
═══════════════════════════════════════ */
export default function Crops() {
  const { t } = useTranslation();
  const [crops,          setCrops]      = useState(SEED_CROPS);
  const [filtered,       setFiltered]   = useState(SEED_CROPS);
  const [search,         setSearch]     = useState("");
  const [season,         setSeason]     = useState("All");
  const [category,       setCategory]   = useState("All");
  const [selected,       setSelected]   = useState(null);
  const [loading,        setLoading]    = useState(true);
  const searchRef = useRef(null);

  /* Fetch crops from API */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/crops`, {
          headers:{ Authorization:`Bearer ${token}` },
        });
        if (data.crops?.length > 0) setCrops(data.crops.map(enrichCropWithIcon));
      } catch {
        /* keep seed crops if API fails */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Apply filters */
  useEffect(() => {
    let result = crops;
    if (search)           result = result.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (season !== "All") result = result.filter(c => c.season === season);
    if (category !== "All") result = result.filter(c => c.category === category);
    setFiltered(result);
  }, [crops, search, season, category]);

  const clearFilters = () => { setSearch(""); setSeason("All"); setCategory("All"); };
  const hasFilters   = search || season !== "All" || category !== "All";

  return (
    <>
      <style>{styles}</style>
      <AppLayout pageId="crops">
        <div className="page-pad">

          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">
              <i className="fa-solid fa-seedling" style={{ marginRight:10, color:C.accent }} />
              {t("crops.heading")}
            </h1>
            <p className="page-sub">
              {t("crops.subheading", { count: crops.length })}
            </p>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            {/* Search */}
            <div className="search-input-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input ref={searchRef} placeholder={t("crops.searchPlaceholder")}
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch("")}
                  style={{ background:"none",border:"none",cursor:"pointer",color:C.textLight,fontSize:12,padding:"0 2px" }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Season */}
            <div className="filter-group">
              {[
                { key: "All",        label: t("crops.seasons.all")       },
                { key: "Kharif",     label: t("crops.seasons.kharif")    },
                { key: "Rabi",       label: t("crops.seasons.rabi")      },
                { key: "Zaid",       label: t("crops.seasons.zaid")      },
                { key: "All Season", label: t("crops.seasons.allSeason") },
              ].map(({ key, label }) => (
                <button key={key} className={`filter-chip${season===key?" active":""}`}
                  onClick={() => setSeason(key)}>{label}</button>
              ))}
            </div>

            {/* Category */}
            <div className="filter-group">
              {[
                { key: "All",       label: t("crops.categories.all")      },
                { key: "Cereal",    label: t("crops.categories.cereal")   },
                { key: "Pulse",     label: t("crops.categories.pulse")    },
                { key: "Oilseed",   label: t("crops.categories.oilseed")  },
                { key: "Vegetable", label: t("crops.categories.vegetable")},
                { key: "Fruit",     label: t("crops.categories.fruit")    },
                { key: "Cash Crop", label: t("crops.categories.cashCrop") },
              ].map(({ key, label }) => (
                <button key={key} className={`filter-chip${category===key?" active":""}`}
                  onClick={() => setCategory(key)}>{label}</button>
              ))}
            </div>

            <div style={{ display:"flex",alignItems:"center",gap:10,marginLeft:"auto",flexShrink:0 }}>
              <span className="results-count">
                <i className="fa-solid fa-layer-group" style={{ marginRight:5,fontSize:11 }} />
                {filtered.length === 1 ? t("crops.resultsCount", { count: filtered.length }) : t("crops.resultsCountPlural", { count: filtered.length })}
              </span>
              {hasFilters && (
                <button onClick={clearFilters}
                  style={{ fontSize:12,fontWeight:500,color:C.accent,background:"none",
                    border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>
                  <i className="fa-solid fa-rotate-left" style={{ fontSize:10 }} /> {t("crops.reset")}
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display:"flex",justifyContent:"center",padding:"60px 0" }}>
              <div style={{ width:28,height:28,border:"2.5px solid #E0D8CC",
                borderTopColor:C.primary,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fa-solid fa-seedling" /></div>
              <div className="empty-title">{t("crops.noFound")}</div>
              <div className="empty-desc">
                {t("crops.noFoundDesc")}<br />
                <button onClick={clearFilters}
                  style={{ marginTop:12,font:"inherit",fontSize:13,fontWeight:600,
                    color:C.accent,background:"none",border:"none",cursor:"pointer" }}>
                  {t("crops.clearFilters")}
                </button>
              </div>
            </div>
          ) : (
            <div className="crops-grid">
              {filtered.map(crop => (
                <CropCard key={crop._id} crop={crop} onClick={setSelected} />
              ))}
            </div>
          )}

        </div>

        {/* Detail Modal */}
        {selected && (
          <CropModal crop={selected} onClose={() => setSelected(null)} />
        )}
      </AppLayout>
    </>
  );
}

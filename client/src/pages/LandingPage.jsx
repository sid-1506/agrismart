import { useState, useEffect, useRef, useCallback } from "react";

/* ── Design tokens ── */
const C = {
  primary:     "#1A4731",
  primaryDark: "#0D2A1F",
  heroDark:    "#091A0F",
  secondary:   "#2E6B49",
  accent:      "#C8973A",
  accentLight: "#E8D5B4",
  bg:          "#F7F3ED",
  surface:     "#EDE8E0",
  text:        "#1A1A16",
  textMuted:   "#4A5E50",
  textLight:   "#7A9080",
  white:       "#FFFFFF",
};

/* ── Animated counter hook ── */
function useCounter(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const timer = setInterval(() => {
      frame++;
      const progress = ease(Math.min(frame / totalFrames, 1));
      setCount(Math.floor(progress * target));
      if (frame >= totalFrames) { setCount(target); clearInterval(timer); }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

/* ── useInView hook ── */
function useInView(threshold = 0.2) {
  const ref  = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

/* ── Global styles ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@200;300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${C.bg}; font-family: 'Outfit', sans-serif; color: ${C.text}; overflow-x: hidden; }

  /* ── Keyframes ── */
  @keyframes fadeUp    { from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn    { from{opacity:0;}to{opacity:1;} }
  @keyframes floatY    { 0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);} }
  @keyframes floatY2   { 0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);} }
  @keyframes rotateSlw { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
  @keyframes pulse     { 0%,100%{opacity:1;}50%{opacity:0.35;} }
  @keyframes typingDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;} }
  @keyframes slideChat { from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);} }
  @keyframes menuSlide { from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);} }
  @keyframes glow      { 0%,100%{box-shadow:0 0 30px rgba(200,151,58,0.25);}50%{box-shadow:0 0 60px rgba(200,151,58,0.55);} }
  @keyframes shimmer   { 0%{background-position:-600px 0;}100%{background-position:600px 0;} }
  @keyframes revealUp  { from{opacity:0;transform:translateY(44px);}to{opacity:1;transform:translateY(0);} }
  @keyframes scaleIn   { from{opacity:0;transform:scale(0.88);}to{opacity:1;transform:scale(1);} }
  @keyframes scanLine  {
    0%{transform:translateY(-100%);}
    100%{transform:translateY(400%);}
  }

  .reveal            { opacity:0; }
  .reveal.visible    { animation: revealUp 0.75s cubic-bezier(0.22,1,0.36,1) both; }
  .reveal-scale      { opacity:0; }
  .reveal-scale.visible { animation: scaleIn 0.6s cubic-bezier(0.22,1,0.36,1) both; }

  .anim-fade-up   { animation: fadeUp  0.8s ease both; }
  .anim-fade-up-1 { animation: fadeUp  0.8s 0.12s ease both; }
  .anim-fade-up-2 { animation: fadeUp  0.8s 0.27s ease both; }
  .anim-fade-up-3 { animation: fadeUp  0.8s 0.42s ease both; }
  .anim-fade-up-4 { animation: fadeUp  0.8s 0.57s ease both; }
  .anim-fade-in   { animation: fadeIn  1.2s 0.3s ease both; }

  /* ── Grain overlay ── */
  .grain {
    position:absolute;inset:0;pointer-events:none;z-index:1;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:140px;
  }

  /* ── Nav ── */
  .nav-scrolled { background:rgba(9,26,15,0.92)!important; backdrop-filter:blur(14px); box-shadow:0 1px 0 rgba(200,151,58,0.12); }
  .nav-link {
    font-family:'Outfit',sans-serif; font-size:14px; color:rgba(247,243,237,0.7);
    text-decoration:none; font-weight:500; padding:6px 0; position:relative; transition:color 0.2s;
  }
  .nav-link::after { content:''; position:absolute; bottom:0; left:0; width:0; height:1.5px; background:${C.accent}; transition:width 0.25s; }
  .nav-link:hover  { color:${C.accent}; }
  .nav-link:hover::after { width:100%; }

  .hamburger       { background:none; border:none; cursor:pointer; padding:8px; display:flex; flex-direction:column; gap:5px; }
  .hamburger span  { display:block; width:22px; height:2px; background:${C.accentLight}; border-radius:2px; transition:all 0.25s; }
  .mobile-menu     { position:absolute; top:68px; right:5%; min-width:220px; z-index:200; background:${C.primaryDark}; border-radius:12px; padding:8px; box-shadow:0 12px 40px rgba(0,0,0,0.4); animation:menuSlide 0.2s ease; display:flex; flex-direction:column; border:0.5px solid rgba(200,151,58,0.2); }
  .mob-link        { font-family:'Outfit',sans-serif; font-size:15px; font-weight:500; color:rgba(247,243,237,0.75); text-decoration:none; padding:12px 16px; border-radius:8px; transition:background 0.15s; }
  .mob-link:hover  { background:rgba(255,255,255,0.07); }
  .mob-divider     { height:0.5px; background:rgba(255,255,255,0.08); margin:4px 0; }

  /* ── Buttons ── */
  .btn-primary {
    font-family:'Outfit',sans-serif; font-weight:700; font-size:15px;
    background:${C.accent}; color:${C.primaryDark}; border:none;
    padding:14px 32px; border-radius:10px; cursor:pointer;
    transition:background 0.2s, transform 0.15s, box-shadow 0.2s;
    text-decoration:none; display:inline-block; text-align:center;
    box-shadow:0 4px 20px rgba(200,151,58,0.35);
  }
  .btn-primary:hover { background:#D4A545; transform:translateY(-2px); box-shadow:0 8px 28px rgba(200,151,58,0.5); }

  .btn-ghost {
    font-family:'Outfit',sans-serif; font-weight:500; font-size:15px;
    background:rgba(255,255,255,0.08); color:rgba(247,243,237,0.85);
    border:1.5px solid rgba(255,255,255,0.2);
    padding:13px 32px; border-radius:10px; cursor:pointer;
    transition:all 0.2s; text-decoration:none; display:inline-block; text-align:center;
    backdrop-filter:blur(4px);
  }
  .btn-ghost:hover { background:rgba(255,255,255,0.14); transform:translateY(-2px); }

  .btn-primary-light {
    font-family:'Outfit',sans-serif; font-weight:700; font-size:15px;
    background:${C.primary}; color:${C.bg}; border:none;
    padding:14px 32px; border-radius:10px; cursor:pointer;
    transition:all 0.2s; text-decoration:none; display:inline-block; text-align:center;
    box-shadow:0 4px 18px rgba(26,71,49,0.28);
  }
  .btn-primary-light:hover { background:${C.secondary}; transform:translateY(-2px); }

  .btn-outline-light {
    font-family:'Outfit',sans-serif; font-weight:500; font-size:15px;
    background:transparent; color:${C.primary};
    border:2px solid ${C.primary};
    padding:13px 32px; border-radius:10px; cursor:pointer;
    transition:all 0.2s; text-decoration:none; display:inline-block; text-align:center;
  }
  .btn-outline-light:hover { background:${C.primary}; color:${C.bg}; transform:translateY(-2px); }

  /* ── Feature cards ── */
  .feature-card {
    background:${C.white}; border:0.5px solid #D8D0C4; border-radius:16px;
    padding:30px 26px; position:relative; overflow:hidden;
    transition:transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s;
    cursor:default;
  }
  .feature-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg, ${C.accent}, #D4A545);
    transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease;
  }
  .feature-card:hover { transform:translateY(-7px); box-shadow:0 18px 48px rgba(26,71,49,0.14); border-color:${C.accentLight}; }
  .feature-card:hover::before { transform:scaleX(1); }
  .feature-icon-wrap {
    width:52px; height:52px; border-radius:14px; margin-bottom:18px;
    display:flex; align-items:center; justify-content:center; font-size:22px;
    transition:transform 0.3s;
  }
  .feature-card:hover .feature-icon-wrap { transform:scale(1.1) rotate(-3deg); }

  /* ── Stats cards ── */
  .stat-num {
    font-family:'DM Serif Display',serif; font-size:clamp(44px,5vw,68px);
    color:${C.white}; line-height:1;
  }
  .stat-label { font-family:'Outfit',sans-serif; font-size:14px; font-weight:300; color:rgba(247,243,237,0.6); margin-top:6px; }

  /* ── Step card ── */
  .step-card {
    background:rgba(255,255,255,0.05); border:0.5px solid rgba(255,255,255,0.1);
    border-radius:16px; padding:26px; position:relative; overflow:hidden;
    transition:background 0.25s, transform 0.25s;
  }
  .step-card::before { content:attr(data-num); position:absolute; top:-12px; right:14px; font-family:'DM Serif Display',serif; font-size:90px; color:rgba(200,151,58,0.12); line-height:1; pointer-events:none; user-select:none; }
  .step-card:hover   { background:rgba(255,255,255,0.08); transform:translateY(-4px); }

  /* ── Timeline ── */
  .timeline-dot { width:30px; height:30px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; margin-top:2px; }

  /* ── Chat bubble ── */
  .chat-bubble-user { background:${C.primary}; color:${C.bg}; font-family:'Outfit',sans-serif; font-size:13px; padding:10px 14px; border-radius:14px 14px 3px 14px; max-width:82%; margin-left:auto; line-height:1.5; animation:slideChat 0.5s ease both; }
  .chat-bubble-ai   { background:rgba(247,243,237,0.1); color:rgba(247,243,237,0.9); backdrop-filter:blur(4px); border:0.5px solid rgba(255,255,255,0.12); font-family:'Outfit',sans-serif; font-size:13px; padding:10px 14px; border-radius:14px 14px 14px 3px; max-width:87%; line-height:1.5; animation:slideChat 0.5s 0.3s ease both; }

  /* ── Testimonial card ── */
  .testi-card {
    background:${C.white}; border:0.5px solid #D8D0C4; border-radius:16px; padding:26px 24px;
    transition:transform 0.25s, box-shadow 0.25s;
  }
  .testi-card:hover { transform:translateY(-6px); box-shadow:0 14px 40px rgba(26,71,49,0.12); }
  .testi-stars { color:${C.accent}; font-size:14px; letter-spacing:2px; margin-bottom:14px; }

  /* ── Footer ── */
  footer a { color:rgba(247,243,237,0.45); text-decoration:none; font-size:13px; transition:color 0.2s; }
  footer a:hover { color:${C.accent}; }

  /* ── Crop chip ── */
  .crop-tag { font-family:'Outfit',sans-serif; font-size:12px; font-weight:600; background:rgba(200,151,58,0.15); color:${C.accent}; padding:5px 14px; border-radius:20px; display:inline-flex; align-items:center; gap:6px; border:0.5px solid rgba(200,151,58,0.3); letter-spacing:0.03em; }

  /* ── Gradient text ── */
  .grad-text {
    background: linear-gradient(135deg, ${C.accent} 0%, #E8B84C 50%, ${C.accent} 100%);
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:shimmer 4s linear infinite;
  }

  /* ── Responsive ── */
  .nav-desktop  { display:flex; }
  .nav-burger   { display:none; }
  @media(max-width:900px){
    .nav-desktop  { display:none !important; }
    .nav-burger   { display:flex !important; }
    .hero-grid    { grid-template-columns:1fr !important; }
    .hero-chat    { display:none !important; }
    .feat-grid    { grid-template-columns:repeat(2,1fr) !important; }
    .steps-grid   { grid-template-columns:repeat(2,1fr) !important; }
    .tl-grid      { grid-template-columns:1fr !important; }
    .stats-row    { grid-template-columns:repeat(2,1fr) !important; }
    .testi-grid   { grid-template-columns:repeat(2,1fr) !important; }
    .footer-grid  { grid-template-columns:1fr 1fr !important; }
    .hero-stats   { gap:24px !important; }
  }
  @media(max-width:600px){
    .section-pad  { padding:64px 5% !important; }
    .hero-pad     { padding:100px 5% 52px !important; min-height:auto !important; }
    .feat-grid    { grid-template-columns:1fr !important; }
    .steps-grid   { grid-template-columns:1fr !important; }
    .testi-grid   { grid-template-columns:1fr !important; }
    .footer-grid  { grid-template-columns:1fr !important; }
    .hero-btns    { flex-direction:column !important; }
    .hero-btns a  { width:100% !important; text-align:center !important; }
    .cta-btns     { flex-direction:column !important; align-items:center !important; }
    .cta-btns a   { width:100% !important; max-width:320px !important; }
    .stats-row    { grid-template-columns:1fr 1fr !important; }
  }
`;

/* ── Navbar ── */
function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className={scrolled ? "nav-scrolled" : ""} style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 5%", height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      transition:"background 0.4s, box-shadow 0.4s",
      background: scrolled ? undefined : "transparent",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, background:C.accent, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <i className="fa-solid fa-wheat-awn" style={{ color:C.primaryDark, fontSize:17 }}/>
        </div>
        <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:21, color:C.accentLight, letterSpacing:"-0.01em" }}>AgriSmart</span>
      </div>

      <div className="nav-desktop" style={{ gap:32, alignItems:"center" }}>
        {[["Features","#features"],["How It Works","#how-it-works"],["About","#about"]].map(([l,h])=>(
          <a key={l} href={h} className="nav-link">{l}</a>
        ))}
      </div>
      <div className="nav-desktop" style={{ gap:10 }}>
        <a href="/login"  className="btn-ghost" style={{ padding:"9px 22px", fontSize:14 }}>Login</a>
        <a href="/signup" className="btn-primary" style={{ padding:"9px 22px", fontSize:14 }}>Sign Up Free</a>
      </div>

      <div className="nav-burger" style={{ flexDirection:"column", alignItems:"flex-end", position:"relative" }}>
        <button className="hamburger" onClick={()=>setOpen(o=>!o)}>
          <span style={{ transform:open?"rotate(45deg) translate(5px,5px)":"none" }}/>
          <span style={{ opacity:open?0:1 }}/>
          <span style={{ transform:open?"rotate(-45deg) translate(5px,-5px)":"none" }}/>
        </button>
        {open && (
          <div className="mobile-menu">
            {[["Features","#features"],["How It Works","#how-it-works"],["About","#about"]].map(([l,h])=>(
              <a key={l} href={h} className="mob-link" onClick={()=>setOpen(false)}>{l}</a>
            ))}
            <div className="mob-divider"/>
            <a href="/login"  className="mob-link" onClick={()=>setOpen(false)}>Login</a>
            <a href="/signup" className="mob-link" style={{ color:C.accent, fontWeight:600 }} onClick={()=>setOpen(false)}>Sign Up Free →</a>
          </div>
        )}
      </div>
    </nav>
  );
}

/* ── Chat Preview (hero) ── */
function ChatPreview() {
  const [step, setStep] = useState(0);
  const msgs = [
    { t:"user", text:"What crops grow best in Maharashtra in July?" },
    { t:"ai",   text:"For July Kharif in Maharashtra, I recommend Soybean, Cotton, or Bajra — all thrive in this season. Want a profit estimate?" },
    { t:"user", text:"Yes! Calculate profit for Soybean — 2 acres." },
    { t:"ai",   text:"Based on current mandi prices: Expected yield 26 quintals, Gross Revenue ₹97,500, Net Profit ~₹52,000. ROI: 114% 🌾" },
  ];
  useEffect(() => {
    if (step < msgs.length) {
      const t = setTimeout(()=>setStep(s=>s+1), step===0?600:2000);
      return ()=>clearTimeout(t);
    }
  }, [step]);
  return (
    <div style={{
      background:"rgba(255,255,255,0.06)", borderRadius:18, padding:18,
      border:"0.5px solid rgba(255,255,255,0.12)",
      backdropFilter:"blur(12px)",
      boxShadow:"0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,151,58,0.1)",
      width:"100%", minHeight:270,
      animation:"floatY2 5s ease-in-out infinite",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, paddingBottom:12, borderBottom:"0.5px solid rgba(255,255,255,0.1)" }}>
        <div style={{ width:9, height:9, borderRadius:"50%", background:"#2ECC71", animation:"pulse 2s infinite" }}/>
        <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, color:C.accentLight }}>AgriSmart AI</span>
        <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(247,243,237,0.35)", fontFamily:"'Outfit',sans-serif" }}>Powered by Groq</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.slice(0, step).map((m, i) => (
          <div key={i} className={m.t==="user"?"chat-bubble-user":"chat-bubble-ai"}>{m.text}</div>
        ))}
        {step < msgs.length && step > 0 && (
          <div style={{ display:"flex", gap:4, padding:"8px 12px", alignItems:"center" }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"rgba(247,243,237,0.4)", animation:`typingDot 1.2s ${i*0.2}s infinite ease-in-out` }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Hero ── */
function HeroSection({ scrollY }) {
  const [statsRef, statsVis] = useInView(0.3);
  const c1 = useCounter(10000, 2000, statsVis);
  const c2 = useCounter(500,   1600, statsVis);
  const c3 = useCounter(8,     1200, statsVis);

  return (
    <section className="hero-pad" style={{
      minHeight:"100vh", padding:"104px 5% 70px",
      background:`linear-gradient(155deg, ${C.heroDark} 0%, ${C.primary} 100%)`,
      position:"relative", overflow:"hidden",
      display:"flex", alignItems:"center",
    }}>
      {/* Grain */}
      <div className="grain" style={{ opacity:0.05 }}/>

      {/* Large BG text watermark */}
      <div style={{
        position:"absolute", top:"5%", left:"-2%", zIndex:0,
        fontFamily:"'DM Serif Display',serif", fontSize:"clamp(120px,18vw,260px)",
        fontWeight:700, color:"rgba(200,151,58,0.04)",
        userSelect:"none", pointerEvents:"none", lineHeight:1,
        transform:`translateY(${scrollY * 0.08}px)`,
        willChange:"transform",
      }}>AGRI<br/>SMART</div>

      {/* Parallax circles */}
      {[
        { w:460, h:460, top:"4%",  right:"-8%", brd:"rgba(200,151,58,0.12)", speed:0.12 },
        { w:280, h:280, top:"12%", right:"-2%", brd:"rgba(200,151,58,0.18)", speed:0.25 },
        { w:120, h:120, top:"30%", right:"12%", brd:"rgba(200,151,58,0.25)", speed:0.4  },
        { w:200, h:200, bottom:"8%", left:"2%", brd:"rgba(200,151,58,0.1)",  speed:0.18 },
      ].map((c, i) => (
        <div key={i} style={{
          position:"absolute", width:c.w, height:c.h, borderRadius:"50%",
          border:`1.5px solid ${c.brd}`, pointerEvents:"none", zIndex:0,
          top:c.top, right:c.right, bottom:c.bottom, left:c.left,
          transform:`translateY(${scrollY * c.speed}px)`,
          willChange:"transform",
        }}/>
      ))}

      {/* Floating accent dot */}
      <div style={{
        position:"absolute", width:12, height:12, borderRadius:"50%",
        background:C.accent, opacity:0.55, top:"22%", left:"8%",
        animation:"floatY 3s ease-in-out infinite",
        transform:`translateY(${scrollY * 0.35}px)`,
      }}/>
      <div style={{
        position:"absolute", width:7, height:7, borderRadius:"50%",
        background:C.accent, opacity:0.4, top:"55%", left:"15%",
        animation:"floatY 4.5s 1s ease-in-out infinite",
        transform:`translateY(${scrollY * 0.55}px)`,
      }}/>

      {/* Content */}
      <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center", width:"100%", position:"relative", zIndex:2 }}>
        {/* Left */}
        <div>
          <div className="anim-fade-up" style={{ marginBottom:20 }}>
            <span className="crop-tag">
              <i className="fa-solid fa-bolt"/> AI-Powered &nbsp;·&nbsp; Free to Use
            </span>
          </div>

          <h1 className="anim-fade-up-1" style={{
            fontFamily:"'DM Serif Display',serif",
            fontSize:"clamp(52px,7.5vw,100px)",
            lineHeight:1.04, marginBottom:24, letterSpacing:"-0.02em",
          }}>
            <span style={{ color:C.accentLight, display:"block" }}>Grow</span>
            <span style={{ color:C.accentLight, display:"block" }}>Smarter.</span>
            <span className="grad-text" style={{ display:"block", marginTop:4 }}>Farm Better.</span>
          </h1>

          <p className="anim-fade-up-2" style={{
            fontFamily:"'Outfit',sans-serif", fontSize:"clamp(15px,1.8vw,18px)",
            fontWeight:300, color:"rgba(247,243,237,0.65)", lineHeight:1.85,
            maxWidth:500, marginBottom:38,
          }}>
            AgriSmart gives every Indian farmer AI crop guidance, personalised farming plans,
            live profit estimates, and disease detection — in your own language.
          </p>

          <div className="anim-fade-up-3 hero-btns" style={{ display:"flex", gap:14, marginBottom:52, flexWrap:"wrap" }}>
            <a href="/signup" className="btn-primary" style={{ fontSize:16, padding:"15px 36px" }}>Start Growing Free →</a>
            <a href="#how-it-works" className="btn-ghost" style={{ fontSize:16, padding:"14px 36px" }}>See How It Works</a>
          </div>

          {/* Animated stats */}
          <div ref={statsRef} className="anim-fade-up-4 hero-stats" style={{ display:"flex", gap:36, flexWrap:"wrap" }}>
            {[
              { val: c1, suffix: "+", label: "Farmers Using AgriSmart" },
              { val: c2, suffix: "+", label: "Crops Supported"         },
              { val: c3, suffix: "",  label: "Indian Languages"         },
            ].map(({ val, suffix, label }) => (
              <div key={label} style={{ position:"relative" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                  <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(32px,4vw,48px)", color:C.accentLight, lineHeight:1 }}>
                    {val.toLocaleString("en-IN")}{suffix}
                  </span>
                </div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:"rgba(247,243,237,0.45)", marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: chat preview */}
        <div className="hero-chat anim-fade-in" style={{ maxWidth:400, marginLeft:"auto", width:"100%" }}>
          <ChatPreview />
          <div style={{ marginTop:14, display:"flex", gap:7, justifyContent:"center", flexWrap:"wrap" }}>
            {["Wheat","Soybean","Cotton","Rice","Maize","Onion"].map(c=>(
              <span key={c} style={{ fontFamily:"'Outfit',sans-serif", fontSize:11, fontWeight:500, background:"rgba(255,255,255,0.07)", color:"rgba(247,243,237,0.6)", padding:"4px 11px", borderRadius:20, border:"0.5px solid rgba(255,255,255,0.1)" }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:2 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(247,243,237,0.28)" }}>Scroll</span>
          <div style={{ width:1, height:32, background:"linear-gradient(to bottom, rgba(247,243,237,0.25), transparent)" }}/>
        </div>
      </div>
    </section>
  );
}

/* ── Features ── */
function FeaturesSection() {
  const [secRef, secVis] = useInView(0.1);
  const features = [
    { icon:"fa-comments",     bg:"rgba(26,71,49,0.1)",   ic:C.primary,  title:"AI Chat Assistant",       desc:"Ask any farming question in plain language. Get instant, expert answers tailored to your region and crop." },
    { icon:"fa-seedling",     bg:"rgba(200,151,58,0.12)",ic:C.accent,   title:"Crop Recommendations",    desc:"AI suggests the best crops for your location, soil type, and season — ranked by profitability." },
    { icon:"fa-calculator",   bg:"rgba(52,152,219,0.1)", ic:"#3498DB",  title:"Profit & Yield Planner",  desc:"Calculate expected yield, expenses, net profit and ROI before sowing. Know your returns in advance." },
    { icon:"fa-clipboard-list",bg:"rgba(46,204,113,0.1)",ic:"#27AE60",  title:"Farming Plan Generator",  desc:"AI creates a complete step-by-step plan — land prep, sowing, watering, fertilising, and harvest." },
    { icon:"fa-microscope",   bg:"rgba(155,89,182,0.1)", ic:"#9B59B6",  title:"Disease Detection",       desc:"Upload a photo of your crop. AI identifies diseases, pests, and nutrient deficiencies instantly." },
    { icon:"fa-globe",        bg:"rgba(26,71,49,0.09)",  ic:C.primary,  title:"8 Indian Languages",      desc:"AgriSmart speaks your language — Hindi, Marathi, Tamil, Telugu, Kannada, Gujarati, Bengali & more." },
  ];
  return (
    <section id="features" className="section-pad" style={{ padding:"96px 5%", background:C.bg }}>
      <div style={{ textAlign:"center", marginBottom:60 }}>
        <div className={`reveal${secVis?" visible":""}`} ref={secRef}>
          <span className="crop-tag" style={{ marginBottom:16, display:"inline-flex", background:`rgba(26,71,49,0.09)`, color:C.primary }}>
            <i className="fa-solid fa-star"/> Everything You Need
          </span>
        </div>
        <h2 className={`reveal${secVis?" visible":""}`} style={{
          fontFamily:"'DM Serif Display',serif", fontSize:"clamp(32px,4.5vw,58px)",
          color:C.primary, margin:"14px 0 16px", lineHeight:1.1, animationDelay:"0.1s",
        }}>
          Built for Every<br/><span style={{ color:C.accent }}>Indian Farmer</span>
        </h2>
        <p className={`reveal${secVis?" visible":""}`} style={{
          fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:16,
          color:C.textMuted, maxWidth:520, margin:"0 auto", lineHeight:1.75,
          animationDelay:"0.2s",
        }}>
          From first-time growers to experienced farmers — AgriSmart adapts to your needs, region, and language.
        </p>
      </div>

      <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
        {features.map((f, i) => (
          <div key={i} className={`feature-card reveal${secVis?" visible":""}`} style={{ animationDelay:`${0.08 * i}s` }}>
            <div className="feature-icon-wrap" style={{ background:f.bg }}>
              <i className={`fa-solid ${f.icon}`} style={{ color:f.ic }}/>
            </div>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:21, color:C.primary, marginBottom:10 }}>{f.title}</h3>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:14, color:C.textMuted, lineHeight:1.75 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Numbers / Stats band ── */
function StatsBand() {
  const [ref, vis] = useInView(0.35);
  const n1 = useCounter(10000, 2000, vis);
  const n2 = useCounter(500,   1600, vis);
  const n3 = useCounter(28,    1400, vis);
  const n4 = useCounter(8,     1200, vis);
  const stats = [
    { val:n1, sfx:"+", label:"Farmers Active" },
    { val:n2, sfx:"+", label:"Crops Supported" },
    { val:n3, sfx:"",  label:"Indian States" },
    { val:n4, sfx:"",  label:"Languages" },
  ];
  return (
    <section style={{ background:`linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`, padding:"72px 5%", position:"relative", overflow:"hidden" }}>
      <div className="grain" style={{ opacity:0.04 }}/>
      <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", border:"1px solid rgba(200,151,58,0.12)", pointerEvents:"none" }}/>
      <div ref={ref} className="stats-row" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, position:"relative", zIndex:1 }}>
        {stats.map(({ val, sfx, label }, i) => (
          <div key={label} style={{ textAlign:"center", padding:"16px 0" }}>
            <div className="stat-num" style={{ animationDelay:`${i*0.1}s` }}>{val.toLocaleString("en-IN")}{sfx}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── How It Works ── */
function HowItWorksSection() {
  const [ref, vis] = useInView(0.1);
  const steps = [
    { num:"01", icon:"fa-user-plus",        title:"Sign Up & Set Location",  desc:"Create your account in 30 seconds. Enter your location and preferred language." },
    { num:"02", icon:"fa-comments",         title:"Ask AI or Browse Crops",  desc:"Ask any farming question or explore AI-powered crop recommendations for your region." },
    { num:"03", icon:"fa-calculator",       title:"Plan & Estimate Profit",  desc:"Generate a personalised farming plan and get a full profit & yield estimate before sowing." },
    { num:"04", icon:"fa-clipboard-check",  title:"Track Your Progress",     desc:"Follow your crop timeline, mark steps done, and let AI keep you on schedule." },
  ];
  return (
    <section id="how-it-works" ref={ref} className="section-pad" style={{ padding:"96px 5%", background:C.primary, position:"relative", overflow:"hidden" }}>
      <div className="grain" style={{ opacity:0.05 }}/>
      <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", border:"1px solid rgba(200,151,58,0.15)", pointerEvents:"none" }}/>
      <div style={{ textAlign:"center", marginBottom:60, position:"relative", zIndex:2 }}>
        <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:600, background:"rgba(200,151,58,0.18)", color:C.accent, padding:"5px 16px", borderRadius:20, display:"inline-block", marginBottom:16, letterSpacing:"0.06em", textTransform:"uppercase" }}>
          Simple Process
        </span>
        <h2 className={`reveal${vis?" visible":""}`} style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(30px,4vw,54px)", color:C.accentLight, marginTop:12, lineHeight:1.1 }}>
          From Question to Harvest
        </h2>
      </div>
      <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, position:"relative", zIndex:2 }}>
        {steps.map((s, i) => (
          <div key={i} className={`step-card reveal${vis?" visible":""}`} style={{ animationDelay:`${0.1*i}s` }} data-num={s.num}>
            <div style={{ width:42, height:42, borderRadius:12, background:"rgba(200,151,58,0.15)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
              <i className={`fa-solid ${s.icon}`} style={{ color:C.accent, fontSize:18 }}/>
            </div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:13, color:C.accent, marginBottom:8, letterSpacing:"0.06em" }}>{s.num}</div>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:19, color:C.accentLight, marginBottom:10 }}>{s.title}</h3>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:13, color:"rgba(247,243,237,0.58)", lineHeight:1.75 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Timeline Preview ── */
function TimelineSection() {
  const [ref, vis] = useInView(0.15);
  const tSteps = [
    { label:"Land Preparation",      done:true,  date:"Week 1"  },
    { label:"Sowing Seeds",          done:true,  date:"Week 2"  },
    { label:"First Irrigation",      done:true,  date:"Week 3"  },
    { label:"Fertiliser Application",done:false, date:"Week 4-5"},
    { label:"Pest Monitoring",       done:false, date:"Week 6-7"},
    { label:"Harvest",               done:false, date:"Week 12" },
  ];
  return (
    <section className="section-pad" style={{ padding:"96px 5%", background:C.surface }}>
      <div className="tl-grid" ref={ref} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
        <div>
          <div className={`reveal${vis?" visible":""}`}>
            <span className="crop-tag" style={{ background:`rgba(26,71,49,0.1)`, color:C.primary, marginBottom:16, display:"inline-flex" }}>Key Feature</span>
          </div>
          <h2 className={`reveal${vis?" visible":""}`} style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(28px,3.8vw,50px)", color:C.primary, lineHeight:1.12, margin:"14px 0 20px", animationDelay:"0.1s" }}>
            Never Miss a Step<br/><span style={{ color:C.accent }}>in Your Crop's Journey</span>
          </h2>
          <p className={`reveal${vis?" visible":""}`} style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:15, color:C.textMuted, lineHeight:1.85, marginBottom:28, animationDelay:"0.2s" }}>
            AI generates your complete crop lifecycle — from land prep to harvest.
            Mark activities done, stay on schedule, and know exactly what comes next.
          </p>
          {["Visual lifecycle from sowing to harvest","Mark steps done with one tap","AI schedule tailored to your crop & region","Never miss a critical farming activity"].map((pt, i) => (
            <div key={i} className={`reveal${vis?" visible":""}`} style={{ display:"flex", gap:11, alignItems:"flex-start", marginBottom:11, animationDelay:`${0.25+i*0.07}s` }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:C.primary, color:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0, marginTop:2 }}>✓</div>
              <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:14, color:C.textMuted }}>{pt}</span>
            </div>
          ))}
        </div>
        <div className={`reveal-scale${vis?" visible":""}`}>
          <div style={{ background:C.white, borderRadius:18, padding:"22px 26px", border:"0.5px solid #D8D0C4", boxShadow:"0 12px 40px rgba(26,71,49,0.1)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:17, color:C.primary }}>Soybean — Kharif 2025</div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:C.textLight, marginTop:2 }}>Maharashtra · 3 of 6 complete</div>
              </div>
              <div style={{ background:C.accentLight, borderRadius:8, padding:"5px 14px", fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:600, color:C.primary }}>50% Done</div>
            </div>
            {tSteps.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"9px 0", position:"relative" }}>
                {i < tSteps.length - 1 && <div style={{ position:"absolute", left:14, top:38, width:2, height:"calc(100% - 10px)", background:"#D8D0C4" }}/>}
                <div className="timeline-dot" style={{ background:s.done?C.primary:C.surface, color:s.done?C.bg:C.textLight, border:s.done?"none":`1.5px solid #D8D0C4` }}>
                  {s.done ? "✓" : i + 1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:4 }}>
                    <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:s.done?600:400, color:s.done?C.primary:C.textMuted }}>{s.label}</span>
                    <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:11, color:C.textLight }}>{s.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function TestimonialsSection() {
  const [ref, vis] = useInView(0.15);
  const testimonials = [
    {
      name:"Ramesh Kumar",   role:"Wheat Farmer · Punjab",
      quote:"AgriSmart's profit planner showed me I could earn 40% more by switching to Rabi mustard. I tried it and the results were exactly as predicted. This app changed my farm planning completely.",
      initials:"RK", color:"#2ECC71",
    },
    {
      name:"Sunita Devi",    role:"Rice Farmer · Bihar",
      quote:"मैं हिंदी में AI से बात कर सकती हूँ — मुझे नहीं पता था ये possible है। अब मेरे धान की फसल में कोई नुकसान नहीं होता। बहुत काम की चीज़ है।",
      initials:"SD", color:"#3498DB",
    },
    {
      name:"Mohammed Ismail",role:"Cotton Farmer · Gujarat",
      quote:"Disease detection ne mara cotton bachavi lidho. Pehlan hun samajto nahi hato ke shu problem chhe, haiyan upload karyo ane 30 second ma answer malyo. Fantastic app!",
      initials:"MI", color:"#E67E22",
    },
  ];
  return (
    <section id="about" className="section-pad" style={{ padding:"96px 5%", background:C.bg }}>
      <div style={{ textAlign:"center", marginBottom:56 }}>
        <span className="crop-tag" style={{ background:`rgba(26,71,49,0.09)`, color:C.primary, marginBottom:16, display:"inline-flex" }}>
          <i className="fa-solid fa-star"/> Farmer Stories
        </span>
        <h2 className={`reveal${vis?" visible":""}`} ref={ref} style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(28px,4vw,52px)", color:C.primary, marginTop:14, lineHeight:1.1 }}>
          Trusted by Farmers<br/><span style={{ color:C.accent }}>Across India</span>
        </h2>
      </div>
      <div className="testi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
        {testimonials.map((t, i) => (
          <div key={i} className={`testi-card reveal${vis?" visible":""}`} style={{ animationDelay:`${0.1*i}s` }}>
            <div className="testi-stars">★★★★★</div>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:14, color:C.textMuted, lineHeight:1.8, marginBottom:20, fontStyle:"italic" }}>"{t.quote}"</p>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:t.color, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:14, color:C.white, flexShrink:0 }}>
                {t.initials}
              </div>
              <div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:14, color:C.primary }}>{t.name}</div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:C.textLight, marginTop:2 }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTASection() {
  const [ref, vis] = useInView(0.3);
  return (
    <section className="section-pad" style={{ padding:"100px 5%", background:C.primary, textAlign:"center", position:"relative", overflow:"hidden" }}>
      <div className="grain" style={{ opacity:0.04 }}/>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, borderRadius:"50%", border:"1px solid rgba(200,151,58,0.1)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:450, height:450, borderRadius:"50%", border:"1.5px solid rgba(200,151,58,0.15)", pointerEvents:"none" }}/>
      <div ref={ref} style={{ position:"relative", zIndex:2 }}>
        <span className="crop-tag" style={{ marginBottom:18, display:"inline-flex" }}>
          <i className="fa-solid fa-rocket"/> Get Started Today — Free
        </span>
        <h2 className={`reveal${vis?" visible":""}`} style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(32px,5vw,68px)", color:C.accentLight, marginTop:14, marginBottom:20, lineHeight:1.08 }}>
          Your Farm Deserves<br/>Smarter Guidance.
        </h2>
        <p className={`reveal${vis?" visible":""}`} style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:17, color:"rgba(247,243,237,0.6)", maxWidth:500, margin:"0 auto 40px", lineHeight:1.75, animationDelay:"0.1s" }}>
          Join thousands of farmers already using AgriSmart to plan better,
          grow smarter, and harvest more — completely free.
        </p>
        <div className="cta-btns" style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <a href="/signup" className="btn-primary" style={{ fontSize:17, padding:"16px 44px" }}>Start for Free →</a>
          <a href="#features" className="btn-ghost" style={{ fontSize:17, padding:"15px 44px" }}>Explore Features</a>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ background:C.heroDark, padding:"52px 5% 30px" }}>
      <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:44 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <div style={{ width:32, height:32, background:C.accent, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <i className="fa-solid fa-wheat-awn" style={{ color:C.primaryDark, fontSize:15 }}/>
            </div>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:C.accentLight }}>AgriSmart</span>
          </div>
          <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:300, fontSize:13, color:"rgba(247,243,237,0.38)", lineHeight:1.85, maxWidth:250 }}>
            AI-powered farming assistant helping every Indian farmer grow smarter and earn more.
          </p>
        </div>
        {[
          { heading:"Product",  links:["Features","Profit Planner","Disease Detection","Farming Plans"] },
          { heading:"Crops",    links:["Wheat","Soybean","Cotton","Rice","All Crops"] },
          { heading:"Company",  links:["About","Blog","Contact","Privacy"] },
        ].map(col=>(
          <div key={col.heading}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:11, fontWeight:700, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>{col.heading}</div>
            {col.links.map(l=>(
              <div key={l} style={{ marginBottom:9 }}><a href="#">{l}</a></div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop:"0.5px solid rgba(247,243,237,0.08)", paddingTop:22, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:"rgba(247,243,237,0.25)" }}>© 2025 AgriSmart. Made for Indian Farmers.</span>
        <span style={{ fontFamily:"'Outfit',sans-serif", fontSize:12, color:"rgba(247,243,237,0.25)" }}>
          Powered by Groq AI &nbsp;·&nbsp; <i className="fa-solid fa-wheat-awn" style={{ color:C.accent }}/> Built with love
        </span>
      </div>
    </footer>
  );
}

/* ── Root ── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollY,  setScrollY]  = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setScrollY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll-reveal on all .reveal elements */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal, .reveal-scale").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <Navbar scrolled={scrolled} />
      <HeroSection scrollY={scrollY} />
      <FeaturesSection />
      <StatsBand />
      <HowItWorksSection />
      <TimelineSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </>
  );
}

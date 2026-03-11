import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const BEADS = [
  {
    id: 0,
    label: "אני הגוף",
    color: 0x8b4513,
    quote:
      "האשליה של היותך גוף-נפש קיימת רק משום שהיא לא נחקרה.\nהחוט שעליו שזורים כל מצבי התודעה הוא חוסר-חקירה.",
    question: "מי הוא הצופה בגוף?",
  },
  {
    id: 1,
    label: "אני מחשבותיי",
    color: 0x6b5b8b,
    quote:
      "כל מצבי התודעה, כל השמות והצורות, מושרשים בחוסר דרישה ובדמיון.\nהם באים והולכים כמו כל מצב אחר.",
    question: "מי הוא המודע למחשבות?",
  },
  {
    id: 2,
    label: "אני רגשותיי",
    color: 0x8b6b2e,
    quote:
      "שכחת-העצמי היא החושך. כשאנחנו שקועים ב'לא-עצמי',\nאנחנו שוכחים את ה'עצמי'.",
    question: "מי חש את הרגש?",
  },
  {
    id: 3,
    label: "אני תפקידי",
    color: 0x3b7a57,
    quote:
      "זה נכון לומר 'אני הנני', אך לומר 'אני זה' או 'אני כזה'\nהוא סימן לחולשה מנטלית ולחוסר חקירה.",
    question: "מי משחק את התפקיד?",
  },
  {
    id: 4,
    label: "אני זיכרונותיי",
    color: 0x4a6fa5,
    quote:
      "כמו חרוזים על מחרוזת, אירועים רודפים אירועים לנצח.\nכולם שזורים על הרעיון הבסיסי 'אני הגוף'.",
    question: "מי זוכר את הזיכרונות?",
  },
];

export default function SelfInquiryGame({ onBack }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const beadMeshesRef = useRef([]);
  const stringRef = useRef(null);
  const animFrameRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const particlesRef = useRef([]);
  const lightRef = useRef(null);
  const ambientRef = useRef(null);
  const hoveredRef = useRef(null);
  const dissolvedRef = useRef(new Set());

  const [phase, setPhase] = useState("intro"); // intro | game | revelation
  const [dissolved, setDissolved] = useState(new Set());
  const [activeQuote, setActiveQuote] = useState(null);
  const [hoveredBead, setHoveredBead] = useState(null);

  useEffect(() => {
    if (phase !== "game") return;

    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.08);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 7);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0x111133, 0.3);
    scene.add(ambient);
    ambientRef.current = ambient;

    const centralLight = new THREE.PointLight(0xffd700, 0.1, 30);
    centralLight.position.set(0, 0, 0);
    scene.add(centralLight);
    lightRef.current = centralLight;

    // Room walls (dark box)
    const roomGeo = new THREE.BoxGeometry(20, 20, 20);
    const roomMat = new THREE.MeshLambertMaterial({
      color: 0x0a0a1a,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(roomGeo, roomMat));

    // Central Self sphere (glowing dimly)
    const selfGeo = new THREE.SphereGeometry(0.35, 32, 32);
    const selfMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.15,
      roughness: 0.1,
      metalness: 0.2,
    });
    const selfSphere = new THREE.Mesh(selfGeo, selfMat);
    scene.add(selfSphere);

    // Halo glow around Self
    const haloGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.05,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(halo);

    // Build string + beads
    const beadMeshes = [];
    const totalBeads = BEADS.length;
    const radius = 3.2;

    // String as a tube around a circle
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.35, Math.sin(angle) * radius * 0.5));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    const stringGeo = new THREE.TubeGeometry(curve, 128, 0.025, 6, true);
    const stringMat = new THREE.MeshLambertMaterial({
      color: 0x8b7355,
      transparent: true,
      opacity: 0.7,
    });
    const stringMesh = new THREE.Mesh(stringGeo, stringMat);
    scene.add(stringMesh);
    stringRef.current = stringMesh;

    // Beads placed along the string
    BEADS.forEach((bead, i) => {
      const angle = (i / totalBeads) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.35;
      const z = Math.sin(angle) * radius * 0.5;

      const geo = new THREE.SphereGeometry(0.38, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: bead.color,
        emissive: bead.color,
        emissiveIntensity: 0.2,
        roughness: 0.4,
        metalness: 0.3,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { beadId: i, originalPos: new THREE.Vector3(x, y, z) };
      scene.add(mesh);
      beadMeshes.push(mesh);

      // Small inner glow
      const glowGeo = new THREE.SphereGeometry(0.42, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: bead.color,
        transparent: true,
        opacity: 0.08,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      mesh.add(glow);
    });

    beadMeshesRef.current = beadMeshes;

    // Star field
    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 18;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Mouse handlers
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = (e) => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(beadMeshesRef.current);
      if (hits.length > 0) {
        const mesh = hits[0].object;
        const id = mesh.userData.beadId;
        if (!dissolvedRef.current.has(id)) {
          triggerDissolve(id, mesh);
        }
      }
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onClick);

    // Animation loop
    let t = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.005;

      // Gentle camera orbit
      camera.position.x = Math.sin(t * 0.3) * 0.8;
      camera.position.y = Math.cos(t * 0.2) * 0.4;
      camera.lookAt(0, 0, 0);

      // Pulse self sphere
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      selfSphere.scale.setScalar(pulse);
      halo.scale.setScalar(pulse * 1.1);

      // Hover detection
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(beadMeshesRef.current);
      const newHovered = hits.length > 0 ? hits[0].object.userData.beadId : null;

      if (newHovered !== hoveredRef.current) {
        hoveredRef.current = newHovered;
        setHoveredBead(newHovered);
        beadMeshesRef.current.forEach((b) => {
          if (!dissolvedRef.current.has(b.userData.beadId)) {
            b.material.emissiveIntensity = b.userData.beadId === newHovered ? 0.6 : 0.2;
            b.scale.setScalar(b.userData.beadId === newHovered ? 1.2 : 1.0);
          }
        });
        container.style.cursor = newHovered !== null ? "pointer" : "default";
      }

      // Animate bead float
      beadMeshesRef.current.forEach((mesh, i) => {
        if (!dissolvedRef.current.has(mesh.userData.beadId)) {
          const op = mesh.userData.originalPos;
          mesh.position.y = op.y + Math.sin(t * 1.5 + i) * 0.06;
        }
      });

      // Animate particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life -= 0.02;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          return false;
        }
        p.mesh.position.addScaledVector(p.vel, 0.05);
        p.mesh.material.opacity = p.life;
        p.mesh.scale.setScalar(p.life);
        return true;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const W2 = container.clientWidth;
      const H2 = container.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [phase]);

  function triggerDissolve(id, mesh) {
    dissolvedRef.current = new Set([...dissolvedRef.current, id]);
    setDissolved(new Set([...dissolvedRef.current]));
    setActiveQuote(BEADS[id]);

    // Spawn particles
    const scene = sceneRef.current;
    for (let i = 0; i < 28; i++) {
      const geo = new THREE.SphereGeometry(0.06, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: BEADS[id].color,
        transparent: true,
        opacity: 1,
      });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(mesh.position);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      particlesRef.current.push({ mesh: p, vel, life: 1 });
      scene.add(p);
    }

    // Dissolve the bead
    mesh.visible = false;

    // Increase central light
    const totalDissolved = dissolvedRef.current.size;
    const ratio = totalDissolved / BEADS.length;
    if (lightRef.current) lightRef.current.intensity = 0.1 + ratio * 3.5;
    if (ambientRef.current) ambientRef.current.intensity = 0.3 + ratio * 1.2;

    // Update room fog
    if (sceneRef.current) {
      const fogDensity = 0.08 - ratio * 0.065;
      sceneRef.current.fog.density = Math.max(0.015, fogDensity);
    }

    // Update Self sphere emissive
    const selfMeshes = sceneRef.current?.children.filter(
      (c) => c.geometry?.type === "SphereGeometry" && c.material?.emissive
    );
    selfMeshes?.forEach((m) => {
      if (m.material.emissiveIntensity !== undefined) {
        m.material.emissiveIntensity = Math.min(0.15 + ratio * 2.5, 3.0);
      }
    });

    // Check if all dissolved
    if (dissolvedRef.current.size === BEADS.length) {
      setTimeout(() => setPhase("revelation"), 1800);
    }
  }

  if (phase === "intro") {
    return (
      <div style={styles.intro}>
        <div style={styles.introCard}>
          <div style={styles.introSymbol}>☀</div>
          <h1 style={styles.introTitle}>חדר החקירה</h1>
          <h2 style={styles.introSubtitle}>מסע תלת-מימדי אל ה"אני הנני"</h2>
          <p style={styles.introText}>
            בפנים תמצא שרשרת של חרוזים הצפה בחושך.
            <br />
            כל חרוז מייצג זהות שאנחנו מצמידים ל"אני" שלנו.
            <br />
            <strong>לחץ על כל חרוז כדי לחקור אותו</strong> – ולגלות שהחושך נעלם כשמדליקים את האור.
          </p>
          <blockquote style={styles.introQuote}>
            "האשליה קיימת רק משום שהיא לא נחקרה.
            <br />
            חוסר-חקירה הוא החוט שעליו שזורים כל מצבי התודעה."
            <br />
            <span style={styles.quoteAuthor}>– ניסארגדטה מהאראג'</span>
          </blockquote>
          <div style={styles.introButtons}>
            <button style={styles.startBtn} onClick={() => setPhase("game")}>
              התחל חקירה
            </button>
            <button style={styles.backBtn} onClick={onBack}>
              חזור
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "revelation") {
    return (
      <div style={styles.revelation}>
        <div style={styles.revCard}>
          <div style={styles.revGlow}>✦</div>
          <h1 style={styles.revTitle}>אני הנני</h1>
          <p style={styles.revText}>
            כל החרוזים הוסרו. כל הזהויות נחקרו ונמצאו ריקות.
            <br />
            מה שנותר – הוא <strong>האור עצמו</strong>: הקיום הטהור.
          </p>
          <div style={styles.revQuotes}>
            <blockquote style={styles.revQuote}>
              "החוכמה טמונה בכך שלעולם לא נשכח את העצמי
              <br />
              כמקור הנוכח-תמיד, הן של החווה והן של חווייתו."
            </blockquote>
            <blockquote style={styles.revQuote}>
              "זה נכון לומר 'אני הנני',
              <br />
              אך לומר 'אני זה' – זהו סימן לחוסר חקירה."
            </blockquote>
          </div>
          <p style={styles.revInstruction}>
            בכל רגע בחיים, כשתרגיש "אני כזה" או "אני זה" –
            <br />
            זכור: פשוט חקור. "מי הוא שחש כך?"
          </p>
          <div style={styles.introButtons}>
            <button style={styles.startBtn} onClick={() => { setPhase("intro"); setDissolved(new Set()); dissolvedRef.current = new Set(); setActiveQuote(null); }}>
              שחק שוב
            </button>
            <button style={styles.backBtn} onClick={onBack}>
              חזור
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.gameWrapper}>
      {/* 3D Canvas */}
      <div ref={mountRef} style={styles.canvas} />

      {/* Top HUD */}
      <div style={styles.hud}>
        <button style={styles.hudBack} onClick={onBack}>← חזור</button>
        <div style={styles.progress}>
          <span style={styles.progressLabel}>חרוזים שנחקרו:</span>
          {BEADS.map((b) => (
            <span
              key={b.id}
              style={{
                ...styles.progressDot,
                background: dissolved.has(b.id) ? "#ffd700" : "#333",
                border: dissolved.has(b.id) ? "1px solid #ffd700" : "1px solid #555",
              }}
              title={b.label}
            />
          ))}
        </div>
      </div>

      {/* Hover label */}
      {hoveredBead !== null && !dissolved.has(hoveredBead) && (
        <div style={styles.hoverLabel}>
          <div style={styles.hoverLabelTitle}>{BEADS[hoveredBead].label}</div>
          <div style={styles.hoverLabelSub}>לחץ לחקירה</div>
        </div>
      )}

      {/* Quote panel */}
      {activeQuote && (
        <div style={styles.quotePanel}>
          <div style={styles.quotePanelInner}>
            <div style={styles.quotePanelQuestion}>🔍 {activeQuote.question}</div>
            <div style={styles.quotePanelQuote}>{activeQuote.quote}</div>
            <button style={styles.quotePanelClose} onClick={() => setActiveQuote(null)}>
              המשך
            </button>
          </div>
        </div>
      )}

      {/* Instruction */}
      {dissolved.size === 0 && !activeQuote && (
        <div style={styles.instructions}>
          לחץ על כל חרוז בשרשרת כדי לחקור אותו
        </div>
      )}
    </div>
  );
}

const styles = {
  // Intro
  intro: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at center, #0d0d2b 0%, #050508 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    direction: "rtl",
  },
  introCard: {
    maxWidth: 560,
    background: "rgba(20,18,40,0.97)",
    border: "1px solid rgba(255,215,0,0.2)",
    borderRadius: 20,
    padding: "44px 40px",
    textAlign: "center",
    boxShadow: "0 0 60px rgba(255,215,0,0.08)",
  },
  introSymbol: {
    fontSize: 52,
    color: "#ffd700",
    marginBottom: 12,
    textShadow: "0 0 20px #ffd700",
  },
  introTitle: {
    fontSize: "2.2rem",
    color: "#ffd700",
    fontWeight: 800,
    margin: "0 0 6px",
    textShadow: "0 0 15px rgba(255,215,0,0.4)",
  },
  introSubtitle: {
    fontSize: "1rem",
    color: "#aaa",
    fontWeight: 400,
    margin: "0 0 22px",
  },
  introText: {
    color: "#ccc",
    lineHeight: 1.75,
    fontSize: "0.97rem",
    marginBottom: 24,
  },
  introQuote: {
    background: "rgba(255,215,0,0.06)",
    border: "1px solid rgba(255,215,0,0.15)",
    borderRadius: 10,
    padding: "16px 20px",
    color: "#e8d8a0",
    fontStyle: "italic",
    lineHeight: 1.7,
    marginBottom: 28,
  },
  quoteAuthor: {
    color: "#ffd700",
    fontSize: "0.85rem",
    fontStyle: "normal",
  },
  introButtons: { display: "flex", gap: 14, justifyContent: "center" },
  startBtn: {
    background: "linear-gradient(135deg, #ffd700, #ff9500)",
    color: "#1a1a00",
    border: "none",
    borderRadius: 10,
    padding: "13px 32px",
    fontSize: "1.05rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(255,215,0,0.3)",
  },
  backBtn: {
    background: "transparent",
    color: "#888",
    border: "1px solid #444",
    borderRadius: 10,
    padding: "13px 22px",
    fontSize: "1rem",
    cursor: "pointer",
  },

  // Game
  gameWrapper: {
    position: "fixed",
    inset: 0,
    background: "#050508",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    direction: "rtl",
  },
  canvas: { width: "100%", height: "100%", display: "block" },
  hud: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    pointerEvents: "none",
  },
  hudBack: {
    pointerEvents: "all",
    background: "rgba(0,0,0,0.6)",
    border: "1px solid #444",
    color: "#aaa",
    borderRadius: 8,
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  progress: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    padding: "7px 16px",
    border: "1px solid rgba(255,215,0,0.15)",
  },
  progressLabel: { color: "#aaa", fontSize: "0.82rem", marginLeft: 6 },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    display: "inline-block",
    transition: "background 0.4s, box-shadow 0.4s",
    boxShadow: "0 0 6px rgba(255,215,0,0.3)",
  },
  hoverLabel: {
    position: "absolute",
    bottom: 100,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(10,8,25,0.92)",
    border: "1px solid rgba(255,215,0,0.3)",
    borderRadius: 10,
    padding: "12px 24px",
    textAlign: "center",
    pointerEvents: "none",
  },
  hoverLabelTitle: {
    color: "#ffd700",
    fontSize: "1.1rem",
    fontWeight: 700,
    marginBottom: 4,
  },
  hoverLabelSub: { color: "#888", fontSize: "0.82rem" },
  quotePanel: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  quotePanelInner: {
    maxWidth: 480,
    background: "rgba(12,10,28,0.98)",
    border: "1px solid rgba(255,215,0,0.3)",
    borderRadius: 16,
    padding: "36px 36px 28px",
    textAlign: "center",
    boxShadow: "0 0 40px rgba(255,215,0,0.1)",
  },
  quotePanelQuestion: {
    color: "#ffd700",
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: 18,
  },
  quotePanelQuote: {
    color: "#ccc",
    lineHeight: 1.8,
    fontSize: "0.95rem",
    fontStyle: "italic",
    marginBottom: 24,
    whiteSpace: "pre-line",
  },
  quotePanelClose: {
    background: "linear-gradient(135deg, #ffd700, #ff9500)",
    color: "#1a1a00",
    border: "none",
    borderRadius: 9,
    padding: "11px 28px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  instructions: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: "translateX(-50%)",
    color: "#666",
    fontSize: "0.88rem",
    background: "rgba(0,0,0,0.5)",
    padding: "8px 20px",
    borderRadius: 20,
    border: "1px solid #222",
    pointerEvents: "none",
  },

  // Revelation
  revelation: {
    minHeight: "100vh",
    background: "radial-gradient(ellipse at center, #1a1200 0%, #050508 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    direction: "rtl",
    animation: "fadeIn 1.5s ease",
  },
  revCard: {
    maxWidth: 560,
    background: "rgba(20,18,8,0.97)",
    border: "1px solid rgba(255,215,0,0.4)",
    borderRadius: 20,
    padding: "50px 40px",
    textAlign: "center",
    boxShadow: "0 0 80px rgba(255,215,0,0.15)",
  },
  revGlow: {
    fontSize: 60,
    color: "#ffd700",
    textShadow: "0 0 30px #ffd700, 0 0 60px rgba(255,215,0,0.4)",
    marginBottom: 16,
    animation: "pulse 2s infinite",
  },
  revTitle: {
    fontSize: "2.8rem",
    color: "#ffd700",
    fontWeight: 900,
    margin: "0 0 14px",
    textShadow: "0 0 20px rgba(255,215,0,0.5)",
  },
  revText: {
    color: "#ccc",
    lineHeight: 1.8,
    fontSize: "1rem",
    marginBottom: 28,
  },
  revQuotes: { marginBottom: 24 },
  revQuote: {
    background: "rgba(255,215,0,0.06)",
    border: "1px solid rgba(255,215,0,0.12)",
    borderRadius: 10,
    padding: "14px 18px",
    color: "#e8d8a0",
    fontStyle: "italic",
    lineHeight: 1.7,
    marginBottom: 12,
  },
  revInstruction: {
    color: "#aaa",
    fontSize: "0.93rem",
    lineHeight: 1.7,
    marginBottom: 28,
    padding: "14px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
  },
};

/* ============================================================
   SCENES A — 1 Hook · 2 The shift · 3 Timeline · 4 Penalty
   Windows: S1 0–11(dark) S2 11–22 S3 22–38 S4 38–48
   ============================================================ */

// ── helper: big animated stat number ────────────────────────
function HeroNumber({ start, dur, to, prefix = '$', suffix = 'B', color = '#fff', size = 300 }) {
  const local = useTime() - start;
  const val = Math.round(countUp(local, dur, to));
  const t = clamp(local / dur, 0, 1);
  const scale = lerp(0.92, 1, Easing.easeOutCubic(t));
  return (
    <div className="tnum" style={{
        fontFamily: SANS, fontWeight: 400, fontSize: size, lineHeight: 0.92,
        letterSpacing: '-0.045em', color, transform: `scale(${scale})`
      }}>{prefix}{val.toLocaleString('en-US')}{suffix}</div>);

}

// ════════ SCENE 1 — HOOK ════════════════════════════════════
function Scene1() {
  const S = 0,E = 11;
  const local = useTime() - S;
  const pillIn = clamp((local - 4.6) / 0.5, 0, 1);
  return (
    <SceneWrap start={S} end={E} anchor="top" capReserve={120}>
      <Eyebrow dark size={23}>Stablecoin settlement · 2025</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <HeroNumber start={1.0} dur={3.0} to={400} size={275} color="#fff" />
        <div style={{
          marginTop: 30, fontFamily: SANS, fontSize: 34, color: 'rgba(255,255,255,0.7)',
          letterSpacing: '-0.01em'
        }}>Annual real-world payment volume</div>
        <div style={{ marginTop: 40, opacity: pillIn, transform: `translateY(${(1 - pillIn) * 10}px)` }}>
          <Pill dark size={24}><span style={{ color: BLUE_LIGHT }}>2×</span> &nbsp;doubled from a year earlier</Pill>
        </div>
      </div>
      <Caption start={0.8} dur={4.0} dark>By the end of 2025, real-world stablecoin payment volume had doubled.</Caption>
      <Caption start={5.2} dur={5.2} dark>It reached <b style={{ fontWeight: 400, color: BLUE_LIGHT }}>$400&nbsp;billion</b> in annual settlement.</Caption>
    </SceneWrap>);

}

// ════════ SCENE 2 — THE SHIFT ═══════════════════════════════
function PenaltyCard({ inT, icon, big, label }) {
  return (
    <div style={{
      width: 540, padding: '52px 56px', background: '#fff', borderRadius: 28,
      border: '1px solid var(--border)', boxShadow: '0 18px 50px rgba(20,27,56,0.08)',
      opacity: inT, transform: `translateY(${(1 - inT) * 26}px)`
    }}>
      <Icon name={icon} size={56} color={NAVY} style={{ marginBottom: 26 }} />
      <div className="tnum" style={{ fontFamily: SANS, fontSize: 104, lineHeight: 1, color: NAVY, letterSpacing: '-0.03em' }}>{big}</div>
      <div className="pretty" style={{ marginTop: 22, fontFamily: SANS, fontSize: 28, color: 'var(--fg-2)', lineHeight: 1.4, maxWidth: 400 }}>{label}</div>
    </div>);

}
function Scene2() {
  const S = 11,E = 22;
  const local = useTime() - S;
  const head = clamp((local - 0.4) / 0.6, 0, 1);
  const c1 = clamp((local - 1.6) / 0.6, 0, 1);
  const c2 = clamp((local - 2.2) / 0.6, 0, 1);
  return (
    <SceneWrap start={S} end={E}>
      <div style={{ opacity: head, transform: `translateY(${(1 - head) * 16}px)`, textAlign: 'center', marginBottom: 74 }}>
        <Eyebrow style={{ marginBottom: 28 }}>The shift</Eyebrow>
        <div style={{ fontFamily: SANS, fontSize: 76, color: NAVY, letterSpacing: '-0.022em', lineHeight: 1.05 }}>
          Corporate treasuries are leaving<br />traditional bank wires behind.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 44 }}>
        <PenaltyCard inT={c1} icon="caution" big="1–3%" label="charged in FX fees on every cross-border payment" />
        <PenaltyCard inT={c2} icon="clock" big="9–5" label="movement restricted to rigid banking hours, weekdays only" />
      </div>
      <Caption start={11.6} dur={4.4}>Finance teams are handling high cash volumes, and moving away from bank wires.</Caption>
      <Caption start={16.4} dur={5.0}>Legacy rails charge 1–3% in FX fees and only move during banking hours.</Caption>
    </SceneWrap>);

}

// ════════ SCENE 3 — TIMELINE COMPARISON ═════════════════════
const DAYS = ['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
const DAY_X = [60, 268, 476, 684, 892, 1100]; // px within 1180 track

function Track({ label, sub, dark, children, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 40, marginBottom: 36,
      background: '#fff', borderRadius: 24, padding: '30px 48px',
      border: '1px solid var(--border)', boxShadow: '0 14px 44px rgba(20,27,56,0.07)'
    }}>
      <div style={{ width: 250, textAlign: 'right' }}>
        <div style={{ fontFamily: SANS, fontSize: 34, color: NAVY, letterSpacing: '-0.015em' }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 17, color: accent, marginTop: 8, letterSpacing: '0.04em' }}>{sub}</div>
      </div>
      <div style={{ position: 'relative', width: 1180, height: 120 }}>
        {/* day gridlines + labels */}
        {DAYS.map((d, i) =>
        <div key={d} style={{ position: 'absolute', left: DAY_X[i], top: 0, bottom: 0 }}>
            <div style={{ position: 'absolute', top: 18, bottom: 40, width: 1, background: 'var(--border)' }} />
            <div style={{ position: 'absolute', bottom: 6, left: -14, fontFamily: MONO, fontSize: 16, color: 'var(--fg-3)' }}>{d}</div>
          </div>
        )}
        {/* base rail */}
        <div style={{ position: 'absolute', left: 60, right: 80, top: 58, height: 4, background: 'var(--border)', borderRadius: 2 }} />
        {children}
      </div>
    </div>);

}

function Scene3() {
  const S = 22,E = 38;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);

  // weekend shaded block (Sat start .. Mon start)
  const wkOp = clamp((local - 1.0) / 0.6, 0, 1);

  // traditional dot: hold at Fri 5pm, frozen over weekend, settle Tue
  const tradX = interpolate(
    [1.4, 2.4, 5.6, 7.0],
    [DAY_X[0], DAY_X[0] + 36, DAY_X[0] + 36, DAY_X[4]],
    [Easing.easeOutCubic, Easing.linear, Easing.easeInOutCubic]
  )(local);
  const tradSettled = clamp((local - 7.0) / 0.5, 0, 1);

  // USDC: green fill sweeps full instantly
  const usdcFill = clamp((local - 1.4) / 0.8, 0, 1);
  const usdcDone = clamp((local - 2.2) / 0.4, 0, 1);

  return (
    <SceneWrap start={S} end={E}>
      <div style={{ opacity: head, transform: `translateY(${(1 - head) * 16}px)`, textAlign: 'center', marginBottom: 70 }}>
        <Eyebrow style={{ marginBottom: 26 }}>Settlement speed</Eyebrow>
        <div style={{ fontFamily: SANS, fontSize: 74, color: NAVY, letterSpacing: '-0.022em', lineHeight: 1.04 }}>
          Same payment, sent Friday.<br />Two very different timelines.
        </div>
      </div>

      <Track label="Traditional wire" sub="T+2 SETTLEMENT" accent="var(--error)">
        {/* weekend frozen block */}
        <div style={{
          position: 'absolute', left: DAY_X[1], width: DAY_X[3] - DAY_X[1], top: 18, bottom: 40,
          background: 'rgba(173,35,35,0.07)', border: '1px solid rgba(173,35,35,0.18)', borderRadius: 12,
          opacity: wkOp
        }}>
          <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center',
            fontFamily: MONO, fontSize: 15, letterSpacing: '0.08em', color: 'var(--error)' }}>WEEKEND · FROZEN</div>
        </div>
        {/* moving dot */}
        <div style={{ position: 'absolute', left: tradX, top: 50, width: 20, height: 20, marginLeft: -10,
          borderRadius: '50%', background: 'var(--error)', boxShadow: '0 0 0 6px rgba(173,35,35,0.15)' }} />
        {/* settled flag — sits fully ABOVE the weekend-box top line, horizontally centered on the dot */}
        <div style={{ position: 'absolute', left: DAY_X[4], top: -16, transform: 'translateX(-50%)', opacity: tradSettled,
          fontFamily: SANS, fontSize: 25, lineHeight: 1, color: 'var(--error)', whiteSpace: 'nowrap' }}>Settled · 2 days later</div>
      </Track>

      <Track label="USDC" sub="24 / 7 · INSTANT" accent={BLUE}>
        <div style={{ position: 'absolute', left: 60, top: 58, height: 4, borderRadius: 2,
          width: (1180 - 140) * usdcFill, background: BLUE }} />
        <div style={{ position: 'absolute', left: 60 + (1180 - 140) * usdcFill, top: 50, width: 20, height: 20, marginLeft: -10,
          borderRadius: '50%', background: BLUE, boxShadow: '0 0 0 6px rgba(35,64,173,0.15)' }} />
        <div style={{ position: 'absolute', left: 60, top: 6, opacity: usdcDone,
          fontFamily: SANS, fontSize: 25, color: BLUE }}>Settled instantly, any hour, any day</div>
      </Track>

      <Caption start={22.8} dur={5.2}>Traditional wires are held up by weekend cutoffs and two-day settlement windows.</Caption>
      <Caption start={28.6} dur={5.4} y={948}>USDC settles transactions instantly, 24 hours a day, 7 days a week.</Caption>
      <Caption start={34.4} dur={3.2} y={948}>Money that never waits for business hours.</Caption>
    </SceneWrap>);

}

// ════════ SCENE 4 — INFRASTRUCTURE / PENALTY ════════════════
function Scene4() {
  const S = 38,E = 48;
  const local = useTime() - S;
  const l1 = clamp((local - 0.4) / 0.7, 0, 1);
  const l2 = clamp((local - 5.0) / 0.7, 0, 1);
  return (
    <SceneWrap start={S} end={E} anchor="center">
      <div style={{ textAlign: 'center', maxWidth: 1500 }}>
        <div style={{ opacity: l1, transform: `translateY(${(1 - l1) * 18}px)`,
          fontFamily: SANS, fontSize: 92, color: NAVY, letterSpacing: '-0.024em', lineHeight: 1.06 }}>
          Digital dollars aren't a bet.<br />They're <em style={{ fontStyle: 'normal', color: BLUE }}>settlement infrastructure.</em>
        </div>
        <div className="pretty" style={{ marginTop: 56, opacity: l2, transform: `translateY(${(1 - l2) * 14}px)`,
          fontFamily: SANS, fontSize: 40, color: 'var(--fg-2)', letterSpacing: '-0.015em' }}>
          But operating at that speed comes with a steep penalty.
        </div>
      </div>
      <Caption start={38.6} dur={4.6}>Treasurers aren't holding digital dollars to speculate. They're mandatory settlement infrastructure.</Caption>
      <Caption start={43.6} dur={3.9}>Their businesses need to move faster than the legacy banking system allows.</Caption>
    </SceneWrap>);

}

Object.assign(window, { Scene1, Scene2, Scene3, Scene4, HeroNumber });
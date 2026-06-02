/* ============================================================
   SCENES C — 9 Jiko Pocket · 10 Direct ownership · 11 Circle flow
   Windows: S9 94–107(dark) S10 107–119 S11 119–136
   ============================================================ */

// ════════ SCENE 9 — JIKO POCKET (dark) ══════════════════════
function Scene9() {
  const S = 94, E = 107;
  const t = useTime();
  const local = t - S;
  const head = clamp((local - 0.4) / 0.7, 0, 1);
  const cardO = clamp((local - 1.6) / 0.7, 0, 1);
  // downward flow dots (continuous)
  const dots = [0, 1, 2, 3].map((i) => ((local * 0.55 + i * 0.25) % 1));
  const billsO = clamp((local - 3.2) / 0.8, 0, 1);
  return (
    <SceneWrap start={S} end={E}>
      <div style={{ opacity: head, textAlign: 'center', marginBottom: 50 }}>
        <Pill dark size={22} style={{ marginBottom: 30 }}><Icon name="sparkle" size={18} color={BLUE_LIGHT}/> Jiko Pocket</Pill>
        <div style={{ fontFamily: SANS, fontSize: 66, color: '#fff', letterSpacing: '-0.024em', lineHeight: 1.06 }}>
          Idle cash, automatically<br/>invested in Treasury bills.
        </div>
      </div>
      {/* Pocket card */}
      <div style={{
        position: 'relative', width: 720, padding: '44px 56px 50px', borderRadius: 32,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(6px)', opacity: cardO, transform: `translateY(${(1-cardO)*22}px)`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 22 }}>One Jiko Pocket</div>
        {/* idle balance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 28px', borderRadius: 18,
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Icon name="coin" size={40} color="#fff"/>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 30, color: '#fff' }}>Idle balance</div>
            <div style={{ fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.55)' }}>USD</div>
          </div>
        </div>
        {/* flow */}
        <div style={{ position: 'relative', height: 90 }}>
          {dots.map((p, i) => (
            <div key={i} style={{ position: 'absolute', left: 48, top: `${p * 90}px`, width: 12, height: 12,
              marginLeft: -6, borderRadius: '50%', background: BLUE_LIGHT, opacity: (1 - Math.abs(p - 0.5) * 1.4) }}/>
          ))}
          <div style={{ position: 'absolute', left: '50%', top: 32, transform: 'translateX(-50%)',
            fontFamily: MONO, fontSize: 15, letterSpacing: '0.08em', color: BLUE_LIGHT, whiteSpace: 'nowrap' }}>AUTO-INVEST</div>
        </div>
        {/* t-bills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderRadius: 18,
          background: 'rgba(84,173,248,0.14)', border: '1px solid rgba(84,173,248,0.4)', opacity: billsO }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Icon name="tdollars" size={40} color={BLUE_LIGHT}/>
            <div style={{ fontFamily: SANS, fontSize: 30, color: '#fff', lineHeight: 1.18 }}>U.S.<br/>Treasury bills</div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 19, color: BLUE_LIGHT, textAlign: 'right', lineHeight: 1.35 }}>earning the<br/>risk-free rate</div>
        </div>
      </div>
      <Caption start={94.8} dur={5.0} dark y={946}>With regulation in place, Jiko, a nationally chartered bank, built the bridge.</Caption>
      <Caption start={100.2} dur={6.0} dark y={946}>Inside a Jiko Pocket, idle cash is automatically invested into U.S. Treasury bills.</Caption>
    </SceneWrap>
  );
}

// ════════ SCENE 10 — DIRECT OWNERSHIP (light) ═══════════════
function OwnPoint({ inT, icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: inT, transform: `translateY(${(1-inT)*16}px)`,
      width: 460 }}>
      <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 18, background: 'var(--bg-tint, #EDF1FB)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={36} color={NAVY}/>
      </div>
      <div className="pretty" style={{ fontFamily: SANS, fontSize: 27, color: NAVY, letterSpacing: '-0.01em', lineHeight: 1.32 }}>{text}</div>
    </div>
  );
}
function Scene10() {
  const S = 107, E = 119;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);
  const certO = clamp((local - 1.4) / 0.7, 0, 1);
  const p = (d) => clamp((local - d) / 0.6, 0, 1);
  return (
    <SceneWrap start={S} end={E}>
      <div style={{ opacity: head, textAlign: 'center', marginBottom: 56 }}>
        <Eyebrow style={{ marginBottom: 22 }}>Direct ownership</Eyebrow>
        <div style={{ fontFamily: SANS, fontSize: 76, color: NAVY, letterSpacing: '-0.024em', lineHeight: 1.04 }}>
          You own the T-bills.<br/>In your own name.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        {/* certificate */}
        <div style={{ width: 520, padding: '40px 44px', borderRadius: 24, background: '#fff',
          border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(20,27,56,0.1)',
          opacity: certO, transform: `translateY(${(1-certO)*22}px)` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <Icon name="tdollars" size={48} color={NAVY}/>
            <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.1em', color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>U.S. TREASURY BILL</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.06em', color: 'var(--fg-3)' }}>REGISTERED HOLDER</div>
          <div style={{ fontFamily: SANS, fontSize: 38, color: NAVY, marginTop: 8, letterSpacing: '-0.015em' }}>Your company</div>
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="safe" size={28} color={BLUE}/>
            <span style={{ fontFamily: SANS, fontSize: 22, color: BLUE }}>Held in safe custody, in your name</span>
          </div>
        </div>
        {/* points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <OwnPoint inT={p(2.2)} icon="safe" text="Sidesteps standard FDIC caps entirely"/>
          <OwnPoint inT={p(2.7)} icon="bank" text="Backed by the full faith and credit of the U.S."/>
          <OwnPoint inT={p(3.2)} icon="check" text="Safest reserve model meets safest cash management"/>
        </div>
      </div>
      <Caption start={107.7} dur={5.6} y={946}>Clients directly own the T-bills in their own name, sidestepping standard FDIC caps.</Caption>
      <Caption start={113.6} dur={4.8} y={946}>Pairing the safest reserve model with the safest cash-management model in finance.</Caption>
    </SceneWrap>
  );
}

// ════════ SCENE 11 — CIRCLE MINT/BURN FLOW (dark · primary) ══
function FlowNode({ x, w, inT, icon, title, sub, accent = '#fff', tint = 'rgba(255,255,255,0.06)' }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: 40, width: w, padding: '38px 34px', borderRadius: 24,
      background: tint, border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
      boxShadow: '0 18px 46px rgba(0,0,0,0.28)', textAlign: 'center',
      opacity: inT, transform: `translateY(${(1-inT)*20}px)`,
    }}>
      <Icon name={icon} size={56} color={accent} style={{ marginBottom: 20, justifyContent: 'center' }}/>
      <div style={{ fontFamily: SANS, fontSize: 30, color: '#fff', letterSpacing: '-0.015em', lineHeight: 1.2 }}>{title}</div>
      <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 16, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.55)' }}>{sub}</div>
    </div>
  );
}
function Scene11() {
  const S = 119, E = 136;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);
  const n1 = clamp((local - 1.0) / 0.5, 0, 1);
  const n2 = clamp((local - 3.2) / 0.5, 0, 1);
  const n3 = clamp((local - 5.4) / 0.5, 0, 1);

  // node centers within 1660-wide row: node w=460 at x 0, 600, 1200 → centers 230, 830, 1430
  const C1 = 230, C2 = 830, C3 = 1430, cy = 160;
  // USDC token: n1→n2 over local 1.8–3.0, then burns
  const tokA = clamp((local - 1.8) / 1.2, 0, 1);
  const tokAx = lerp(C1, C2, Easing.easeInOutCubic(tokA));
  const tokAop = clamp((local - 1.8) / 0.3, 0, 1) * (1 - clamp((local - 3.0) / 0.4, 0, 1));
  const burn = clamp((local - 3.0) / 0.5, 0, 1) * (1 - clamp((local - 3.7) / 0.5, 0, 1));
  // fiat token: n2→n3 over local 4.0–5.2
  const tokB = clamp((local - 4.0) / 1.2, 0, 1);
  const tokBx = lerp(C2, C3, Easing.easeInOutCubic(tokB));
  const tokBop = clamp((local - 4.0) / 0.3, 0, 1) * (1 - clamp((local - 5.2) / 0.4, 0, 1));
  // arrows draw
  const arr1 = clamp((local - 1.4) / 0.8, 0, 1);
  const arr2 = clamp((local - 3.6) / 0.8, 0, 1);
  const resO = clamp((local - 6.4) / 0.7, 0, 1);

  return (
    <SceneWrap start={S} end={E}>
      <div style={{ opacity: head, textAlign: 'center', marginBottom: 24 }}>
        <Eyebrow dark style={{ marginBottom: 22 }}>In partnership with Circle</Eyebrow>
        <div style={{ fontFamily: SANS, fontSize: 64, color: '#fff', letterSpacing: '-0.022em', lineHeight: 1.04 }}>
          From USDC to T-bills, in one motion
        </div>
      </div>

      <div style={{ position: 'relative', width: 1660, height: 340 }}>
        {/* connecting arrows */}
        <div style={{ position: 'absolute', left: C1 + 200, top: cy - 1, height: 3, background: BLUE_LIGHT,
          width: (C2 - 200 - (C1 + 200)) * arr1, borderRadius: 2 }}/>
        <div style={{ position: 'absolute', left: C2 + 200, top: cy - 1, height: 3, background: BLUE_LIGHT,
          width: (C3 - 200 - (C2 + 200)) * arr2, borderRadius: 2 }}/>

        <FlowNode x={0}    w={460} inT={n1} icon="coin"     title="Client deposits USDC" sub="INTO ITS JIKO POCKET"/>
        <FlowNode x={600}  w={460} inT={n2} icon="exchange" title="Circle burns the USDC" sub="DIRECT MINT & BURN" accent={BLUE_LIGHT} tint="rgba(84,173,248,0.10)"/>
        <FlowNode x={1200} w={460} inT={n3} icon="tdollars" title="Jiko deploys fiat into T-bills" sub="EQUIVALENT, INSTANTLY" accent={BLUE_LIGHT} tint="rgba(84,173,248,0.10)"/>

        {/* USDC traveling token */}
        <div style={{ position: 'absolute', left: tokAx, top: cy, marginLeft: -26, marginTop: -26,
          width: 52, height: 52, borderRadius: '50%', background: BLUE_LIGHT, color: NAVY_DEEP, opacity: tokAop,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 17,
          boxShadow: '0 0 22px rgba(84,173,248,0.6)' }}>$</div>
        {/* burn flash */}
        <div style={{ position: 'absolute', left: C2, top: cy, marginLeft: -50, marginTop: -50, width: 100, height: 100,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(84,173,248,0.85), transparent 70%)',
          opacity: burn, transform: `scale(${lerp(0.4,1.6,burn)})` }}/>
        {/* fiat traveling token */}
        <div style={{ position: 'absolute', left: tokBx, top: cy, marginLeft: -26, marginTop: -26,
          width: 52, height: 52, borderRadius: 12, background: '#fff', color: NAVY, opacity: tokBop,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 15,
          boxShadow: '0 6px 18px rgba(0,0,0,0.35)' }}>USD</div>
      </div>

      <div style={{ opacity: resO, marginTop: 8, display: 'flex', gap: 40, fontFamily: SANS, fontSize: 27, color: 'rgba(255,255,255,0.82)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="check" size={26} color={BLUE_LIGHT}/> Zero exposure windows</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="check" size={26} color={BLUE_LIGHT}/> Continuous yield, no manual sweep</span>
      </div>

      <Caption start={119.6} dur={5.0} dark y={978}>Deposit USDC into a Jiko Pocket, and Circle instantly burns the deposited token.</Caption>
      <Caption start={125.0} dur={5.4} dark y={978}>Jiko simultaneously deploys the exact equivalent in fiat into U.S. Treasury bills.</Caption>
      <Caption start={130.8} dur={4.4} dark y={978}>The conversion is instant, so there are zero exposure windows.</Caption>
    </SceneWrap>
  );
}

Object.assign(window, { Scene9, Scene10, Scene11, FlowNode });

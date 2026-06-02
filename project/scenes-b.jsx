/* ============================================================
   SCENES B — 5 Zero return · 6 $450K cost · 7 Dilemma · 8 GENIUS Act
   Windows: S5 48–57(dark) S6 57–72 S7 72–84(dark) S8 84–94(paper)
   ============================================================ */

// ════════ SCENE 5 — ZERO RETURN (dark) ══════════════════════
function Scene5() {
  const S = 48,E = 57;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);
  const numO = clamp((local - 1.0) / 0.7, 0, 1);
  const lineW = Easing.easeInOutCubic(clamp((local - 1.4) / 1.8, 0, 1));
  return (
    <SceneWrap start={S} end={E} anchor="top">
      <div style={{ opacity: head }}>
        <Eyebrow dark size={22}>The cost of idle cash</Eyebrow>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="tnum" style={{
          opacity: numO, transform: `scale(${lerp(0.94, 1, numO)})`,
          fontFamily: SANS, fontSize: 300, lineHeight: 0.9, color: '#fff', letterSpacing: '-0.04em', width: "800px"
        }}>0.00%</div>
        {/* flatline */}
        <div style={{ position: 'relative', width: 900, height: 60, marginTop: 24 }}>
          <div style={{ position: 'absolute', top: 30, left: 0, width: `${lineW * 100}%`, height: 3,
            background: 'rgba(255,255,255,0.45)', borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: 24, left: `calc(${lineW * 100}% - 7px)`, width: 14, height: 14,
            borderRadius: '50%', background: '#fff', opacity: numO }} />
        </div>
        <div style={{ marginTop: 28, fontFamily: SANS, fontSize: 33, color: 'rgba(255,255,255,0.7)' }}>
          yield on every dollar held in USDC
        </div>
      </div>
      <Caption start={48.7} dur={4.6} dark>Held for operational liquidity and rapid settlement, those balances generate zero return.</Caption>
      <Caption start={53.5} dur={3.0} dark>Exactly zero.</Caption>
    </SceneWrap>);

}

// ════════ SCENE 6 — $450K COST (light) ══════════════════════
function RiskChip({ inT, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '22px 30px',
      border: '1px solid #121844', borderRadius: 18,
      opacity: inT, transform: `translateY(${(1 - inT) * 18}px)`, background: "rgb(246, 246, 246)"
    }}>
      <Icon name="caution" size={34} color="#121844" />
      <span style={{ fontFamily: SANS, fontSize: 28, letterSpacing: '-0.01em', color: "rgb(18, 24, 68)" }}>{label}</span>
    </div>);

}
function Scene6() {
  const S = 57,E = 72;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);
  const ctx = clamp((local - 4.6) / 0.7, 0, 1);
  const sweepLbl = clamp((local - 6.4) / 0.6, 0, 1);
  const ch = (d) => clamp((local - d) / 0.6, 0, 1);
  return (
    <SceneWrap start={S} end={E} capReserve={230}>
      <div style={{ opacity: head, textAlign: 'center', marginBottom: 30 }}>
        <Eyebrow style={{ marginBottom: 22 }}>The inefficiency</Eyebrow>
        <div style={{ fontFamily: SANS, fontSize: 56, color: NAVY, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          What idle cash really costs
        </div>
      </div>
      <HeroNumber start={58.0} dur={2.6} to={450000} prefix="$" suffix="" color={NAVY} size={224} />
      <div className="pretty" style={{ opacity: ctx, marginTop: 18, textAlign: 'center', fontFamily: SANS, fontSize: 31, color: 'var(--fg-2)', maxWidth: 1080, lineHeight: 1.4 }}>
        in foregone yield each year on a <b style={{ fontWeight: 400, color: NAVY }}>$10M USDC balance</b>, at current<br/>Treasury bill rates
      </div>
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ opacity: sweepLbl, fontFamily: MONO, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
          The usual fix, sweeping into money market funds, brings:
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 26 }}>
          <RiskChip inT={ch(7.2)} label="Gate risk" />
          <RiskChip inT={ch(7.6)} label="Counterparty exposure" />
          <RiskChip inT={ch(8.0)} label="Frozen liquidity" />
        </div>
      </div>
      <Caption start={57.8} dur={5.6} y={930}>At current T-bill rates, a $10M USDC balance forgoes roughly $450,000 in yield a year.</Caption>
      <Caption start={63.8} dur={4.0} y={930}>Clawing it back usually means sweeping cash into money market funds.</Caption>
      <Caption start={68.0} dur={3.6} y={930}>Which freezes that liquidity exactly when it's needed most.</Caption>
    </SceneWrap>);

}

// ════════ SCENE 7 — THE DILEMMA (dark) ══════════════════════
function ForkCard({ inT, icon, title, upside, downside }) {
  return (
    <div style={{
      width: 600, padding: '54px 56px', borderRadius: 30,
      background: '#183085',
      border: '1px solid rgba(255,255,255,0.14)',
      opacity: inT, transform: `translateY(${(1 - inT) * 24}px)`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 30 }}>
        <Icon name={icon} size={58} color={BLUE_LIGHT} style={{ marginTop: icon === 'earn' ? -10 : 0 }} />
        <div style={{
          background: 'rgba(84,173,248,0.09)', borderRadius: 999,
          padding: '8px 20px', whiteSpace: 'nowrap',
          fontFamily: MONO, fontSize: 19, letterSpacing: '0.14em', textTransform: 'uppercase', color: BLUE_LIGHT
        }}>{title}</div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 40, color: '#fff', letterSpacing: '-0.018em', lineHeight: 1.2 }}>{upside}</div>
      <div style={{ marginTop: 30, paddingTop: 26, borderTop: '1px solid rgba(255,255,255,0.14)',
        display: 'flex', alignItems: 'center', gap: 14 }}>
        <Icon name="caution" size={30} color="#FF8A8A" />
        <span style={{ fontFamily: SANS, fontSize: 30, color: '#FF9D9D', letterSpacing: '-0.01em' }}>{downside}</span>
      </div>
    </div>);

}
function Scene7() {
  const S = 72,E = 84;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);
  const c1 = clamp((local - 1.4) / 0.7, 0, 1);
  const c2 = clamp((local - 2.0) / 0.7, 0, 1);
  const orO = clamp((local - 2.6) / 0.6, 0, 1);
  return (
    <SceneWrap start={S} end={E}>
      <div style={{ opacity: head, textAlign: 'center', marginBottom: 64 }}>
        <Eyebrow dark style={{ marginBottom: 22 }}>The treasurer's dilemma</Eyebrow>
        <div style={{ fontFamily: SANS, fontSize: 62, color: '#fff', letterSpacing: '-0.022em', lineHeight: 1.05 }}>
          An agonizing compromise
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
        <ForkCard inT={c1} icon="fast" title="Path A · Speed" upside="Fast, instant, always-on" downside="Earns nothing" />
        <div style={{ width: 110, textAlign: 'center', opacity: orO,
          fontFamily: SANS, fontSize: 36, color: 'rgba(255,255,255,0.55)' }}>or</div>
        <ForkCard inT={c2} icon="earn" title="Path B · Yield" upside="Earns the risk-free rate" downside="Moves too slowly" />
      </div>
      <Caption start={72.7} dur={4.8} dark>Corporate treasurers are stuck in an agonizing compromise.</Caption>
      <Caption start={78.0} dur={5.4} dark>Keep money fast but earning nothing, or earn yield on money that moves too slowly.</Caption>
    </SceneWrap>);

}

// ════════ SCENE 8 — GENIUS ACT (paper) ══════════════════════
function Scene8() {
  const S = 84,E = 94;
  const local = useTime() - S;
  const ebO = clamp((local - 0.3) / 0.6, 0, 1);
  // seal stamps in
  const stampT = clamp((local - 0.8) / 0.6, 0, 1);
  const stampScale = lerp(1.5, 1, Easing.easeOutBack(stampT));
  const titleO = clamp((local - 1.7) / 0.7, 0, 1);
  const subO = clamp((local - 2.4) / 0.7, 0, 1);
  return (
    <SceneWrap start={S} end={E} anchor="top" capReserve={180}>
      <div style={{ opacity: ebO }}>
        <Eyebrow style={{ textAlign: 'center' }}>The turning point · July 2025</Eyebrow>
      </div>
      {/* seal */}
      <div style={{ position: 'relative', width: 150, height: 150, marginBottom: 44,
        opacity: stampT, transform: `scale(${stampScale}) rotate(${lerp(-8, 0, Easing.easeOutBack(stampT))}deg)` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${BLUE}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="doc" size={74} color={BLUE} />
        </div>
      </div>
      <div style={{ opacity: titleO, transform: `translateY(${(1 - titleO) * 14}px)`,
        fontFamily: SANS, fontSize: 116, color: NAVY, letterSpacing: '-0.028em', lineHeight: 1, textAlign: 'center' }}>
        The GENIUS Act
      </div>
      <div className="pretty" style={{ opacity: subO, marginTop: 34, fontFamily: SANS, fontSize: 38, color: 'var(--fg-2)', textAlign: 'center', maxWidth: 1200, lineHeight: 1.4 }}>
        A federal framework. The clarity to deploy stablecoins safely, at scale.
      </div>
      <Caption start={84.7} dur={5.0}>In July 2025, the GENIUS Act established a federal regulatory framework.</Caption>
      <Caption start={90.0} dur={3.6}>Giving institutions the clarity to deploy stablecoins safely at scale.</Caption>
    </SceneWrap>);

}

Object.assign(window, { Scene5, Scene6, Scene7, Scene8 });
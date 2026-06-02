/* ============================================================
   SCENES D — 12 JikoNet ledger · 13 Payoff · 14 Closing
   Windows: S12 136–158(dark) S13 158–172 S14 172–184(dark)
   ============================================================ */

// ════════ SCENE 12 — JIKONET LEDGER (light · ledger card stays dark) ══
function PocketCard({ title, x, inT, rows }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: 0, width: 440, padding: '30px 32px', borderRadius: 24,
      background: '#fff', border: '1px solid var(--border)', boxShadow: '0 14px 40px rgba(20,27,56,0.07)',
      opacity: inT, transform: `translateY(${(1-inT)*18}px)`,
    }}>
      <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 20 }}>{title}</div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
          padding: '16px 20px', borderRadius: 14, marginBottom: 12,
          background: r.on ? 'rgba(35,64,173,0.08)' : '#F4F6FB',
          border: `1px solid ${r.on ? 'rgba(35,64,173,0.30)' : 'var(--border)'}`,
          opacity: r.dim ? 0.4 : 1, transition: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Icon name={r.icon} size={28} color={r.on ? BLUE : 'var(--fg-2)'}/>
            <span style={{ fontFamily: SANS, fontSize: 24, color: NAVY, textDecoration: r.struck ? 'line-through' : 'none' }}>{r.label}</span>
          </div>
          {r.tag && <span style={{ fontFamily: MONO, fontSize: 15, color: r.on ? BLUE : 'var(--fg-3)' }}>{r.tag}</span>}
        </div>
      ))}
    </div>
  );
}

function Scene12() {
  const S = 136, E = 158;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);
  const cards = clamp((local - 1.4) / 0.7, 0, 1);

  const initiated = local > 2.6;
  const sold = local > 5.2;
  const received = local > 9.8;
  const reinvested = local > 11.4;
  const cleared = local > 13.0;

  // token travel sender→recipient 7.2–9.6
  const tokT = clamp((local - 7.2) / 2.0, 0, 1);
  const Lx = 70, Rx = 1240, cy = 150;
  const tokX = lerp(Lx + 440, Rx, Easing.easeInOutCubic(tokT));
  const tokOp = clamp((local - 7.2) / 0.3, 0, 1) * (1 - clamp((local - 9.6) / 0.4, 0, 1));

  const senderRows = [
    { icon: 'tdollars', label: 'U.S. T-bills', tag: sold ? 'LIQUIDATED' : 'HELD', dim: sold, struck: sold },
    { icon: 'coin', label: 'USD ready to send', tag: '$4.2M', on: sold && !received },
  ];
  const recRows = received ? [
    { icon: 'coin', label: 'USD received', tag: '$4.2M', dim: reinvested },
    { icon: 'tdollars', label: 'Reinvested in T-bills', tag: reinvested ? 'EARNING' : '…', on: reinvested },
  ] : [
    { icon: 'clock', label: 'Awaiting funds', tag: '·' },
  ];

  const ledger = [
    { at: 2.6, time: '23:47:02', text: 'Payment initiated · $4,200,000' },
    { at: 5.2, time: '23:47:02', text: 'Sender T-bills liquidated → USD' },
    { at: 9.8, time: '23:47:03', text: 'USD settled to recipient Pocket' },
    { at: 11.4, time: '23:47:03', text: 'USD reinvested → T-bills' },
  ];

  return (
    <SceneWrap start={S} end={E}>
      <div style={{ opacity: head, textAlign: 'center', marginBottom: 44 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginBottom: 24 }}>
          <Pill size={20} style={{ background: '#fff', boxShadow: '0 2px 10px rgba(20,27,56,0.07)' }}><Icon name="fast" size={17} color={BLUE}/> JikoNet</Pill>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 18,
            letterSpacing: '0.08em', color: BLUE, background: '#fff', border: '1px solid rgba(35,64,173,0.4)', borderRadius: 999, padding: '8px 18px', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(20,27,56,0.07)' }}>
            <Icon name="clock" size={16} color={BLUE}/> SAT · 11:47 PM</span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 60, color: NAVY, letterSpacing: '-0.022em', lineHeight: 1.05 }}>
          A Saturday-night payment that clears instantly
        </div>
      </div>

      <div style={{ position: 'relative', width: 1700, height: 320 }}>
        <PocketCard title="Sender Pocket" x={Lx} inT={cards} rows={senderRows}/>
        {/* ledger — stays dark on the light scene */}
        <div style={{ position: 'absolute', left: 600, top: 0, width: 500, padding: '24px 28px', borderRadius: 22,
          background: 'linear-gradient(155deg, #1A2970 0%, #121844 100%)', border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 60px rgba(18,24,68,0.28)', opacity: cards }}>
          <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>JIKONET LEDGER · REAL-TIME</div>
          {ledger.map((row, i) => {
            const o = clamp((local - row.at) / 0.5, 0, 1);
            return (
              <div key={i} style={{ opacity: o, transform: `translateX(${(1-o)*10}px)`, display: 'flex', gap: 14, marginBottom: 13, alignItems: 'baseline' }}>
                <span style={{ fontFamily: MONO, fontSize: 14, color: BLUE_LIGHT, flexShrink: 0 }}>{row.time}</span>
                <span style={{ fontFamily: SANS, fontSize: 19, color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}>{row.text}</span>
              </div>
            );
          })}
          {cleared && (
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px',
              borderRadius: 999, background: 'rgba(84,173,248,0.2)', border: '1px solid rgba(84,173,248,0.5)' }}>
              <Icon name="check" size={20} color={BLUE_LIGHT}/>
              <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.08em', color: BLUE_LIGHT }}>CLEARED</span>
            </div>
          )}
        </div>
        <PocketCard title="Recipient Pocket" x={Rx} inT={cards} rows={recRows}/>

        {/* traveling token */}
        <div style={{ position: 'absolute', left: tokX, top: cy, marginTop: -22, marginLeft: -22, width: 44, height: 44,
          borderRadius: '50%', background: BLUE, color: '#fff', opacity: tokOp,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 14, fontWeight: 500,
          boxShadow: '0 6px 20px rgba(35,64,173,0.5)' }}>USD</div>
      </div>

      <Caption start={136.7} dur={4.8} y={968}>To keep 24/7 speed, Jiko built JikoNet, a proprietary USD settlement network.</Caption>
      <Caption start={141.8} dur={4.6} y={968}>Imagine a massive vendor payment that has to go out late on a Saturday night.</Caption>
      <Caption start={146.8} dur={4.6} y={968}>JikoNet instantly sells the underlying T-bills to generate liquid cash.</Caption>
      <Caption start={151.8} dur={5.6} y={968}>It moves across the ledger and reinvests into T-bills in the recipient's Pocket, cleared.</Caption>
    </SceneWrap>
  );
}

// ════════ SCENE 13 — THE PAYOFF (light) ═════════════════════
function TeamPocket({ inT, name, bal }) {
  return (
    <div style={{
      width: 360, padding: '30px 32px', borderRadius: 22, background: '#fff',
      border: '1px solid var(--border)', boxShadow: '0 14px 40px rgba(20,27,56,0.07)',
      opacity: inT, transform: `translateY(${(1-inT)*20}px)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <span style={{ fontFamily: SANS, fontSize: 27, color: NAVY, letterSpacing: '-0.01em' }}>{name}</span>
        <Icon name="pocket" size={26} color={BLUE}/>
      </div>
      <div className="tnum" style={{ fontFamily: SANS, fontSize: 38, color: NAVY, letterSpacing: '-0.02em' }}>{bal}</div>
      <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
        background: 'var(--success-bg, #E6F4EC)', whiteSpace: 'nowrap' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }}/>
        <span style={{ fontFamily: MONO, fontSize: 15, color: 'var(--success)' }}>Earning · 4.38% APY</span>
      </div>
    </div>
  );
}
function Scene13() {
  const S = 158, E = 172;
  const local = useTime() - S;
  const head = clamp((local - 0.3) / 0.6, 0, 1);
  const p = (d) => clamp((local - d) / 0.6, 0, 1);
  const remO = clamp((local - 4.4) / 0.7, 0, 1);
  return (
    <SceneWrap start={S} end={E} anchor="center" centerPad={210}>
      <div style={{ opacity: head, textAlign: 'center', marginBottom: 56 }}>
        <Eyebrow style={{ marginBottom: 22 }}>The payoff</Eyebrow>
        <div style={{ fontFamily: SANS, fontSize: 70, color: NAVY, letterSpacing: '-0.024em', lineHeight: 1.04 }}>
          Organize by team. Earn on every dollar.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 36, marginBottom: 56 }}>
        <TeamPocket inT={p(1.4)} name="Payroll" bal="$2,400,000"/>
        <TeamPocket inT={p(1.8)} name="Vendors" bal="$5,180,000"/>
        <TeamPocket inT={p(2.2)} name="Reserve" bal="$12,750,000"/>
      </div>
      <div style={{ opacity: remO, display: 'flex', gap: 40, fontFamily: SANS, fontSize: 30, color: 'var(--fg-2)' }}>
        {['No fund wrappers', 'No broker-dealers', 'No hidden fees'].map((t) => (
          <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="visibility" size={28} color={BLUE}/>{t}
          </span>
        ))}
      </div>
      <Caption start={158.7} dur={5.6} y={952}>Organize and move money by team or project, earning the risk-free rate between settlements.</Caption>
      <Caption start={164.6} dur={4.4} y={952}>Held through direct T-bill ownership, it all runs with total transparency.</Caption>
      <Caption start={169.2} dur={2.4} y={952}>No middlemen. No hidden fees.</Caption>
    </SceneWrap>
  );
}

// ════════ SCENE 14 — CLOSING (dark) ═════════════════════════
function Scene14() {
  const S = 172, E = 184;
  const local = useTime() - S;
  // beat 1: statement (0.4–5.6), beat 2: logo + CTA (5.6–12)
  const b1 = clamp((local - 0.4) / 0.7, 0, 1) * (1 - clamp((local - 5.4) / 0.6, 0, 1));
  const b2base = clamp((local - 6.0) / 0.7, 0, 1);
  const logoO = b2base;
  const tagO = clamp((local - 6.8) / 0.7, 0, 1);
  const ctaO = clamp((local - 7.6) / 0.7, 0, 1);
  return (
    <SceneWrap start={S} end={E} anchor="center">
      {/* beat 1 */}
      <div style={{ position: 'absolute', left: 0, right: 0, opacity: b1, textAlign: 'center', padding: '0 200px' }}>
        <div style={{ fontFamily: SANS, fontSize: 80, color: '#fff', letterSpacing: '-0.024em', lineHeight: 1.1 }}>
          Stablecoins moved money.<br/><em style={{ fontStyle: 'normal', color: BLUE_LIGHT }}>Jiko makes holding it profitable.</em>
        </div>
      </div>
      {/* beat 2 */}
      <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(120px)' }}>
        <div style={{ opacity: logoO, transform: `translateY(${(1-logoO)*14}px)` }}>
          <JikoMark height={92} color="#fff"/>
        </div>
        <div style={{ opacity: tagO, marginTop: 38, fontFamily: SANS, fontSize: 40, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.015em' }}>
          Where safety meets innovation.
        </div>
        <div style={{ opacity: ctaO, transform: `translateY(${(1-ctaO)*12}px)`, marginTop: 96 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            background: BLUE, color: '#fff', fontFamily: SANS, fontSize: 31,
            padding: '22px 48px', borderRadius: 20, letterSpacing: '-0.012em'
          }}>
            Book a consultation <span style={{ opacity: 0.8 }}>· jiko.com</span>
            <Icon name="arrow" size={29} color="#fff"/>
          </span>
        </div>
      </div>
      <Caption start={172.6} dur={4.6} dark>Stablecoins already solved moving money quickly and securely.</Caption>
      <Caption start={177.4} dur={3.4} dark>Jiko built the infrastructure to make holding them profitable.</Caption>
    </SceneWrap>
  );
}

Object.assign(window, { Scene12, Scene13, Scene14, PocketCard, TeamPocket });

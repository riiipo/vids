/* ============================================================
   JIKO EXPLAINER — shared library (backgrounds, captions, icons, logo, helpers)
   Loaded after animations.jsx. Exports to window for cross-file scope.
   ============================================================ */

const NAVY = '#183085',NAVY_DEEP = '#121844',BLUE = '#2340AD',
  BLUE_LIGHT = '#54ADF8',INK = '#121844';
const SANS = "'Saans', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

// ── small math helpers ──────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
function rangeOpacity(time, ranges, fade = 0.7) {
  // returns 0..1 — full inside any [s,e], ramped over `fade` at edges
  let o = 0;
  for (const [s, e] of ranges) {
    if (time <= s - fade || time >= e + fade) continue;
    let v = 1;
    if (time < s) v = (time - (s - fade)) / fade; // ramp up before s
    else if (time > e) v = 1 - (time - e) / fade; // ramp down after e
    o = Math.max(o, clamp(v, 0, 1));
  }
  return o;
}

// ── ICONS (inline brand line-icons) ─────────────────────────
const ICONS = {
  tdollars: '<path d="M15 25h3.3333m43.3334 30H65M40.5556 31.6667V50m-8.3333-20H48.889M5 65V15h70v50H5Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  bank: '<path d="M65.6667 31.6668v26.6668m-13.3334 0V31.6668m-36.6666 0v26.6668m13.3333 0V31.6668m33.579 26.6668H18.7543c-3.8346 0-7.2389 2.4537-8.4514 6.0914-.641 1.9226.7902 3.9086 2.8171 3.9086h55.0933c2.027 0 3.458-1.986 2.817-3.9086-1.2123-3.6377-4.6166-6.0914-8.4513-6.0914Zm5.5257-26.6668H13.2286C10.8932 31.6668 9 29.7736 9 27.4382c0-1.509.80407-2.9036 2.1099-3.6596L35.6563 9.56753c3.0994-1.7943 6.9214-1.7943 10.0207 0L70.2233 23.7786c1.306.756 2.11 2.1506 2.11 3.6596 0 2.3354-1.8933 4.2286-4.2286 4.2286Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="round"/>',
  fast: '<path d="M50.3335 65c13.8071 0 25-11.1929 25-25s-11.1929-25-25-25-25 11.1929-25 25 11.1929 25 25 25ZM5.3335 40h10M8.66683 55h9.99997M8.66683 25h9.99997" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M50.3335 28.333v11.6667l8.3333 8.3333" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M15 9.5 10.5 15l-2-2m12.75-1c0 5.1086-4.1414 9.25-9.25 9.25-5.10863 0-9.25-4.1414-9.25-9.25 0-5.10863 4.14137-9.25 9.25-9.25 5.1086 0 9.25 4.14137 9.25 9.25Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  caution: '<path d="M15.9993 11.6665v5.3333m0 3.6667v-.0133m.3334.0133c0 .1841-.1492.3333-.3334.3333-.1841 0-.3333-.1492-.3333-.3333 0-.1841.1492-.3333.3333-.3333.1842 0 .3334.1492.3334.3333Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3.73022 21.6368 13.7088 4.85458c1.0336-1.7384 3.5506-1.7384 4.5842-.00001l9.9786 16.78223c1.057 1.7776-.224 4.0296-2.292 4.0296H6.02231c-2.06804 0-3.34901-2.252-2.29209-4.0296Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>',
  exchange: '<path d="M24.498 10.834 13.5217 21.8103c-1.3017 1.3018-1.3017 3.4123 0 4.7141L24.498 37.5007m31.6665 5L67.1409 53.477c1.302 1.3017 1.302 3.4123 0 4.714L56.1645 69.1673m-39.1665-45h50.8332M12.8314 55.834h51.6665" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  safe: '<path d="m29.8337 40.0003 7.2224 7.5 14.4443-15M40.6671 6.66699 12.3337 18.3337v25c0 15.648 12.6853 28.3333 28.3334 28.3333 15.648 0 28.3333-12.6853 28.3333-28.3333v-25L40.6671 6.66699Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  coin: '<path d="M40.0002 24.1667v-3.5185m0 35.1852v3.5186M48.3335 30c-1.521-2.1033-5.0773-4.074-8.3333-4.074-3.8077 0-8.7963 1.629-8.7963 6.2551 0 10.0183 17.5926 5.8019 17.5926 15.3693 0 4.5913-4.9287 6.5236-8.7963 6.5236-3.256 0-7.2754-1.9706-8.7963-4.074m40.4629-10c0 17.489-14.1776 31.6667-31.6666 31.6667C22.5111 71.6667 8.3335 57.489 8.3335 40c0-17.489 14.1776-31.66663 31.6667-31.66663C57.4892 8.33337 71.6668 22.511 71.6668 40Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  earn: '<path d="M12.0005 68.3329h3.4375s13.3012 4.193 21.5625 3.3333c9.0967-.9463 24.5117-11.3846 29.812-15.1456 1.1787-.8367 1.8547-2.1924 1.8547-3.6377 0-3.0857-2.99-5.288-5.937-4.373l-25.7297 7.9897M12.0005 48.3346l11.6667-3.3337c3.1831-1.1393 6.5759-1.5737 9.9434-1.2723l13.8262 1.2373c1.044.0937 1.7437 1.1163 1.4524 2.1233l-.0467.162c-1.232 4.2587-4.451 6.8564-8.6707 8.216l-3.1713 1.0217M42.7998 14.2551c-1.5606-3.4902-5.063-5.92209-9.1333-5.92209-5.5228 0-10 4.47719-10 9.99999s4.4772 10 10 10c1.5 0 2.923-.3303 4.2-.9221m4.9333-13.1558c.557 1.2453.8667 2.6255.8667 4.0779 0 4.0228-2.3753 7.4909-5.8 9.0779m4.9333-13.1558c1.277-.5918 2.7-.9221 4.2-.9221 5.523 0 10 4.4772 10 10s-4.477 10-10 10c-4.0703 0-7.5726-2.4319-9.1333-5.9221" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  twoUsers: '<path d="M28.8472 26.3608c6.2684-2.6036 14.0568.6986 16.47 9.9064.5882 2.2442-1.292 4.2328-3.6118 4.2328H32.497m-11-26.5c0 3.5899-2.9101 6.5-6.5 6.5-3.5898 0-6.49998-2.9101-6.49998-6.5S11.4072 7.5 14.997 7.5c3.5899 0 6.5 2.9101 6.5 6.5Zm18 0c0 3.5899-2.9102 6.5-6.5 6.5s-6.5-2.9101-6.5-6.5 2.9102-6.5 6.5-6.5 6.5 2.9101 6.5 6.5ZM23.4194 40.5H6.28892c-2.3199 0-4.19866-1.999-3.60934-4.2428 3.76706-14.343 20.58202-14.343 24.34922 0C27.618 38.501 25.7394 40.5 23.4194 40.5Z" stroke="currentColor" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>',
  visibility: '<path d="M71.7709 37.0613C55.6412 8.75582 24.3688 8.75548 8.23929 37.061c-1.0378 1.821-1.0378 4.0537 0 5.8747 16.12951 28.3056 47.40191 28.306 63.53161.0003 1.0377-1.821 1.0377-4.0533 0-5.8747" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M50.8307 40.0013c0 5.983-4.8503 10.8333-10.8333 10.8333s-10.8333-4.8503-10.8333-10.8333S34.0144 29.168 39.9974 29.168s10.8333 4.8503 10.8333 10.8333" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  sparkle: '<path d="M64.9997 43.3333C47.641 44.836 38.169 54.308 36.6663 71.6667 35.1003 54.038 25.6779 45.298 8.33301 43.3333 25.952 41.3013 34.6343 32.619 36.6663 15 38.631 32.3449 47.371 41.7673 64.9997 43.3333Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  stack: '<path d="m8 53 32 15.5 31.5-15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="m8 40 32 15.5 31.5-15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="m40 41.5-31.5-15L40 12l31.5 14.5-31.5 15Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  arrow: '<path d="M25 40h28.334m-10-11.666L55.001 40 43.334 51.667M71.667 40c0 17.49-14.177 31.667-31.666 31.667S8.334 57.489 8.334 40 22.512 8.334 40.001 8.334 71.667 22.51 71.667 40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  doc: '<path d="M48 8H20a4 4 0 0 0-4 4v56a4 4 0 0 0 4 4h40a4 4 0 0 0 4-4V24L48 8Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M47 9v15a2 2 0 0 0 2 2h14M28 42h24M28 54h24M28 30h8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
  clock: '<circle cx="40" cy="40" r="31" stroke="currentColor" stroke-width="2.5"/><path d="M40 20v20l13 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
};
const ICON_VB = { check: '0 0 24 24', caution: '0 0 32 32', twoUsers: '0 0 48 48' };

function Icon({ name, size = 48, color = 'currentColor', style = {} }) {
  const vb = ICON_VB[name] || '0 0 80 80';
  return (
    <span style={{ display: 'inline-flex', width: size, height: size, color, ...style }}
    dangerouslySetInnerHTML={{ __html:
      `<svg viewBox="${vb}" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${ICONS[name] || ''}</svg>` }} />);

}

// ── JIKO wordmark (currentColor) ────────────────────────────
const JIKO_PATH = 'M18.636 14.47q0 3.586-2.436 5.498-2.435 1.91-7.131 1.91-4.26 0-6.576-1.868Q.176 18.145 0 14.587h3.558q.234 2.232 1.576 3.187 1.341.954 4.14.953 3.12 0 4.49-.962 1.372-.964 1.371-3.272V.122h3.5zM47.126.121h-3.501v21.723h3.5zM84.671 8.11 95.47.122h-5.052L75.633 11.059V.122h-3.5v21.72h3.5v-7.01l6.389-4.69 10.662 11.7h4.497zm32.992 1.413c.383-1.38 1.192-3.057 2.427-4.065q2.688-2.193 6.962-2.195 3.906 0 6.537 1.926c1.442 1.056 2.372 2.825 2.791 4.334h3.616c-.459-2.403-1.781-4.926-3.975-6.598Q132.404.151 127.053.152c-3.567 0-6.546.923-9 2.773-2.209 1.672-3.54 4.195-4.001 6.598h3.612m18.723 2.948c-.383 1.38-1.192 3.057-2.426 4.065q-2.689 2.193-6.962 2.194-3.907 0-6.537-1.925c-1.443-1.056-2.372-2.825-2.792-4.334h-3.615c.458 2.403 1.78 4.926 3.974 6.598q3.623 2.774 8.97 2.773c3.564 0 6.546-.923 8.999-2.773 2.209-1.672 3.54-4.195 4.002-6.598h-3.613';
function JikoMark({ height = 30, color = NAVY, style = {} }) {
  return (
    <span style={{ display: 'inline-flex', height, color, ...style }}
    dangerouslySetInnerHTML={{ __html:
      `<svg viewBox="0 0 140 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="height:100%;width:auto;display:block"><path fill="currentColor" d="${JIKO_PATH}"/></svg>` }} />);

}

// ── BACKGROUND DIRECTOR ─────────────────────────────────────
// base = aurora-on-white; overlays fade in/out per schedule.
// Colorways:
//   Light · aurora     → base (white + pastel orbs)                 S2, S4, S12, S13
//   Light render       → uploaded blue-orb render @ ~80% on white   S3, S6, S10  (data-viz readability)
//   Paper              → warm paper + orbs                          S8
//   Dark · orbs        → navy gradient + glowing orbs               S1, S5, S9, S14
//   Dark · primary     → flat 180° navy gradient #172974→#131F55    S7, S11
const ORB_DARK_RANGES = [[0, 11], [48, 57], [94, 107], [172, 184]];
const FLAT_DARK_RANGES = [[72, 84], [119, 136]];
// combined — used by the footer progress bar to pick its accent color.
const DARK_RANGES = [...ORB_DARK_RANGES, ...FLAT_DARK_RANGES];
const PAPER_RANGES = [[84, 94]];
// "Light render" — uploaded brand gradient render shown at ~80% opacity over
// white, behind dense data viz (timeline, cost, ownership) for readability.
const IMG_RANGES = [[22, 38], [57, 72], [107, 119]];

function Orb({ x, y, size, color, blur, opacity = 1 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: size, height: size,
      marginLeft: -size / 2, marginTop: -size / 2, borderRadius: '50%',
      background: color, filter: `blur(${blur}px)`, opacity,
      pointerEvents: 'none'
    }} />);

}

function BackgroundDirector() {
  const time = useTime();
  const orbDarkO = rangeOpacity(time, ORB_DARK_RANGES);
  const flatDarkO = rangeOpacity(time, FLAT_DARK_RANGES);
  const paperO = rangeOpacity(time, PAPER_RANGES);
  const imgO = rangeOpacity(time, IMG_RANGES);
  // slow drift
  const d = (a, p, amp) => Math.sin((time + p) * a) * amp;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* BASE — white + pastel aurora orbs */}
      <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF' }}>
        <Orb x={360 + d(0.13, 0, 40)} y={300 + d(0.11, 2, 50)} size={1100} color="var(--orb-lavender)" blur={150} opacity={0.55} />
        <Orb x={560 + d(0.10, 5, 60)} y={820 + d(0.12, 1, 40)} size={1000} color="var(--orb-cyan)" blur={160} opacity={0.42} />
        <Orb x={1500 + d(0.09, 3, 70)} y={560 + d(0.10, 4, 50)} size={1150} color="var(--orb-sky)" blur={170} opacity={0.30} />
      </div>

      {/* LIGHT RENDER — uploaded brand gradient render, shown at ~80% opacity
            over white, behind data viz for cleaner legibility */}
      <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: imgO }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.8,
          backgroundImage: 'url("assets/light-bg-1.png")',
          backgroundSize: 'cover', backgroundPosition: 'center'
        }} />
      </div>

      {/* PAPER overlay — white base, pastel aurora orbs */}
      <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: paperO }}>
        <Orb x={1400 + d(0.10, 2, 60)} y={360} size={1000} color="var(--orb-lavender)" blur={170} opacity={0.5} />
        <Orb x={460 + d(0.09, 6, 50)} y={760} size={950} color="var(--orb-cyan)" blur={170} opacity={0.32} />
      </div>

      {/* DARK · ORBS — navy gradient + glowing orbs */}
      <div style={{
        position: 'absolute', inset: 0, opacity: orbDarkO,
        background: 'linear-gradient(158deg, #1A2970 0%, #121844 58%, #0E1438 100%)'
      }}>
        <Orb x={1560 + d(0.12, 0, 80)} y={120 + d(0.10, 3, 60)} size={820} color="rgba(47,208,230,0.55)" blur={130} />
        <Orb x={300 + d(0.10, 4, 90)} y={1000 + d(0.11, 1, 70)} size={920} color="rgba(61,107,230,0.55)" blur={150} />
        <Orb x={980 + d(0.08, 6, 70)} y={540 + d(0.09, 2, 50)} size={680} color="rgba(89,141,239,0.30)" blur={140} />
      </div>

      {/* DARK · PRIMARY — flat 180° navy gradient, no orbs */}
      <div style={{
        position: 'absolute', inset: 0, opacity: flatDarkO,
        background: 'linear-gradient(180deg, #172974 0%, #131F55 100%)'
      }} />
    </div>);

}

// ── CAPTION (narration lower-third) ─────────────────────────
// start/dur are GLOBAL seconds. fades in/out automatically.
// Anchored from the BOTTOM at a fixed offset so caption position is identical
// across every segment (1- and 2-line captions share the same baseline).
const CAP_BOTTOM = 104;
function Caption({ start, dur, dark = false, children, size = 33, max = 1440 }) {
  const time = useTime();
  const end = start + dur;
  if (time < start - 0.5 || time > end + 0.5) return null;
  const inT = clamp((time - start) / 0.45, 0, 1);
  const outT = clamp((end - time) / 0.4, 0, 1);
  const op = Math.min(Easing.easeOutCubic(inT), Easing.easeInQuad(outT));
  const ty = (1 - inT) * 14;
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom: CAP_BOTTOM, transform: `translate(-50%, ${ty}px)`,
      width: max, textAlign: 'center', opacity: op,
      fontFamily: SANS, fontWeight: 400, fontSize: size, lineHeight: 1.34,
      letterSpacing: '-0.018em', color: dark ? 'rgba(255,255,255,0.94)' : INK,
      textWrap: 'balance', willChange: 'transform,opacity'
    }}>{children}</div>);

}

// ── EYEBROW / KICKER ────────────────────────────────────────
function Eyebrow({ children, dark = false, size = 21, style = {} }) {
  return (
    <div style={{
      fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: '0.16em',
      textTransform: 'uppercase', whiteSpace: 'nowrap', color: dark ? BLUE_LIGHT : BLUE, ...style
    }}>{children}</div>);

}

// ── PILL (outlined kicker capsule) ──────────────────────────
function Pill({ children, dark = false, size = 22, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: SANS, fontSize: size, borderRadius: 999,
      border: `1.5px solid ${dark ? 'rgba(255,255,255,0.5)' : NAVY}`,
      color: dark ? '#fff' : NAVY, ...style, padding: "12px 28px"
    }}>{children}</span>);

}

// ── animated number helper (returns formatted string) ───────
function countUp(localTime, dur, to, ease = Easing.easeOutCubic) {
  const t = ease(clamp(localTime / dur, 0, 1));
  return to * t;
}
function fmtMoney(v, dec = 0) {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ── persistent footer lockup (logo + progress) ─────────────
function Chrome({ darkRanges }) {
  const { time, duration } = useTimeline();
  const dark = rangeOpacity(time, darkRanges) > 0.5;
  return (
    <div style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: `${time / duration * 100}%`,
      background: dark ? BLUE_LIGHT : BLUE, opacity: 0.9 }} />);

}

// ── SCENE WRAP — gates to [start,end] + master fade in/out ──
// anchor='top'  → header (first child) pinned at TOP_PAD; the remaining graphic
//                 content is centered in the band between the title and the
//                 fixed caption zone, so air sits evenly above + below it.
// anchor='center' → hero/statement scenes, centered but nudged up.
const TOP_PAD = 150;
const CAP_RESERVE = 224;
// `capReserve` = bottom padding of the centering band; a smaller value lets the
// content settle lower (closer to the caption). `centerPad` does the same for
// anchor='center' scenes.
function SceneWrap({ start, end, fade = 0.55, children, anchor = 'top', capReserve = CAP_RESERVE, centerPad = 196 }) {
  const time = useTime();
  if (time < start - 0.01 || time > end + 0.01) return null;
  const local = time - start;
  const dur = end - start;
  const inO = clamp(local / fade, 0, 1);
  const outO = clamp((dur - local) / fade, 0, 1);
  const op = Math.min(Easing.easeOutCubic(inO), Easing.easeInQuad(outO));

  if (anchor !== 'top') {
    return (
      <div style={{
        position: 'absolute', inset: 0, opacity: op, willChange: 'opacity',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', paddingBottom: centerPad
      }}>{children}</div>);
  }

  // top-anchored: split header (first child) from the rest
  const kids = React.Children.toArray(children);
  const head = kids[0];
  const rest = kids.slice(1);
  return (
    <div style={{
      position: 'absolute', inset: 0, opacity: op, willChange: 'opacity',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', paddingTop: TOP_PAD, paddingBottom: capReserve
    }}>
      {head}
      <div style={{
        flex: 1, alignSelf: 'stretch', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>{rest}</div>
    </div>);

}

// local time within a scene window
function useLocal(start) {return useTime() - start;}

Object.assign(window, {
  NAVY, NAVY_DEEP, BLUE, BLUE_LIGHT, INK, SANS, MONO,
  lerp, rangeOpacity, Icon, JikoMark, BackgroundDirector, Orb,
  Caption, Eyebrow, Pill, countUp, fmtMoney, Chrome,
  DARK_RANGES, ORB_DARK_RANGES, FLAT_DARK_RANGES, PAPER_RANGES, IMG_RANGES, SceneWrap, useLocal
});
# Jiko Explainer Video

_Started 2026-06-01 09:59 UTC_

---

## User

hi claude. i need an explainer video animated. attached is the script for you to get context of the project and to see what needs visualization. 

also attached: Jiko's brand guidelines and visual language, and the brand's video loop mp4 to get a feel for their brand's animation and visual style for video projects

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: image_metadata]_

I'll dig into the brand materials first, then come back with a clear plan. Let me explore the resources in parallel.

_[tool: read_file]_

_[tool: read_file]_

Let me read the design system CSS and look at the brand video. First the CSS tokens and key assets.

_[tool: read_file]_

_[tool: read_file]_

The storyboard kit looks purpose-built for this. Let me explore it and the slides, plus check the brand video.

_[tool: write_file]_

Now let me study the brand video's motion feel. I'll extract frames.

_[tool: show_html]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: save_screenshot]_

The capture isn't decoding video frames. Let me play it and try once more.

_[tool: view_image]_

_[tool: view_image]_

_[tool: read_file]_

_[tool: view_image]_

The video won't decode in this sandbox, but I have a strong read on the brand from the design system (aurora gradients, drifting glowing orbs, navy, restrained smooth fades). Let me check the ring-diagram engine and key visual assets, then I'll come to you with questions.

_[tool: questions_v2]_

I've absorbed the brand: aurora swirls (cyan→blue→violet) on white, deep navy, single-weight Saans, restrained smooth fades — and there's a ready-made loop-diagram engine I can build on. Before I storyboard this, a few things will shape the whole piece.

## User

Questions timed out; go with defaults

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

Defaults it is. Here's what I'm building: the **complete** explainer, 16:9 (1920×1080), ~2.5 min, on-screen captions that double as the narration (so it reads silently and pairs with a future VO), register shifting between airy-light and cinematic-dark with the story, rich animated diagrams, paced for calm ambient music.

Let me set up and pull in the animation engine + brand assets.

_[tool: read_file]_

_[tool: copy_files]_

Engine understood. Now let me bring in the brand assets I'll need — fonts, logos, the aurora render, and the line icons.

_[tool: list_files]_

_[tool: read_file]_

_[tool: run_script]_

_[tool: write_file]_

I have everything I need. Let me build the brand CSS and the shared component library first.

_[tool: write_file]_

## Assistant

_[tool: write_file]_

_[tool: str_replace_edit]_

Now a `SceneWrap` helper for clean per-scene fades, added to the library.

_[tool: write_file]_

Now scenes 1–4 (hook, the shift, the wire-vs-USDC timeline, the penalty setup).

_[tool: write_file]_

Scenes 5–8 (zero yield, the $450K cost, the dilemma, the GENIUS Act turning point).

_[tool: write_file]_

Scenes 9–11 (Jiko Pocket, direct T-bill ownership, the Circle mint/burn flow).

_[tool: write_file]_

Scenes 12–14 — the JikoNet ledger (the signature beat), the payoff, and the close.

_[tool: write_file]_

Now the assembly — `index.html` wiring the engine, background director, all 14 scenes, and chrome.Let me check it loads cleanly and capture a few key scenes.

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: str_replace_edit]_

I'll add a tiny seek bridge so I can jump to specific timestamps for verification.

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

Excellent — these are clean and on-brand. Let me check the rest.

_[tool: save_screenshot]_

Strong. Let me verify the back half — GENIUS Act, Pocket, Circle flow, JikoNet ledger, payoff, close.

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

The JikoNet ledger is a highlight. Let me see the GENIUS Act, payoff, and closing — and note the "SAT · 11:47 PM" chip wraps.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

All 14 scenes look polished and firmly on-brand. Two tiny text-wrap fixes: the "SAT · 11:47 PM" clock chip and the "4.38% APY · earning" pill both wrap awkwardly.

_[tool: str_replace_edit]_

_[tool: delete_file]_

Let me add the few semantic tokens I referenced (they work via fallbacks, but cleaner to define), then clean up temp files.

_[tool: update_todos]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

The full explainer is built and playing. Here's the shape of it:

**Jiko Explainer.html** — a ~3-minute, 14-scene animated video at 1920×1080, paced for a voiceover with on-screen captions that double as the narration (so it reads silently too). Hit play, or scrub/seek with the timeline; ←/→ and space also work.

**The arc**, following your script beat-for-beat:
1. **$400B hook** — count-up, "doubled" pill
2. **The shift** — 1–3% FX fees / banking-hours cards
3. **Timeline race** — wire stalls on a frozen weekend (T+2) vs. USDC's instant 24/7 fill
4. **Settlement infrastructure**, not speculation → the "steep penalty" turn
5. **0.00%** flatline
6. **$450,000** foregone yield + money-market risk chips
7. **The dilemma** — fast-but-nothing vs. yield-but-slow fork
8. **The GENIUS Act** turning point
9. **Jiko Pocket** — idle cash auto-investing into T-bills
10. **Direct ownership** — T-bills in your name, FDIC caps sidestepped
11. **Circle mint/burn flow** — USDC burns, fiat deploys into T-bills
12. **JikoNet ledger** — the Saturday-night payment clearing in real time (the signature beat)
13. **The payoff** — Pockets by team, transparency, no middlemen
14. **Close** — wordmark + jiko.com CTA

Register shifts between airy-white (pastel auroras) and cinematic navy (glowing orbs) to match the story, all in Saans + IBM Plex Mono with the brand palette.

**Notes / next steps:**
- Numbers ($4.2M payment, team balances, 4.38% APY) are illustrative — easy to swap to real figures.
- Captions are concise paraphrases of your script; if you want them verbatim or removed entirely (for a pure VO cut), I can adjust.
- Pacing is tuned for a calm narration; once you have the real VO, I can nudge any scene's timing to lock to it.

Want me to fine-tune timing, swap in real data, or export this to video/PPTX?

## User

- can we add in the light background, #f6f6f6 to the text-heavy slides, please? let's also remove the footer text: timecode and the jiko logo

## Assistant

_[tool: str_replace_edit]_

Good calls — a calmer neutral for the text slides will let the aurora stay special for the hero/diagram moments. I'll apply `#f6f6f6` to the text-heavy light scenes (the shift, the penalty statement, the $450K cost, direct ownership, the payoff) and keep the aurora-white behind the two animated diagrams (timeline, Circle flow). And I'll strip the footer logo + timecode.

_[tool: str_replace_edit]_

Now strip the footer logo + timecode from `Chrome` (keep the thin progress line), and export `COOL_RANGES`.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

Let me verify the neutral background lands on the text scenes and the footer is gone.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: delete_file]_

_[tool: done]_

Both changes are in: the text-heavy scenes now sit on a calm `#f6f6f6` neutral (whisper-faint orbs only), the timeline and Circle-flow diagrams keep the aurora, and the footer logo + timecode are gone (just the thin progress line remains). The APY pill also tidied to one line.Done. The text-heavy scenes (the shift, the penalty statement, the $450K cost, direct ownership, the payoff) now rest on the neutral `#f6f6f6` background, while the timeline and Circle mint/burn diagrams keep the aurora-white for atmosphere. The footer Jiko logo and timecode are removed — only the slim progress line stays at the bottom edge.

Want me to also drop the neutral onto the two diagram scenes, or keep more aurora anywhere?

## User

- let's nudge all assets up, just to make sure each sequence is centered as a group within the slide composition. make sure all headers are aligned and in the same position across segments, leaving significant room between the graphics and the captions, of which the positions also remain the same across segments

- please also make the text size of the captions smaller, about 33px

- omit all em-dash usage

- the segment around 0:25, let's use the #f6f6f6 background instead so the graphics are more effective

- the segment around 1:10 -- let's change the text color of "$450,000" to the brand's #183085. also change the usage of red for the risk boxes to #121844, making the text #f6f6f6

## Assistant

_[tool: read_file]_

Let me re-read the files the user edited before making changes.

_[tool: grep]_

The user already bumped captions toward 33px (I'll clean that up properly) and I can see the current state. Let me find all em-dashes to remove them.

## User

additionally:

- the segment of 1:41 -- move "auto-invest" to the right and center it based on the space between the two "idle balance" and "U.S. Treasury bills" boxes. 
also adjust text in the same box:
"U.S.
Treasury bills"

and the smaller text:
"earning the
risk-free rate"

this is in-line with the brand guidelines to restrict widows in typography

## Assistant

## User

please continue!

## Assistant

_[tool: str_replace_edit]_

Now I'll make all the changes. Starting with `lib.jsx` — clean caption (33px, bottom-anchored for consistent position), refactored `SceneWrap` (top-anchored headers by default so they align across segments, with room above the fixed caption zone), and the timeline scene added to the neutral background.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now mark the 5 hero/statement scenes as centered (the other 9 default to top-anchored aligned headers).

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now remove all em-dashes from the rendered copy (keeping en-dashes in numeric ranges like 1–3%).

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the Scene 6 color changes — navy `$450,000` and the risk boxes to `#121844` with `#f6f6f6` text.

_[tool: read_file]_

Now the Scene 9 Pocket fixes — center AUTO-INVEST and control the line breaks. Let me read the current markup.

_[tool: str_replace_edit]_

_[tool: show_html]_

Let me reload and verify the new layout, backgrounds, and Scene 6/9 changes across several timestamps.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

Scene 3 neutral + Scene 6 navy/dark chips look right. Let me check Scene 9 (Pocket), Scene 12 (ledger), and a hero.

_[tool: str_replace_edit]_

_[tool: delete_file]_

Everything's landing well: headers now align across the structured segments, captions sit at a consistent bottom position with clear air above them, Scene 3 is on the neutral background, Scene 6's number is navy with the deep-navy risk boxes, and Scene 9's AUTO-INVEST is centered with the line breaks controlled. Let me tidy the tab title (em-dash) and clean up.

_[tool: done]_

All changes are in:

- **Composition nudged up & aligned** — the content scenes are now top-anchored at a fixed Y, so every header sits in the same position across segments, with consistent air between the graphics and the captions. The hero stat moments ($400B, 0.00%, GENIUS Act, closing) stay deliberately center-balanced and nudged up.
- **Captions** are now 33px and anchored to a single fixed baseline across every segment.
- **Em-dashes removed** from all on-screen copy (en-dashes in ranges like 1–3% kept, since those are correct).
- **0:25 timeline** now uses the `#f6f6f6` neutral so the diagram reads more cleanly.
- **1:10 cost scene** — `$450,000` is now brand navy `#183085`, and the risk boxes use `#121844` with `#f6f6f6` text.
- **1:41 Pocket** — `AUTO-INVEST` is centered in the gap (flow dots run down the icon column), and the box copy now breaks as `U.S. / Treasury bills` and `earning the / risk-free rate` to avoid widows.

One judgment call to flag: I kept the four hero/stat scenes centered rather than top-anchoring their eyebrows, since those are intentional focal compositions. If you'd rather every eyebrow line up with the structured-scene headers too, say the word and I'll snap them up.

## User

add space between the titles and the graphics, centered between the headers/titles and the subtitles

## Assistant

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: view_image]_

The graphics now sit centered between the title and the caption with proper breathing room. Let me confirm Scene 10 and 13.

_[tool: delete_file]_

_[tool: done]_

The composition is balanced across all segments now — titles pinned at a consistent height, graphics centered in the space below them with generous air, and captions on a fixed baseline. Cleaning up and finalizing.Done. Each graphic now sits centered in the band between its title and the caption, with clear breathing room above it — titles stay pinned at a consistent height across segments and captions hold their fixed baseline, so the whole set reads as one balanced system.

## User

let's also change the background color to the light aurora colorway instead.

for the ending sequence/cta, let's move the button down and bump up the text. add a solid background to the button and make it #2340AD.

## Assistant

_[tool: snip]_

_[tool: read_file]_

_[tool: read_file]_

Two changes: revert the neutral scenes back to the light aurora colorway, and rework the closing CTA button.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: view_image]_

_[tool: delete_file]_

_[tool: done]_

Both changes are in:
- The previously-neutral scenes now use the light aurora colorway (pastel cyan/lavender washes on white).
- The closing CTA is now a solid `#2340AD` button with bumped-up white text, moved further down below the tagline.Done. All light scenes now share the light aurora colorway, and the closing CTA is a solid hero-blue `#2340AD` button with larger text, dropped further beneath the tagline.


/**
 * Active preloader markup — outline draw → black fill → red horizontal sweep → final colored logo.
 *
 * Two SVG sources only (after rename):
 *   • Preloader_EtecéStudio_Negro.svg  → inline as JSX so we can stroke-draw + fill-morph
 *   • Preloader_EtecéStudio.svg        → final coloured lockup, <img>, revealed L→R by sweep
 *
 * Both share viewBox 0 0 88892 37500. The container `.preloader-logo-stack` locks that
 * aspect-ratio so every layer occupies the exact same box at every breakpoint → perfect
 * pixel alignment, no blur, no scaling mismatch.
 *
 * Behaviour: src/lib/animations/preloader.locked.ts
 */

/* SVG path geometry copied verbatim from public/assets/Preloader_EtecéStudio_Negro.svg.
   No transforms applied — coordinates are direct viewBox units.

   We keep TWO arrays:
     PRELOADER_FILL_PATHS    — the original 8 paths, including the 3 compound
                                paths for the e/é/e letters (outer + inner hole
                                in a single path so `fill-rule="evenodd"` cuts
                                the hole correctly when filled solid black).
     PRELOADER_STROKE_PATHS  — same geometry but with the 3 compound letter
                                paths SPLIT into outer + inner standalone
                                paths (11 paths total). When stroked, every
                                path is a single closed curve → each piece
                                traces in lockstep with the others, so the
                                entire lockup draws as ONE continuous mark.
                                For strokes there's no fill-rule concern. */

const E_OUTER_BODY =
  "c503.459,-2474.932 2694.083,-4339.749 5316.692,-4339.504c2622.264,0.244 4812.304,1864.969 5315.687,4339.504c71.388,350.93 108.853,714.126 108.819,1086.007c-0.033,371.177 -37.426,733.698 -108.614,1083.997l-7974.54,0c251.591,1237.392 1346.675,2169.884 2657.896,2170.003c886.509,0.081 1674.301,-426.046 2169.458,-1084.499l2803.725,0c-837.88,1915.47 -2750.474,3255.211 -4973.432,3255.005c-2622.618,-0.244 -4812.897,-1865.477 -5315.893,-4340.509c-66.45,-326.97 -103.45,-664.583 -108.111,-1009.948l0,-149.083c4.666,-345.724 41.738,-683.681 108.317,-1010.972l-0.005,0Z";
const E_INNER_BODY =
  "c-251.787,-1237.143 -1346.752,-2169.381 -2657.791,-2169.501c-1311.216,-0.12 -2406.468,932.162 -2658.293,2169.501l5316.089,0l-0.005,0Z";

const ACCENT_TRIANGLE =
  "M76197.005,9235.583l4583.042,-2385.781l0,2212.88l-4550.209,2121.796l-32.832,14.988l0,-1963.883Z";
const T_LETTER =
  "M42412.466,13620.066l-1627.505,0l0,-2170.003l1627.505,0l0,-2170.003l2712.507,0l0,2170.003l3797.508,0l0,2170.003l-3797.508,0l0,6510.01l3797.504,0l0,2712.507l-3798.011,0c-610.173,0 -1173.565,-201.909 -1626.94,-542.503c-645.91,-485.227 -1068.535,-1251.935 -1085.059,-2117.307l0,-6562.707Z";
const C_LETTER =
  "M61508.689,16332.697c503.215,-2475.243 2693.987,-4340.375 5316.821,-4340.131c2427.093,0.225 4483.913,1597.721 5175.777,3797.633l-2826.638,0c-468.928,-971.866 -1344.627,-1626.51 -2346.823,-1627.625l-2.565,0c-1180.226,-0.244 -2185.427,906.345 -2558.159,2170.128c-73.853,250.399 -122.874,514.829 -143.509,789.026c-7.336,97.488 -11.083,196.21 -11.083,295.975c0,99.765 3.747,198.488 11.088,295.98c20.635,274.192 69.656,538.622 143.509,789.022c372.68,1263.606 1377.651,2169.874 2557.657,2170.128l2.972,0c1002.282,-1.072 1878.057,-655.787 2346.986,-1627.754l2826.537,0c-692.017,2200.214 -2749.345,3797.733 -5176.744,3797.508c-2622.398,-0.244 -4812.529,-1865.161 -5315.763,-4339.883c-71.34,-350.816 -108.776,-713.882 -108.743,-1085.629c0.033,-371.311 37.45,-733.956 108.69,-1084.375l-0.01,-0.005Z";
const LEFT_BRACKET =
  "M7419.979,11449.358l2441.596,0l0,2034.504l-2848.683,0l0,7324.217l2848.683,0l0,2034.504l-2441.596,0c-138.688,0 -274.688,-11.588 -407.092,-33.846c-1021.721,-171.767 -1828.971,-978.996 -2000.683,-2000.658c-22.242,-132.342 -33.821,-268.279 -33.821,-406.9l0,-6510.417c0,-138.621 11.579,-274.558 33.821,-406.9c171.712,-1021.663 978.963,-1828.896 2000.683,-2000.658c132.4,-22.258 268.404,-33.846 407.092,-33.846Z";
const RIGHT_BRACKET =
  "M23288.933,13483.867l-2848.683,0l0,-2034.504l2441.596,0c138.688,0 274.688,11.587 407.092,33.846c1021.721,171.767 1828.971,978.996 2000.683,2000.658c22.242,132.342 33.821,268.279 33.821,406.9l0,6820.333c-4.129,32.533 -8.9,64.862 -14.3,96.983c-172.804,1028.162 -989.258,1839.154 -2020.208,2003.858c-126.233,20.167 -255.688,30.646 -387.567,30.646l-2441.596,0l0,-2034.504l2829.162,0l0,-7324.217Z";

/** Compound-letter helper — keeps the original outer + inner hole as one path
 *  (required by the fill layer so `fill-rule="evenodd"` cuts the letter's hole). */
const compoundE = (x: number) =>
  `M${x},16332.07${E_OUTER_BODY.replace(
    /^c/,
    "c"
  )}m7974.234,0${E_INNER_BODY.replace(/^c/, "c")}`;

const PRELOADER_FILL_PATHS: ReadonlyArray<string> = [
  ACCENT_TRIANGLE,
  T_LETTER,
  compoundE(49573.297), // 'e' right
  compoundE(73172.085), // 'é' rightmost
  C_LETTER,
  compoundE(29500.762), // 'e' left
  LEFT_BRACKET,
  RIGHT_BRACKET,
];

const PRELOADER_STROKE_PATHS: ReadonlyArray<string> = [
  ACCENT_TRIANGLE,
  T_LETTER,
  // 'e' right — outer outline + inner hole as separate single-subpath paths
  `M49573.297,16332.07${E_OUTER_BODY}`,
  `M57547.531,16332.07${E_INNER_BODY}`,
  // 'é' rightmost
  `M73172.085,16332.07${E_OUTER_BODY}`,
  `M81146.319,16332.07${E_INNER_BODY}`,
  C_LETTER,
  // 'e' left
  `M29500.762,16332.07${E_OUTER_BODY}`,
  `M37474.996,16332.07${E_INNER_BODY}`,
  LEFT_BRACKET,
  RIGHT_BRACKET,
];

const PRELOADER_CIRCLES: ReadonlyArray<{ cx: number; cy: number; r: number }> = [
  { cx: 15150.912, cy: 17145.975, r: 2034.504 },
  { cx: 20033.725, cy: 17145.975, r: 2034.504 },
  { cx: 10268.1, cy: 17145.975, r: 2034.504 },
];

export function PreloaderLocked() {
  return (
    <>
      <div id="brandTransition" className="brand-transition" aria-hidden="true">
        <div className="brand-fill-surface" id="brandFillSurface" />
        <div className="brand-panels" id="brandPanels">
          <div className="brand-panel brand-panel-left" />
          <div className="brand-panel brand-panel-right" />
        </div>
      </div>

      <div id="preloader" className="preloader--simple" aria-hidden="true">
        <div className="preloader-stage">
          <div className="preloader-visual-scale">
          <div className="preloader-logo-stack" aria-hidden="true">
            {/*
              Layer A — inline SVG of Preloader_EtecéStudio_Negro.svg.
              Same viewBox as the colored asset → pixel-perfect alignment.
              Has TWO render layers driven by GSAP:
                .stroke-layer → outline pen-draw (stage 2)
                .fill-layer   → solid black flood (stage 3)
              STUDIO text fades in with the fill (text cannot be stroke-drawn cleanly).
            */}
            <svg
              className="preloader-build-svg"
              viewBox="0 0 88892 37500"
              preserveAspectRatio="xMidYMid meet"
              shapeRendering="geometricPrecision"
              textRendering="geometricPrecision"
              role="img"
              aria-label="Etecé Studio"
              focusable="false"
            >
              {/*
                Every layer ships invisible via inline SVG attributes and
                inline element styles. CSS is a *secondary* safety net; the
                primary guarantee that the user only ever sees white before
                the timeline starts comes from these baked-in attributes,
                which apply from the very first byte of HTML — independent
                of CSS load order, React hydration, or JS execution timing.
              */}
              <g
                className="preloader-stroke-layer"
                fill="none"
                stroke="#000000"
                strokeWidth={180}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0}
              >
                {/*
                  Each drawable element ships with `strokeDasharray="200000"`
                  and `strokeDashoffset="200000"` baked in as static SVG
                  attributes — 200 000 is larger than any path's geometric
                  length in this viewBox (88 892 wide), so every path is
                  guaranteed-invisible from the very first paint (SSR +
                  hydration tick), regardless of CSS load order.

                  On mount, JS reads each path's real length via
                  `getTotalLength()` and rewrites both attributes to that
                  exact length. GSAP then animates `strokeDashoffset` from
                  the real length down to 0 → one smooth continuous pen
                  stroke per path, no patches/blocks, no compound-path
                  rendering glitches that `pathLength="1"` would cause.
                */}
                {PRELOADER_STROKE_PATHS.map((d, i) => (
                  <path
                    key={`s-${i}`}
                    className="draw-path"
                    d={d}
                    strokeDasharray="200000"
                    strokeDashoffset="200000"
                  />
                ))}
                {PRELOADER_CIRCLES.map((c, i) => (
                  <circle
                    key={`sc-${i}`}
                    className="draw-path"
                    cx={c.cx}
                    cy={c.cy}
                    r={c.r}
                    strokeDasharray="200000"
                    strokeDashoffset="200000"
                  />
                ))}
              </g>

              <g
                className="preloader-fill-layer"
                fill="#000000"
                fillRule="evenodd"
                clipRule="evenodd"
                opacity={0}
              >
                {PRELOADER_FILL_PATHS.map((d, i) => (
                  <path key={`f-${i}`} d={d} />
                ))}
                {PRELOADER_CIRCLES.map((c, i) => (
                  <circle key={`fc-${i}`} cx={c.cx} cy={c.cy} r={c.r} />
                ))}
              </g>

              <text
                className="preloader-studio-text"
                x="50959.681"
                y="32982.559"
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize="8333.333"
                fill="#000000"
                opacity={0}
              >
                STUDIO
              </text>
            </svg>

            {/*
              Layer B — final coloured lockup. Same viewBox, loaded as <img> so the
              browser rasterises it at its natural SVG resolution at any DPR (zero blur).
              Inline style locks it invisible + horizontally clipped at first paint;
              GSAP later animates clip-path L→R during the sweep stage.
            */}
            <div
              className="preloader-logo-layer preloader-logo-layer--color"
              style={{
                opacity: 0,
                clipPath: "inset(0% 100% 0% 0%)",
                WebkitClipPath: "inset(0% 100% 0% 0%)",
              }}
            >
              <img
                className="preloader-logo-final"
                src="/assets/Preloader_Etec%C3%A9Studio.svg"
                alt=""
                aria-hidden="true"
                width={540}
                height={228}
                draggable={false}
              />
            </div>

            {/* Red hairline sweep — pure horizontal travel (left → right). */}
            <span
              className="px-sweep"
              aria-hidden="true"
              style={{ opacity: 0, left: "-6%" }}
            />
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

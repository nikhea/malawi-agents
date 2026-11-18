/**
 * Storefront stylesheet.
 *
 * The CSS lives in TypeScript so `mastra build` bundles the app into a single
 * self-contained HTML document without an asset-copy step.
 */
export const storeAppStyles = String.raw`
    :root {
      color-scheme: light;
      --bg: #f7f1e7;
      --surface: #fffaf2;
      --surface-2: #efe4d3;
      --ink: #211a13;
      --muted: #6e6151;
      --line: #e2d4c0;
      --green: #1d5c45;
      --green-2: #2d7a5c;
      --clay: #b4552d;
      --gold: #c99a3f;
      --danger: #a8322a;
      --shadow: 0 18px 50px rgba(67, 46, 23, 0.12);
      --radius: 20px;
      --font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      --serif: ui-serif, Georgia, "Times New Roman", serif;
    }
    [data-theme="dark"] {
      color-scheme: dark;
      --bg: #16130f;
      --surface: #211c16;
      --surface-2: #2c251d;
      --ink: #f5ede1;
      --muted: #b7a992;
      --line: #3d342a;
      --green: #6dc6a0;
      --green-2: #8ed9b8;
      --clay: #e08a61;
      --gold: #e1b968;
      --danger: #ef8b80;
      --shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background:
        radial-gradient(circle at 12% 0%, rgba(201, 154, 63, 0.14), transparent 34rem),
        radial-gradient(circle at 88% 10%, rgba(29, 92, 69, 0.12), transparent 30rem),
        var(--bg);
      color: var(--ink);
      font-family: var(--font);
      font-size: 15px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .app { max-width: 1080px; margin: 0 auto; padding: 18px 18px 28px; }
    .topbar {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 12px 4px 16px; margin-bottom: 6px;
      border-bottom: 1px solid var(--line);
    }
    .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .brand-mark {
      width: 46px; height: 46px; flex: 0 0 46px; display: block; overflow: hidden;
      border-radius: 15px; background: var(--green);
      box-shadow:
        0 10px 24px -10px rgba(29, 92, 69, 0.55),
        inset 0 0 0 1px rgba(255, 255, 255, 0.16);
    }
    .brand-mark svg { display: block; width: 100%; height: 100%; }
    .brand-copy { min-width: 0; }
    .brand strong {
      display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap;
      font-family: var(--serif); font-size: 21px; line-height: 1.05; letter-spacing: -0.015em;
    }
    .brand-word {
      font-family: var(--font); font-size: 10px; font-weight: 800;
      letter-spacing: 0.2em; text-transform: uppercase; color: var(--clay);
    }
    .brand-tag {
      display: flex; align-items: center; gap: 7px;
      color: var(--muted); font-size: 10px; letter-spacing: 0.13em;
      text-transform: uppercase; margin-top: 4px;
    }
    .brand-tag::before {
      content: ""; display: inline-block; width: 18px; height: 1px; background: var(--gold);
    }
    [data-theme="dark"] .brand-mark {
      box-shadow:
        0 10px 24px -10px rgba(0, 0, 0, 0.7),
        inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    }
    button {
      font: inherit; color: inherit; cursor: pointer; border: 0; background: none;
    }
    button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
    .main { padding: 14px 4px 24px; }
    h1 { font-family: var(--serif); font-size: clamp(26px, 4vw, 38px); line-height: 1.08; margin: 0 0 8px; letter-spacing: -0.02em; }
    h2 { font-family: var(--serif); font-size: 20px; line-height: 1.2; margin: 0 0 5px; }
    h3 { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 22px 0 9px; }
    .lede { color: var(--muted); margin: 0 0 20px; max-width: 62ch; }
    .muted { color: var(--muted); }
    .small { font-size: 12px; }
    .clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .row.between { justify-content: space-between; }
    .row.end { justify-content: flex-end; }
    .pill {
      display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line);
      background: var(--surface-2); color: var(--muted); border-radius: 999px;
      padding: 3px 9px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
    }
    .muted-pill { opacity: 0.75; }
    .price { font-weight: 800; font-size: 17px; color: var(--green); margin: 0; }
    .link { color: var(--clay); font-size: 12px; font-weight: 700; text-decoration: none; background: none; padding: 0; }
    .link:hover { text-decoration: underline; }
    .link.danger { color: var(--danger); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
    .card {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      overflow: hidden; box-shadow: var(--shadow); position: relative;
    }
    .card-button { display: block; width: 100%; text-align: left; padding: 0; }
    .card-body { padding: 13px 15px 16px; }
    .card-body h2 { margin-bottom: 3px; }
    .thumb {
      position: relative; aspect-ratio: 4 / 3; overflow: hidden;
      background:
        linear-gradient(135deg, rgba(29, 92, 69, 0.16), rgba(201, 154, 63, 0.22)),
        repeating-linear-gradient(45deg, transparent 0 14px, rgba(255, 255, 255, 0.18) 14px 16px),
        var(--surface-2);
      display: grid; place-items: center;
    }
    .thumb-initials {
      font-family: var(--serif); font-size: clamp(34px, 8vw, 56px); font-weight: 700;
      color: var(--green); opacity: 0.55; letter-spacing: 0.04em;
    }
    .thumb img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.35s ease;
    }
    .card-button:hover .thumb img { transform: scale(1.04); }
    .detail { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: 22px; align-items: start; }
    .detail .thumb { border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--line); }
    .detail-body p { color: var(--muted); }
    .panel {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      padding: 6px 16px 16px; box-shadow: var(--shadow);
    }
    .line { display: flex; gap: 13px; padding: 14px 0; border-bottom: 1px solid var(--line); align-items: flex-start; }
    .line:last-of-type { border-bottom: 0; }
    .line .thumb { width: 62px; aspect-ratio: 1; border-radius: 13px; flex: 0 0 62px; }
    .line .thumb-initials { font-size: 24px; }
    .line-main { flex: 1; min-width: 0; }
    .qty { margin-top: 7px; gap: 6px; }
    .icon {
      width: 27px; height: 27px; border-radius: 999px; border: 1px solid var(--line);
      background: var(--surface-2); display: inline-grid; place-items: center; font-weight: 700;
      line-height: 1;
    }
    .qty span { min-width: 22px; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; }
    .subtotal {
      display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
      padding: 16px 0 10px; border-top: 1px solid var(--line); margin-top: 4px;
      font-size: 15px;
    }
    .subtotal strong { font-family: var(--serif); font-size: 24px; color: var(--green); }
    .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--line); vertical-align: middle; }
    th { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); background: var(--surface-2); }
    tr:last-child td { border-bottom: 0; }
    td.right, th.right { text-align: right; }
    button.small {
      background: var(--green); color: #fff; border-radius: 999px; padding: 6px 12px;
      font-size: 11px; font-weight: 800; letter-spacing: 0.03em;
    }
    button.small:hover { background: var(--green-2); }
    button.danger { color: var(--danger); }
    .badge { display: inline-block; border-radius: 999px; padding: 3px 9px; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
    .badge.pending { background: rgba(201, 154, 63, 0.2); color: #8a5a00; }
    .badge.paid { background: rgba(29, 92, 69, 0.18); color: var(--green); }
    .badge.cancelled { background: rgba(168, 50, 42, 0.15); color: var(--danger); }
    .badge.stock { background: rgba(29, 92, 69, 0.15); color: var(--green); }
    .badge.out { background: rgba(168, 50, 42, 0.12); color: var(--danger); }
    [data-theme="dark"] .badge.pending { color: var(--gold); }
    .order { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); margin-bottom: 14px; }
    .order-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; flex-wrap: wrap; }
    .order-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--muted); }
    .order ul { list-style: none; margin: 13px 0; padding: 0; border-top: 1px solid var(--line); }
    .order li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
    .order li:last-child { border-bottom: 0; }
    .order-line {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      width: 100%; padding: 0; text-align: left; color: inherit;
    }
    .order-line:hover { color: var(--clay); }
    .order-line:hover .pill { border-color: var(--clay); color: var(--clay); }
    .order-line-side { display: inline-flex; align-items: center; gap: 8px; }
    .reviews { margin-top: 18px; padding-top: 16px; }
    .reviews-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap; margin-bottom: 6px; }
    .reviews-head h2 { margin-bottom: 2px; }
    .review-form {
      display: grid; gap: 10px; margin: 12px 0;
      background: var(--surface-2); border: 1px solid var(--line); border-radius: 16px; padding: 14px;
    }
    .review-form h3 { margin: 0; }
    .review-form label {
      display: grid; gap: 5px; font-size: 10px; font-weight: 800;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted);
    }
    .review-form select, .review-form input, .review-form textarea {
      font: inherit; font-size: 14px; color: var(--ink); background: var(--surface);
      border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; width: 100%;
    }
    .review-form textarea { resize: vertical; min-height: 86px; }
    .review-form select:focus, .review-form input:focus, .review-form textarea:focus {
      outline: 2px solid var(--gold); outline-offset: 1px;
    }
    .review { border-top: 1px solid var(--line); padding: 14px 0; }
    .review:first-child { border-top: 0; }
    .stars { color: var(--gold); letter-spacing: 0.08em; font-size: 14px; }
    .big-stars { font-size: 26px; letter-spacing: 0.06em; }
    .profile { display: flex; gap: 16px; align-items: center; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
    .avatar { width: 70px; height: 70px; border-radius: 22px; display: grid; place-items: center; background: linear-gradient(145deg, var(--green), var(--green-2)); color: #fff; font-family: var(--serif); font-size: 27px; font-weight: 700; }
    .kv { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 16px; }
    .kv > div { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; }
    .kv span { display: block; color: var(--muted); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 3px; }
    .empty, .error, .success {
      background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius);
      padding: 28px 22px; text-align: center; box-shadow: var(--shadow);
    }
    .empty p, .error p, .success p { color: var(--muted); max-width: 48ch; margin: 6px auto 16px; }
    .success .check { display: inline-grid; place-items: center; width: 52px; height: 52px; border-radius: 999px; background: rgba(29, 92, 69, 0.15); color: var(--green); font-size: 28px; }
    .error { border-color: rgba(168, 50, 42, 0.35); }
    .json {
      background: #1d1914; color: #f4ecdf; border-radius: 14px; padding: 16px; overflow: auto;
      font-size: 12px; line-height: 1.55; max-height: 460px;
    }
    .busy { display: inline-flex; align-items: center; gap: 9px; color: var(--muted); font-size: 12px; margin-bottom: 14px; }
    .notice {
      display: inline-flex; align-items: center; gap: 8px; margin-bottom: 14px;
      background: rgba(29, 92, 69, 0.12); border: 1px solid rgba(29, 92, 69, 0.24);
      color: var(--green); border-radius: 999px; padding: 7px 14px;
      font-size: 12px; font-weight: 700;
    }
    [data-theme="dark"] .notice { background: rgba(109, 198, 160, 0.12); border-color: rgba(109, 198, 160, 0.28); }
    .spinner { width: 17px; height: 17px; border: 2px solid var(--line); border-top-color: var(--green); border-radius: 999px; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .boot { min-height: 60vh; display: grid; place-items: center; text-align: center; color: var(--muted); }
    .boot h1 { color: var(--ink); }
    @media (max-width: 720px) {
      .detail { grid-template-columns: 1fr; }
      .topbar { align-items: flex-start; }
      .app { padding: 12px 12px 24px; }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
`;

/*
 * Local rich-text renderer (plan step N6), shared by the notes page, the flashcards page and later the quiz page.
 * A direct port of the website's components/learning/RichContent.tsx (blocks, inline syntax) and
 * components/MathText.tsx (math). Syntax: # ## ###, > callouts, - / * lists, tables, ``` code, ---,
 * **bold**, *italic*, `code`, ==highlight==, [[key term]], math $..$, $$..$$, \(..\), \[..\].
 * Needs katex/katex.min.js loaded BEFORE this file (without it formulas show as plain code text).
 * Use: WTRich.render(text) -> HTML of blocks; WTRich.renderInline(text) -> HTML of one line.
 * F3 (2026-10-12): at the end of this file, a small confetti + vibration effect for the quiz page (see there).
 */
(function () {
  var MATH_RE_SRC = "\\$\\$([\\s\\S]+?)\\$\\$|\\\\\\[([\\s\\S]+?)\\\\\\]|(?<!\\\\)\\$(?!\\s)([^$\\n]+?)(?<!\\s)\\$|\\\\\\(([\\s\\S]+?)\\\\\\)";
  function mathRe() { return new RegExp(MATH_RE_SRC, "g"); }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function cleanDelims(src) {
    var s = src.trim(), inner;
    if (s.indexOf("$$") === 0 && s.slice(-2) === "$$" && s.length >= 4) {
      inner = s.slice(2, -2); if (inner.indexOf("$$") === -1) s = inner.trim();
    } else if (s.indexOf("\\[") === 0 && s.slice(-2) === "\\]" && s.length >= 4) {
      inner = s.slice(2, -2); if (inner.indexOf("\\[") === -1) s = inner.trim();
    } else if (s.charAt(0) === "$" && s.slice(-1) === "$" && s.length >= 2) {
      inner = s.slice(1, -1); if (inner.indexOf("$") === -1) s = inner.trim();
    } else if (s.indexOf("\\(") === 0 && s.slice(-2) === "\\)" && s.length >= 4) {
      inner = s.slice(2, -2); if (inner.indexOf("\\(") === -1) s = inner.trim();
    }
    return s;
  }

  function renderTex(src, display) {
    var clean = cleanDelims(src);
    if (!window.katex) return '<code class="math-fallback">' + esc(src) + "</code>";
    try {
      return window.katex.renderToString(clean, { throwOnError: false, displayMode: display, strict: "ignore", trust: false });
    } catch (e) {
      return '<code class="math-fallback">' + esc(src) + "</code>";
    }
  }

  // MathText: split plain / math segments, render each; plain text is escaped, newlines become <br/>
  function renderMixedMath(input) {
    if (!input) return "";
    var re = mathRe(), out = "", last = 0, m;
    while ((m = re.exec(input)) !== null) {
      if (m.index > last) out += esc(input.slice(last, m.index)).replace(/\n/g, "<br/>");
      if (m[1] != null) out += renderTex(m[1].trim(), true);
      else if (m[2] != null) out += renderTex(m[2].trim(), true);
      else if (m[3] != null) out += renderTex(m[3].trim(), false);
      else if (m[4] != null) out += renderTex(m[4].trim(), false);
      last = m.index + m[0].length;
    }
    if (last < input.length) out += esc(input.slice(last)).replace(/\n/g, "<br/>");
    return out || esc(input).replace(/\n/g, "<br/>");
  }

  function protectMath(text) {
    var math = [];
    var out = text.replace(mathRe(), function (full) {
      var idx = math.length; math.push(full); return "@@WTMATH" + idx + "@@";
    });
    return { text: out, math: math };
  }
  function restoreMath(text, math) {
    return text.replace(/@@WTMATH(\d+)@@/g, function (_, n) { var i = Number(n); return math[i] != null ? math[i] : ""; });
  }

  function sanitizeHighlightMarkers(text) {
    var parts = [], i = 0;
    while (i < text.length) {
      var open = text.indexOf("==", i);
      if (open === -1) { parts.push(text.slice(i)); break; }
      parts.push(text.slice(i, open));
      var close = text.indexOf("==", open + 2);
      if (close === -1) { i = open + 2; continue; }
      var inner = text.slice(open + 2, close);
      if (inner.indexOf("\n") !== -1 || !inner.trim()) {
        parts.push(text.slice(open, close + 2).replace(/==/g, ""));
        i = close + 2; continue;
      }
      parts.push("==" + inner + "==");
      i = close + 2;
    }
    return parts.join("");
  }

  function renderInline(text) {
    var p = protectMath(text || "");
    var cleaned = sanitizeHighlightMarkers(p.text);
    var math = p.math;
    var re = /\[\[([^\]]+)\]\]|==([^\n]+?)==|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
    var html = "", last = 0, m;
    function leaf(chunk) { return renderMixedMath(restoreMath(chunk, math)); }
    while ((m = re.exec(cleaned)) !== null) {
      if (m.index > last) html += leaf(cleaned.slice(last, m.index));
      if (m[1] != null) html += '<mark class="key-term">' + leaf(m[1]) + "</mark>";
      else if (m[2] != null) html += '<mark class="hl-term">' + leaf(m[2]) + "</mark>";
      else if (m[3] != null) html += "<strong>" + leaf(m[3]) + "</strong>";
      else if (m[4] != null) html += "<em>" + leaf(m[4]) + "</em>";
      else if (m[5] != null) html += '<code class="md-code">' + esc(restoreMath(m[5], math)) + "</code>";
      last = m.index + m[0].length;
    }
    if (last < cleaned.length) html += leaf(cleaned.slice(last));
    return html || leaf(cleaned);
  }

  function splitRow(line) {
    var s = line.trim();
    if (s.charAt(0) === "|") s = s.slice(1);
    if (s.slice(-1) === "|") s = s.slice(0, -1);
    return s.split("|").map(function (c) { return c.trim(); });
  }
  function isSep(line) {
    var cells = splitRow(line);
    return cells.length > 0 && cells.every(function (c) { return /^:?-+:?$/.test(c) || c === ""; });
  }
  function looksLikeHeader(line) { return line.indexOf("|") !== -1 && splitRow(line).length >= 2; }

  function render(raw) {
    var p = protectMath(raw || "");
    var math = p.math;
    var lines = p.text.replace(/\r\n/g, "\n").split("\n");
    var out = [], para = [], i = 0;
    function restore(s) { return restoreMath(s, math); }
    function flush() {
      var t = para.join(" ").trim();
      if (t) out.push('<p class="study-p">' + renderInline(restore(t)) + "</p>");
      para = [];
    }
    while (i < lines.length) {
      var line = lines[i], t = line.trim(), m;
      if (!t) { flush(); i++; continue; }
      if (/^---+$/.test(t) || /^\*\*\*+$/.test(t)) { flush(); out.push('<hr class="study-hr">'); i++; continue; }
      if (t.indexOf("```") === 0) {
        flush(); i++;
        var code = [];
        while (i < lines.length && lines[i].trim().indexOf("```") !== 0) { code.push(lines[i]); i++; }
        if (i < lines.length) i++;
        out.push("<pre><code>" + esc(restore(code.join("\n"))) + "</code></pre>");
        continue;
      }
      if (looksLikeHeader(t) && i + 1 < lines.length && isSep(lines[i + 1].trim())) {
        flush();
        var heads = splitRow(t).map(restore);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].trim().indexOf("|") !== -1) { rows.push(splitRow(lines[i].trim()).map(restore)); i++; }
        var th = heads.map(function (h) { return "<th>" + renderInline(h) + "</th>"; }).join("");
        var tb = rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + renderInline(c) + "</td>"; }).join("") + "</tr>"; }).join("");
        out.push('<div class="scroll-x"><table class="study-table"><thead><tr>' + th + "</tr></thead><tbody>" + tb + "</tbody></table></div>");
        continue;
      }
      var h1 = t.match(/^#\s+(.+)/), h2 = t.match(/^##\s+(.+)/), h3 = t.match(/^###\s+(.+)/);
      if (h1 || h2 || h3) {
        flush();
        var text = restore(((h1 && h1[1]) || (h2 && h2[1]) || (h3 && h3[1]) || "").trim());
        if (h1) out.push('<h1 class="study-h1">' + renderInline(text) + "</h1>");
        else if (h2) out.push('<h2 class="study-h2"><span class="study-h2-bar"></span><span>' + renderInline(text) + "</span></h2>");
        else out.push('<h3 class="study-h3">' + renderInline(text) + "</h3>");
        i++; continue;
      }
      if (t.indexOf("> ") === 0 || t === ">") {
        flush();
        var parts = [];
        while (i < lines.length && (lines[i].trim().charAt(0) === ">")) { parts.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push('<aside class="study-callout">' + renderInline(restore(parts.join(" ").trim())) + "</aside>");
        continue;
      }
      if (/^[-*]\s+/.test(t)) {
        flush();
        var items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(restore(lines[i].trim().replace(/^[-*]\s+/, ""))); i++; }
        out.push('<ul class="study-list">' + items.map(function (it) { return "<li>" + renderInline(it) + "</li>"; }).join("") + "</ul>");
        continue;
      }
      para.push(t); i++;
    }
    flush();
    return out.join("\n");
  }

  window.WTRich = { render: render, renderInline: renderInline };
})();

/*
 * F3 (owner report 2026-10-12, problem 6: no confetti on a correct answer in question banks).
 * The quiz page (quiz.html) redraws everything on each tap, so this module watches the tap from the outside:
 * after a tap on an answer button (data-act="pick") and the page's own redraw, a correct answer in "Right Away"
 * mode is the case where the page shows a green `.choice.right` and NO red `.choice.wrong`. Then a short confetti
 * burst starts at the finger and the phone vibrates briefly; a wrong answer only gives a short vibration (the
 * page itself shakes the choice). Exams and "After Finish" never show green before submit, so nothing happens there.
 * The effect draws on its own canvas (not inside #root, so a redraw cannot erase it) and does nothing on pages
 * that have no answer buttons (notes, flashcards). Wrapped in try/catch: it can never break a page.
 */
(function () {
  var canvas = null, ctx = null, parts = [], running = false, lastX = 0, lastY = 0, dpr = 1;
  var COLORS = ["#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#fb923c"];

  function ensure() {
    if (canvas) return true;
    if (!document.body) return false;
    canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:200";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    return !!ctx;
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    var w = Math.round(window.innerWidth * dpr), h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
  }

  function frame() {
    var alive = [], i, p;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (i = 0; i < parts.length; i++) {
      p = parts[i];
      p.vy += 0.35; p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.age++;
      if (p.age >= p.life || p.y > window.innerHeight + 20) continue;
      ctx.save();
      ctx.globalAlpha = p.age > p.life - 20 ? Math.max(0, (p.life - p.age) / 20) : 1;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      alive.push(p);
    }
    parts = alive;
    if (parts.length) { window.requestAnimationFrame(frame); }
    else { running = false; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  function burst(x, y) {
    if (!ensure()) return;
    resize();
    var n = 70, i, a, s;
    for (i = 0; i < n; i++) {
      a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      s = 6 + Math.random() * 8;
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
                   w: 6 + Math.random() * 5, h: 3 + Math.random() * 4, color: COLORS[i % COLORS.length], age: 0, life: 70 + Math.random() * 40 });
    }
    if (!running) { running = true; window.requestAnimationFrame(frame); }
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* not supported: ignore */ }
  }

  document.addEventListener("click", function (e) {
    try {
      lastX = e.clientX; lastY = e.clientY;
      var t = e.target;
      var btn = t && t.closest ? t.closest('button[data-act="pick"]') : null;
      if (!btn) return;
      var x = lastX, y = lastY;
      window.setTimeout(function () {
        try {
          if (document.querySelector(".choice.wrong")) { vibrate(60); return; }
          if (document.querySelector(".choice.right")) { burst(x, y); vibrate([20, 30, 20]); }
        } catch (err) { /* never break the page */ }
      }, 30);
    } catch (err) { /* never break the page */ }
  });
})();

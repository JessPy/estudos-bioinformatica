(() => {
  "use strict";

  // ---------- Utilidades ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const todayISO = () => iso(new Date());
  const fmt = (s) => parse(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtLong = (s) => parse(s).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const TYPE = {
    teoria: { label: "Teoria", plan: [["5'", "recordar a sessão anterior"], ["40'", "estudo ativo"], ["15'", "síntese + flashcards"]] },
    pratica: { label: "Prática", plan: [["5'", "objetivo"], ["45'", "mão na massa"], ["10'", "registro + commit"]] },
    revisao: { label: "Revisão", plan: [["20'", "flashcards"], ["30'", "refazer exercícios"], ["10'", "lacunas"]] },
    avaliacao: { label: "Avaliação", plan: [["40'", "sem consulta"], ["20'", "correção + plano"]] },
    projeto: { label: "Projeto", plan: [["5'", "planejar"], ["45'", "construir"], ["10'", "documentar + commit"]] },
  };
  const MODS = window.MODULES, MAT = window.MAT, AREAS = window.AREAS, PHASES = window.PHASES;
  const MOD = Object.fromEntries(MODS.map((m) => [m.id, m]));

  // ---------- Geração de sessões ----------
  function chunk(arr, n) {
    const out = Array.from({ length: n }, () => []);
    (arr || []).forEach((x, i) => out[Math.min(n - 1, Math.floor((i * n) / Math.max(arr.length, 1)))].push(x));
    return out;
  }
  // ---------- Plano de leitura (data/readings.js) ----------
  // Cada trecho tem uma chave estável (material + texto do trecho), usada para marcar "Lido".
  const READ = window.READINGS || {};
  const CHEATS = window.CHEATS || {}; // resumos (cheatsheets) por tópico, gerados de data/cheatsheets/*.md
  const rKey = (mat, t) => `${mat}::${t}`;
  const short = (x, n = 110) => (x.length > n ? `${x.slice(0, n - 1).trimEnd()}…` : x);
  const READS_BY_MAT = {}; const READS_BY_TOPIC = {};
  function topicReads(m, tp, ti) {
    const spec = READ[`${m.id}:${ti}`] || {}, n = Math.max(tp.th || 0, 1);
    const per = Array.from({ length: n }, () => []);
    tp.m.forEach((mat) => {
      const v = spec[mat];
      const arr = v == null ? per.map(() => "") : Array.isArray(v) ? v : per.map(() => v);
      arr.forEach((x, j) => {
        if (x == null || !per[j]) return;
        const r = typeof x === "string" ? { t: x } : x;
        per[j].push({ mat, t: r.t || "", u: r.u || "", key: rKey(mat, r.t || "") });
      });
    });
    const seen = new Set();
    return { per, all: per.flat().filter((r) => !seen.has(r.key) && seen.add(r.key)) };
  }

  const SESS = []; const BY_MOD = {}; const SID = {};
  MODS.forEach((m) => {
    const list = []; const push = (s) => { s.id = `${m.id}-${pad(list.length + 1)}`; s.mod = m.id; s.n = list.length + 1; list.push(s); };
    const since = []; const modReads = [];
    m.topics.forEach((tp, ti) => {
      const th = chunk(tp.c, tp.th || 0), pr = chunk(tp.p, tp.pr || 0);
      const TR = topicReads(m, tp, ti); READS_BY_TOPIC[`${m.id}:${ti}`] = TR;
      const topicLabel = `Tópico ${ti + 1}/${m.topics.length}`;
      const owner = (r, s) => { const l = (READS_BY_MAT[r.mat] = READS_BY_MAT[r.mat] || []); if (!l.some((x) => x.key === r.key)) l.push({ ...r, sid: s.id }); };
      for (let i = 0; i < (tp.th || 0); i++) {
        const s = {
          type: "teoria", title: tp.t, part: tp.th > 1 ? `${i + 1}/${tp.th}` : "", gg: tp.gg, topic: ti, topicLabel,
          sub: th[i].join("; "), reads: TR.per[i] || [], readMode: "leitura",
          checks: [...(i === 0 ? [] : ["Recordar sem consulta os pontos da sessão anterior (5 min)"]),
            ...(th[i].length ? th[i].map((x) => `Estudar: ${x}`) : [`Continuar o estudo de: ${tp.t}`]),
            "Resumir em 5 linhas com suas palavras + 3 perguntas", "Criar 3–5 flashcards (Anki)"],
        };
        push(s); s.reads.forEach((r) => owner(r, s));
      }
      for (let i = 0; i < (tp.pr || 0); i++) {
        const s = {
          type: "pratica", title: tp.t, part: tp.pr > 1 ? `${i + 1}/${tp.pr}` : "", gg: tp.gg, topic: ti, topicLabel,
          sub: short(pr[i][0] || ""), reads: TR.all, readMode: tp.th ? "consulta" : "leitura",
          checks: [...(pr[i].length ? pr[i] : [`Exercícios práticos de: ${tp.t}`]), "Registrar código/comandos e resultados no repositório de estudos", "Anotar 1 erro encontrado e como resolveu"],
        };
        push(s); if (!tp.th) s.reads.forEach((r) => owner(r, s));
      }
      since.push(ti); modReads.push(...TR.all);
      if (since.length === 3 && ti < m.topics.length - 1) {
        const ts = since.map((x) => m.topics[x].t);
        push({ type: "revisao", title: "Revisão espaçada", tops: since.slice(), sub: `Tópicos ${since.map((x) => x + 1).join(", ")}: ${short(ts.join("; "), 140)}`, reads: since.flatMap((x) => READS_BY_TOPIC[`${m.id}:${x}`].all), readMode: "revisao", checks: ["Revisar flashcards pendentes", ...ts.map((t) => `Refazer sem consulta um exercício de: ${t}`), "Explicar em voz alta um conceito difícil (técnica Feynman)", "Listar dúvidas restantes e buscar resposta"] });
        since.length = 0;
      }
    });
    if (m.topics.length) {
      push({ type: "revisao", title: "Revisão geral do módulo", tops: m.topics.map((_, i) => i), sub: "Todos os tópicos do módulo", reads: modReads, readMode: "revisao", checks: ["Mapa mental do módulo inteiro sem consulta", "Revisar flashcards do módulo", "Reler os resultados esperados e marcar os que domina", "Escolher 2 pontos fracos e revisá-los"] });
      push({ type: "avaliacao", title: "Avaliação do módulo", tops: m.topics.map((_, i) => i), sub: "Sem consulta; corrigir depois com os trechos lidos", reads: modReads, readMode: "revisao", checks: [...m.quiz.map((q) => `Responder sem consulta: ${q}`), "Corrigir com os materiais e registrar a nota (≥ 70 para avançar)"] });
    }
    const st = chunk(m.project.steps, m.project.sessions);
    for (let i = 0; i < m.project.sessions; i++) push({
      type: "projeto", title: `Projeto: ${m.project.title}`, part: `${i + 1}/${m.project.sessions}`, sub: short(st[i][0] || ""), reads: modReads, readMode: "revisao",
      checks: [...(st[i].length ? st[i] : ["Avançar no projeto conforme planejamento"]), ...(i === m.project.sessions - 1 ? ["README completo (contexto, dados, como rodar, resultados, limitações)", "Publicar e fixar no perfil do GitHub"] : ["Commit com mensagem descritiva"])],
    });
    if (m.integrator) push({ type: "avaliacao", title: "Avaliação do projeto integrador", sub: "Rubrica de portfólio", reads: [], checks: [...m.quiz.map((q) => `Responder por escrito: ${q}`), "Autoavaliação com a rubrica de portfólio e nota (0–100)"] });
    BY_MOD[m.id] = list; list.forEach((s) => { SESS.push(s); SID[s.id] = s; });
  });

  // Ordem dos módulos: integradores entram logo após seus pré-requisitos
  const ORDER = [];
  (() => {
    const placed = new Set(); const ints = MODS.filter((m) => m.integrator);
    MODS.filter((m) => !m.integrator).forEach((m) => {
      ORDER.push(m); placed.add(m.id);
      ints.forEach((i) => { if (!placed.has(i.id) && i.req.every((r) => placed.has(r))) { ORDER.push(i); placed.add(i.id); } });
    });
    ints.forEach((i) => { if (!placed.has(i.id)) ORDER.push(i); });
  })();

  // ---------- Estado ----------
  const KEY = "trilhaBioinfo.v1";
  const defaults = () => ({ startDate: todayISO(), days: [1, 2, 3, 4, 5], perDay: 1, parallel: 2, ggMode: "slot", off: [], done: {}, materialsSeen: {}, read: {}, checks: {}, notes: {}, known: {}, scores: {}, log: [], baselineEnd: null, theme: "auto", welcomed: false });
  let S;
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { S = defaults(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { toast("Não foi possível salvar no navegador — exporte um backup."); } invalidate(); };

  // ---------- Planejamento ----------
  // Sequência estática: intercala até `parallel` módulos cujos pré-requisitos já foram totalmente sequenciados.
  let _seq = null, _plan = null;
  function invalidate() { _seq = null; _plan = null; }
  function sequence() {
    if (_seq && _seq.p === S.parallel && _seq.g === S.ggMode) return _seq.list;
    // ggMode: "slot" = no máximo 1 módulo Conhecimento comercial ativo, com prioridade; "first" = Conhecimento comercial antes de tudo; "normal" = ordem da trilha
    const isGG = (id) => MOD[id].area === "gg";
    const cand = S.ggMode === "normal" ? ORDER : [...ORDER.filter((m) => m.area === "gg"), ...ORDER.filter((m) => m.area !== "gg")];
    const pos = {}, fin = new Set(), active = [], list = []; let rr = 0;
    while (list.length < SESS.length) {
      for (const pass of [0, 1]) for (const m of cand) {
        if (active.length >= S.parallel) break;
        if (fin.has(m.id) || active.includes(m.id)) continue;
        if (pass === 0 && S.ggMode === "slot" && m.area === "gg" && active.some(isGG)) continue;
        if (pass === 0 && S.ggMode === "slot" && m.area !== "gg" && !active.some(isGG) && cand.some((x) => x.area === "gg" && !fin.has(x.id) && x.req.every((r) => fin.has(r)))) continue;
        if (m.req.every((r) => fin.has(r))) active.push(m.id);
      }
      if (!active.length) break;
      const id = active[rr % active.length]; pos[id] = pos[id] || 0;
      list.push(BY_MOD[id][pos[id]++]);
      if (pos[id] >= BY_MOD[id].length) { fin.add(id); active.splice(active.indexOf(id), 1); } else rr++;
    }
    _seq = { p: S.parallel, g: S.ggMode, list };
    return list;
  }
  const isStudyDay = (d) => S.days.includes(d.getDay()) && !S.off.includes(iso(d));
  const doneOn = (dISO) => Object.entries(S.done).filter(([, d]) => d === dISO).map(([id]) => id);
  // "Já conheço": tópico revisado só pelo resumo. S.known["MÓD:tópico"] = { d, ids } guarda as sessões concluídas por ele.
  const knownIds = () => new Set(Object.values(S.known || {}).flatMap((r) => r.ids || []));
  const isKnownId = (id) => !!S.done[id] && Object.values(S.known || {}).some((r) => (r.ids || []).includes(id));
  const doneIcon = (id) => (S.done[id] ? (isKnownId(id) ? "🔁" : "✅") : "⬜");
  const topicStudySessions = (key) => { const [mod, ti] = key.split(":"); return (BY_MOD[mod] || []).filter((s) => s.topic === +ti && (s.type === "teoria" || s.type === "pratica")); };

  // Distribui o que falta a partir de hoje: dia perdido = conteúdo empurrado, nada se perde.
  function plan() {
    if (_plan) return _plan;
    const pending = sequence().filter((s) => !S.done[s.id]);
    const byDate = {}, dateOf = {};
    let d = new Date(); d.setHours(0, 0, 0, 0);
    if (parse(S.startDate) > d) d = parse(S.startDate);
    const kn = knownIds();
    let cap = isStudyDay(d) ? Math.max(0, S.perDay - (iso(d) === todayISO() ? doneOn(iso(d)).filter((id) => !kn.has(id)).length : 0)) : 0;
    let guard = 0;
    for (const s of pending) {
      while (cap <= 0 && guard++ < 20000) { d = addDays(d, 1); cap = isStudyDay(d) ? S.perDay : 0; }
      const k = iso(d); (byDate[k] = byDate[k] || []).push(s.id); dateOf[s.id] = k; cap--;
    }
    const end = pending.length ? iso(d) : null;
    _plan = { byDate, dateOf, end, pending };
    return _plan;
  }
  function baselineEnd() {
    // fim previsto se tudo fosse cumprido desde a data de início
    let d = parse(S.startDate), left = SESS.length, guard = 0;
    while (left > 0 && guard++ < 20000) { if (isStudyDay(d)) left -= S.perDay; if (left > 0) d = addDays(d, 1); }
    return iso(d);
  }
  function missedDays() {
    const out = []; const t = parse(todayISO());
    for (let d = parse(S.startDate); d < t; d = addDays(d, 1)) if (isStudyDay(d) && !doneOn(iso(d)).length) out.push(iso(d));
    return out;
  }
  function streak() {
    let n = 0, d = parse(todayISO());
    if (!doneOn(iso(d)).length) d = addDays(d, -1);
    for (let i = 0; i < 3650; i++, d = addDays(d, -1)) {
      if (d < parse(S.startDate)) break;
      if (doneOn(iso(d)).length) n++; else if (isStudyDay(d)) break;
    }
    return n;
  }

  // ---------- Progresso ----------
  const doneCount = (list) => list.filter((s) => S.done[s.id]).length;
  const modProg = (id) => ({ d: doneCount(BY_MOD[id]), t: BY_MOD[id].length });
  function modStatus(id) {
    const { d, t } = modProg(id);
    if (d === t) return ["Concluído", "st-done"];
    if (d > 0) return ["Em andamento", "st-prog"];
    if (MOD[id].req.every((r) => modProg(r).d === modProg(r).t)) return ["Disponível", "st-avail"];
    return ["Aguardando pré-requisitos", "st-lock"];
  }
  const bar = (p) => `<div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p}%"></span></div>`;
  const progRow = (label, d, t, href) => `<div class="prog-row"><div class="lab">${href ? `<a href="${href}">${esc(label)}</a>` : esc(label)}</div><div class="pct">${d}/${t}</div>${bar(pct(d, t))}</div>`;
  function ring(p) {
    const r = 52, c = 2 * Math.PI * r;
    return `<div class="ring"><svg width="120" height="120"><circle cx="60" cy="60" r="${r}" stroke="var(--surface-2)" stroke-width="12" fill="none"/><circle cx="60" cy="60" r="${r}" stroke="var(--accent)" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p / 100)}"/></svg><div class="c">${p}%</div></div>`;
  }
  function weekRange(ref = new Date()) {
    const d = new Date(ref); d.setHours(0, 0, 0, 0); const mon = addDays(d, -((d.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => iso(addDays(mon, i)));
  }
  function weekStats(days) {
    const P = plan(); let done = 0, planned = 0;
    days.forEach((k) => { done += doneOn(k).length; planned += (P.byDate[k] || []).length; });
    return { done, total: done + planned };
  }

  // ---------- Ações ----------
  function toggleDone(id, force) {
    const on = force ?? !S.done[id];
    if (on) { S.done[id] = todayISO(); S.log.push({ d: new Date().toISOString(), a: "done", id }); }
    else {
      delete S.done[id]; S.log.push({ d: new Date().toISOString(), a: "undo", id });
      Object.entries(S.known).forEach(([k, r]) => { if (!(r.ids || []).includes(id)) return; r.ids = r.ids.filter((x) => x !== id); if (!r.ids.length) delete S.known[k]; });
    }
    save();
  }
  function markKnown(key) {
    const t = todayISO(), now = new Date().toISOString();
    const ids = topicStudySessions(key).filter((s) => !S.done[s.id]).map((s) => s.id);
    ids.forEach((id) => { S.done[id] = t; S.log.push({ d: now, a: "done", id, k: 1 }); });
    S.known[key] = { d: t, ids }; S.log.push({ d: now, a: "known", key });
    save();
  }
  function unmarkKnown(key) {
    const r = S.known[key]; if (!r) return;
    const now = new Date().toISOString();
    (r.ids || []).forEach((id) => { if (S.done[id]) { delete S.done[id]; S.log.push({ d: now, a: "undo", id }); } });
    delete S.known[key]; S.log.push({ d: now, a: "unknown", key });
    save();
  }
  function toggleCheck(id, i) {
    const arr = new Set(S.checks[id] || []); arr.has(i) ? arr.delete(i) : arr.add(i); S.checks[id] = [...arr];
    const s = SID[id];
    if (arr.size === s.checks.length && !S.done[id]) { toggleDone(id, true); toast("Sessão concluída! 🎉"); } else save();
  }
  function toast(msg) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  // ---------- Componentes ----------
  const typeTag = (t) => `<span class="tag t-${t}">${TYPE[t].label}</span>`;
  const lvlTag = (n) => `<span class="lvl lvl-${n}">${window.LEVEL_LABEL[n]}</span>`;
  const areaDot = (a) => `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${AREAS[a].color}"></span>`;
  const sTitle = (s) => `${esc(s.title)}${s.part ? ` <span class="muted">(${s.part})</span>` : ""}`;
  // Linha curta que diferencia sessões com o mesmo título (foco da teoria, 1ª tarefa da prática etc.)
  const sSub = (s) => {
    const r = s.type === "teoria" ? (s.reads || []).filter((x) => x.t) : [];
    const read = r.length ? `📖 ${esc(MAT[r[0].mat].t.split(" — ")[0].split(" (")[0])}: ${esc(short(r[0].t, 80))}${r.length > 1 ? ` <span class="muted">+${r.length - 1}</span>` : ""}` : "";
    const parts = [s.topicLabel ? esc(s.topicLabel) : "", s.sub ? esc(s.sub) : ""].filter(Boolean).join(" · ");
    return parts || read ? `<div class="s-sub">${parts}${parts && read ? "<br>" : ""}${read}</div>` : "";
  };
  const readDone = (list) => list.filter((r) => S.read[r.key]).length;

  // ---------- Markdown (anotações) ----------
  // Renderizador pequeno e seguro: todo o texto é escapado antes; só links http(s) são gerados.
  function mdInline(t) {
    const codes = [];
    t = t.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    t = t.replace(/!?\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, txt, u) => `<a href="${u}" target="_blank" rel="noopener">${txt}</a>`)
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_, p, u) => `${p}<a href="${u}" target="_blank" rel="noopener">${u}</a>`)
      .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_, a, b) => `<strong>${a || b}</strong>`)
      .replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>").replace(/(^|[^_\w])_([^_\s][^_]*)_(?!\w)/g, "$1<em>$2</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>").replace(/==([^=]+)==/g, "<mark>$1</mark>");
    return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
  }
  function md(src) {
    const lines = esc(src || "").replace(/\r/g, "").split("\n"), out = [];
    let i = 0;
    const isList = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l);
    const isTableSep = (l) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
    const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => mdInline(c.trim()));
    while (i < lines.length) {
      const l = lines[i];
      if (/^\s*```/.test(l)) { const lang = l.replace(/^\s*```/, "").trim(); const buf = []; i++; while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre><code${lang ? ` data-lang="${lang}"` : ""}>${buf.join("\n")}</code></pre>`); continue; }
      if (!l.trim()) { i++; continue; }
      let m;
      if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { const n = Math.min(m[1].length + 2, 6); out.push(`<h${n}>${mdInline(m[2])}</h${n}>`); i++; continue; }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
      if (/^\s*&gt;/.test(l)) { const buf = []; while (i < lines.length && /^\s*&gt;/.test(lines[i])) buf.push(lines[i++].replace(/^\s*&gt;\s?/, "")); out.push(`<blockquote>${md(buf.join("\n").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&"))}</blockquote>`); continue; }
      if (l.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        const head = cells(l); i += 2; const rows = [];
        while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(cells(lines[i++]));
        out.push(`<div class="md-table"><table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`); continue;
      }
      if (isList(l)) {
        // Listas (com aninhamento por indentação) e tarefas "- [ ]" / "- [x]"
        const stack = []; let html = "";
        while (i < lines.length && (isList(lines[i]) || (lines[i].trim() && /^\s{2,}/.test(lines[i]) && stack.length))) {
          const cur = lines[i];
          if (!isList(cur)) { html += ` ${mdInline(cur.trim())}`; i++; continue; }
          const ind = cur.match(/^\s*/)[0].length, ordered = /^\s*\d+[.)]/.test(cur), tag = ordered ? "ol" : "ul";
          let body = cur.replace(/^\s*([-*+]|\d+[.)])\s+/, "");
          while (stack.length && ind < stack[stack.length - 1].ind) html += `</li></${stack.pop().tag}>`;
          if (!stack.length || ind > stack[stack.length - 1].ind) { stack.push({ ind, tag }); html += `<${tag}>`; } else html += "</li>";
          const task = body.match(/^\[([ xX])\]\s+(.*)$/);
          if (task) body = `<span class="md-task ${task[1] !== " " ? "on" : ""}">${task[1] !== " " ? "☑" : "☐"}</span> ${mdInline(task[2])}`; else body = mdInline(body);
          html += `<li>${body}`; i++;
        }
        while (stack.length) html += `</li></${stack.pop().tag}>`;
        out.push(html); continue;
      }
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*```|\s*&gt;)/.test(lines[i]) && !isList(lines[i]) && !/^\s*([-*_])(\s*\1){2,}\s*$/.test(lines[i])) buf.push(mdInline(lines[i++]));
      out.push(`<p>${buf.join("<br>")}</p>`);
    }
    return out.join("");
  }
  const NOTE_HINT = "Markdown: **negrito**, *itálico*, `código`, # Título, - lista, - [ ] tarefa, > citação, ```bloco de código```, [link](https://…), | tabela |";
  // Botão/estado "Já conheço" de um tópico
  function knownCtl(key, compact) {
    const r = S.known[key];
    if (r) return `<div class="known-box on"><span>🔁 <strong>Já conhecia</strong> — marcado em ${fmt(r.d)}${compact ? "" : `. ${r.ids.length ? `${r.ids.length} sessão(ões) de teoria/prática concluída(s) como revisão pelo resumo.` : "As sessões já estavam concluídas."}`}</span><button class="btn" data-unknown="${key}">Desfazer</button></div>`;
    const n = topicStudySessions(key).filter((s) => !S.done[s.id]).length;
    return `<div class="known-box"><span>${compact ? "Já domina este tópico?" : `Já domina este tópico? Revise o resumo acima e marque. ${n ? `Conclui as ${n} sessão(ões) de teoria/prática pendentes como <em>revisão</em>, sem ocupar a hora do dia, e o cronograma avança.` : "As sessões já estão concluídas; a marcação só registra que foi revisão."}`}</span><button class="btn" data-known="${key}">✓ Já conheço</button></div>`;
  }
  const cheatHtml = (key) => (CHEATS[key] ? md(CHEATS[key]) : `<p class="muted">Resumo ainda não disponível para este tópico.</p>`);
  function cheatBox(s) {
    if (s.topic != null) {
      const key = `${s.mod}:${s.topic}`;
      return `<div class="cheat"><div class="spread"><h4 style="margin:0">📌 Resumo do tópico <span class="small muted">(cheatsheet para revisar e saber o que esperar)</span></h4>${CHEATS[key] ? `<button class="btn" data-cheatcopy="${s.id}">Copiar para minhas anotações</button>` : ""}</div>
        <details class="cheat-d" ${S.known[key] || S.done[s.id] ? "" : "open"}><summary class="small">Mostrar/ocultar resumo</summary><div class="md-body cheat-body">${cheatHtml(key)}</div></details>${knownCtl(key)}</div>`;
    }
    if (!s.tops || !s.tops.length) return "";
    const m = MOD[s.mod];
    return `<div class="cheat"><h4 style="margin:0 0 4px">📌 Resumos dos tópicos desta ${s.type === "avaliacao" ? "avaliação" : "revisão"}</h4>${s.type === "avaliacao" ? `<p class="small muted" style="margin:0 0 6px">Responda primeiro sem consulta; abra os resumos só na correção.</p>` : ""}
      ${s.tops.map((ti) => { const key = `${s.mod}:${ti}`; return `<details class="cheat-topic"><summary><strong>Tópico ${ti + 1} · ${esc(m.topics[ti].t)}</strong>${S.known[key] ? ` <span class="pill">🔁 já conhecia</span>` : ""}</summary><div class="md-body cheat-body">${cheatHtml(key)}</div></details>`; }).join("")}</div>`;
  }
  function notesBox(s) {
    const id = s.id, v = S.notes[id] || "";
    return `<div class="notes"><div class="spread"><h3 style="margin:0">Anotações</h3><div class="seg" role="tablist">
        ${[["edit", "Escrever"], ["split", "Lado a lado"], ["view", "Visualizar"]].map(([k, l]) => `<button class="seg-btn" data-notemode="${k}" aria-pressed="${(S.noteMode || "split") === k}">${l}</button>`).join("")}</div></div>
      <div class="notes-grid mode-${S.noteMode || "split"}">
        <textarea data-note="${id}" spellcheck="true" placeholder="Dúvidas, insights, links, comandos... (aceita Markdown)">${esc(v)}</textarea>
        <div class="md-body" data-note-preview="${id}">${v.trim() ? md(v) : `<p class="muted">A pré-visualização aparece aqui.</p>`}</div>
      </div><div class="small muted" style="margin-top:4px">${esc(NOTE_HINT)}</div>${s.type === "projeto" ? "" : cheatBox(s)}</div>`;
  }
  // Um trecho de leitura com checkbox "Lido" (compartilhado em todas as telas onde o mesmo trecho aparece)
  function readItem(r, opts = {}) {
    const m = MAT[r.mat]; if (!m) return "";
    const on = !!S.read[r.key], spec = r.t || "Material completo (sem trecho específico)";
    const specHtml = r.u ? `<a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(spec)}</a>` : esc(spec);
    const where = opts.where ? `<div class="small muted">${opts.where}</div>` : "";
    return `<div class="mat"><span class="k">${window.KIND_LABEL[m.k]}</span><div class="body">${opts.compact ? "" : `<a href="${esc(m.u)}" target="_blank" rel="noopener">${esc(m.t)}</a> ${lvlTag(m.n)}`}
      <div class="read-spec">📖 ${specHtml}</div>${where}
      <label class="mat-check ${on ? "on" : ""}"><input type="checkbox" data-read="${esc(r.key)}" aria-label="Lido: ${esc(m.t)} — ${esc(spec)}" ${on ? "checked" : ""}><span>${on ? `Lido em ${fmt(S.read[r.key])}` : "Lido"}</span></label></div></div>`;
  }
  const ownerOf = (r) => (READS_BY_MAT[r.mat] || []).find((x) => x.key === r.key) || r;
  // Onde um trecho é estudado: módulo · tópico · sessão (com link)
  const readWhere = (r) => { const s = SID[r.sid]; if (!s) return ""; return `<a href="#/sessao/${s.id}">${esc(s.mod)} · ${esc(s.topicLabel || "")} · ${TYPE[s.type].label}${s.part ? ` ${s.part}` : ""}</a> — ${esc(s.title)}`; };
  function matItem(id, usage = "") {
    const m = MAT[id]; if (!m) return "";
    const plan = READS_BY_MAT[id] || [];
    const head = `<a href="${esc(m.u)}" target="_blank" rel="noopener">${esc(m.t)}</a> ${lvlTag(m.n)}<div class="small muted">${esc(m.s)}${typeof usage === "string" ? usage : ""}</div>`;
    if (!plan.length) return `<div class="mat"><span class="k">${window.KIND_LABEL[m.k]}</span><div class="body">${head}<label class="mat-check ${S.materialsSeen[id] ? "on" : ""}"><input type="checkbox" data-material="${esc(id)}" aria-label="Já vi: ${esc(m.t)}" ${S.materialsSeen[id] ? "checked" : ""}><span>Já vi</span></label></div></div>`;
    const d = readDone(plan);
    return `<div class="mat"><span class="k">${window.KIND_LABEL[m.k]}</span><div class="body">${head}
      <details class="read-plan"><summary><span class="read-prog ${d === plan.length ? "full" : ""}">${d}/${plan.length}</span> trecho(s) lido(s) — ver plano de leitura deste material</summary>
      ${S.materialsSeen[id] ? `<div class="small muted" style="margin:4px 0">Você marcou este material como “Já vi” antes da divisão por trechos. Confira abaixo quais trechos já leu.</div>` : ""}
      ${plan.map((r) => readItem(r, { compact: true, where: readWhere(r) })).join("")}</details></div></div>`;
  }
  function sessionCard(s, opts = {}) {
    const done = !!S.done[s.id], m = MOD[s.mod], ch = new Set(S.checks[s.id] || []);
    const kn = isKnownId(s.id);
    const date = done ? `${kn ? "🔁 já conhecia · revisada" : "concluída"} em ${fmt(S.done[s.id])}` : plan().dateOf[s.id] ? `prevista para ${fmt(plan().dateOf[s.id])}` : "";
    return `<div class="session ${done ? "done" : ""}">
      <div class="spread"><div class="meta">${typeTag(s.type)} ${areaDot(m.area)} <a href="#/modulo/${m.id}">${esc(m.name)}</a> · sessão ${s.n}/${BY_MOD[m.id].length}</div><span class="small muted">${date}</span></div>
      <h3 style="margin:8px 0 4px"><a href="#/sessao/${s.id}" style="color:inherit">${sTitle(s)}</a></h3>${sSub(s)}
      ${opts.full ? "" : `<div class="row small muted">${ch.size}/${s.checks.length} itens · <a href="#/sessao/${s.id}">abrir sessão →</a></div>`}
    </div>`;
  }
  function checklist(s) {
    const ch = new Set(S.checks[s.id] || []);
    return s.checks.map((c, i) => `<label class="check ${ch.has(i) ? "on" : ""}"><input type="checkbox" data-check="${s.id}|${i}" ${ch.has(i) ? "checked" : ""}><span>${esc(c)}</span></label>`).join("");
  }

  // ---------- Páginas ----------
  const pages = {};

  pages[""] = () => {
    const P = plan(), total = SESS.length, done = Object.keys(S.done).filter((k) => SID[k]).length;
    const kDone = [...knownIds()].filter((k) => SID[k] && S.done[k]).length;
    const wk = weekStats(weekRange()), miss = missedDays().length, base = S.baselineEnd || baselineEnd();
    const delay = P.end ? Math.round((parse(P.end) - parse(base)) / 864e5) : 0;
    const next = P.pending[0];
    const curMods = ORDER.filter((m) => { const p = modProg(m.id); return p.d > 0 && p.d < p.t; });
    const upcoming = ORDER.filter((m) => modProg(m.id).d < modProg(m.id).t).slice(0, 4);
    const show = curMods.length ? curMods : upcoming;
    return `
    ${S.welcomed ? "" : `<div class="banner stack" style="margin-bottom:16px"><div><strong>Bem-vinda à sua trilha!</strong> São ${ORDER.length} módulos e ${total} sessões de 1 hora, com dependências entre assuntos. O cronograma começa em ${fmt(S.startDate)} com estudo de ${S.days.map((d) => DOW[d]).join(", ")}. Ajuste dias e data de início em <a href="#/config">Configurações</a>.</div><div class="small muted">O progresso fica salvo neste navegador. Faça backups periódicos (Configurações → Exportar).</div><div><button class="btn primary" data-act="welcome">Entendi, vamos começar</button></div></div>`}
    <div class="page-head"><h1>Dashboard</h1><div class="muted">${fmtLong(todayISO())}</div></div>
    <div class="grid g4">
      <div class="card kpi"><div class="v">${done}<span class="muted" style="font-size:1rem">/${total}</span></div><div class="l">sessões concluídas (${done - kDone} h de estudo${kDone ? ` + ${kDone} revisada(s) por “já conheço”` : ""})</div></div>
      <div class="card kpi"><div class="v">${streak()} 🔥</div><div class="l">dias seguidos de estudo</div></div>
      <div class="card kpi"><div class="v">${wk.done}/${wk.total}</div><div class="l">sessões nesta semana</div>${bar(pct(wk.done, wk.total))}</div>
      <div class="card kpi"><div class="v" style="font-size:1.25rem">${P.end ? fmt(P.end) : "Concluído!"}</div><div class="l">previsão de término ${delay > 0 ? `· <span style="color:var(--warn)">+${delay} dias vs plano</span>` : delay < 0 ? `· <span style="color:var(--ok)">${-delay} dias adiantada</span>` : "· no plano"}</div></div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card stack">
        <div class="spread"><h2 style="margin:0">Próxima sessão</h2><a href="#/hoje" class="btn primary">Estudar hoje</a></div>
        ${next ? sessionCard(next) : "<p>Você concluiu toda a trilha. Parabéns! 🎓</p>"}
        ${miss ? `<div class="warnbox small">${miss} dia(s) de estudo sem registro desde o início. O cronograma foi reorganizado automaticamente — nenhum conteúdo foi perdido.</div>` : ""}
        <div><h3>Próximos dias</h3><ul class="list-plain small">${Object.entries(P.byDate).slice(0, 5).map(([d, ids]) => `<li><strong>${fmtLong(d)}</strong> — ${ids.map((id) => `${typeTag(SID[id].type)} <a href="#/sessao/${id}">${esc(SID[id].title)}${SID[id].part ? ` (${SID[id].part})` : ""}</a>`).join(" · ")}</li>`).join("")}</ul></div>
      </div>
      <div class="card">
        <h2>Curso completo</h2>
        <div class="row" style="gap:20px;flex-wrap:nowrap">${ring(pct(done, total))}<div class="prog-list" style="flex:1;min-width:0">${PHASES.map((ph) => { const l = SESS.filter((s) => MOD[s.mod].phase === ph.id); return progRow(`Fase ${ph.id} · ${ph.name}`, doneCount(l), l.length); }).join("")}</div></div>
      </div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h2>${curMods.length ? "Módulos em andamento" : "Próximos módulos"}</h2><div class="prog-list">${show.map((m) => { const p = modProg(m.id); return progRow(m.name, p.d, p.t, `#/modulo/${m.id}`); }).join("")}</div></div>
      <div class="card"><h2>Por área de competência</h2><div class="prog-list">${Object.entries(AREAS).map(([k, a]) => { const l = SESS.filter((s) => MOD[s.mod].area === k); return progRow(a.name, doneCount(l), l.length); }).join("")}</div></div>
    </div>`;
  };

  pages.hoje = () => {
    const P = plan(), t = todayISO();
    const kn = knownIds(), ids = [...doneOn(t).filter((id) => !kn.has(id)), ...(P.byDate[t] || [])];
    const study = isStudyDay(parse(t));
    const nextDay = Object.keys(P.byDate).find((d) => d > t);
    return `<div class="page-head spread"><div><h1>Hoje</h1><div class="muted">${fmtLong(t)}</div></div>
      <div class="row">${study ? `<button class="btn" data-act="skipToday">Hoje não vou estudar</button>` : S.off.includes(t) ? `<button class="btn" data-act="unskipToday">Vou estudar hoje</button>` : ""}</div></div>
      ${ids.length ? ids.map((id) => sessionPanel(SID[id])).join("") : `<div class="card stack"><p>${study ? "Nada pendente para hoje." : "Hoje não é dia de estudo no seu cronograma."}</p>${P.pending[0] ? `<p class="muted">Próxima sessão: ${nextDay ? fmtLong(nextDay) : ""}. Quer adiantar? Concluir agora antecipa todo o cronograma.</p>${sessionPanel(P.pending[0])}` : ""}</div>`}`;
  };

  function sessionPanel(s) {
    const m = MOD[s.mod], done = !!S.done[s.id], idx = BY_MOD[m.id].indexOf(s);
    const prev = BY_MOD[m.id][idx - 1], next = BY_MOD[m.id][idx + 1];
    const reads = s.reads || [], rd = readDone(reads);
    const readTitle = { leitura: "📖 Leitura desta sessão", consulta: "📖 Consulta para a prática", revisao: "📖 Trechos para revisar" }[s.readMode] || "📖 Leitura";
    const readHint = { leitura: "Leia apenas estes trechos nesta sessão. Marque “Lido” para acompanhar a progressão em cada material.", consulta: "Trechos das sessões de teoria deste tópico, para consultar durante a prática.", revisao: "Trechos lidos nos tópicos cobertos por esta sessão — releia os que ainda estão fracos." }[s.readMode] || "";
    return `<div class="card stack" style="margin-bottom:16px">
      ${sessionCard(s, { full: true })}
      ${s.gg ? `<a class="btn" href="#/gogenetic/${s.gg}">🧬 Conteúdo aprofundado deste tópico →</a>` : ""}
      <div class="timeplan">${TYPE[s.type].plan.map(([a, b]) => `<div><strong>${a}</strong> ${b}</div>`).join("")}</div>
      ${s.type === "projeto" ? projectBox(m) : ""}
      <div><h3>Checklist</h3>${checklist(s)}</div>
      ${s.type === "avaliacao" ? `<div class="row"><label for="sc-${s.id}"><strong>Nota da autoavaliação (0–100):</strong></label><input type="number" min="0" max="100" id="sc-${s.id}" data-score="${s.id}" value="${S.scores[s.id] ?? ""}" style="width:90px">${S.scores[s.id] != null && S.scores[s.id] < 70 ? `<span class="small" style="color:var(--warn)">Abaixo de 70: revise os tópicos fracos antes de avançar.</span>` : ""}</div>` : ""}
      ${reads.length ? `<details ${s.readMode !== "revisao" ? "open" : ""}><summary><strong>${readTitle}</strong> <span class="read-prog ${rd === reads.length ? "full" : ""}">${rd}/${reads.length} lido(s)</span></summary><p class="small muted" style="margin:6px 0">${readHint}</p>${reads.map((r) => readItem(r, { where: s.readMode === "leitura" ? "" : readWhere(ownerOf(r)) })).join("")}</details>` : ""}
      ${notesBox(s)}
      <div class="spread"><div class="row">${prev ? `<a class="btn" href="#/sessao/${prev.id}">← Anterior</a>` : ""}${next ? `<a class="btn" href="#/sessao/${next.id}">Próxima →</a>` : ""}</div>
      <button class="btn ${done ? "" : "primary"}" data-done="${s.id}">${done ? "Desfazer conclusão" : "✓ Marcar sessão como concluída"}</button></div>
    </div>`;
  }
  function projectBox(m) {
    const p = m.project;
    return `<div class="card" style="box-shadow:none;background:var(--surface-2)"><div class="spread"><strong>${esc(p.title)}</strong>${lvlTag(p.level)}</div>
      <div class="small" style="margin-top:6px"><strong>Dados:</strong> ${esc(p.data)}<br><strong>Ferramentas:</strong> ${p.tools.map(esc).join(", ")}</div>
      <ol class="small" style="margin:8px 0 0;padding-left:18px">${p.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div>`;
  }

  pages.sessao = (id) => { const s = SID[id]; return s ? `<div class="page-head"><a href="#/modulo/${s.mod}" class="small">← ${esc(MOD[s.mod].name)}</a></div>${sessionPanel(s)}` : notFound(); };

  pages.modulo = (id) => {
    const m = MOD[id]; if (!m) return notFound();
    const p = modProg(id), [st, cls] = modStatus(id);
    const allReads = m.topics.flatMap((_, ti) => READS_BY_TOPIC[`${id}:${ti}`].all);
    const firstOpen = m.topics.findIndex((_, ti) => readDone(READS_BY_TOPIC[`${id}:${ti}`].all) < READS_BY_TOPIC[`${id}:${ti}`].all.length);
    const readPlan = m.topics.map((tp, ti) => {
      const TR = READS_BY_TOPIC[`${id}:${ti}`], d = readDone(TR.all);
      const thS = BY_MOD[id].filter((s) => s.topic === ti && s.readMode === "leitura");
      return `<details class="read-topic" ${ti === firstOpen ? "open" : ""}><summary><strong>Tópico ${ti + 1} · ${esc(tp.t)}</strong> <span class="read-prog ${d === TR.all.length ? "full" : ""}">${d}/${TR.all.length}</span>${S.known[`${id}:${ti}`] ? ` <span class="pill">🔁 já conhecia</span>` : ""}</summary>
        <details class="cheat-topic"><summary class="small">📌 Resumo do tópico</summary><div class="md-body cheat-body">${cheatHtml(`${id}:${ti}`)}</div></details>${knownCtl(`${id}:${ti}`, true)}
        ${thS.map((s) => `<div class="read-session"><a href="#/sessao/${s.id}">${doneIcon(s.id)} ${TYPE[s.type].label}${s.part ? ` ${s.part}` : ""}</a>${s.sub ? ` <span class="small muted">— ${esc(short(s.sub, 90))}</span>` : ""}</div>${s.reads.map((r) => readItem(r)).join("")}`).join("")}</details>`;
    }).join("");
    const dependents = MODS.filter((x) => x.req.includes(id));
    const evalS = BY_MOD[id].filter((s) => s.type === "avaliacao" && S.scores[s.id] != null);
    return `<div class="page-head"><div class="row small">${areaDot(m.area)} ${AREAS[m.area].name} · Fase ${m.phase} · ${lvlTag(m.level)} <span class="status ${cls}">${st}</span></div>
      <h1>${esc(m.name)}</h1><p class="muted" style="margin:.25rem 0 0">${esc(m.desc)}</p>${m.gg ? `<p style="margin:.5rem 0 0"><a class="btn" href="#/gogenetic/${m.gg}">🧬 Abrir conteúdo aprofundado</a></p>` : ""}</div>
      <div class="grid g3">
        <div class="card"><h3>Progresso</h3>${progRow("Sessões", p.d, p.t)}<div class="small muted" style="margin-top:8px">${["teoria", "pratica", "revisao", "avaliacao", "projeto"].map((t) => { const l = BY_MOD[id].filter((s) => s.type === t); return l.length ? `${TYPE[t].label}: ${doneCount(l)}/${l.length}` : ""; }).filter(Boolean).join(" · ")}</div>${evalS.length ? `<div class="small" style="margin-top:6px">Nota da avaliação: <strong>${evalS.map((s) => S.scores[s.id]).join(", ")}</strong></div>` : ""}</div>
        <div class="card"><h3>Pré-requisitos</h3>${m.req.length ? m.req.map((r) => `<div class="small">${modProg(r).d === modProg(r).t ? "✅" : "⏳"} <a href="#/modulo/${r}">${esc(MOD[r].name)}</a></div>`).join("") : '<span class="small muted">Nenhum — pode começar.</span>'}<h3 style="margin-top:12px">Libera</h3>${dependents.length ? dependents.map((d) => `<div class="small">→ <a href="#/modulo/${d.id}">${esc(d.name)}</a></div>`).join("") : '<span class="small muted">—</span>'}</div>
        <div class="card"><h3>Ao final você será capaz de</h3><ul class="clean small">${m.outcomes.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>
      </div>
      <div class="grid g2" style="margin-top:16px;align-items:start">
        <div class="card"><h2>Sessões (${BY_MOD[id].length} h)</h2><ul class="list-plain">${BY_MOD[id].map((s) => `<li class="row" style="flex-wrap:nowrap"><span>${doneIcon(s.id)}</span> ${typeTag(s.type)} <div style="min-width:0"><a href="#/sessao/${s.id}">${sTitle(s)}</a>${sSub(s)}</div></li>`).join("")}</ul></div>
        <div class="stack"><div class="card"><h2>Projeto do módulo</h2>${projectBox(m)}</div>
        ${allReads.length ? `<div class="card"><div class="spread"><h2 style="margin:0">Plano de leitura e resumos</h2><span class="read-prog ${readDone(allReads) === allReads.length ? "full" : ""}">${readDone(allReads)}/${allReads.length} trechos lidos</span></div><p class="small muted">O que ler em cada sessão de teoria, tópico a tópico, com o resumo de cada tópico e o botão “Já conheço”. A marcação “Lido” é a mesma da sessão e da página Materiais.</p>${readPlan}</div>` : ""}</div>
      </div>`;
  };

  pages.trilha = () => {
    return `<div class="page-head"><h1>Trilha & dependências</h1><p class="muted">${ORDER.length} módulos em 5 fases. O cronograma intercala até ${S.parallel} módulos por vez e só inicia um módulo após concluir o sequenciamento dos pré-requisitos. Passe o mouse (ou toque) em um módulo para ver suas dependências.</p></div>
      <div class="card" style="margin-bottom:16px"><h2>Mapa de dependências</h2>${graph()}<div class="legend" style="margin-top:10px">${Object.values(AREAS).map((a) => `<span><i style="background:${a.color}"></i>${a.name}</span>`).join("")}</div></div>
      <div class="phase-cols">${PHASES.map((ph) => `<div><h3>Fase ${ph.id} · ${ph.name}</h3><p class="small muted">${ph.desc}</p>${ORDER.filter((m) => m.phase === ph.id).map(modCard).join("")}</div>`).join("")}</div>`;
  };
  function modCard(m) {
    const p = modProg(m.id), [st, cls] = modStatus(m.id);
    return `<a class="mod-card" href="#/modulo/${m.id}" style="--c:${AREAS[m.area].color}"><div class="n">${esc(m.name)}</div><div class="spread small"><span class="status ${cls}">${st}</span><span class="muted">${p.t} h</span></div>${bar(pct(p.d, p.t))}${m.req.length ? `<div class="small muted" style="margin-top:4px">requer: ${m.req.join(", ")}</div>` : ""}</a>`;
  }
  function graph() {
    const W = 200, H = 40, CX = 250, RY = 54, PADX = 16, PADY = 16, pos = {};
    PHASES.forEach((ph, ci) => ORDER.filter((m) => m.phase === ph.id).forEach((m, ri) => { pos[m.id] = { x: PADX + ci * CX, y: PADY + ri * RY }; }));
    const rows = Math.max(...PHASES.map((ph) => ORDER.filter((m) => m.phase === ph.id).length));
    const w = PADX * 2 + (PHASES.length - 1) * CX + W, h = PADY * 2 + rows * RY;
    const edges = [];
    MODS.forEach((m) => m.req.forEach((r) => {
      const a = pos[r], b = pos[m.id]; let d;
      if (a.x === b.x) { const x = a.x + W; d = `M${x},${a.y + H / 2} C${x + 30},${a.y + H / 2} ${x + 30},${b.y + H / 2} ${x},${b.y + H / 2}`; }
      else { const x1 = a.x + W, x2 = b.x, mx = (x1 + x2) / 2; d = `M${x1},${a.y + H / 2} C${mx},${a.y + H / 2} ${mx},${b.y + H / 2} ${x2},${b.y + H / 2}`; }
      edges.push(`<path class="gedge" data-a="${r}" data-b="${m.id}" d="${d}"/>`);
    }));
    const nodes = ORDER.map((m) => { const p = pos[m.id], pr = modProg(m.id); const f = Math.round((W - 8) * pr.d / pr.t);
      return `<g class="gnode" data-id="${m.id}" transform="translate(${p.x},${p.y})" tabindex="0"><rect width="${W}" height="${H}" rx="8"/><rect x="0" y="0" width="5" height="${H}" rx="2" style="fill:${AREAS[m.area].color};stroke:none"/><rect x="4" y="${H - 4}" width="${f}" height="3" style="fill:var(--accent);stroke:none"/><text x="12" y="${H / 2 + 4}">${esc(m.name.length > 27 ? m.name.slice(0, 26) + "…" : m.name)}</text><title>${esc(m.name)}</title></g>`; }).join("");
    return `<div class="graph-wrap" id="graph"><svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${edges.join("")}${nodes}</svg></div>`;
  }

  let calRef = new Date(); let calSel = todayISO();
  pages.calendario = () => {
    const P = plan(), y = calRef.getFullYear(), mo = calRef.getMonth();
    const first = new Date(y, mo, 1), start = addDays(first, -first.getDay());
    const missed = new Set(missedDays()), t = todayISO();
    const cells = Array.from({ length: 42 }, (_, i) => {
      const d = addDays(start, i), k = iso(d);
      const ev = [...doneOn(k).map((id) => [id, 1]), ...(P.byDate[k] || []).map((id) => [id, 0])];
      return `<div class="day ${d.getMonth() !== mo ? "out" : ""} ${k === t ? "today" : ""} ${k === calSel ? "sel" : ""}" data-day="${k}"><div class="d"><span>${d.getDate()}</span>${S.off.includes(k) ? '<span class="offd">folga</span>' : missed.has(k) ? '<span class="miss">perdido</span>' : ""}</div>${ev.map(([id, dn]) => `<div class="ev t-${SID[id].type} ${dn ? "done" : ""}" title="${esc(SID[id].title)}">${esc(SID[id].mod)} · ${esc(SID[id].title)}</div>`).join("")}</div>`;
    }).join("");
    const selIds = [...doneOn(calSel), ...(P.byDate[calSel] || [])];
    return `<div class="page-head spread"><div><h1>Calendário</h1><p class="muted" style="margin:0">Dias perdidos empurram o conteúdo para a próxima data de estudo automaticamente.</p></div>
      <div class="row"><button class="btn" data-cal="-1">←</button><strong style="min-width:150px;text-align:center">${first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</strong><button class="btn" data-cal="1">→</button><button class="btn" data-cal="0">Hoje</button></div></div>
      <div class="card"><div class="cal">${DOW.map((d) => `<div class="dow">${d}</div>`).join("")}${cells}</div>
      <div class="legend" style="margin-top:12px">${Object.entries(TYPE).map(([k, v]) => `<span><i class="t-${k}"></i>${v.label}</span>`).join("")}<span>riscado = concluída</span></div></div>
      <div class="card" style="margin-top:16px"><div class="spread"><h2 style="margin:0">${fmtLong(calSel)}</h2>
        <button class="btn" data-offtoggle="${calSel}">${S.off.includes(calSel) ? "Remover folga" : "Marcar como folga"}</button></div>
        <div class="stack" style="margin-top:12px">${selIds.length ? selIds.map((id) => sessionCard(SID[id])).join("") : '<p class="muted">Nenhuma sessão neste dia.</p>'}</div></div>`;
  };

  pages.progresso = () => {
    const total = SESS.length, done = doneCount(SESS);
    const weeks = []; for (let i = 7; i >= 0; i--) { const days = weekRange(addDays(new Date(), -7 * i)); const n = days.reduce((a, k) => a + doneOn(k).length, 0); const target = days.filter((k) => isStudyDay(parse(k)) && k >= S.startDate).length * S.perDay; weeks.push({ lab: `${fmt(days[0]).slice(0, 5)}–${fmt(days[6]).slice(0, 5)}`, n, target }); }
    return `<div class="page-head"><h1>Progresso</h1></div>
      <div class="grid g3">
        <div class="card"><h2>Curso completo</h2><div class="row">${ring(pct(done, total))}<div class="small muted">${done} de ${total} sessões<br>${total - done} horas restantes</div></div></div>
        <div class="card"><h2>Por tipo de sessão</h2><div class="prog-list">${Object.keys(TYPE).map((t) => { const l = SESS.filter((s) => s.type === t); return progRow(TYPE[t].label, doneCount(l), l.length); }).join("")}</div></div>
        <div class="card"><h2>Últimas 8 semanas</h2><div class="prog-list">${weeks.map((w) => progRow(w.lab, w.n, w.target)).join("")}</div></div>
      </div>
      <div class="grid g2" style="margin-top:16px;align-items:start">
        <div class="card"><h2>Por assunto (área)</h2><div class="prog-list">${Object.entries(AREAS).map(([k, a]) => { const l = SESS.filter((s) => MOD[s.mod].area === k); return progRow(a.name, doneCount(l), l.length); }).join("")}</div>
          <h2 style="margin-top:20px">Por fase</h2><div class="prog-list">${PHASES.map((ph) => { const l = SESS.filter((s) => MOD[s.mod].phase === ph.id); return progRow(`Fase ${ph.id} · ${ph.name}`, doneCount(l), l.length); }).join("")}</div></div>
        <div class="card"><h2>Por módulo</h2><div class="prog-list">${ORDER.map((m) => { const p = modProg(m.id); return progRow(m.name, p.d, p.t, `#/modulo/${m.id}`); }).join("")}</div></div>
      </div>`;
  };

  pages.projetos = () => {
    const proj = (m) => { const l = BY_MOD[m.id].filter((s) => s.type === "projeto"); return `<div class="card stack"><div class="row small">${areaDot(m.area)} <a href="#/modulo/${m.id}">${esc(m.name)}</a></div>${projectBox(m)}${progRow("Sessões de projeto", doneCount(l), l.length)}</div>`; };
    return `<div class="page-head"><h1>Projetos & portfólio</h1><p class="muted">Cada módulo termina com um projeto publicável no GitHub, com dificuldade crescente. Os três integradores combinam biologia, estatística, programação, bioinformática e IA.</p></div>
      <h2>Projetos integradores</h2><div class="grid g3">${ORDER.filter((m) => m.integrator).map(proj).join("")}</div>
      <h2 style="margin-top:24px">Padrão de publicação (todo projeto)</h2>
      <div class="grid g2"><div class="card"><h3>Checklist de qualidade</h3><ul class="clean small">
        <li>Pergunta biológica clara e motivação no topo do README</li><li>Dados públicos com acesso documentado (IDs, versões, datas de download)</li>
        <li>Ambiente reprodutível (environment.yml / renv.lock / Dockerfile)</li><li>Um comando reproduz tudo (Makefile, Snakemake ou Nextflow)</li>
        <li>Testes para funções próprias e CI (a partir de ENG1)</li><li>Figuras legendadas e resultados interpretados biologicamente</li>
        <li>Seção de limitações e próximos passos</li><li>Licença (MIT/Apache-2.0) e CITATION.cff</li></ul></div>
      <div class="card"><h3>Modelo de README</h3><pre class="code"># Título do projeto
Uma frase com a pergunta e o principal resultado.

## Contexto biológico
## Dados (fonte, IDs, licença)
## Métodos (fluxo + ferramentas e versões)
## Como reproduzir
\`\`\`bash
conda env create -f environment.yml
snakemake --cores 4   # ou nextflow run main.nf -profile docker
\`\`\`
## Resultados (figuras + interpretação)
## Limitações
## Referências</pre></div></div>
      <h2 style="margin-top:24px">Projetos por módulo</h2><div class="grid g3">${ORDER.filter((m) => !m.integrator).map(proj).join("")}</div>`;
  };

  let matF = { q: "", k: "", n: "", a: "" };
  pages.materiais = () => {
    const use = {}; MODS.forEach((m) => m.topics.forEach((t) => t.m.forEach((id) => { (use[id] = use[id] || new Set()).add(m.id); })));
    const q = matF.q.toLowerCase();
    const list = Object.entries(MAT).filter(([id, m]) => (!q || (m.t + m.s).toLowerCase().includes(q)) && (!matF.k || m.k === matF.k) && (!matF.n || String(m.n) === matF.n) && (!matF.a || [...(use[id] || [])].some((x) => MOD[x].area === matF.a))).sort((a, b) => a[1].n - b[1].n || a[1].t.localeCompare(b[1].t));
    return `<div class="page-head"><h1>Materiais</h1><p class="muted">${Object.keys(MAT).length} materiais de universidades, instituições científicas, documentações oficiais e publicações revisadas por pares. Cada material tem um plano de leitura: o trecho exato a ler em cada sessão. Abra “ver plano de leitura” para marcar os trechos lidos — a marcação é a mesma das sessões e da página do módulo. Materiais sem plano ficam com “Já vi”.</p></div>
      <div class="card"><div class="filters"><input type="text" id="mq" placeholder="Buscar..." value="${esc(matF.q)}">
        <select id="mk"><option value="">Todos os tipos</option>${Object.entries(window.KIND_LABEL).map(([k, v]) => `<option value="${k}" ${matF.k === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <select id="mn"><option value="">Todos os níveis</option>${Object.entries(window.LEVEL_LABEL).map(([k, v]) => `<option value="${k}" ${matF.n === k ? "selected" : ""}>${v}</option>`).join("")}</select>
        <select id="ma"><option value="">Todas as áreas</option>${Object.entries(AREAS).filter(([k]) => k !== "int").map(([k, v]) => `<option value="${k}" ${matF.a === k ? "selected" : ""}>${v.name}</option>`).join("")}</select></div>
        <div class="small muted" style="margin-bottom:6px">${list.length} resultado(s)</div>
        ${list.map(([id]) => matItem(id, use[id] ? ` · usado em ${[...use[id]].map((x) => `<a href="#/modulo/${x}">${x}</a>`).join(", ")}` : "")).join("")}</div>`;
  };

  pages.mercado = () => {
    const M = window.MARKET, N = M.jobs.length;
    return `<div class="page-head"><h1>Pesquisa de mercado</h1><p class="muted">Levantamento de ${fmt(M.date)} com ${N} anúncios de vagas sênior e correlatas (Bioinformatics Scientist, Computational Biologist, genômica, ML para ciências da vida). ${esc(M.note)}</p></div>
      <div class="grid g2" style="align-items:start">
        <div class="card"><h2>Competências mais citadas</h2><div class="prog-list">${M.skills.map((s) => `<div class="prog-row"><div class="lab" style="white-space:normal">${esc(s.k)}</div><div class="pct">${s.n}/${N}</div>${bar(pct(s.n, N))}<div class="small muted" style="grid-column:1/-1">Na trilha: ${s.mods.map((x) => `<a href="#/modulo/${x}">${esc(MOD[x].name)}</a>`).join(" · ")}</div></div>`).join("")}</div></div>
        <div class="card"><h2>O que isso significa para a trilha</h2><ul class="clean">${M.insights.map((i) => `<li style="margin-bottom:8px">${esc(i)}</li>`).join("")}</ul></div>
      </div>
      <div class="card" style="margin-top:16px"><h2>Vagas analisadas</h2><ul class="list-plain">${M.jobs.map((j) => `<li><a href="${esc(j.url)}" target="_blank" rel="noopener">${esc(j.title)}</a> <span class="muted small">— ${esc(j.org)} · ${esc(j.when)}</span><div class="row small" style="margin-top:4px;gap:6px">${j.reqs.map((r) => `<span class="pill">${esc(r)}</span>`).join("")}</div></li>`).join("")}</ul>
      <p class="small muted">Requisitos resumidos a partir dos anúncios encontrados na busca; vagas expiram — confira o anúncio original. Para atualizar, refaça a análise no módulo "Carreira" (CAR).</p></div>`;
  };

  pages.historico = () => {
    const end = parse(todayISO()), start = addDays(end, -7 * 26 - end.getDay());
    const cells = []; for (let d = new Date(start); d <= end; d = addDays(d, 1)) { const n = doneOn(iso(d)).length; cells.push(`<span class="${n >= 3 ? "h3" : n === 2 ? "h2" : n === 1 ? "h1" : ""}" title="${fmt(iso(d))}: ${n} sessão(ões)"></span>`); }
    const byDay = {}; S.log.filter((l) => l.a === "done" && SID[l.id] && S.done[l.id]).forEach((l) => { const k = S.done[l.id]; (byDay[k] = byDay[k] || new Set()).add(l.id); });
    const days = Object.keys(byDay).sort().reverse();
    const scores = Object.entries(S.scores).filter(([id]) => SID[id]);
    const kDone = [...knownIds()].filter((k) => SID[k] && S.done[k]).length;
    return `<div class="page-head"><h1>Histórico</h1></div>
      <div class="grid g3"><div class="card kpi"><div class="v">${doneCount(SESS) - kDone} h</div><div class="l">estudadas no total${kDone ? ` · ${kDone} sessão(ões) revisada(s) por “já conheço”` : ""}</div></div><div class="card kpi"><div class="v">${streak()}</div><div class="l">dias seguidos</div></div><div class="card kpi"><div class="v">${missedDays().length}</div><div class="l">dias de estudo sem registro (reagendados)</div></div></div>
      <div class="card" style="margin-top:16px"><h2>Últimos 6 meses</h2><div class="heat">${cells.join("")}</div></div>
      ${scores.length ? `<div class="card" style="margin-top:16px"><h2>Avaliações</h2><ul class="list-plain">${scores.map(([id, v]) => `<li class="spread"><a href="#/sessao/${id}">${esc(MOD[SID[id].mod].name)}</a><strong style="color:${v >= 70 ? "var(--ok)" : "var(--warn)"}">${v}</strong></li>`).join("")}</ul></div>` : ""}
      <div class="card" style="margin-top:16px"><h2>Sessões concluídas</h2>${days.length ? days.map((d) => `<h3 style="margin-top:12px">${fmtLong(d)}</h3><ul class="list-plain">${[...byDay[d]].map((id) => `<li>${typeTag(SID[id].type)} <a href="#/sessao/${id}">${sTitle(SID[id])}</a>${isKnownId(id) ? ` <span class="pill">🔁 já conhecia (revisão pelo resumo)</span>` : ""} <span class="small muted">· ${esc(MOD[SID[id].mod].name)}</span>${S.notes[id] ? `<div class="small muted">📝 ${esc(S.notes[id].slice(0, 160))}</div>` : ""}</li>`).join("")}</ul>`).join("") : '<p class="muted">Nenhuma sessão concluída ainda.</p>'}</div>`;
  };

  pages.config = () => `<div class="page-head"><h1>Configurações</h1></div>
    <div class="grid g2" style="align-items:start">
      <div class="card stack"><h2>Cronograma</h2>
        <div><label><strong>Data de início</strong><br><input type="date" id="cfStart" value="${S.startDate}"></label></div>
        <div class="weekdays"><strong>Dias de estudo</strong><br>${DOW.map((d, i) => `<label><input type="checkbox" data-wd="${i}" ${S.days.includes(i) ? "checked" : ""}>${d}</label>`).join("")}</div>
        <div><label><strong>Sessões de 1 h por dia</strong><br><select id="cfPer">${[1, 2, 3].map((n) => `<option ${S.perDay === n ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>
        <div><label><strong>Módulos intercalados em paralelo</strong><br><select id="cfPar">${[1, 2, 3].map((n) => `<option ${S.parallel === n ? "selected" : ""}>${n}</option>`).join("")}</select></label><div class="small muted">2 é o recomendado: alterna, por exemplo, biologia e programação, o que ajuda a reter conteúdo.</div></div>
        <div><label><strong>Trilha Conhecimento comercial no cronograma</strong><br><select id="cfGG">${[["slot", "Sempre 1 módulo Conhecimento comercial em paralelo (recomendado)"], ["first", "Priorizar Conhecimento comercial antes do restante"], ["normal", "Seguir a ordem normal da trilha"]].map(([v, l]) => `<option value="${v}" ${S.ggMode === v ? "selected" : ""}>${l}</option>`).join("")}</select></label></div>
        <div><strong>Linha de base</strong><div class="small muted">Plano original: término em ${fmt(S.baselineEnd || baselineEnd())}. Previsão atual: ${plan().end ? fmt(plan().end) : "—"}.</div><button class="btn" data-act="rebase" style="margin-top:6px">Redefinir linha de base para a previsão atual</button></div>
      </div>
      <div class="stack">
        <div class="card stack"><h2>Folgas e férias</h2><div class="row"><input type="date" id="offFrom"><span>até</span><input type="date" id="offTo"><button class="btn" data-act="addOff">Adicionar</button></div>
          <div class="small">${S.off.length ? S.off.slice().sort().map((d) => `<span class="pill" style="margin:2px">${fmt(d)} <a href="#" data-deloff="${d}" aria-label="remover">✕</a></span>`).join("") : '<span class="muted">Nenhuma folga cadastrada.</span>'}</div></div>
        <div class="card stack"><h2>Backup</h2><p class="small muted" style="margin:0">Seu progresso fica salvo apenas neste navegador. Exporte para guardar ou levar para outro dispositivo.</p>
          <div class="row"><button class="btn primary" data-act="export">Exportar JSON</button><label class="btn">Importar JSON<input type="file" id="imp" accept="application/json" hidden></label><button class="btn danger" data-act="reset">Apagar progresso</button></div></div>
      </div>
    </div>`;

  pages.gogenetic = (pid, tid) => {
    const G = window.GG, P = G.products.find((p) => p.id === pid);
    const modOf = (id) => MODS.find((m) => m.gg === id);
    const tabs = `<div class="row" style="margin-bottom:16px">${G.products.map((p) => `<a class="btn ${p.id === pid ? "primary" : ""}" href="#/gogenetic/${p.id}">${esc(p.brand === "Conhecimento comercial" && p.id === "base" ? "Fundamentos comuns" : p.name.split(" — ")[0])}</a>`).join("")}</div>`;
    const head = `<div class="page-head"><h1>Biologia aplicada aos relatórios Conhecimento comercial</h1><p class="muted">Fundamentação biológica, interpretação e limitações dos indicadores dos relatórios. Conteúdo construído a partir dos relatórios-modelo e bancos internos (lidos em ${fmt(G.updated)}), sem dados de clientes.</p></div>`;
    // "auditoria" é o id do integrador GGI: mostra a visão geral dos produtos
    if (pid === "auditoria" || !pid) {
      const overview = `<div class="grid g3" style="margin-bottom:16px">${G.products.map((p) => { const m = modOf(p.id), pr = modProg(m.id); return `<a class="card" href="#/gogenetic/${p.id}" style="color:inherit;text-decoration:none"><div class="small muted">${esc(p.brand)}</div><h3 style="margin-top:4px">${esc(p.name)}</h3><div class="small muted">${p.topics.length} tópicos · ${p.indicators.length} grupos de indicadores</div><div style="margin-top:8px">${progRow("Sessões", pr.d, pr.t)}</div></a>`; }).join("")}${(() => { const m = MOD.GGI, pr = modProg("GGI"); return `<a class="card" href="#/modulo/GGI" style="color:inherit;text-decoration:none"><div class="small muted">Integrador</div><h3 style="margin-top:4px">${esc(m.name)}</h3><div style="margin-top:8px">${progRow("Sessões", pr.d, pr.t)}</div></a>`; })()}</div>`;
      return `${head}${tabs}${overview}`;
    }
    if (!P) return notFound();
    const m = modOf(P.id), pr = modProg(m.id);
    const sec = (n, title, items) => `<h4 style="margin:14px 0 6px">${n}. ${title}</h4><ul class="clean small">${items.map((x) => `<li style="margin-bottom:4px">${esc(x)}</li>`).join("")}</ul>`;
    return `${head}${tabs}
      <div class="grid g2" style="margin-bottom:16px;align-items:start">
        <div class="card"><div class="small muted">${esc(P.brand)} · ${esc(P.report)}</div><h2 style="margin-top:4px">${esc(P.name)}</h2>${progRow(m.name, pr.d, pr.t, `#/modulo/${m.id}`)}</div>
        <div class="card"><h3>Indicadores do relatório cobertos</h3><ul class="clean small">${P.indicators.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      </div>
      ${P.topics.map((t) => `<details class="card" id="gg-${t.id}" style="margin-bottom:12px" ${t.id === tid ? "open" : ""}><summary><strong>${t.id} · ${esc(t.t)}</strong></summary>
        ${sec(1, "Fundamentos biológicos e bioquímicos (do básico ao avançado)", t.fund)}
        ${sec(2, "Gêneros, espécies, genes, enzimas e mecanismos", t.key)}
        <h4 style="margin:14px 0 6px">3. Artigos e revisões — o que ler em cada sessão</h4>${(() => {
          const ti = m.topics.findIndex((x) => x.gg === `${P.id}/${t.id}`); if (ti < 0) return t.refs.map(matItem).join("");
          return BY_MOD[m.id].filter((s) => s.topic === ti && s.readMode === "leitura").map((s) => `<div class="read-session"><a href="#/sessao/${s.id}">${doneIcon(s.id)} ${TYPE[s.type].label}${s.part ? ` ${s.part}` : ""}</a> <span class="small muted">— ${esc(s.sub)}</span></div>${s.reads.map((r) => readItem(r)).join("")}`).join("");
        })()}
        ${sec(4, "Relação com os relatórios Conhecimento comercial", t.rel)}
        ${sec(5, "Como interpretar", t.interp)}
        <ul class="clean small" style="margin-top:6px">${t.lim.map((x) => `<li style="margin-bottom:4px"><strong>Limite:</strong> ${esc(x)}</li>`).join("")}</ul>
        ${sec(6, "Desafios práticos", t.ch)}
      </details>`).join("")}`;
  };

  const notFound = () => `<div class="card"><h2>Página não encontrada</h2><a href="#/">Voltar ao dashboard</a></div>`;

  // ---------- Roteador ----------
  function render() {
    const [r, arg, arg2] = location.hash.replace(/^#\/?/, "").split("/");
    const html = (pages[r] || notFound)(arg && decodeURIComponent(arg), arg2 && decodeURIComponent(arg2));
    $("#app").innerHTML = html;
    document.querySelectorAll(".sidebar a").forEach((a) => a.classList.toggle("active", a.dataset.r === r || (r === "modulo" && a.dataset.r === "trilha") || (r === "sessao" && a.dataset.r === "hoje")));
    $("#sidebar").classList.remove("open");
    $("#topProgress").textContent = `${pct(doneCount(SESS), SESS.length)}% concluído`;
    if (r === "trilha") bindGraph();
    if (r === "gogenetic" && arg2 && !quietRender) setTimeout(() => { const el = document.getElementById(`gg-${arg2}`); if (el) { el.open = true; window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70); } }, 0);
  }
  let quietRender = false;
  function rerender() { const y = window.scrollY; quietRender = true; try { render(); } finally { quietRender = false; } window.scrollTo(0, y); }
  window.addEventListener("hashchange", () => { window.scrollTo(0, 0); render(); });

  function bindGraph() {
    const g = $("#graph"); if (!g) return;
    const hi = (id) => {
      g.classList.toggle("dim", !!id);
      const rel = new Set([id]);
      g.querySelectorAll(".gedge").forEach((e) => { const on = id && (e.dataset.a === id || e.dataset.b === id); e.classList.toggle("hi", !!on); if (on) { rel.add(e.dataset.a); rel.add(e.dataset.b); } });
      g.querySelectorAll(".gnode").forEach((n) => n.classList.toggle("hi", !!id && rel.has(n.dataset.id)));
    };
    g.querySelectorAll(".gnode").forEach((n) => {
      n.addEventListener("mouseenter", () => hi(n.dataset.id)); n.addEventListener("focus", () => hi(n.dataset.id));
      n.addEventListener("mouseleave", () => hi(null));
      n.addEventListener("click", () => { location.hash = `#/modulo/${n.dataset.id}`; });
      n.addEventListener("keydown", (e) => { if (e.key === "Enter") location.hash = `#/modulo/${n.dataset.id}`; });
    });
  }

  // ---------- Eventos ----------
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.material && MAT[t.dataset.material]) {
      const id = t.dataset.material;
      if (t.checked) S.materialsSeen[id] = true; else delete S.materialsSeen[id];
      save();
      document.querySelectorAll("[data-material]").forEach((input) => {
        if (input.dataset.material !== id) return;
        input.checked = !!S.materialsSeen[id];
        input.closest(".mat-check").classList.toggle("on", input.checked);
      });
    }
    else if (t.dataset.read != null) {
      const k = t.dataset.read;
      if (t.checked) S.read[k] = todayISO(); else delete S.read[k];
      save();
      // Re-renderiza mantendo abertos/fechados os blocos <details> (mesma estrutura de página)
      const open = [...document.querySelectorAll("#app details")].map((d) => d.open);
      rerender();
      const ds = document.querySelectorAll("#app details");
      if (ds.length === open.length) ds.forEach((d, i) => { d.open = open[i]; });
    }
    else if (t.dataset.check) { const [id, i] = t.dataset.check.split("|"); toggleCheck(id, +i); rerender(); }
    else if (t.dataset.score) { const v = t.value === "" ? null : Math.max(0, Math.min(100, +t.value)); if (v == null) delete S.scores[t.dataset.score]; else S.scores[t.dataset.score] = v; save(); rerender(); }
    else if (t.dataset.wd != null) { const d = +t.dataset.wd; S.days = t.checked ? [...new Set([...S.days, d])].sort() : S.days.filter((x) => x !== d); if (!S.days.length) { S.days = [d]; toast("Mantenha ao menos um dia de estudo."); } save(); rerender(); }
    else if (t.id === "cfStart" && t.value) { S.startDate = t.value; S.baselineEnd = null; save(); rerender(); }
    else if (t.id === "cfPer") { S.perDay = +t.value; save(); rerender(); }
    else if (t.id === "cfPar") { S.parallel = +t.value; save(); rerender(); }
    else if (t.id === "cfGG") { S.ggMode = t.value; save(); rerender(); }
    else if (["mk", "mn", "ma"].includes(t.id)) { matF[{ mk: "k", mn: "n", ma: "a" }[t.id]] = t.value; rerender(); }
    else if (t.id === "imp" && t.files[0]) {
      t.files[0].text().then((txt) => { try { const d = JSON.parse(txt); if (typeof d !== "object" || !d.done) throw 0; S = Object.assign(defaults(), d); save(); toast("Backup importado."); render(); } catch { toast("Arquivo inválido."); } });
    }
  });
  document.addEventListener("keydown", (e) => {
    const t = e.target;
    if (!t.dataset || !t.dataset.note) return;
    if (e.key === "Tab" && !e.ctrlKey && !e.altKey && !e.metaKey) {
      // Tab/Shift+Tab indenta a linha atual (listas aninhadas)
      e.preventDefault();
      const v = t.value, a = t.selectionStart, ls = v.lastIndexOf("\n", a - 1) + 1;
      if (e.shiftKey) { const n = v.slice(ls, ls + 2).match(/^ {1,2}/)?.[0].length || 0; if (!n) return; t.value = v.slice(0, ls) + v.slice(ls + n); t.selectionStart = t.selectionEnd = Math.max(ls, a - n); }
      else { t.value = v.slice(0, ls) + "  " + v.slice(ls); t.selectionStart = t.selectionEnd = a + 2; }
      t.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (e.key === "Enter" && !e.shiftKey) {
      // Enter continua listas ("- ", "1. ", "- [ ] "); Enter numa linha de lista vazia encerra a lista
      const v = t.value, a = t.selectionStart, ls = v.lastIndexOf("\n", a - 1) + 1, line = v.slice(ls, a);
      const m = line.match(/^(\s*)([-*+]|\d+[.)])(\s+)(\[[ xX]\]\s+)?/); if (!m) return;
      e.preventDefault();
      if (line.trim() === m[0].trim()) { t.value = v.slice(0, ls) + v.slice(a); t.selectionStart = t.selectionEnd = ls; }
      else {
        const num = m[2].match(/^(\d+)([.)])$/), bullet = num ? `${+num[1] + 1}${num[2]}` : m[2];
        const ins = `\n${m[1]}${bullet}${m[3]}${m[4] ? "[ ] " : ""}`;
        t.value = v.slice(0, a) + ins + v.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = a + ins.length;
      }
      t.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.note) {
      S.notes[t.dataset.note] = t.value; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* aviso no próximo save */ }
      const pv = document.querySelector(`[data-note-preview="${t.dataset.note}"]`);
      if (pv) pv.innerHTML = t.value.trim() ? md(t.value) : `<p class="muted">A pré-visualização aparece aqui.</p>`;
    }
    else if (t.id === "mq") { matF.q = t.value; const pos = t.selectionStart; rerender(); const n = $("#mq"); n.focus(); n.setSelectionRange(pos, pos); }
  });
  document.addEventListener("click", (e) => {
    const nm = e.target.closest("[data-notemode]");
    if (nm) {
      S.noteMode = nm.dataset.notemode; save();
      document.querySelectorAll(".notes-grid").forEach((g) => { g.className = `notes-grid mode-${S.noteMode}`; });
      document.querySelectorAll("[data-notemode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.notemode === S.noteMode)));
      if (S.noteMode !== "view") document.querySelector("[data-note]")?.focus();
      return;
    }
    const cc = e.target.closest("[data-cheatcopy]");
    if (cc) {
      const s = SID[cc.dataset.cheatcopy], txt = CHEATS[`${s.mod}:${s.topic}`], cur = S.notes[s.id] || "";
      if (cur.includes(txt.trim())) return toast("O resumo já está nas suas anotações.");
      S.notes[s.id] = cur.trim() ? `${txt.trim()}\n\n---\n\n${cur}` : `${txt.trim()}\n`; save();
      if (S.noteMode === "view") S.noteMode = "split";
      rerender(); toast("Resumo copiado para as anotações — edite à vontade.");
      return;
    }
    const kb = e.target.closest("[data-known],[data-unknown]");
    if (kb) {
      const open = [...document.querySelectorAll("#app details")].map((d) => d.open);
      if (kb.dataset.known) { markKnown(kb.dataset.known); toast("Tópico marcado como já conhecido. 🔁"); } else unmarkKnown(kb.dataset.unknown);
      rerender();
      const ds = document.querySelectorAll("#app details");
      if (ds.length === open.length) ds.forEach((d, i) => { d.open = open[i]; });
      return;
    }
    const t = e.target.closest("[data-done],[data-act],[data-cal],[data-day],[data-offtoggle],[data-deloff]"); if (!t) return;
    if (t.dataset.done) { const id = t.dataset.done; const was = !!S.done[id]; toggleDone(id); if (!was) toast("Sessão concluída! 🎉"); rerender(); }
    else if (t.dataset.cal) { const n = +t.dataset.cal; calRef = n ? new Date(calRef.getFullYear(), calRef.getMonth() + n, 1) : new Date(); if (!n) calSel = todayISO(); rerender(); }
    else if (t.dataset.day) { calSel = t.dataset.day; rerender(); }
    else if (t.dataset.offtoggle) { const k = t.dataset.offtoggle; S.off = S.off.includes(k) ? S.off.filter((x) => x !== k) : [...S.off, k]; save(); rerender(); }
    else if (t.dataset.deloff) { e.preventDefault(); S.off = S.off.filter((x) => x !== t.dataset.deloff); save(); rerender(); }
    else if (t.dataset.act) {
      const a = t.dataset.act;
      if (a === "welcome") { S.welcomed = true; if (!S.baselineEnd) S.baselineEnd = baselineEnd(); save(); rerender(); }
      else if (a === "skipToday") { S.off.push(todayISO()); S.log.push({ d: new Date().toISOString(), a: "skip" }); save(); toast("Tudo bem! O cronograma foi reorganizado."); rerender(); }
      else if (a === "unskipToday") { S.off = S.off.filter((x) => x !== todayISO()); save(); rerender(); }
      else if (a === "rebase") { S.baselineEnd = plan().end; save(); toast("Linha de base atualizada."); rerender(); }
      else if (a === "addOff") { const f = $("#offFrom").value, to = $("#offTo").value || f; if (!f) return toast("Escolha a data inicial."); for (let d = parse(f); d <= parse(to); d = addDays(d, 1)) if (!S.off.includes(iso(d))) S.off.push(iso(d)); save(); rerender(); }
      else if (a === "export") { const b = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" }); const u = URL.createObjectURL(b); const l = document.createElement("a"); l.href = u; l.download = `trilha-bioinfo-backup-${todayISO()}.json`; l.click(); URL.revokeObjectURL(u); }
      else if (a === "reset") { if (confirm("Apagar todo o progresso, anotações e configurações? Exporte um backup antes.")) { S = defaults(); save(); render(); } }
    }
  });
  $("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  const applyTheme = () => { if (S.theme === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.dataset.theme = S.theme; };
  $("#themeBtn").addEventListener("click", () => {
    const dark = S.theme === "dark" || (S.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    S.theme = dark ? "light" : "dark"; applyTheme(); save();
  });
  applyTheme();
  render();
})();

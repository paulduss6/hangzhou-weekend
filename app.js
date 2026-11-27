(() => {
  "use strict";

  // ---------- Stockage local (sûr) ----------
  const KEY = "hz-weekend-v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
  }
  let state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage indisponible */ }
  }
  state.done = state.done || {};
  state.fields = state.fields || {};

  // ---------- Utilitaires ----------
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

  // Heure actuelle à Hangzhou (quel que soit le fuseau du téléphone)
  function nowHZ() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TRIP.tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
  }

  function itemState(day, item, now) {
    if (now.date < day.date) return "future";
    if (now.date > day.date) return "past";
    if (now.min >= toMin(item.end)) return "past";
    if (now.min >= toMin(item.start)) return "now";
    return "future";
  }

  // Lieu « hôtel » construit depuis la réservation saisie
  function hotelPlace() {
    const f = state.fields.hotel || {};
    return {
      fr: f["Nom de l'hôtel"] || "Hôtel (à renseigner)",
      zh: f["Nom de l'hôtel"] || "酒店",
      addr: f["Adresse en chinois"] || "",
      hint: "Hôtel du samedi soir",
      missing: !f["Adresse en chinois"],
    };
  }
  const getPlace = (id) => (id === "hotel" ? hotelPlace() : PLACES[id]);

  function amapLink(place, id) {
    const city = id === "applaza" ? "上海" : "杭州";
    const kw = place.addr || place.zh;
    return `https://uri.amap.com/search?keyword=${encodeURIComponent(kw)}&city=${encodeURIComponent(city)}&callnative=1`;
  }

  // ---------- Bandeau de statut ----------
  function renderStatus() {
    const now = nowHZ();
    const el = $("#status");
    el.className = "status";
    const first = DAYS[0], last = DAYS[DAYS.length - 1];
    if (now.date < first.date) {
      const ms = Date.parse(first.date + "T06:00:00+08:00") - Date.now();
      const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
      const todo = BOOKINGS.filter((b) => b.urgent && !state.done[b.id]).length;
      el.innerHTML = `Départ dans <b>${d > 0 ? d + " j " : ""}${h} h</b>` +
        (todo ? ` · <b>${todo}</b> réservation${todo > 1 ? "s" : ""} urgente${todo > 1 ? "s" : ""} à faire` : " · réservations urgentes faites ✓");
      if (todo) el.classList.add("alert");
      return;
    }
    if (now.date > last.date) { el.innerHTML = "Week-end terminé. 再见杭州 !"; return; }
    const day = DAYS.find((d) => d.date === now.date);
    if (!day) { el.textContent = ""; return; }
    const cur = day.items.find((it) => itemState(day, it, now) === "now");
    const next = day.items.find((it) => toMin(it.start) > now.min);
    let html = "";
    if (cur) html += `Maintenant : <b>${esc(cur.title)}</b> (jusqu'à ${cur.end})`;
    if (next) html += `${html ? "<br>" : ""}Ensuite ${next.start} : <b>${esc(next.title)}</b>`;
    if (day.id === "dim" && now.min >= toMin("12:15") && now.min < toMin("12:40")) {
      html += `<br>⚠️ Départ pour la gare à <b>12h40</b> au plus tard`;
      el.classList.add("alert");
    }
    el.innerHTML = html || "Bonne soirée !";
  }

  // ---------- Programme ----------
  let currentDay = (() => {
    const t = nowHZ().date;
    const d = DAYS.find((x) => x.date === t);
    return d ? d.id : DAYS[0].id;
  })();

  function renderDayTabs() {
    $("#daytabs").innerHTML = DAYS.map((d) =>
      `<button role="tab" aria-selected="${d.id === currentDay}" data-day="${d.id}">${esc(d.label)}</button>`).join("");
  }

  // Garder les cartes ouvertes/fermées entre deux rafraîchissements
  const openCards = new Set();
  const closedCards = new Set();
  document.addEventListener("toggle", (e) => {
    const k = e.target.dataset && e.target.dataset.key;
    if (!k) return;
    if (e.target.open) { openCards.add(k); closedCards.delete(k); }
    else { openCards.delete(k); closedCards.add(k); }
  }, true);

  function renderTimeline() {
    const day = DAYS.find((d) => d.id === currentDay);
    const now = nowHZ();
    $("#sun").textContent = day.sun;
    $("#timeline").innerHTML = day.items.map((it, i) => {
      const st = itemState(day, it, now);
      const place = it.place ? getPlace(it.place) : null;
      const actions = place ? `
        <div class="actions">
          <button class="btn primary" data-taxi="${it.place}">🚕 Chauffeur</button>
          ${place.addr || place.zh ? `<a class="btn" href="${amapLink(place, it.place)}" target="_blank" rel="noopener">🗺 Amap</a>` : ""}
        </div>` : "";
      return `
      <li class="tl k-${it.kind} ${st}">
        <div class="time">${it.start}<small>${it.end}</small></div>
        <details class="card" data-key="${day.id}-${i}" ${openCards.has(`${day.id}-${i}`) || (st === "now" && !closedCards.has(`${day.id}-${i}`)) ? "open" : ""}>
          <summary>
            <div class="ttl">${esc(it.title)}</div>
            <div class="meta">
              ${st === "now" ? '<span class="chip nowchip">EN COURS</span>' : ""}
              ${it.price ? `<span class="chip price">${esc(it.price)}</span>` : ""}
              ${place ? `<span class="chip">${esc(place.zh)}</span>` : ""}
            </div>
          </summary>
          <p class="desc">${esc(it.desc)}</p>
          ${it.warn ? `<p class="warn">${esc(it.warn)}</p>` : ""}
          ${actions}
        </details>
      </li>`;
    }).join("");
  }

  // ---------- Réservations ----------
  function renderResa() {
    const done = BOOKINGS.filter((b) => state.done[b.id]).length;
    $("#resa-progress").textContent = `${done} / ${BOOKINGS.length} faites · les plus urgentes en premier.`;
    $("#resa-list").innerHTML = BOOKINGS.map((b) => {
      const f = state.fields[b.id] || {};
      const isDone = !!state.done[b.id];
      return `
      <div class="card resa ${isDone ? "done" : ""}">
        <button class="check" data-check="${b.id}" aria-pressed="${isDone}" aria-label="Marquer comme fait">${isDone ? "✓" : ""}</button>
        <div>
          <div class="rt">${esc(b.title)}${b.urgent && !isDone ? '<span class="urgent-badge">URGENT</span>' : ""}</div>
          <div class="when">${esc(b.when)}</div>
          <p class="how">${esc(b.how)}</p>
          <span class="chip price">${esc(b.price)}</span>
          <div class="fields">
            ${b.fields.map((name) => `
              <label>${esc(name)}
                <input type="text" data-resa="${b.id}" data-field="${esc(name)}" value="${esc(f[name] || "")}" autocomplete="off">
              </label>`).join("")}
          </div>
        </div>
      </div>`;
    }).join("");
  }

  // ---------- Infos ----------
  function renderInfos() {
    $("#infos-list").innerHTML = INFOS.map((x) => `
      <div class="card info"><div class="ico" aria-hidden="true">${x.icon}</div>
        <div><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></div></div>`).join("");
    $("#budget").innerHTML = BUDGET.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("") +
      `<tr><td colspan="2">${esc(BUDGET_TOTAL)}</td></tr>`;
    $("#phrases").innerHTML = PHRASES.map(([fr, zh, py], i) => `
      <button class="row-btn" data-phrase="${i}">
        <span><span class="zh">${esc(zh)}</span><br><span class="fr">${esc(fr)} · ${esc(py)}</span></span>
        <span class="go">⤢</span>
      </button>`).join("");
  }

  // ---------- Chauffeur ----------
  function renderTaxi() {
    const ids = ["hotel", ...Object.keys(PLACES)];
    $("#taxi-list").innerHTML = ids.map((id) => {
      const p = getPlace(id);
      return `
      <button class="row-btn" data-taxi="${id}">
        <span><span class="zh">${esc(p.zh)}</span><br><span class="fr">${esc(p.fr)}${p.missing ? " · adresse à saisir dans Résas" : ""}</span></span>
        <span class="go">⤢</span>
      </button>`;
    }).join("");
  }

  // ---------- Overlay plein écran ----------
  function openOverlay(html) {
    $("#overlay-body").innerHTML = html;
    $("#overlay").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeOverlay() {
    $("#overlay").hidden = true;
    document.body.style.overflow = "";
  }
  function showTaxi(id) {
    const p = getPlace(id);
    openOverlay(`
      <div class="ask">请带我去这里</div>
      <div class="zh" style="margin-top:14px">${esc(p.zh)}</div>
      ${p.addr ? `<div class="addr">${esc(p.addr)}</div>` : `<div class="fr">Adresse en chinois à saisir dans l'onglet Résas → Hôtel.</div>`}
      <div class="fr">${esc(p.fr)} — ${esc(p.hint)}</div>`);
  }
  function showPhrase(i) {
    const [fr, zh, py] = PHRASES[i];
    openOverlay(`<div class="zh">${esc(zh)}</div><div class="py">${esc(py)}</div><div class="fr">${esc(fr)}</div>`);
  }

  // ---------- Navigation & événements ----------
  function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
    document.querySelectorAll(".tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    try { sessionStorage.setItem("hz-view", name); } catch {}
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t) return;
    if (t.dataset.view) return showView(t.dataset.view);
    if (t.dataset.day) { currentDay = t.dataset.day; renderDayTabs(); renderTimeline(); return; }
    if (t.dataset.taxi) { e.preventDefault(); return showTaxi(t.dataset.taxi); }
    if (t.dataset.phrase) return showPhrase(Number(t.dataset.phrase));
    if (t.dataset.check) {
      const id = t.dataset.check;
      state.done[id] = !state.done[id];
      save(); renderResa(); renderStatus();
      return;
    }
    if (t.id === "overlay-close") return closeOverlay();
  });
  $("#overlay").addEventListener("click", (e) => { if (e.target.id === "overlay") closeOverlay(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeOverlay(); });

  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.dataset.resa) return;
    const id = el.dataset.resa;
    state.fields[id] = state.fields[id] || {};
    state.fields[id][el.dataset.field] = el.value;
    save();
    if (id === "hotel") { renderTaxi(); renderTimeline(); }
  });

  // ---------- Budget ----------
  state.expenses = state.expenses || [];
  state.names = state.names || ["Moi", "Ami 1", "Ami 2"];
  let budCat = EXPENSE_CATS[0].id;
  let pendingDelete = null;
  const yuan = (n) => (Math.round(n * 100) / 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " ¥";
  const catOf = (id) => EXPENSE_CATS.find((c) => c.id === id) || EXPENSE_CATS[EXPENSE_CATS.length - 1];

  function shares() {
    // part de chacun (dépenses partagées / 3 + dépenses perso) et soldes
    const part = [0, 0, 0], paid = [0, 0, 0];
    for (const e of state.expenses) {
      paid[e.payer] += e.amount;
      if (e.split) part.forEach((_, i) => { part[i] += e.amount / 3; });
      else part[e.payer] += e.amount;
    }
    return { part, net: paid.map((p, i) => p - part[i]) };
  }

  function settle(net) {
    const cred = [], debt = [];
    net.forEach((v, i) => { if (v > 0.5) cred.push([i, v]); else if (v < -0.5) debt.push([i, -v]); });
    const out = [];
    let a = 0, b = 0;
    while (a < debt.length && b < cred.length) {
      const x = Math.min(debt[a][1], cred[b][1]);
      out.push([debt[a][0], cred[b][0], x]);
      debt[a][1] -= x; cred[b][1] -= x;
      if (debt[a][1] < 0.5) a++;
      if (cred[b][1] < 0.5) b++;
    }
    return out;
  }

  function renderBudgetForm() {
    $("#bud-cats").innerHTML = EXPENSE_CATS.map((c) =>
      `<button type="button" role="radio" aria-checked="${c.id === budCat}" data-cat="${c.id}">${c.icon} ${esc(c.label)}</button>`).join("");
    const sel = $("#bud-payer"), cur = sel.value;
    sel.innerHTML = state.names.map((n, i) => `<option value="${i}">${esc(n)}</option>`).join("");
    if (cur !== "") sel.value = cur;
    $("#bud-names").innerHTML = state.names.map((n, i) =>
      `<label>Voyageur ${i + 1}<input type="text" data-name="${i}" value="${esc(n)}" maxlength="20"></label>`).join("");
  }

  function renderBudget() {
    const total = state.expenses.reduce((s, e) => s + e.amount, 0);
    const { part, net } = shares();
    $("#bud-totals").innerHTML = `
      <div class="tot-main"><span>Total dépensé</span><b>${yuan(total)}</b></div>
      <div class="tot-grid">${state.names.map((n, i) =>
        `<div><span>${esc(n)}</span><b>${yuan(part[i])}</b></div>`).join("")}</div>
      <p class="tot-est">Estimation : 800–1 100 ¥ par personne (hors thé et shopping)</p>`;

    $("#bud-cats-table").innerHTML = EXPENSE_CATS.map((c) => {
      const sum = state.expenses.filter((e) => e.cat === c.id).reduce((s, e) => s + e.amount, 0);
      const est = c.est[1] ? `<small>est. ${c.est[0] === c.est[1] ? c.est[0] : c.est[0] + "–" + c.est[1]} ¥/pers.</small>` : "";
      return `<tr><td>${c.icon} ${esc(c.label)}${est}</td><td>${yuan(sum)}<small>${yuan(sum / 3)}/pers.</small></td></tr>`;
    }).join("");

    const tr = settle(net);
    $("#bud-balance").innerHTML = tr.length
      ? tr.map(([d, c, x]) => `<p class="settle"><b>${esc(state.names[d])}</b> doit <b>${yuan(x)}</b> à <b>${esc(state.names[c])}</b></p>`).join("")
      : `<p class="settle muted">Tout le monde est à l'équilibre.</p>`;

    const list = [...state.expenses].sort((a, b) => b.ts - a.ts);
    $("#bud-list").innerHTML = list.length ? list.map((e) => {
      const c = catOf(e.cat);
      const d = new Date(e.ts).toLocaleString("fr-FR", { timeZone: TRIP.tz, weekday: "short", hour: "2-digit", minute: "2-digit" });
      return `<div class="card exp">
        <span class="ico" aria-hidden="true">${c.icon}</span>
        <div class="exp-main"><div class="exp-l">${esc(e.label || c.label)}</div>
          <div class="exp-m">${esc(state.names[e.payer])} · ${e.split ? "partagé ÷3" : "perso"} · ${esc(d)}</div></div>
        <b class="exp-a">${yuan(e.amount)}</b>
        <button class="del ${pendingDelete === e.id ? "confirm" : ""}" data-del="${e.id}" aria-label="Supprimer">${pendingDelete === e.id ? "Supprimer ?" : "✕"}</button>
      </div>`;
    }).join("") : `<p class="lead">Aucune dépense pour l'instant.</p>`;
  }

  $("#bud-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = $("#bud-amount").value.replace(/\s/g, "").replace(",", ".");
    const amount = Number(raw);
    if (!raw || !isFinite(amount) || amount <= 0) { $("#bud-amount").focus(); $("#bud-amount").classList.add("bad"); return; }
    $("#bud-amount").classList.remove("bad");
    state.expenses.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      cat: budCat, label: $("#bud-label").value.trim(), amount: Math.round(amount * 100) / 100,
      payer: Number($("#bud-payer").value) || 0, split: $("#bud-split").checked, ts: Date.now(),
    });
    save();
    $("#bud-label").value = ""; $("#bud-amount").value = "";
    renderBudget();
  });

  document.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.cat) { budCat = t.dataset.cat; renderBudgetForm(); return; }
    if (t.dataset.del) {
      if (pendingDelete === t.dataset.del) {
        state.expenses = state.expenses.filter((x) => x.id !== t.dataset.del);
        pendingDelete = null; save();
      } else pendingDelete = t.dataset.del;
      renderBudget();
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.dataset.name === undefined) return;
    state.names[Number(e.target.dataset.name)] = e.target.value.trim() || `Voyageur ${Number(e.target.dataset.name) + 1}`;
    save(); renderBudgetForm(); renderBudget();
  });

  // ---------- Démarrage ----------
  $("#subtitle").textContent = TRIP.subtitle;
  renderDayTabs();
  renderTimeline();
  renderResa();
  renderInfos();
  renderTaxi();
  renderBudgetForm();
  renderBudget();
  renderStatus();
  try { const v = sessionStorage.getItem("hz-view"); if (v) showView(v); } catch {}

  setInterval(() => { renderStatus(); renderTimeline(); }, 60000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { renderStatus(); renderTimeline(); }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();

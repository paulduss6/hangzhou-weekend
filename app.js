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
    if (day.id === "dim" && now.min >= toMin("12:30") && now.min < toMin("13:15")) {
      html += `<br>⚠️ Départ pour Shanghai à <b>13h15</b> au plus tard`;
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

  // ---------- Démarrage ----------
  $("#subtitle").textContent = TRIP.subtitle;
  renderDayTabs();
  renderTimeline();
  renderResa();
  renderInfos();
  renderTaxi();
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

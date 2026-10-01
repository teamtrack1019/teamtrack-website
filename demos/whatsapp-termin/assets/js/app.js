/* Offline WhatsApp booking chat. Startup and the whole flow stay in the browser. */
(() => {
  "use strict";

  const state = {
    salon: null,
    step: "boot",
    service: null,
    day: null,
    time: null,
    name: null,
    phone: null,
    busy: false,
  };

  const el = {
    body: document.getElementById("chat-body"),
    replies: document.getElementById("quick-replies"),
    composer: document.getElementById("composer"),
    input: document.getElementById("composer-input"),
    salonName: document.getElementById("salon-name"),
    botStatus: document.getElementById("bot-status"),
    reset: document.getElementById("btn-reset"),
  };

  let composerHandler = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function nowLabel() {
    return new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  function formatMoney(n) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: state.salon?.currency || "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  }

  function formatReminderWhen(iso) {
    if (!iso) return "unbekannt";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function scrollBottom() {
    el.body.scrollTop = el.body.scrollHeight;
  }

  function clearChoices() {
    el.replies.hidden = true;
    el.replies.innerHTML = "";
    el.composer.hidden = true;
    el.input.value = "";
    el.input.placeholder = "Nachricht…";
    if (composerHandler) {
      el.composer.removeEventListener("submit", composerHandler);
      composerHandler = null;
    }
  }

  function addMessage(text, who = "bot") {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    const html = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*(.+?)\*/g, "<strong>$1</strong>");
    div.innerHTML = html + `<span class="meta">${nowLabel()}</span>`;
    el.body.appendChild(div);
    scrollBottom();
    return div;
  }

  function addSystem(text) {
    const div = document.createElement("div");
    div.className = "msg system";
    div.textContent = text;
    el.body.appendChild(div);
    scrollBottom();
  }

  function showTyping() {
    const tip = document.createElement("div");
    tip.className = "typing";
    tip.id = "typing";
    tip.innerHTML = "<span></span><span></span><span></span>";
    tip.setAttribute("aria-label", "schreibt…");
    el.body.appendChild(tip);
    scrollBottom();
  }

  function hideTyping() {
    document.getElementById("typing")?.remove();
  }

  async function botSay(text, delay = 450) {
    showTyping();
    await sleep(delay);
    hideTyping();
    addMessage(text, "bot");
  }

  function showChips(items, onPick) {
    el.replies.hidden = false;
    el.replies.innerHTML = "";
    items.forEach((item, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip";
      btn.style.animationDelay = `${i * 0.04}s`;
      if (item.sub) {
        btn.innerHTML = `${escapeHtml(item.label)}<span class="chip-sub">${escapeHtml(item.sub)}</span>`;
      } else {
        btn.textContent = item.label;
      }
      btn.addEventListener("click", () => {
        if (state.busy) return;
        clearChoices();
        onPick(item);
      });
      el.replies.appendChild(btn);
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function askText({ placeholder, mode, validate, onDone }) {
    el.composer.hidden = false;
    el.input.placeholder = placeholder;
    el.input.inputMode = mode || "text";
    el.input.autocomplete = mode === "tel" ? "tel" : "name";
    el.input.focus();

    composerHandler = async (e) => {
      e.preventDefault();
      if (state.busy) return;
      const value = el.input.value.trim();
      const err = validate(value);
      if (err) {
        addSystem(err);
        return;
      }
      el.composer.removeEventListener("submit", composerHandler);
      composerHandler = null;
      clearChoices();
      addMessage(value, "user");
      await onDone(value);
    };
    el.composer.addEventListener("submit", composerHandler);
  }

  function offerDays(days) {
    showChips(
      days.map((d) => ({
        id: d.date,
        label: d.label,
        sub: `${d.slotCount} freie Zeiten`,
        raw: d,
      })),
      pickDay
    );
  }

  async function startFlow() {
    state.busy = true;
    state.step = "welcome";
    state.service = state.day = state.time = state.name = state.phone = null;
    el.body.innerHTML = "";
    clearChoices();

    try {
      const salon = window.TerminBooking.salonPublic();
      state.salon = salon;
      el.salonName.textContent = salon.name;
      el.botStatus.textContent = `online · ${salon.botName}`;

      await botSay(salon.welcomeMessage, 600);
      await botSay("Welche Leistung möchtest du buchen?", 350);
      state.busy = false;
      state.step = "service";
      showChips(
        salon.services.map((s) => ({
          id: s.id,
          label: s.name,
          sub: `${s.durationMinutes} Min · ab ${formatMoney(s.price)}`,
          raw: s,
        })),
        pickService
      );
    } catch (err) {
      state.busy = false;
      addSystem("Demo konnte nicht geladen werden: " + err.message);
    }
  }

  async function pickService(item) {
    state.busy = true;
    state.service = item.raw;
    addMessage(item.label, "user");
    await botSay(
      `Alles klar — *${item.raw.name}* (${item.raw.durationMinutes} Min, ab ${formatMoney(item.raw.price)}).\nAn welchem Tag passt es dir?`,
      500
    );

    try {
      const days = window.TerminBooking.availableDays(item.raw.id);
      state.busy = false;
      state.step = "day";
      if (!days.length) {
        await botSay("Aktuell sind leider keine freien Tage in den nächsten Wochen verfügbar.", 300);
        showChips([{ id: "restart", label: "Nochmal versuchen" }], () => startFlow());
        return;
      }
      offerDays(days);
    } catch (err) {
      state.busy = false;
      addSystem(err.message);
      showChips([{ id: "restart", label: "Neu starten" }], () => startFlow());
    }
  }

  async function pickDay(item) {
    state.busy = true;
    state.day = item.raw;
    addMessage(item.label, "user");
    await botSay(`Super. Welche Uhrzeit am *${item.raw.label}*?`, 400);

    try {
      const times = window.TerminBooking.availableTimes(state.service.id, item.raw.date);
      state.busy = false;
      state.step = "time";
      if (!times.length) {
        await botSay("Für diesen Tag sind keine Zeiten mehr frei. Bitte wähle einen anderen Tag.", 300);
        offerDays(window.TerminBooking.availableDays(state.service.id));
        return;
      }
      showChips(
        times.map((t) => ({
          id: t.time,
          label: t.label,
          raw: t,
        })),
        pickTime
      );
    } catch (err) {
      state.busy = false;
      addSystem(err.message);
    }
  }

  async function pickTime(item) {
    state.busy = true;
    state.time = item.raw;
    addMessage(item.label, "user");
    await botSay("Perfekt. Wie lautet dein Name?", 350);
    state.busy = false;
    state.step = "name";
    askText({
      placeholder: "Vor- und Nachname",
      mode: "text",
      validate: (v) => (v.length < 2 ? "Bitte mindestens 2 Zeichen eingeben." : null),
      onDone: async (name) => {
        state.name = name;
        await botSay(`Danke, ${name.split(" ")[0]}! Und deine Handynummer für die Bestätigung?`, 350);
        state.step = "phone";
        askText({
          placeholder: "+49 …",
          mode: "tel",
          validate: (v) =>
            /^[+\d][\d\s/\-()]{5,}$/.test(v) ? null : "Bitte eine gültige Telefonnummer eingeben.",
          onDone: confirmBooking,
        });
      },
    });
  }

  async function confirmBooking(phone) {
    state.phone = phone;
    state.busy = true;
    state.step = "booking";
    await botSay("Einen Moment — ich prüfe die Verfügbarkeit und trage den Termin ein…", 500);

    try {
      const result = window.TerminBooking.createBooking({
        service_id: state.service.id,
        date: state.day.date,
        time: state.time.time,
        customer_name: state.name,
        customer_phone: state.phone,
      });

      const b = result.booking;
      await botSay(
        `✅ *Termin bestätigt!*\n\n` +
          `📍 ${state.salon.name}\n` +
          `✂️ ${b.service_name}\n` +
          `📅 ${b.display.weekday}, ${b.display.date} um ${b.display.time} Uhr\n` +
          `👤 ${b.customer_name}\n` +
          `📞 ${b.customer_phone}\n` +
          `💶 ab ${formatMoney(b.price)}\n\n` +
          `Buchungs-Nr. #${b.id}`,
        650
      );

      const reminderAt = formatReminderWhen(result.stubs.whatsapp_reminder.send_at);
      addSystem(`🔔 Simulierte ${state.salon.reminderHoursBefore}h-Erinnerung geplant · ${reminderAt}`);
      await botSay(
        "Du erhältst rechtzeitig eine Erinnerung per WhatsApp (in der Demo nur simuliert).\nMöchtest du einen weiteren Termin buchen?",
        400
      );

      state.busy = false;
      state.step = "done";
      showChips(
        [
          { id: "again", label: "Weiteren Termin buchen" },
          { id: "done", label: "Fertig, danke!" },
        ],
        async (chip) => {
          if (chip.id === "again") {
            await startFlow();
          } else {
            addMessage(chip.label, "user");
            await botSay("Gern geschehen — bis bald bei uns! ✂️", 300);
          }
        }
      );
    } catch (err) {
      state.busy = false;
      await botSay(`Leider hat es nicht geklappt: ${err.message}`, 300);
      showChips(
        [
          { id: "retry", label: "Andere Zeit wählen" },
          { id: "restart", label: "Von vorn" },
        ],
        async (chip) => {
          if (chip.id === "restart") {
            await startFlow();
          } else {
            state.busy = true;
            try {
              const times = window.TerminBooking.availableTimes(state.service.id, state.day.date);
              state.busy = false;
              if (!times.length) {
                await botSay("Für diesen Tag sind keine Zeiten mehr frei.", 250);
                offerDays(window.TerminBooking.availableDays(state.service.id));
                return;
              }
              showChips(
                times.map((t) => ({ id: t.time, label: t.label, raw: t })),
                pickTime
              );
            } catch (e) {
              state.busy = false;
              addSystem(e.message);
            }
          }
        }
      );
    }
  }

  el.reset.addEventListener("click", () => {
    if (state.busy) return;
    startFlow();
  });

  startFlow();
})();

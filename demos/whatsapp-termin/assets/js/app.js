/* Offline WhatsApp booking chat. Startup and the whole flow stay in the browser. */
(() => {
  "use strict";

  const UI = {
    de: {
      askService: "Welche Leistung möchtest du buchen?",
      freeSlots: (n) => `${n} freie Zeiten`,
      loadFail: "Demo konnte nicht geladen werden: ",
      servicePicked: (name, min, price) =>
        `Alles klar — *${name}* (${min} Min, ab ${price}).\nAn welchem Tag passt es dir?`,
      noDays: "Aktuell sind leider keine freien Tage in den nächsten Wochen verfügbar.",
      tryAgain: "Nochmal versuchen",
      restart: "Neu starten",
      askTime: (day) => `Super. Welche Uhrzeit am *${day}*?`,
      noTimesDay: "Für diesen Tag sind keine Zeiten mehr frei. Bitte wähle einen anderen Tag.",
      askName: "Perfekt. Wie lautet dein Name?",
      namePh: "Vor- und Nachname",
      nameErr: "Bitte mindestens 2 Zeichen eingeben.",
      askPhone: (first) => `Danke, ${first}! Und deine Handynummer für die Bestätigung?`,
      phonePh: "+49 …",
      phoneErr: "Bitte eine gültige Telefonnummer eingeben.",
      checking: "Einen Moment — ich prüfe die Verfügbarkeit und trage den Termin ein…",
      confirmed: (salon, b, price) =>
        `✅ *Termin bestätigt!*\n\n` +
        `📍 ${salon}\n` +
        `✂️ ${b.service_name}\n` +
        `📅 ${b.display.weekday}, ${b.display.date} um ${b.display.time} Uhr\n` +
        `👤 ${b.customer_name}\n` +
        `📞 ${b.customer_phone}\n` +
        `💶 ab ${price}\n\n` +
        `Buchungs-Nr. #${b.id}`,
      reminderSys: (h, when) => `🔔 Simulierte ${h}h-Erinnerung geplant · ${when}`,
      reminderBot:
        "Du erhältst rechtzeitig eine Erinnerung per WhatsApp (in der Demo nur simuliert).\nMöchtest du einen weiteren Termin buchen?",
      bookAgain: "Weiteren Termin buchen",
      doneThanks: "Fertig, danke!",
      bye: "Gern geschehen — bis bald bei uns! ✂️",
      fail: (msg) => `Leider hat es nicht geklappt: ${msg}`,
      otherTime: "Andere Zeit wählen",
      fromScratch: "Von vorn",
      noTimesLeft: "Für diesen Tag sind keine Zeiten mehr frei.",
      unknown: "unbekannt",
      typing: "schreibt…",
      msgPh: "Nachricht…",
      send: "Senden",
      resetTitle: "Demo neu starten",
      online: (bot) => `online · ${bot}`,
      minAb: (min, price) => `${min} Min · ab ${price}`,
      pitchBrand: "TeamTrack · Showcase",
      pitchTitle: "WhatsApp Terminbuchung",
      pitchLead: "Live-Demo eines automatisierten Buchungsdialogs für Friseure & lokale Dienstleister.",
      pitch1: "Service → Tag → Uhrzeit → Kontaktdaten",
      pitch2: "Echtzeit-Verfügbarkeit & Doppelbuchungs-Schutz",
      pitch3: "Stub für Kalender- & WhatsApp-API",
      pitch4: "Simulierte 24h-Erinnerung",
      pitchCta: "Sales line: „Das habe ich — ich baue es für dich.“",
      close: "Schließen",
      backHome: "Zurück zur Website",
      pageTitle: "WhatsApp Termin-Demo · Salon Mira",
    },
    tr: {
      askService: "Hangi hizmeti almak istersin?",
      freeSlots: (n) => `${n} müsait saat`,
      loadFail: "Demo yüklenemedi: ",
      servicePicked: (name, min, price) =>
        `Tamam — *${name}* (${min} dk, ${price}'den itibaren).\nHangi gün uygun?`,
      noDays: "Önümüzdeki haftalarda maalesef müsait gün yok.",
      tryAgain: "Tekrar dene",
      restart: "Yeniden başlat",
      askTime: (day) => `Harika. *${day}* için hangi saat?`,
      noTimesDay: "Bu gün için müsait saat kalmadı. Lütfen başka bir gün seç.",
      askName: "Süper. Adın ne?",
      namePh: "Ad Soyad",
      nameErr: "Lütfen en az 2 karakter yaz.",
      askPhone: (first) => `Teşekkürler, ${first}! Onay için cep numaran?`,
      phonePh: "+90 …",
      phoneErr: "Lütfen geçerli bir telefon numarası gir.",
      checking: "Bir saniye — müsaitliği kontrol edip randevuyu kaydediyorum…",
      confirmed: (salon, b, price) =>
        `✅ *Randevu onaylandı!*\n\n` +
        `📍 ${salon}\n` +
        `✂️ ${b.service_name}\n` +
        `📅 ${b.display.weekday}, ${b.display.date} saat ${b.display.time}\n` +
        `👤 ${b.customer_name}\n` +
        `📞 ${b.customer_phone}\n` +
        `💶 ${price}'den itibaren\n\n` +
        `Rezervasyon No. #${b.id}`,
      reminderSys: (h, when) => `🔔 Simüle ${h}s hatırlatma planlandı · ${when}`,
      reminderBot:
        "WhatsApp ile hatırlatma alacaksın (demoda yalnızca simüle).\nBaşka randevu almak ister misin?",
      bookAgain: "Yeni randevu al",
      doneThanks: "Tamam, teşekkürler!",
      bye: "Rica ederiz — yakında görüşürüz! ✂️",
      fail: (msg) => `Maalesef olmadı: ${msg}`,
      otherTime: "Başka saat seç",
      fromScratch: "Baştan başla",
      noTimesLeft: "Bu gün için müsait saat kalmadı.",
      unknown: "bilinmiyor",
      typing: "yazıyor…",
      msgPh: "Mesaj…",
      send: "Gönder",
      resetTitle: "Demoyu yeniden başlat",
      online: (bot) => `çevrimiçi · ${bot}`,
      minAb: (min, price) => `${min} dk · ${price}'den`,
      pitchBrand: "TeamTrack · Showcase",
      pitchTitle: "WhatsApp Randevu",
      pitchLead: "Kuaför ve yerel işletmeler için otomatik randevu sohbetinin canlı demosu.",
      pitch1: "Hizmet → Gün → Saat → İletişim",
      pitch2: "Canlı müsaitlik & çift rezervasyon koruması",
      pitch3: "Takvim & WhatsApp API için hazır iskelet",
      pitch4: "Simüle 24 saat hatırlatma",
      pitchCta: "Satış cümlesi: „Bende var — senin için kurarım.“",
      close: "Kapat",
      backHome: "Siteye geri dön",
      pageTitle: "WhatsApp Randevu Demo · Salon Mira",
    },
    en: {
      askService: "Which service would you like to book?",
      freeSlots: (n) => `${n} open slots`,
      loadFail: "Demo failed to load: ",
      servicePicked: (name, min, price) =>
        `Got it — *${name}* (${min} min, from ${price}).\nWhich day works for you?`,
      noDays: "Sorry, no open days in the next few weeks.",
      tryAgain: "Try again",
      restart: "Restart",
      askTime: (day) => `Great. What time on *${day}*?`,
      noTimesDay: "No times left that day. Please pick another day.",
      askName: "Perfect. What's your name?",
      namePh: "First and last name",
      nameErr: "Please enter at least 2 characters.",
      askPhone: (first) => `Thanks, ${first}! And your mobile number for confirmation?`,
      phonePh: "+49 …",
      phoneErr: "Please enter a valid phone number.",
      checking: "One moment — checking availability and saving your booking…",
      confirmed: (salon, b, price) =>
        `✅ *Booking confirmed!*\n\n` +
        `📍 ${salon}\n` +
        `✂️ ${b.service_name}\n` +
        `📅 ${b.display.weekday}, ${b.display.date} at ${b.display.time}\n` +
        `👤 ${b.customer_name}\n` +
        `📞 ${b.customer_phone}\n` +
        `💶 from ${price}\n\n` +
        `Booking #${b.id}`,
      reminderSys: (h, when) => `🔔 Simulated ${h}h reminder scheduled · ${when}`,
      reminderBot:
        "You'll get a WhatsApp reminder in time (simulated in this demo).\nWant to book another appointment?",
      bookAgain: "Book another",
      doneThanks: "Done, thanks!",
      bye: "You're welcome — see you soon! ✂️",
      fail: (msg) => `Sorry, that didn't work: ${msg}`,
      otherTime: "Pick another time",
      fromScratch: "Start over",
      noTimesLeft: "No times left for that day.",
      unknown: "unknown",
      typing: "typing…",
      msgPh: "Message…",
      send: "Send",
      resetTitle: "Restart demo",
      online: (bot) => `online · ${bot}`,
      minAb: (min, price) => `${min} min · from ${price}`,
      pitchBrand: "TeamTrack · Showcase",
      pitchTitle: "WhatsApp Booking",
      pitchLead: "Live demo of an automated booking chat for salons & local services.",
      pitch1: "Service → Day → Time → Contact details",
      pitch2: "Live availability & double-booking guard",
      pitch3: "Stub-ready for Calendar & WhatsApp API",
      pitch4: "Simulated 24h reminder",
      pitchCta: "Sales line: “I've got this — I'll build it for you.”",
      close: "Close",
      backHome: "Back to website",
      pageTitle: "WhatsApp Booking Demo · Salon Mira",
    },
  };

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

  function lang() {
    return window.DEMO_LANG || "de";
  }

  function ui() {
    return UI[lang()] || UI.de;
  }

  function localeTag() {
    return state.salon?.locale || (lang() === "tr" ? "tr-TR" : lang() === "en" ? "en-GB" : "de-DE");
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function nowLabel() {
    return new Date().toLocaleTimeString(localeTag(), { hour: "2-digit", minute: "2-digit" });
  }

  function formatMoney(n) {
    return new Intl.NumberFormat(localeTag(), {
      style: "currency",
      currency: state.salon?.currency || "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  }

  function formatReminderWhen(iso) {
    if (!iso) return ui().unknown;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(localeTag(), {
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
    el.input.placeholder = ui().msgPh;
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
    tip.setAttribute("aria-label", ui().typing);
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
    const t = ui();
    showChips(
      days.map((d) => ({
        id: d.date,
        label: d.label,
        sub: t.freeSlots(d.slotCount),
        raw: d,
      })),
      pickDay
    );
  }

  function applyStaticCopy() {
    const t = ui();
    document.title = t.pageTitle;
    document.documentElement.lang = lang();
    const map = {
      "pitch-brand": t.pitchBrand,
      "pitch-title": t.pitchTitle,
      "pitch-lead": t.pitchLead,
      "pitch-1": t.pitch1,
      "pitch-2": t.pitch2,
      "pitch-3": t.pitch3,
      "pitch-4": t.pitch4,
      "pitch-cta": t.pitchCta,
      "btn-close-label": t.close,
      "btn-close-home": t.backHome,
    };
    Object.keys(map).forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.textContent = map[id];
    });
    if (el.reset) el.reset.title = t.resetTitle;
    const sendBtn = document.querySelector("#composer button[type='submit']");
    if (sendBtn) sendBtn.setAttribute("aria-label", t.send);
  }

  async function startFlow() {
    const t = ui();
    state.busy = true;
    state.step = "welcome";
    state.service = state.day = state.time = state.name = state.phone = null;
    el.body.innerHTML = "";
    clearChoices();

    try {
      const salon = window.TerminBooking.salonPublic();
      state.salon = salon;
      el.salonName.textContent = salon.name;
      el.botStatus.textContent = t.online(salon.botName);

      await botSay(salon.welcomeMessage, 600);
      await botSay(t.askService, 350);
      state.busy = false;
      state.step = "service";
      showChips(
        salon.services.map((s) => ({
          id: s.id,
          label: s.name,
          sub: t.minAb(s.durationMinutes, formatMoney(s.price)),
          raw: s,
        })),
        pickService
      );
    } catch (err) {
      state.busy = false;
      addSystem(t.loadFail + err.message);
    }
  }

  async function pickService(item) {
    const t = ui();
    state.busy = true;
    state.service = item.raw;
    addMessage(item.label, "user");
    await botSay(
      t.servicePicked(item.raw.name, item.raw.durationMinutes, formatMoney(item.raw.price)),
      500
    );

    try {
      const days = window.TerminBooking.availableDays(item.raw.id);
      state.busy = false;
      state.step = "day";
      if (!days.length) {
        await botSay(t.noDays, 300);
        showChips([{ id: "restart", label: t.tryAgain }], () => startFlow());
        return;
      }
      offerDays(days);
    } catch (err) {
      state.busy = false;
      addSystem(err.message);
      showChips([{ id: "restart", label: t.restart }], () => startFlow());
    }
  }

  async function pickDay(item) {
    const t = ui();
    state.busy = true;
    state.day = item.raw;
    addMessage(item.label, "user");
    await botSay(t.askTime(item.raw.label), 400);

    try {
      const times = window.TerminBooking.availableTimes(state.service.id, item.raw.date);
      state.busy = false;
      state.step = "time";
      if (!times.length) {
        await botSay(t.noTimesDay, 300);
        offerDays(window.TerminBooking.availableDays(state.service.id));
        return;
      }
      showChips(
        times.map((tm) => ({
          id: tm.time,
          label: tm.label,
          raw: tm,
        })),
        pickTime
      );
    } catch (err) {
      state.busy = false;
      addSystem(err.message);
    }
  }

  async function pickTime(item) {
    const t = ui();
    state.busy = true;
    state.time = item.raw;
    addMessage(item.label, "user");
    await botSay(t.askName, 350);
    state.busy = false;
    state.step = "name";
    askText({
      placeholder: t.namePh,
      mode: "text",
      validate: (v) => (v.length < 2 ? t.nameErr : null),
      onDone: async (name) => {
        state.name = name;
        await botSay(t.askPhone(name.split(" ")[0]), 350);
        state.step = "phone";
        askText({
          placeholder: t.phonePh,
          mode: "tel",
          validate: (v) =>
            /^[+\d][\d\s/\-()]{5,}$/.test(v) ? null : t.phoneErr,
          onDone: confirmBooking,
        });
      },
    });
  }

  async function confirmBooking(phone) {
    const t = ui();
    state.phone = phone;
    state.busy = true;
    state.step = "booking";
    await botSay(t.checking, 500);

    try {
      const result = window.TerminBooking.createBooking({
        service_id: state.service.id,
        date: state.day.date,
        time: state.time.time,
        customer_name: state.name,
        customer_phone: state.phone,
      });

      const b = result.booking;
      await botSay(t.confirmed(state.salon.name, b, formatMoney(b.price)), 650);

      const reminderAt = formatReminderWhen(result.stubs.whatsapp_reminder.send_at);
      addSystem(t.reminderSys(state.salon.reminderHoursBefore, reminderAt));
      await botSay(t.reminderBot, 400);

      state.busy = false;
      state.step = "done";
      showChips(
        [
          { id: "again", label: t.bookAgain },
          { id: "done", label: t.doneThanks },
        ],
        async (chip) => {
          if (chip.id === "again") {
            await startFlow();
          } else {
            addMessage(chip.label, "user");
            await botSay(t.bye, 300);
          }
        }
      );
    } catch (err) {
      state.busy = false;
      await botSay(t.fail(err.message), 300);
      showChips(
        [
          { id: "retry", label: t.otherTime },
          { id: "restart", label: t.fromScratch },
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
                await botSay(t.noTimesLeft, 250);
                offerDays(window.TerminBooking.availableDays(state.service.id));
                return;
              }
              showChips(
                times.map((tm) => ({ id: tm.time, label: tm.label, raw: tm })),
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

  applyStaticCopy();
  startFlow();
})();

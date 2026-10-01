/* Availability + double-booking guard. Browser only — localStorage, no network. */
(() => {
  "use strict";

  const STORAGE_KEY = "whatsapp-termin-demo.bookings";
  const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const WEEKDAY_FROM_SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const WEEKDAYS = {
    de: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    tr: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  };
  const ERR = {
    de: {
      missingConfig: "Salon-Konfiguration fehlt.",
      unknownService: "Unbekannter Service.",
      invalidDate: "Ungültiges Datum.",
      needName: "Bitte gib deinen Namen an.",
      needPhone: "Bitte gib eine gültige Telefonnummer an.",
      badDateTime: "Datum oder Uhrzeit ungültig.",
      doubleBook: "Doppelbuchung verhindert: Slot bereits belegt.",
      unavailable: "Dieser Termin ist leider nicht mehr verfügbar.",
      invalidSlot: "Termin ungültig.",
    },
    tr: {
      missingConfig: "Salon yapılandırması eksik.",
      unknownService: "Bilinmeyen hizmet.",
      invalidDate: "Geçersiz tarih.",
      needName: "Lütfen adınızı yazın.",
      needPhone: "Lütfen geçerli bir telefon numarası girin.",
      badDateTime: "Tarih veya saat geçersiz.",
      doubleBook: "Çift rezervasyon engellendi: slot dolu.",
      unavailable: "Bu randevu artık müsait değil.",
      invalidSlot: "Randevu geçersiz.",
    },
    en: {
      missingConfig: "Salon configuration missing.",
      unknownService: "Unknown service.",
      invalidDate: "Invalid date.",
      needName: "Please enter your name.",
      needPhone: "Please enter a valid phone number.",
      badDateTime: "Invalid date or time.",
      doubleBook: "Double booking blocked: slot already taken.",
      unavailable: "This slot is no longer available.",
      invalidSlot: "Invalid appointment.",
    },
  };

  function lang() {
    return window.DEMO_LANG || "de";
  }

  function tErr(key) {
    return (ERR[lang()] || ERR.de)[key] || ERR.de[key];
  }

  function weekdays() {
    return WEEKDAYS[lang()] || WEEKDAYS.de;
  }

  const memory = [];
  let persist = true;

  function config() {
    const cfg = window.SALON_CONFIG;
    if (!cfg || !Array.isArray(cfg.services)) {
      throw new Error(tErr("missingConfig"));
    }
    return cfg;
  }

  function serviceById(id) {
    return config().services.find((s) => s.id === id) || null;
  }

  function readStore() {
    if (!persist) return memory.slice();
    try {
      const raw = localStorage.getItem(STORAGE_KEY + "." + lang());
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      persist = false;
      return memory.slice();
    }
  }

  function writeStore(list) {
    if (!persist) {
      memory.length = 0;
      list.forEach((item) => memory.push(item));
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY + "." + lang(), JSON.stringify(list));
    } catch {
      persist = false;
      memory.length = 0;
      list.forEach((item) => memory.push(item));
    }
  }

  function confirmedBookings() {
    return readStore().filter((b) => b && b.status === "confirmed");
  }

  function timezone() {
    return config().timezone || "Europe/Berlin";
  }

  function partsInZone(date, tz) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const map = {};
    fmt.formatToParts(date).forEach((p) => {
      map[p.type] = p.value;
    });
    let hour = map.hour;
    if (hour === "24") hour = "00";
    return {
      ymd: `${map.year}-${map.month}-${map.day}`,
      hm: `${hour}:${map.minute}`,
    };
  }

  function weekdayIndex(ymd, tz) {
    const [y, m, d] = ymd.split("-").map(Number);
    const probe = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const short = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
    }).format(probe);
    return WEEKDAY_FROM_SHORT[short];
  }

  function addDays(ymd, n) {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + n));
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }

  function dayDiff(fromYmd, toYmd) {
    const [ay, am, ad] = fromYmd.split("-").map(Number);
    const [by, bm, bd] = toYmd.split("-").map(Number);
    return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
  }

  function parseMinutes(hm) {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m;
  }

  function formatHM(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function zonedTimeToUtc(ymd, hm, tz) {
    const [y, mo, d] = ymd.split("-").map(Number);
    const [h, mi] = hm.split(":").map(Number);
    let utc = Date.UTC(y, mo - 1, d, h, mi, 0);
    for (let i = 0; i < 3; i++) {
      const wall = partsInZone(new Date(utc), tz);
      const [wy, wm, wd] = wall.ymd.split("-").map(Number);
      const [wh, wmin] = wall.hm.split(":").map(Number);
      const asUtc = Date.UTC(wy, wm - 1, wd, wh, wmin, 0);
      const desired = Date.UTC(y, mo - 1, d, h, mi, 0);
      const delta = desired - asUtc;
      if (delta === 0) break;
      utc += delta;
    }
    return new Date(utc);
  }

  function overlaps(startHm, endHm, bookings) {
    return bookings.some((b) => startHm < b.endTime && endHm > b.startTime);
  }

  function slotsForDate(ymd, service) {
    const cfg = config();
    const tz = timezone();
    const closed = cfg.closedDates || [];
    if (closed.includes(ymd)) return [];

    const weekday = WEEKDAY_KEYS[weekdayIndex(ymd, tz)];
    const hours = (cfg.openingHours || {})[weekday];
    if (!hours || !hours.open || !hours.close) return [];

    const interval = Number(cfg.slotIntervalMinutes) || 30;
    const duration = Number(service.durationMinutes);
    const openM = parseMinutes(hours.open);
    const closeM = parseMinutes(hours.close);
    const now = partsInZone(new Date(), tz);
    const nowM = parseMinutes(now.hm);
    const taken = confirmedBookings().filter((b) => b.date === ymd);

    const slots = [];
    for (let cursor = openM; cursor < closeM; cursor += interval) {
      const slotEnd = cursor + duration;
      if (slotEnd > closeM) break;
      if (ymd < now.ymd) continue;
      if (ymd === now.ymd && cursor <= nowM) continue;
      const startHm = formatHM(cursor);
      const endHm = formatHM(slotEnd);
      if (overlaps(startHm, endHm, taken)) continue;
      slots.push(startHm);
    }
    return slots;
  }

  function germanDayLabel(ymd, todayYmd, tz) {
    const [, m, d] = ymd.split("-");
    const dm = lang() === "en" ? `${d}/${m}` : `${d}.${m}.`;
    const diff = dayDiff(todayYmd, ymd);
    const wd = weekdays()[weekdayIndex(ymd, tz)];
    if (lang() === "tr") {
      if (diff === 0) return `Bugün, ${dm}`;
      if (diff === 1) return `Yarın, ${dm}`;
      return `${wd}, ${dm}`;
    }
    if (lang() === "en") {
      if (diff === 0) return `Today, ${dm}`;
      if (diff === 1) return `Tomorrow, ${dm}`;
      return `${wd}, ${dm}`;
    }
    if (diff === 0) return `Heute, ${dm}`;
    if (diff === 1) return `Morgen, ${dm}`;
    return `${wd}, ${dm}`;
  }

  function salonPublic() {
    const cfg = config();
    return {
      name: cfg.name,
      tagline: cfg.tagline,
      phone: cfg.phone,
      botName: cfg.botName,
      welcomeMessage: cfg.welcomeMessage,
      reminderHoursBefore: cfg.reminderHoursBefore,
      currency: cfg.currency,
      locale: cfg.locale,
      services: cfg.services,
      bookingHorizonDays: cfg.bookingHorizonDays,
    };
  }

  function availableDays(serviceId) {
    const service = serviceById(serviceId);
    if (!service) throw new Error(tErr("unknownService"));

    const cfg = config();
    const tz = timezone();
    const horizon = Number(cfg.bookingHorizonDays) || 14;
    const today = partsInZone(new Date(), tz).ymd;
    const days = [];

    for (let i = 0; i < horizon; i++) {
      const ymd = addDays(today, i);
      const slots = slotsForDate(ymd, service);
      if (!slots.length) continue;
      days.push({
        date: ymd,
        label: germanDayLabel(ymd, today, tz),
        weekday: WEEKDAY_KEYS[weekdayIndex(ymd, tz)],
        slotCount: slots.length,
      });
    }
    return days;
  }

  function availableTimes(serviceId, dateYmd) {
    const service = serviceById(serviceId);
    if (!service) throw new Error(tErr("unknownService"));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYmd)) throw new Error(tErr("invalidDate"));

    return slotsForDate(dateYmd, service).map((time) => ({
      time,
      label: lang() === "de" ? `${time} Uhr` : time,
    }));
  }

  function createBooking(input) {
    const serviceId = String(input.service_id || "").trim();
    const dateYmd = String(input.date || "").trim();
    const time = String(input.time || "").trim();
    const name = String(input.customer_name || "").trim();
    const phone = String(input.customer_phone || "").trim();

    const service = serviceById(serviceId);
    if (!service) throw new Error(tErr("unknownService"));
    if (name.length < 2) throw new Error(tErr("needName"));
    if (!/^[+\d][\d\s/\-()]{5,}$/.test(phone)) {
      throw new Error(tErr("needPhone"));
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateYmd) || !/^\d{2}:\d{2}$/.test(time)) {
      throw new Error(tErr("badDateTime"));
    }

    const cfg = config();
    const tz = timezone();
    const duration = Number(service.durationMinutes);
    const endTime = formatHM(parseMinutes(time) + duration);
    const sameDay = confirmedBookings().filter((b) => b.date === dateYmd);

    if (overlaps(time, endTime, sameDay)) {
      throw new Error(tErr("doubleBook"));
    }
    if (!slotsForDate(dateYmd, service).includes(time)) {
      throw new Error(tErr("unavailable"));
    }

    const starts = zonedTimeToUtc(dateYmd, time, tz);
    if (Number.isNaN(starts.getTime())) throw new Error(tErr("invalidSlot"));
    const ends = new Date(starts.getTime() + duration * 60000);
    const reminderHours = Number(cfg.reminderHoursBefore ?? 24);
    const reminderAt = new Date(starts.getTime() - reminderHours * 3600000);

    const all = readStore();
    const nextId = all.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1;
    const [y, m, d] = dateYmd.split("-");

    const booking = {
      id: nextId,
      service_id: service.id,
      service_name: service.name,
      date: dateYmd,
      startTime: time,
      endTime,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      customer_name: name,
      customer_phone: phone,
      status: "confirmed",
      price: service.price,
      durationMinutes: duration,
      display: {
        date: lang() === "en" ? `${d}/${m}/${y}` : `${d}.${m}.${y}`,
        time,
        weekday: weekdays()[weekdayIndex(dateYmd, tz)],
      },
    };

    all.push(booking);
    writeStore(all);

    return {
      booking,
      stubs: {
        calendar: {
          provider: "stub-calendar",
          action: "create_event",
          status: "stubbed",
        },
        whatsapp_confirmation: {
          provider: "stub-whatsapp",
          action: "send_text",
          kind: "confirmation",
          to: phone,
          status: "stubbed",
        },
        whatsapp_reminder: {
          provider: "stub-whatsapp",
          action: "schedule_reminder",
          hours_before: reminderHours,
          send_at: reminderAt.toISOString(),
          to: phone,
          status: "stubbed-simulated",
        },
      },
    };
  }

  window.TerminBooking = {
    STORAGE_KEY,
    salonPublic,
    availableDays,
    availableTimes,
    createBooking,
  };
})();

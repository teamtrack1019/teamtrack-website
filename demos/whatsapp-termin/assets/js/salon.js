/* Multi-language salon samples. Prices adapt per market (EUR / TRY). */
(() => {
  "use strict";

  function detectLang() {
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q && ["de", "tr", "en"].includes(q)) return q;
    } catch (_) {}
    try {
      const stored = localStorage.getItem("teamtrack_lang");
      if (stored && ["de", "tr", "en"].includes(stored)) return stored;
    } catch (_) {}
    const html = (document.documentElement.lang || "").slice(0, 2).toLowerCase();
    if (["de", "tr", "en"].includes(html)) return html;
    return "de";
  }

  const LOCALES = {
    de: {
      name: "Salon Mira",
      tagline: "Dein Friseur in der Nachbarschaft",
      phone: "+49 30 12345678",
      timezone: "Europe/Berlin",
      locale: "de-DE",
      currency: "EUR",
      botName: "Termin-Assistent",
      welcomeMessage:
        "Hallo! 👋 Willkommen bei *Salon Mira*.\nIch helfe dir gerne bei der Terminbuchung — rund um die Uhr, ohne Warteschleife.",
      reminderHoursBefore: 24,
      slotIntervalMinutes: 30,
      bookingHorizonDays: 14,
      services: [
        { id: "schneiden", name: "Haarschnitt", durationMinutes: 45, price: 32, description: "Waschen, Schneiden, Föhnen" },
        { id: "farbe", name: "Farbe / Tönung", durationMinutes: 90, price: 65, description: "Beratung, Farbe, Pflege" },
        { id: "bart", name: "Bartpflege", durationMinutes: 30, price: 22, description: "Kontur, Pflege, Styling" },
        { id: "styling", name: "Styling / Hochsteckfrisur", durationMinutes: 60, price: 45, description: "Für Anlässe & Events" },
      ],
      openingHours: {
        mon: { open: "09:00", close: "18:00" },
        tue: { open: "09:00", close: "18:00" },
        wed: { open: "09:00", close: "18:00" },
        thu: { open: "09:00", close: "20:00" },
        fri: { open: "09:00", close: "18:00" },
        sat: { open: "09:00", close: "14:00" },
        sun: null,
      },
      closedDates: [],
      staff: [
        { id: "mira", name: "Mira" },
        { id: "lena", name: "Lena" },
      ],
    },
    tr: {
      name: "Salon Mira",
      tagline: "Mahallendeki kuaförün",
      phone: "+90 212 555 01 23",
      timezone: "Europe/Istanbul",
      locale: "tr-TR",
      currency: "TRY",
      botName: "Randevu Asistanı",
      welcomeMessage:
        "Merhaba! 👋 *Salon Mira*'ya hoş geldiniz.\nRandevu almak için 7/24 yardımcı olurum — bekleme yok.",
      reminderHoursBefore: 24,
      slotIntervalMinutes: 30,
      bookingHorizonDays: 14,
      services: [
        { id: "schneiden", name: "Saç Kesimi", durationMinutes: 45, price: 450, description: "Yıkama, kesim, fön" },
        { id: "farbe", name: "Boya / Röfle", durationMinutes: 90, price: 1450, description: "Danışmanlık, boya, bakım" },
        { id: "bart", name: "Sakal Bakımı", durationMinutes: 30, price: 280, description: "Kontür, bakım, şekillendirme" },
        { id: "styling", name: "Şekillendirme / Topuz", durationMinutes: 60, price: 850, description: "Özel günler & etkinlikler" },
      ],
      openingHours: {
        mon: { open: "09:00", close: "18:00" },
        tue: { open: "09:00", close: "18:00" },
        wed: { open: "09:00", close: "18:00" },
        thu: { open: "09:00", close: "20:00" },
        fri: { open: "09:00", close: "18:00" },
        sat: { open: "09:00", close: "14:00" },
        sun: null,
      },
      closedDates: [],
      staff: [
        { id: "mira", name: "Mira" },
        { id: "lena", name: "Lena" },
      ],
    },
    en: {
      name: "Salon Mira",
      tagline: "Your neighborhood hair salon",
      phone: "+49 30 12345678",
      timezone: "Europe/Berlin",
      locale: "en-GB",
      currency: "EUR",
      botName: "Booking Assistant",
      welcomeMessage:
        "Hi! 👋 Welcome to *Salon Mira*.\nI can book your appointment any time — no hold music.",
      reminderHoursBefore: 24,
      slotIntervalMinutes: 30,
      bookingHorizonDays: 14,
      services: [
        { id: "schneiden", name: "Haircut", durationMinutes: 45, price: 32, description: "Wash, cut, blow-dry" },
        { id: "farbe", name: "Color / Tint", durationMinutes: 90, price: 65, description: "Consultation, color, care" },
        { id: "bart", name: "Beard Care", durationMinutes: 30, price: 22, description: "Contour, care, styling" },
        { id: "styling", name: "Styling / Updo", durationMinutes: 60, price: 45, description: "For events & occasions" },
      ],
      openingHours: {
        mon: { open: "09:00", close: "18:00" },
        tue: { open: "09:00", close: "18:00" },
        wed: { open: "09:00", close: "18:00" },
        thu: { open: "09:00", close: "20:00" },
        fri: { open: "09:00", close: "18:00" },
        sat: { open: "09:00", close: "14:00" },
        sun: null,
      },
      closedDates: [],
      staff: [
        { id: "mira", name: "Mira" },
        { id: "lena", name: "Lena" },
      ],
    },
  };

  const lang = detectLang();
  window.DEMO_LANG = lang;
  window.SALON_CONFIG = LOCALES[lang] || LOCALES.de;
})();

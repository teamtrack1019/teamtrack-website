/* Salon sample for the offline showcase. Edit this file — the page does not read salon.json. */
window.SALON_CONFIG = {
  name: "Salon Mira",
  tagline: "Dein Friseur in der Nachbarschaft",
  phone: "+49 30 12345678",
  timezone: "Europe/Berlin",
  locale: "de",
  currency: "EUR",
  botName: "Termin-Assistent",
  welcomeMessage:
    "Hallo! 👋 Willkommen bei *Salon Mira*.\nIch helfe dir gerne bei der Terminbuchung — rund um die Uhr, ohne Warteschleife.",
  reminderHoursBefore: 24,
  slotIntervalMinutes: 30,
  bookingHorizonDays: 14,
  services: [
    {
      id: "schneiden",
      name: "Haarschnitt",
      durationMinutes: 45,
      price: 32,
      description: "Waschen, Schneiden, Föhnen",
    },
    {
      id: "farbe",
      name: "Farbe / Tönung",
      durationMinutes: 90,
      price: 65,
      description: "Beratung, Farbe, Pflege",
    },
    {
      id: "bart",
      name: "Bartpflege",
      durationMinutes: 30,
      price: 22,
      description: "Kontur, Pflege, Styling",
    },
    {
      id: "styling",
      name: "Styling / Hochsteckfrisur",
      durationMinutes: 60,
      price: 45,
      description: "Für Anlässe & Events",
    },
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
};

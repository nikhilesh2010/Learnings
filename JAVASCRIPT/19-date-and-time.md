# 41: Date & Time

## 📅 Creating Dates

JavaScript's built-in `Date` object represents a single point in time as the number of milliseconds since the Unix epoch (1970-01-01T00:00:00.000Z).

```js
// Current moment
const now = new Date();

// From ISO 8601 string (ALWAYS use this format — reliable cross-browser)
const d1 = new Date("2024-03-15");                  // midnight UTC
const d2 = new Date("2024-03-15T10:30:00");          // local time
const d3 = new Date("2024-03-15T10:30:00Z");         // explicit UTC
const d4 = new Date("2024-03-15T10:30:00+05:30");    // IST offset

// From year, month (0-indexed!), day, hour, min, sec, ms  (local time)
const d5 = new Date(2024, 2, 15);        // March 15 2024 — month is 0-based ⚠️
const d6 = new Date(2024, 2, 15, 10, 30, 0, 0);

// From Unix timestamp (milliseconds)
const d7 = new Date(0);                   // 1970-01-01T00:00:00.000Z
const d8 = new Date(1710499200000);

// Current timestamp as number
const ts = Date.now();                    // milliseconds since epoch  ✅ preferred
```

---

## 🔍 Reading Date Parts

```js
const d = new Date("2024-03-15T10:30:45.123Z");

// Local time getters (depend on system timezone)
d.getFullYear();        // 2024
d.getMonth();           // 2  ← 0-indexed! (0 = Jan, 11 = Dec)
d.getDate();            // 15 (day of month)
d.getDay();             // 5  (day of week: 0 = Sun, 6 = Sat)
d.getHours();           // local hours
d.getMinutes();         // local minutes
d.getSeconds();         // 45
d.getMilliseconds();    // 123

// UTC getters (timezone-independent)
d.getUTCFullYear();
d.getUTCMonth();        // same 0-indexed
d.getUTCDate();
d.getUTCHours();        // 10
d.getUTCMinutes();      // 30
d.getUTCSeconds();      // 45

// Timestamp
d.getTime();            // milliseconds since epoch
d.valueOf();            // same as getTime()
+d;                     // coerce to number = getTime()
```

---

## ✏️ Setting Date Parts

```js
const d = new Date("2024-03-15");

d.setFullYear(2025);
d.setMonth(0);           // January
d.setDate(1);
d.setHours(9, 0, 0, 0);  // h, min, sec, ms

// UTC equivalents
d.setUTCFullYear(2025);
d.setUTCHours(0);

// Overflow auto-adjusts dates
const d2 = new Date(2024, 0, 32);  // → Feb 1 2024 (January 32 overflows)
```

---

## 🖨️ Formatting Dates

```js
const d = new Date("2024-03-15T10:30:00Z");

// Built-in output methods
d.toISOString();          // "2024-03-15T10:30:00.000Z"   ← best for storage/API
d.toJSON();               // same as toISOString()
d.toLocaleDateString();   // "3/15/2024"  (varies by OS locale)
d.toLocaleTimeString();   // "10:30:00 AM"
d.toLocaleString();       // "3/15/2024, 10:30:00 AM"
d.toUTCString();          // "Fri, 15 Mar 2024 10:30:00 GMT"
d.toString();             // long local string (avoid for display)
d.toDateString();         // "Fri Mar 15 2024"
d.toTimeString();         // "10:30:00 GMT+0000 ..."

// Locale-aware formatting (prefer Intl over these methods)
d.toLocaleDateString("en-GB");                 // "15/03/2024"
d.toLocaleDateString("de-DE");                 // "15.3.2024"
d.toLocaleDateString("en-US", {
  weekday: "long", year: "numeric",
  month: "long",  day: "numeric",
});  // "Friday, March 15, 2024"

// ✅ Best approach — use Intl.DateTimeFormat (see 42-intl.md)
const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" });
fmt.format(d);  // "Friday, March 15, 2024 at 10:30 AM"
```

---

## ➕ Date Arithmetic

```js
// Add/subtract using timestamps
const now = Date.now();
const oneHourLater     = new Date(now + 60 * 60 * 1000);
const threeDaysAgo     = new Date(now - 3 * 24 * 60 * 60 * 1000);

// Difference between two dates
const start = new Date("2024-01-01");
const end   = new Date("2024-03-15");
const diffMs   = end - start;                         // 5,529,600,000 ms
const diffDays = diffMs / (1000 * 60 * 60 * 24);     // 74 days

// Add months (careful — use setMonth for accurate month arithmetic)
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// Clamp: start of day (midnight local time)
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Check if a date is in the past
const isPast = (date) => new Date(date) < new Date();

// Date comparison
const a = new Date("2024-01-01");
const b = new Date("2024-06-01");
a < b;        // true
a.getTime() === b.getTime();  // false
```

---

## 🌍 Timezones

`Date` has no timezone property — it always stores UTC internally and converts to local time via system timezone for display/getters.

```js
// Get local timezone offset (minutes behind UTC)
new Date().getTimezoneOffset();   // e.g. -330 for IST (UTC+5:30), 0 for UTC

// Convert date to a specific timezone string using Intl
function toTimezone(date, tz) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(date);
}

toTimezone(new Date(), "America/New_York");  // "03/15/2024, 05:30:00 AM"
toTimezone(new Date(), "Asia/Kolkata");      // "03/15/2024, 04:00:00 PM"
toTimezone(new Date(), "Europe/London");

// List of IANA timezone names: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
// Common ones: "UTC", "America/New_York", "America/Los_Angeles",
//              "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Kolkata"

// Get timezone name
Intl.DateTimeFormat().resolvedOptions().timeZone;  // "Asia/Kolkata" (current system tz)
```

---

## ⚡ Performance: Date.now() vs new Date()

```js
// ✅ For timestamps only — much faster, no object allocation
const t0 = Date.now();
doWork();
const elapsed = Date.now() - t0;

// For high-resolution timing (microseconds)
const t1 = performance.now();
doWork();
console.log(`${performance.now() - t1} ms`);

// Date.parse() — parses ISO strings to timestamp (avoid other formats)
Date.parse("2024-03-15T10:30:00Z");   // 1710499200000
Date.parse("invalid");                 // NaN
```

---

## 🔄 Common Utility Patterns

```js
// Is valid date?
function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

// Format as YYYY-MM-DD (ISO date string, local time)
function toDateString(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;    // "2024-03-15"
}

// Days between two dates (ignoring time)
function daysBetween(a, b) {
  const ms = Math.abs(startOfDay(a) - startOfDay(b));
  return Math.round(ms / 86_400_000);
}

// Next weekday after a date
function nextWeekday(date, weekday /* 0-6 */) {
  const d = new Date(date);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

// Relative time label (see Intl.RelativeTimeFormat in 42-intl.md for locale support)
function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60_000)          return "just now";
  if (diff < 3_600_000)       return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)      return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 2_592_000_000)   return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(date).toLocaleDateString();
}
```

---

## 🚀 Temporal API (Stage 3 — coming soon)

`Temporal` is the modern replacement for `Date`. It fixes timezone handling, immutability, and API consistency.

```js
// ⚠️ Available via polyfill today: npm install @js-temporal/polyfill
import { Temporal } from "@js-temporal/polyfill";

// Plain types (no timezone)
const today = Temporal.PlainDate.from("2024-03-15");
today.year;   // 2024
today.month;  // 3   ← 1-indexed ✅
today.day;    // 15

// Zoned datetime (explicit timezone)
const zdt = Temporal.ZonedDateTime.from("2024-03-15T10:30:00[Asia/Kolkata]");
zdt.timeZoneId;   // "Asia/Kolkata"

// Instant (point in time, no timezone)
const instant = Temporal.Now.instant();
instant.epochMilliseconds;

// Arithmetic (returns new immutable objects)
const tomorrow = today.add({ days: 1 });
const nextMonth = today.add({ months: 1 });

// Duration
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 });

// Convert legacy Date
const legacyDate = new Date("2024-03-15T10:30:00Z");
const temporalInstant = Temporal.Instant.fromEpochMilliseconds(legacyDate.getTime());
```

---

## ⚠️ Common Pitfalls

```js
// ❌ Month is 0-indexed — the most common Date bug
new Date(2024, 3, 15);   // April 15, not March! (month 3 = April)
new Date(2024, 2, 15);   // ✅ March 15

// ❌ Parsing non-ISO strings is implementation-dependent
new Date("03/15/2024");  // May work in some browsers, but avoid
new Date("15-03-2024");  // ❌ Invalid in many engines

// ✅ Always use ISO 8601
new Date("2024-03-15T10:30:00Z");

// ❌ Comparing dates with ==
const a = new Date("2024-01-01");
const b = new Date("2024-01-01");
a == b;          // false — different objects!
a.getTime() === b.getTime();   // ✅ true

// ❌ new Date() in a loop (allocates objects)
// ✅ Use Date.now() for timestamps
```

---

## 🔑 Key Takeaways

- Months are **0-indexed** (0 = January, 11 = December) — the #1 gotcha.
- Always use **ISO 8601** strings (`"2024-03-15T10:30:00Z"`) for reliable parsing.
- `Date.now()` is faster than `new Date()` when you only need a timestamp.
- `Date` has no timezone — it stores UTC; local getters depend on system timezone.
- Use `Intl.DateTimeFormat` for locale-aware formatting (see [42-intl.md](42-intl.md)).
- Use `performance.now()` for high-resolution timing.
- **Temporal API** (Stage 3) will eventually replace `Date` — it's 1-indexed, immutable, and timezone-aware.
- For production apps, consider [date-fns](https://date-fns.org/) or [Luxon](https://moment.github.io/luxon/) until Temporal ships natively.

---

[← Previous: Iterators & Generators](18-iterators-and-generators.md) | [Contents](README.md) | [Next: Intl API →](20-intl.md)

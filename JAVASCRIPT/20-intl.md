# 42: Intl API

The `Intl` (Internationalization) namespace provides locale-sensitive formatting for numbers, dates, strings, and more — without any third-party library.

## 🔢 Intl.NumberFormat

Format numbers, currencies, and units according to locale conventions.

```js
// Basic number formatting
const nf = new Intl.NumberFormat("en-US");
nf.format(1234567.89);         // "1,234,567.89"

new Intl.NumberFormat("de-DE").format(1234567.89);   // "1.234.567,89"
new Intl.NumberFormat("hi-IN").format(1234567.89);   // "12,34,567.89"

// Currency
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
usd.format(1234.56);    // "$1,234.56"

new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(1234.56);
// "1.234,56 €"

new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(1234);
// "¥1,234"

new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(1234.56);
// "₹1,234.56"

// Percent
new Intl.NumberFormat("en-US", { style: "percent" }).format(0.876);     // "88%"
new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 1 }).format(0.876);
// "87.6%"

// Units (compact / engineering)
new Intl.NumberFormat("en-US", { notation: "compact" }).format(1_500_000);  // "1.5M"
new Intl.NumberFormat("en-US", { notation: "compact" }).format(12_000);     // "12K"

// Physical units
new Intl.NumberFormat("en-US", {
  style: "unit", unit: "kilometer-per-hour", unitDisplay: "short",
}).format(120);    // "120 km/h"

new Intl.NumberFormat("en-US", {
  style: "unit", unit: "liter", unitDisplay: "long",
}).format(3.5);   // "3.5 liters"

// Significant digits
new Intl.NumberFormat("en-US", {
  minimumSignificantDigits: 3,
  maximumSignificantDigits: 4,
}).format(1234.5678);   // "1,235"

// Reuse formatToParts for custom rendering
const parts = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD",
}).formatToParts(1234.56);
// [{ type: "currency", value: "$" }, { type: "integer", value: "1,234" }, ...]
```

---

## 📅 Intl.DateTimeFormat

Locale-aware date and time formatting.

```js
const d = new Date("2024-03-15T10:30:00Z");

// Simple date
new Intl.DateTimeFormat("en-US").format(d);   // "3/15/2024"
new Intl.DateTimeFormat("en-GB").format(d);   // "15/03/2024"
new Intl.DateTimeFormat("de-DE").format(d);   // "15.3.2024"

// Full control with options
new Intl.DateTimeFormat("en-US", {
  weekday: "long",  year: "numeric",
  month:   "long",  day:  "numeric",
}).format(d);
// "Friday, March 15, 2024"

// Date + time with timezone
new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
}).format(d);
// "Mar 15, 2024, 6:30 AM"

// formatRange — date ranges
const fmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" });
fmt.formatRange(new Date("2024-03-10"), new Date("2024-03-15"));
// "March 10–15"

fmt.formatRange(new Date("2024-03-10"), new Date("2024-04-05"));
// "March 10 – April 5"

// Common option values
// weekday:   "narrow" | "short" | "long"
// year:      "numeric" | "2-digit"
// month:     "numeric" | "2-digit" | "narrow" | "short" | "long"
// day:       "numeric" | "2-digit"
// hour:      "numeric" | "2-digit"
// minute:    "numeric" | "2-digit"
// second:    "numeric" | "2-digit"
// hour12:    true | false
// dateStyle: "full" | "long" | "medium" | "short"
// timeStyle: "full" | "long" | "medium" | "short"
// timeZone:  IANA name e.g. "UTC", "America/New_York", "Asia/Kolkata"
```

---

## ⏱️ Intl.RelativeTimeFormat

Format relative time like "3 days ago" or "in 2 hours".

```js
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

rtf.format(-1, "day");     // "yesterday"
rtf.format(1,  "day");     // "tomorrow"
rtf.format(0,  "day");     // "today"
rtf.format(-3, "day");     // "3 days ago"
rtf.format(2,  "week");    // "in 2 weeks"
rtf.format(-1, "month");   // "last month"
rtf.format(1,  "year");    // "next year"
rtf.format(-5, "minute");  // "5 minutes ago"
rtf.format(30, "second");  // "in 30 seconds"

// numeric: "always" for strictly numbered output
const rtfAlways = new Intl.RelativeTimeFormat("en", { numeric: "always" });
rtfAlways.format(-1, "day");   // "1 day ago"

// Smart helper
function relativeTimeFormat(date, locale = "en") {
  const diff = new Date(date).getTime() - Date.now();
  const rtf  = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const abs = Math.abs(diff);
  const MINUTE  = 60_000;
  const HOUR    = 3_600_000;
  const DAY     = 86_400_000;
  const WEEK    = 604_800_000;
  const MONTH   = 2_592_000_000;
  const YEAR    = 31_536_000_000;

  if (abs < MINUTE)  return rtf.format(Math.round(diff / 1000),  "second");
  if (abs < HOUR)    return rtf.format(Math.round(diff / MINUTE), "minute");
  if (abs < DAY)     return rtf.format(Math.round(diff / HOUR),   "hour");
  if (abs < WEEK)    return rtf.format(Math.round(diff / DAY),    "day");
  if (abs < MONTH)   return rtf.format(Math.round(diff / WEEK),   "week");
  if (abs < YEAR)    return rtf.format(Math.round(diff / MONTH),  "month");
  return rtf.format(Math.round(diff / YEAR), "year");
}

relativeTimeFormat(Date.now() - 90_000);    // "2 minutes ago"
relativeTimeFormat(Date.now() + 3_600_000); // "in 1 hour"
```

---

## 🔤 Intl.Collator

Locale-aware string comparison and sorting.

```js
// Default JS sort is wrong for accented characters
["café", "bar", "Banana"].sort();   // ["Banana", "bar", "café"] ← wrong

// ✅ Use Intl.Collator
const collator = new Intl.Collator("en");
["café", "bar", "Banana"].sort(collator.compare);  // ["bar", "Banana", "café"] ✅

// Case-insensitive sort
const ci = new Intl.Collator("en", { sensitivity: "base" });
["Banana", "apple", "Cherry"].sort(ci.compare);  // ["apple", "Banana", "Cherry"]

// Numeric sort (natural sort: "file10" after "file9")
const numeric = new Intl.Collator("en", { numeric: true });
["file10", "file2", "file1"].sort(numeric.compare);  // ["file1", "file2", "file10"]

// Comparison result: -1, 0, or 1
ci.compare("apple", "Apple");   // 0 (same base)
ci.compare("a", "b");           // -1

// sensitivity values:
// "base"     — ignore case and accents (a == A == á)
// "accent"   — ignore case, respect accents (a == A, a != á)
// "case"     — respect case, ignore accents (a != A, a == á)
// "variant"  — respect both (a != A != á) ← default
```

---

## 📊 Intl.PluralRules

Determine the correct plural category for a number (one, few, many, other…).

```js
const pr = new Intl.PluralRules("en-US");
pr.select(0);   // "other"
pr.select(1);   // "one"
pr.select(2);   // "other"
pr.select(5);   // "other"

const prRu = new Intl.PluralRules("ru");
prRu.select(1);   // "one"
prRu.select(2);   // "few"
prRu.select(5);   // "many"
prRu.select(11);  // "many"

// Practical use
const messages = {
  one:   "1 item",
  other: (n) => `${n} items`,
};

function itemCount(n, locale = "en-US") {
  const rule = new Intl.PluralRules(locale).select(n);
  const msg  = messages[rule];
  return typeof msg === "function" ? msg(n) : msg;
}

itemCount(1);   // "1 item"
itemCount(5);   // "5 items"

// Ordinal (1st, 2nd, 3rd…)
const ordinal = new Intl.PluralRules("en-US", { type: "ordinal" });
const suffixes = { one: "st", two: "nd", few: "rd", other: "th" };
function ordinalNumber(n) {
  return `${n}${suffixes[ordinal.select(n)]}`;
}
ordinalNumber(1);   // "1st"
ordinalNumber(2);   // "2nd"
ordinalNumber(3);   // "3rd"
ordinalNumber(4);   // "4th"
ordinalNumber(11);  // "11th"
```

---

## 📋 Intl.ListFormat

Format arrays of items as natural language lists.

```js
const lf = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
lf.format(["Alice", "Bob", "Carol"]);   // "Alice, Bob, and Carol"
lf.format(["Alice", "Bob"]);            // "Alice and Bob"
lf.format(["Alice"]);                   // "Alice"

// Disjunction (or)
const lfOr = new Intl.ListFormat("en", { type: "disjunction" });
lfOr.format(["cat", "dog", "fish"]);    // "cat, dog, or fish"

// Unit (no conjunction word)
const lfUnit = new Intl.ListFormat("en", { type: "unit", style: "narrow" });
lfUnit.format(["5kg", "2L"]);           // "5kg 2L"

// Other locales
new Intl.ListFormat("fr", { type: "conjunction" }).format(["pomme", "banane", "cerise"]);
// "pomme, banane et cerise"
```

---

## 🔡 Intl.Segmenter

Split text into graphemes, words, or sentences respecting locale rules.

```js
// Word segmentation
const wordSeg = new Intl.Segmenter("en", { granularity: "word" });
const words = [...wordSeg.segment("Hello, World! How are you?")]
  .filter(s => s.isWordLike)
  .map(s => s.segment);
// ["Hello", "World", "How", "are", "you"]

// Sentence segmentation
const sentSeg = new Intl.Segmenter("en", { granularity: "sentence" });
[...sentSeg.segment("Hello World. How are you? Great!")].map(s => s.segment);
// ["Hello World. ", "How are you? ", "Great!"]

// Grapheme segmentation — handles emoji correctly
const graphSeg = new Intl.Segmenter("en", { granularity: "grapheme" });
[...graphSeg.segment("Hello 👋🏽")].map(s => s.segment);
// ["H", "e", "l", "l", "o", " ", "👋🏽"]   ← emoji + skin tone as ONE grapheme ✅

// Compare to string spread (WRONG for multi-codepoint emoji)
[..."Hello 👋🏽"];  // ["H","e","l","l","o"," ","👋","🏽"]  ← splits the emoji ❌

// Get accurate character count
function graphemeLength(str) {
  return [...new Intl.Segmenter().segment(str)].length;
}
graphemeLength("👋🏽");   // 1
"👋🏽".length;            // 4 (UTF-16 code units)
```

---

## 🌐 Locale Detection & Discovery

```js
// Get current system locale
navigator.language;        // "en-US"
navigator.languages;       // ["en-US", "en", "hi"]  (preferred order)

// Intl.Locale — parse and manipulate locale strings
const locale = new Intl.Locale("en-US-u-hc-h12");
locale.language;      // "en"
locale.region;        // "US"
locale.hourCycle;     // "h12"

// Check supported locales
Intl.DateTimeFormat.supportedLocalesOf(["en-US", "xx-INVALID"]);  // ["en-US"]

// Get locale from resolved options
new Intl.DateTimeFormat().resolvedOptions().locale;   // "en-US"
new Intl.DateTimeFormat().resolvedOptions().timeZone; // "Asia/Kolkata"

// Canonical form
new Intl.Locale("EN_us").maximize().toString();  // "en-Latn-US"
```

---

## 🔑 Key Takeaways

- **`Intl.NumberFormat`** — numbers, currencies, percents, units, compact notation.
- **`Intl.DateTimeFormat`** — locale-aware date/time with timezones; supports `formatRange`.
- **`Intl.RelativeTimeFormat`** — "3 days ago", "in 2 hours", automatically localized.
- **`Intl.Collator`** — correct locale-aware sort; supports numeric and case-insensitive modes.
- **`Intl.PluralRules`** — determine singular/plural/ordinal form per locale.
- **`Intl.ListFormat`** — "Alice, Bob, and Carol" with conjunction/disjunction support.
- **`Intl.Segmenter`** — correctly split emoji-heavy text into graphemes, words, or sentences.
- Reuse `Intl.*` instances — construction is expensive; `.format()` is cheap.

---

[← Previous: Date & Time](19-date-and-time.md) | [Contents](README.md) | [Next: The Event Loop & Callbacks →](21-event-loop-and-callbacks.md)

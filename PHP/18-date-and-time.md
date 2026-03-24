# 18: Date & Time

## 📅 DateTimeImmutable (Recommended)

`DateTimeImmutable` is the modern, preferred date class in PHP. Its methods (`modify()`, `add()`, `sub()`, `setTimezone()`) return **new instances** instead of mutating the original, making it safe to use in functional-style code and preventing accidental side effects when the same variable is referenced in multiple places.

```php
<?php
declare(strict_types=1);

// DateTimeImmutable — methods return new instances (safe, no mutation)
$now  = new DateTimeImmutable();
$date = new DateTimeImmutable('2025-03-24');
$dt   = new DateTimeImmutable('2025-03-24 14:30:00');

// From Unix timestamp
$ts   = new DateTimeImmutable('@1711310400');

// With timezone
$paris = new DateTimeImmutable('now', new DateTimeZone('Europe/Paris'));
$utc   = new DateTimeImmutable('now', new DateTimeZone('UTC'));

// Immutable — original unchanged
$tomorrow = $now->modify('+1 day');   // $now is unchanged!
```

---

## 🔧 DateTime (Mutable, legacy)

`DateTime` is the **mutable** predecessor to `DateTimeImmutable`. Its methods modify the object in place, which can lead to subtle bugs when the same variable is shared. **Prefer `DateTimeImmutable` for all new code**. Use `DateTime` only when working with older code that requires it.

```php
// DateTime — mutable (modify() changes the object in place)
$d = new DateTime('2025-03-24');
$d->modify('+1 month');   // $d is now changed
// Use DateTimeImmutable for functional style
```

---

## 🎨 Formatting Dates

`format()` converts a date object to a string using single-character tokens. Common tokens: `Y` (4-digit year), `m` (month 01-12), `d` (day 01-31), `H:i:s` (24-hour time). Use the predefined constants like `DateTimeInterface::ATOM` for standard interchange formats instead of hand-writing the format string.

```php
$dt = new DateTimeImmutable('2025-03-24 14:30:45');

echo $dt->format('Y-m-d');           // 2025-03-24
echo $dt->format('d/m/Y');           // 24/03/2025
echo $dt->format('D, d M Y');        // Mon, 24 Mar 2025
echo $dt->format('l, F j, Y');       // Monday, March 24, 2025
echo $dt->format('H:i:s');           // 14:30:45
echo $dt->format('h:i A');           // 02:30 PM
echo $dt->format('g:ia');            // 2:30pm
echo $dt->format('U');               // Unix timestamp: 1711294245
echo $dt->format('c');               // ISO 8601: 2025-03-24T14:30:45+00:00
echo $dt->format('r');               // RFC 2822: Mon, 24 Mar 2025 14:30:45 +0000
echo $dt->format('Y-m-d\TH:i:sP');  // ISO 8601 manual

// Common format constants
DateTimeInterface::ATOM;    // Y-m-d\TH:i:sP
DateTimeInterface::ISO8601; // Y-m-d\TH:i:sO
DateTimeInterface::RFC3339; // Y-m-d\TH:i:sP
DateTimeInterface::RSS;     // D, d M Y H:i:s O
```

### Format Reference

| Token | Meaning | Example |
|-------|---------|---------|
| `Y` | 4-digit year | 2025 |
| `y` | 2-digit year | 25 |
| `m` | Month (01–12) | 03 |
| `n` | Month (1–12) | 3 |
| `M` | Month abbrev | Mar |
| `F` | Month full | March |
| `d` | Day (01–31) | 24 |
| `j` | Day (1–31) | 24 |
| `D` | Weekday abbrev | Mon |
| `l` | Weekday full | Monday |
| `N` | Day of week (1=Mon,7=Sun) | 1 |
| `H` | Hour 24h (00–23) | 14 |
| `h` | Hour 12h (01–12) | 02 |
| `g` | Hour 12h (1–12) | 2 |
| `i` | Minutes (00–59) | 30 |
| `s` | Seconds (00–59) | 45 |
| `A` | AM/PM | PM |
| `a` | am/pm | pm |
| `U` | Unix timestamp | 1711294245 |
| `W` | ISO week number | 13 |
| `t` | Days in month | 31 |
| `L` | Leap year (0/1) | 0 |

---

## ➕ Arithmetic with DateInterval

`DateInterval` represents a duration (e.g. `P1Y2M3DT4H` = 1 year, 2 months, 3 days, 4 hours). Use `add()` and `sub()` on a `DateTimeImmutable` to calculate future or past dates. The `diff()` method computes the interval between two dates, giving you the total days and individual components.

```php
$now = new DateTimeImmutable();

// modify() with string
$tomorrow  = $now->modify('+1 day');
$nextMonth = $now->modify('+1 month');
$lastYear  = $now->modify('-1 year');
$nextWeek  = $now->modify('next Monday');
$endOfDay  = $now->setTime(23, 59, 59);

// DateInterval
$interval  = new DateInterval('P1Y2M3DT4H5M6S');
// P=Period, Y,M,D=date parts, T=time separator, H,M,S=time parts
$future    = $now->add($interval);
$past      = $now->sub(new DateInterval('P30D'));  // minus 30 days

// diff — get interval between two dates
$start = new DateTimeImmutable('2025-01-01');
$end   = new DateTimeImmutable('2025-03-24');
$diff  = $start->diff($end);

echo $diff->days;    // 82 (total days)
echo $diff->m;       // 2  (months component)
echo $diff->d;       // 23 (remaining days)
echo $diff->format('%a days, %h hours');   // "82 days, 0 hours"
```

---

## 📆 DatePeriod — Ranges

`DatePeriod` generates a sequence of dates separated by a fixed `DateInterval`. It's perfect for generating calendar grids, billing cycles, weekly recurring events, or any time-series where you need every Nth date between two points.

```php
// Generate every Monday for 10 weeks
$start  = new DateTimeImmutable('2025-03-24');
$end    = new DateTimeImmutable('2025-06-02');
$period = new DatePeriod(
    $start,
    new DateInterval('P7D'),   // 1 week interval
    $end
);

foreach ($period as $date) {
    echo $date->format('Y-m-d') . "\n";
}

// Generate every month for 6 months
$period = new DatePeriod(
    new DateTimeImmutable('2025-01-01'),
    new DateInterval('P1M'),
    6    // number of recurrences (not end date)
);
foreach ($period as $month) {
    echo $month->format('F Y') . "\n";
}
```

---

## 🌍 Timezones

Always create dates with an **explicit timezone** — never rely on the server's default `date.timezone` setting, which differs between environments. Store timestamps as UTC in the database and convert to the user's local timezone only for display. `setTimezone()` returns a new `DateTimeImmutable` in the target timezone.

```php
// List all zones
$zones = DateTimeZone::listIdentifiers();
// [..., "America/New_York", "Europe/London", "Asia/Tokyo", ...]

// Create with timezone
$tz  = new DateTimeZone('America/New_York');
$nyc = new DateTimeImmutable('now', $tz);

// Convert timezone
$utc    = new DateTimeImmutable('2025-03-24 12:00:00', new DateTimeZone('UTC'));
$tokyo  = $utc->setTimezone(new DateTimeZone('Asia/Tokyo'));

echo $utc->format('H:i');    // 12:00 (UTC)
echo $tokyo->format('H:i');  // 21:00 (UTC+9)

// Offset info
$offset = $tz->getOffset(new DateTimeImmutable());  // seconds offset from UTC
```

---

## 🔍 Parsing Dates

`DateTimeImmutable::createFromFormat()` parses a date string with a custom format string — use it whenever the input format is known (e.g. form input `dd/mm/yyyy`). The legacy `strtotime()` parses natural-language expressions like `"next Friday"` and returns a Unix timestamp. Both return `false` on failure, so always check the result.

```php
// createFromFormat — parse non-standard date strings
$d = DateTimeImmutable::createFromFormat('d/m/Y', '24/03/2025');
$d = DateTimeImmutable::createFromFormat('d-M-y', '24-Mar-25');
$d = DateTimeImmutable::createFromFormat('U', '1711294245');  // from timestamp

if ($d === false) {
    $errors = DateTimeImmutable::getLastErrors();
    print_r($errors);
}

// strtotime — parse English date strings (legacy, but handy)
$ts = strtotime('next Friday');
$ts = strtotime('+2 weeks');
$ts = strtotime('last day of this month');
$d  = new DateTimeImmutable('@' . strtotime('next Monday'));

// date_parse — parse to components
$parts = date_parse('2025-03-24 14:30:00');
// ['year'=>2025,'month'=>3,'day'=>24,'hour'=>14,'minute'=>30,'second'=>0]
```

---

## ⚙️ Procedural date() (Legacy Style)

The procedural functions (`date()`, `time()`, `mktime()`, `strtotime()`) are PHP's original date API. They operate on **Unix timestamps** (integers) rather than objects. They are still widely used in legacy codebases and for quick one-off tasks, but prefer `DateTimeImmutable` for anything involving arithmetic, timezones, or application logic.

```php
// time() — current Unix timestamp
$ts = time();        // e.g., 1711294245

// date() — format timestamp
echo date('Y-m-d');                    // current date
echo date('Y-m-d H:i:s', $ts);       // formatted
echo date('Y-m-d', strtotime('+1 week'));

// mktime — create timestamp from components
$ts = mktime(14, 30, 0, 3, 24, 2025);  // h, min, sec, month, day, year
echo date('Y-m-d H:i:s', $ts);  // 2025-03-24 14:30:00

// checkdate — validate a date
checkdate(2, 29, 2024);  // true  (2024 is leap year)
checkdate(2, 29, 2025);  // false
checkdate(13, 1, 2025);  // false (invalid month)
```

---

## 📋 Date & Time Quick Reference

| Task | Code |
|------|------|
| Current datetime | `new DateTimeImmutable()` |
| Specific date | `new DateTimeImmutable('2025-03-24')` |
| Parse custom format | `DateTimeImmutable::createFromFormat('d/m/Y', ...)` |
| Format | `$dt->format('Y-m-d H:i:s')` |
| Add interval | `$dt->modify('+7 days')` or `$dt->add(new DateInterval('P7D'))` |
| Subtract | `$dt->modify('-1 month')` |
| Diff | `$a->diff($b)->days` |
| Timezone convert | `$dt->setTimezone(new DateTimeZone('UTC'))` |
| Unix timestamp | `$dt->getTimestamp()` |
| From timestamp | `new DateTimeImmutable('@' . $ts)` |
| Date range | `new DatePeriod($start, $interval, $end)` |


---

[← Previous: Regular Expressions](17-regex.md) | [Contents](README.md) | [Next: JSON & REST APIs →](19-json-and-apis.md)

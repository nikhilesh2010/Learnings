# 33: Regular Expressions

## 📝 Creating RegEx

Use the literal syntax (`/pattern/flags`) for static patterns — it's compiled at load time and more readable. Use the `RegExp` constructor when you need to build a pattern dynamically from a string variable.

```js
// Literal syntax (preferred — compiled at load time)
const re = /hello/;
const re2 = /hello/gi;   // with flags

// Constructor (for dynamic patterns)
const pattern = "hello";
const re3 = new RegExp(pattern, "gi");
const re4 = new RegExp(`^${pattern}$`, "i");  // template literal
```

---

## 🚩 Flags

| Flag | Name | Description |
|---|---|---|
| `g` | global | Find all matches (not just first) |
| `i` | case insensitive | Ignore case |
| `m` | multiline | `^`/`$` match start/end of each line |
| `s` | dotAll | `.` matches `\n` too |
| `u` | unicode | Enable full Unicode support |
| `v` | unicodeSets | Advanced Unicode (ES2024) |
| `d` | hasIndices | Include start/end indices in results |
| `y` | sticky | Match at exact `lastIndex` position |

---

## 🔡 Character Classes

Character class shortcuts like `\d`, `\w`, and `\s` match broad categories of characters. Use `[...]` to define a custom set, `[^...]` for exclusion, and `[a-z]` for ranges. Uppercase versions (`\D`, `\W`, `\S`) match the complement.

```
.       any char (except \n without s flag)
\d      digit [0-9]
\D      non-digit
\w      word char [a-zA-Z0-9_]
\W      non-word char
\s      whitespace (\t, \n, \r, space)
\S      non-whitespace
\b      word boundary
\B      non-word boundary
\t      tab
\n      newline
\r      carriage return

[abc]   one of: a, b, c
[^abc]  any except: a, b, c
[a-z]   range
[a-zA-Z0-9]  alphanumeric
```

---

## 🔢 Quantifiers

Quantifiers control how many times the preceding element matches. Greedy quantifiers match as much as possible by default; add `?` after any quantifier to make it lazy (match as little as possible), which prevents over-matching in patterns like `<.*>`.

```
*       0 or more  (greedy)
+       1 or more  (greedy)
?       0 or 1     (greedy)
{n}     exactly n
{n,}    n or more
{n,m}   between n and m (inclusive)

*?      0 or more  (lazy — match as few as possible)
+?      1 or more  (lazy)
??      0 or 1     (lazy)
{n,m}?  lazy range

// Greedy vs lazy
"<a><b><c>".match(/<.*>/)[0];   // "<a><b><c>" (greedy — as much as possible)
"<a><b><c>".match(/<.*?>/)[0];  // "<a>"       (lazy — as little as possible)
```

---

## ⚓ Anchors

Anchors assert a position rather than matching a character. `^` matches the start and `$` the end of the string (or of each line with the `m` flag). `\b` matches a word boundary, ensuring a pattern only matches whole words.

```
^       start of string (or line with m flag)
$       end of string (or line with m flag)
\b      word boundary
\B      non-word boundary
\A      start of string (not in JS — use ^)
\Z      end of string (not in JS — use $)

/^\d{5}$/.test("12345");      // true  — exactly 5 digits
/^\d{5}$/.test("123456");     // false — anchors enforce full match
/\bhello\b/.test("hello");    // true
/\bhello\b/.test("helloway"); // false — not a word boundary
```

---

## 🪣 Groups & Capturing

Capturing groups `(...)` let you extract parts of a match by index. Named groups `(?<name>...)` make extracted values accessible as properties on the result's `.groups` object. Non-capturing groups `(?:...)` group without capturing, and backreferences `\1` / `\k<name>` match the same text again.

```js
// Capturing group — ( )
const match = "2024-03-15".match(/(\d{4})-(\d{2})-(\d{2})/);
match[0];  // "2024-03-15"  (full match)
match[1];  // "2024"        (group 1)
match[2];  // "03"          (group 2)
match[3];  // "15"          (group 3)

// Named capturing group — (?<name>)
const { year, month, day } =
  "2024-03-15".match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)?.groups ?? {};

// Non-capturing group — (?:)
"color colour".match(/colou?r/g);        // ["color", "colour"]
"foobar foobaz".match(/foo(?:bar|baz)/g); // groups but doesn't capture

// Backreferences — \n or \k<name>
/(.)\1/.test("aa");      // true  — same char twice
/(.)\1/.test("ab");      // false
/(?<ch>.)\k<ch>/.test("aa"); // true — named backreference
```

---

## 👀 Lookahead & Lookbehind

Lookaheads `(?=...)` and lookbehinds `(?<=...)` assert that a pattern is (or isn't) present without consuming characters in the match. They're zero-width assertions — the matched text doesn't include them, so they're ideal for context-sensitive patterns like extracting numbers preceded by `$`.

```js
// Positive lookahead — (?=...) — match X followed by Y
/\d+(?= dollars)/.exec("100 dollars")[0]; // "100"
/\d+(?= dollars)/.exec("100 euros");       // null

// Negative lookahead — (?!...)
/\d+(?! dollars)/.exec("100 euros")[0];    // "100"
/\d+(?! dollars)/.exec("100 dollars");     // null

// Positive lookbehind — (?<=...) — match X preceded by Y
/(?<=\$)\d+/.exec("Price: $99")[0];  // "99"

// Negative lookbehind — (?<!...)
/(?<!\$)\d+/.exec("Total: 42")[0];   // "42"
/(?<!\$)\d+/.exec("Price: $99");      // null (preceded by $)

// Lookaheads don't consume — zero-width assertions
"foobar".replace(/foo(?=bar)/, "baz"); // "bazbar" (bar remains)
```

---

## 🔧 RegEx Methods

Use `re.test()` for a quick boolean check, `re.exec()` when you need the full match object and want to iterate all matches with a `g`-flagged regex. For string operations, `str.match()`, `str.matchAll()`, `str.replace()`, and `str.split()` all accept regular expressions.

```js
const str = "Hello World hello world";
const re  = /hello/gi;

// test — returns boolean
re.test(str);   // true

// exec — returns match array or null, advances lastIndex with g flag
let match;
while ((match = re.exec(str)) !== null) {
  console.log(match[0], "at index", match.index);
}

// String methods with regex
str.match(/hello/gi);        // ["Hello", "hello"]  (all with g flag)
str.match(/hello/i);         // ["Hello"] + groups  (no g — detailed result)

str.matchAll(/hello/gi);     // iterator of all detailed matches
[...str.matchAll(/hello/gi)].map(m => ({ text: m[0], index: m.index }));

str.search(/world/i);        // 6 (index of first match, or -1)

str.replace(/hello/gi, "Hi");  // "Hi World Hi world"
str.replace(/(\w+)\s(\w+)/, "$2 $1");  // "World Hello hello world" (swap)
str.replace(/(?<first>\w+)\s(?<last>\w+)/, "$<last> $<first>"); // named groups

str.replaceAll(/hello/gi, "Hi");  // same as g-flagged replace

str.split(/\s+/);  // ["Hello", "World", "hello", "world"]
str.split(/(\s+)/);  // includes separator in result: ["Hello"," ","World"...]
```

---

## 📚 Common Patterns

Battled-tested regex patterns for everyday validation tasks: email addresses, URLs, IPv4, US phone numbers, hex colors, strong passwords, slugs, and ISO dates. Use `str.replace(/\s+/g, " ").trim()` to normalize whitespace.

```js
// Email (simplified)
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL
const url = /^https?:\/\/[\w.-]+(?:\/[\w./?=&%-]*)?$/;

// IPv4
const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;

// Phone (US)
const phone = /^\+?1?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// Hex color
const hex = /^#([a-f\d]{3}|[a-f\d]{6})$/i;

// Strong password (8+ chars, uppercase, lowercase, digit, special)
const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Slug
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ISO date
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

// Remove extra whitespace
str.replace(/\s+/g, " ").trim();

// Extract all numbers
"abc 123 def 456".match(/\d+/g);  // ["123", "456"]

// Validate only digits
/^\d+$/.test("12345");   // true
/^\d+$/.test("123a5");   // false
```

---

## ⚙️ Advanced Features

The `y` (sticky) flag anchors matches to a specific `lastIndex` position, useful for tokenizing. The `u` flag enables proper Unicode and `\p{}` Unicode property escapes. The `d` flag adds start/end indices to match results. Always use `escapeRegex()` to sanitize user input before building a dynamic `RegExp`.

```js
// sticky flag — match must start at lastIndex
const re = /\d+/y;
re.lastIndex = 5;
re.exec("abc  123 456");  // null — no digit at exactly index 5
re.lastIndex = 5;
re.exec("abc  123 456");  // tries at index 5

// Unicode flag u
/\u{1F600}/u.test("😀");   // true (emoji as Unicode code point)
/^\p{Letter}+$/u.test("Héllo"); // true — Unicode letter property

// d flag — indices
const m = "test string".match(/(?<word>\w+)/d);
m.indices[0];         // [0, 4]
m.indices.groups.word; // [0, 4]

// RegExp.escape (proposal — not yet standard, use library)
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const userInput = "3.14";
new RegExp(escapeRegex(userInput));  // /3\.14/ — treats . as literal dot
```

---

## 🔑 Key Takeaways

- `\d` = digit, `\w` = word char, `\s` = whitespace; uppercase = negation.
- `g` flag: find all matches; without `g`, match stops at first.
- Use named capture groups `(?<name>...)` for readable destructuring.
- Lookaheads `(?=...)` / lookbehinds `(?<=...)` are zero-width — they don't consume.
- `str.matchAll(re)` needs the `g` flag and returns an iterator of full match objects.
- Always escape user input with `escapeRegex()` before inserting into a `new RegExp`.
- Lazy quantifiers `*?`, `+?` prevent over-matching (greedy) by default.
- `u` flag enables proper Unicode handling for emoji and non-ASCII characters.

---

[← Previous: Error Handling](38-error-handling.md) | [Contents](README.md) | [Next: Performance Optimization →](40-performance.md)

# 07: Arrays

## 📦 Creating Arrays

PHP arrays are **ordered maps** — they can function as a list (integer-indexed), a dictionary (string-indexed), or a mix of both. Arrays grow and shrink dynamically and can hold mixed types. The short `[]` syntax is preferred over the older `array()` function syntax.

```php
<?php
// Indexed array (auto-increments from 0)
$fruits = ["apple", "banana", "cherry"];
$nums   = [10, 20, 30];

// Associative array
$person = [
    "name" => "Alice",
    "age"  => 30,
    "city" => "Paris",
];

// Old array() syntax (still valid)
$colors = array("red", "green", "blue");

// Empty array
$empty = [];

// Mixed keys
$mixed = [
    0     => "first",
    "key" => "value",
    1     => "second",
];
```

---

## 🔑 Accessing Elements

Array elements are accessed with `$array[key]`. For indexed arrays the key is an integer; for associative arrays it is a string. Accessing a non-existent key returns `null` and emits a warning — use the null coalescing operator `??` to safely provide a default value.

```php
$fruits = ["apple", "banana", "cherry"];
$person = ["name" => "Alice", "age" => 30];

echo $fruits[0];        // apple
echo $fruits[2];        // cherry
echo $person["name"];   // Alice

// Nested arrays
$matrix = [[1, 2, 3], [4, 5, 6]];
echo $matrix[1][2];     // 6

$users = [
    ["id" => 1, "name" => "Alice"],
    ["id" => 2, "name" => "Bob"],
];
echo $users[0]["name"];  // Alice

// Null-safe access (PHP 8+)
$val = $arr["key"] ?? "default";

// Accessing undefined key
echo $arr["missing"] ?? null;  // null — no error
```

---

## ➕ Adding & Modifying

Append to an indexed array with `$arr[] = value` — PHP auto-assigns the next integer key. `array_push()` appends multiple values in one call. `array_unshift()` inserts at the beginning. The union operator `+` merges two arrays but keeps the left array's values on key conflicts.

```php
$arr = ["a", "b", "c"];

// Append
$arr[] = "d";              // $arr = ["a","b","c","d"]
array_push($arr, "e", "f"); // append multiple

// Prepend
array_unshift($arr, "z");   // insert at beginning

// Modify
$arr[0] = "A";

// Add to associative
$person = ["name" => "Alice"];
$person["age"] = 30;
$person["email"] = "alice@example.com";

// Merge arrays
$a = [1, 2, 3];
$b = [4, 5, 6];
$merged = array_merge($a, $b);   // [1,2,3,4,5,6]
$spread = [...$a, ...$b];         // [1,2,3,4,5,6] (PHP 7.4+)

// Union operator (for associative — keeps left keys)
$defaults = ["color" => "blue", "size" => "M"];
$custom   = ["color" => "red"];
$result   = $custom + $defaults;   // ["color"=>"red","size"=>"M"]
```

---

## ➖ Removing Elements

`array_pop()` removes and returns the last element; `array_shift()` removes the first. `unset($arr[$key])` removes by key but **does not re-index** the remaining elements — leaving integer gaps. Call `array_values()` afterwards to reset keys to a contiguous zero-based sequence.

```php
$arr = ["a", "b", "c", "d"];

// Remove last
$last = array_pop($arr);    // returns "d", $arr = ["a","b","c"]

// Remove first
$first = array_shift($arr); // returns "a", $arr = ["b","c"]

// Remove by key
unset($arr[1]);   // removes index 1, DOES NOT re-index!
// $arr = [0=>"b", 2=>"c"]  — gap in indices

// Re-index after unset
$arr = array_values($arr);  // [0=>"b", 1=>"c"]

// Remove by value (find index first)
$key = array_search("c", $arr);
if ($key !== false) unset($arr[$key]);
```

---

## 🔁 Iterating Arrays

`foreach` is the standard way to iterate arrays in PHP. Use `as $value` for values only, or `as $key => $value` for both. To **modify** elements in-place, prefix with `&` (`&$value`) — always call `unset($value)` after the loop to break the reference binding and prevent accidental mutations later.

```php
$fruits = ["apple", "banana", "cherry"];
$person = ["name" => "Alice", "age" => 30];

// foreach — most common
foreach ($fruits as $fruit) {
    echo $fruit . "\n";
}

foreach ($person as $key => $value) {
    echo "$key: $value\n";
}

// Modify with reference
foreach ($fruits as &$fruit) {
    $fruit = strtoupper($fruit);
}
unset($fruit);   // ← always unset reference!

// array_walk — apply callback to each element
array_walk($person, function(&$value, $key) {
    $value = strtoupper((string)$value);
});
```

---

## 🔍 Searching Arrays

`in_array()` checks whether a value exists (pass `true` as the third argument for strict type-safe checking). `array_search()` returns the **key** of the first matching value, or `false` if not found. Use `array_key_exists()` instead of `isset()` when a key could legitimately hold a `null` value.

```php
$arr = [10, 20, 30, 20, 40];

// in_array — check if value exists (loose by default)
in_array(20, $arr);          // true
in_array("20", $arr);        // true  (loose)
in_array("20", $arr, true);  // false (strict — different type)

// array_search — returns key of first match (or false)
$key = array_search(30, $arr);  // 2
$key = array_search(99, $arr);  // false

// isset — check if key exists and not null
isset($arr[2]);                // true
isset($person["missing"]);     // false

// array_key_exists — check key existence (even if value is null)
array_key_exists("name", $person);  // true
isset($arr[99]);                    // false
```

---

## 📊 Sorting Arrays

PHP has many sort functions. `sort()`/`rsort()` sort by value and **reset integer keys**. `asort()`/`arsort()` sort by value and **preserve keys**. `ksort()`/`krsort()` sort by key. `usort()` accepts a custom comparison callback. `natsort()` uses natural order so `"file10"` sorts after `"file2"`.

```php
$nums = [3, 1, 4, 1, 5, 9, 2, 6];

// sort — ascending, loses keys
sort($nums);
print_r($nums);   // [1,1,2,3,4,5,6,9]

// rsort — descending
rsort($nums);

// asort — sort by value, preserve keys
$scores = ["Alice" => 85, "Bob" => 72, "Carol" => 90];
asort($scores);   // sorted by value, keys kept

// arsort — sort by value descending, preserve keys
arsort($scores);

// ksort — sort by key
ksort($scores);   // alphabetical by key

// krsort — sort by key descending
krsort($scores);

// usort — custom sort function (doesn't preserve keys)
$people = [
    ["name" => "Bob",   "age" => 25],
    ["name" => "Alice", "age" => 30],
    ["name" => "Carol", "age" => 22],
];
usort($people, fn($a, $b) => $a["age"] <=> $b["age"]);

// uasort — custom sort, preserve keys
// uksort — custom sort by keys

// natsort — natural order sort ("file10" > "file2")
$files = ["file10.txt", "file2.txt", "file1.txt"];
natsort($files);   // file1.txt, file2.txt, file10.txt

// natcasesort — case-insensitive natural sort
natcasesort($files);
```

---

## 🗂️ Array Transformation

Transformation functions produce a **new array** from an existing one without mutating the original. `array_map()` applies a callback to every element. `array_filter()` keeps only elements matching a predicate (truthy by default). `array_reduce()` folds the entire array into a single value such as a sum, product, or a new structure.

```php
$nums = [1, 2, 3, 4, 5];
$people = [["name" => "Alice", "age" => 30], ["name" => "Bob", "age" => 25]];

// array_map — transform each element
$doubled = array_map(fn($n) => $n * 2, $nums);  // [2,4,6,8,10]

// array_map with multiple arrays
$sums = array_map(fn($a, $b) => $a + $b, [1,2,3], [10,20,30]); // [11,22,33]

// array_filter — keep elements matching predicate
$evens = array_filter($nums, fn($n) => $n % 2 === 0);  // [2=>2, 4=>4]
$evens = array_values($evens);  // re-index → [2, 4]

// filter without callback — removes falsy values
$clean = array_filter([0, 1, "", "a", null, false, true]);  // [1, "a", true]

// array_reduce — fold array into single value
$sum     = array_reduce($nums, fn($carry, $n) => $carry + $n, 0);  // 15
$product = array_reduce($nums, fn($carry, $n) => $carry * $n, 1);  // 120

// array_column — extract a column from 2D array
$names = array_column($people, "name");   // ["Alice", "Bob"]
$indexed = array_column($people, null, "name");  // keyed by name

// array_flip — swap keys and values
$arr = ["a" => 1, "b" => 2, "c" => 3];
array_flip($arr);   // [1 => "a", 2 => "b", 3 => "c"]

// array_reverse
array_reverse([1,2,3,4]);         // [4,3,2,1]
array_reverse([1,2,3,4], true);   // preserve keys
```

---

## ✂️ Slicing & Splicing

`array_slice()` extracts a portion of an array as a new array without modifying the original. `array_splice()` removes elements and optionally inserts replacements **in-place** — like cut-and-insert. `array_chunk()` splits a large array into fixed-size pieces, useful for pagination and batch processing.

```php
$arr = [10, 20, 30, 40, 50];

// array_slice(array, offset, length, preserve_keys)
array_slice($arr, 2);         // [30,40,50]
array_slice($arr, 1, 3);      // [20,30,40]
array_slice($arr, -2);        // [40,50]
array_slice($arr, 1, 3, true); // [1=>20,2=>30,3=>40] preserve keys

// array_splice — remove & optionally replace
// array_splice(array, offset, length, replacement)
$removed = array_splice($arr, 1, 2);  // removes 20,30 → $arr=[10,40,50]
array_splice($arr, 1, 0, [99, 98]);   // insert at index 1 without removing

// array_chunk — split into chunks
array_chunk([1,2,3,4,5], 2);         // [[1,2],[3,4],[5]]
array_chunk([1,2,3,4,5], 2, true);   // preserve keys
```

---

## 🧮 Array Math & Stats

PHP provides built-in functions for common statistical operations on numeric arrays: `count()`, `array_sum()`, `array_product()`, `min()`, `max()`, and `array_unique()` (removes duplicates). `range()` generates a sequential array of numbers or letters in a single call.

```php
$nums = [3, 1, 4, 1, 5, 9, 2, 6];

echo count($nums);          // 8
echo array_sum($nums);      // 31
echo array_product([1,2,3,4,5]);  // 120
echo min($nums);            // 1
echo max($nums);            // 9

// Unique values
$unique = array_unique([1,2,2,3,3,4]);  // [1,2,3,4]

// Count occurrences of each value
$counts = array_count_values(["a","b","a","c","b","a"]);
// ["a"=>3, "b"=>2, "c"=>1]

// Range
$range = range(1, 5);        // [1,2,3,4,5]
$chars = range('a', 'e');    // ['a','b','c','d','e']
range(0, 1, 0.1);            // [0.0, 0.1, 0.2, ..., 1.0]
```

---

## 🔗 Array Set Operations

PHP implements **set theory** operations on arrays. `array_intersect()` finds values common to all arrays (intersection). `array_diff()` finds values in the first array not present in the others (difference). `array_combine()` creates an associative array by pairing a keys array with a values array.

```php
$a = [1, 2, 3, 4, 5];
$b = [3, 4, 5, 6, 7];

// Intersect — elements in both arrays
array_intersect($a, $b);        // [3,4,5]
array_intersect_key($a, $b);    // intersect by keys

// Diff — elements in $a but not in $b
array_diff($a, $b);        // [1,2]
array_diff_key($a, $b);    // diff by keys

// Combine two arrays into key=>value pairs
$keys   = ["name", "age", "city"];
$values = ["Alice", 30, "Paris"];
$combined = array_combine($keys, $values);
// ["name"=>"Alice","age"=>30,"city"=>"Paris"]

// Zip (via array_map with null)
$a = [1,2,3];
$b = ['a','b','c'];
$zipped = array_map(null, $a, $b);
// [[1,'a'],[2,'b'],[3,'c']]
```

---

## 🎲 Randomizing & Filling

`shuffle()` randomises array order in-place (resetting integer keys). `array_rand()` picks one or more random keys. `array_fill()` and `array_fill_keys()` create arrays pre-populated with a given value. `compact()` builds an associative array from variable names; `extract()` does the reverse (use with caution as it injects variables into local scope).

```php
$arr = [1, 2, 3, 4, 5];

// Shuffle
shuffle($arr);   // random order, reindexes

// Random key(s)
$key  = array_rand($arr);          // one random key
$keys = array_rand($arr, 2);       // array of 2 random keys

// array_fill — fill with a value
array_fill(0, 5, "x");             // ["x","x","x","x","x"]
array_fill_keys(["a","b","c"], 0); // ["a"=>0,"b"=>0,"c"=>0]

// compact & extract
$name = "Alice";
$age  = 30;
$data = compact("name", "age");  // ["name"=>"Alice","age"=>30]

extract($data);   // Creates $name and $age in current scope ⚠️ use carefully
```

---

## 📋 Array Quick Reference

| Function | Purpose |
|----------|---------|
| `count()` | Number of elements |
| `array_push/pop()` | Add/remove from end |
| `array_unshift/shift()` | Add/remove from start |
| `array_merge()` | Merge arrays |
| `array_slice()` | Extract portion |
| `array_splice()` | Remove/insert in place |
| `array_search()` | Find key by value |
| `in_array()` | Check if value exists |
| `array_key_exists()` | Check if key exists |
| `array_map()` | Transform elements |
| `array_filter()` | Filter elements |
| `array_reduce()` | Fold into single value |
| `array_column()` | Extract column from 2D |
| `sort/rsort()` | Sort (indexed) |
| `asort/arsort()` | Sort by value, keep keys |
| `ksort/krsort()` | Sort by key |
| `usort()` | Custom sort |
| `array_unique()` | Remove duplicates |
| `array_flip()` | Swap keys & values |
| `array_combine()` | Create key→value pairs |
| `array_diff/intersect()` | Set operations |


---

[← Previous: Strings](06-strings.md) | [Contents](README.md) | [Next: Object-Oriented Programming →](08-oop.md)

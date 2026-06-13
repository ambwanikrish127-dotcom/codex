# ⚡ CodeArena — DSA Practice Platform

An interactive coding-practice site where you solve **Data Structures & Algorithms** problems in the browser and get instant pass/fail feedback. Built with **plain HTML, CSS, and JavaScript** — no frameworks, no backend.

## Features

- 10 DSA problems (Easy / Medium / Hard)
- Built-in JavaScript code editor with starter code
- **Run tests** button validates your solution against multiple test cases
- Marks problems **Solved** and tracks progress (saved in localStorage)
- **Search** by name/category and **filter** by difficulty
- Dark theme, responsive layout

## Tech Stack

- **HTML5**, **CSS3**, **Vanilla JavaScript**
- `new Function()` to execute the code you type
- **localStorage** to remember which problems you solved

## How to Run

1. Download or clone this folder.
2. Double-click `index.html`.
3. Pick a problem → write your solution → click **Run tests**.

## Project Structure

```
smart-code-platform/
├── index.html    → structure: list page + solve page
├── style.css     → dark theme styling
├── problems.js   → the 10 problems + their test cases
├── app.js        → list, filter, code runner, progress
└── README.md
```

## How the code runner works (the interesting part)

1. You type a function in the editor (e.g. `function twoSum(nums, target) {...}`).
2. `new Function(yourCode + "return twoSum;")()` turns that text into a real,
   callable function.
3. Each problem in `problems.js` has a `testRunner` that calls your function
   with sample inputs and compares the result to the expected output using
   `JSON.stringify` (so arrays/objects compare correctly).
4. If every test passes, the problem is marked **Solved** in localStorage.

## Key Concepts Used

- Dynamic DOM rendering with template strings
- `new Function()` to run user-submitted code
- Test-case validation (expected vs actual)
- `localStorage` for persistence
- Array methods: `filter`, `map`, `every`, `find`
- Simple single-page navigation (show/hide sections)

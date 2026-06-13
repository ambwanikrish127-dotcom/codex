/* ===================================================================
   CodeArena — app.js   (plain JavaScript, no libraries)

   What it does:
   - Shows a list of DSA problems (data comes from problems.js -> PROBLEMS).
   - Lets you open a problem, write JavaScript, and run it against test cases.
   - Marks a problem "solved" when all tests pass, saved in localStorage.
   =================================================================== */

/* ---------- SAFE STORAGE ----------
   localStorage can THROW when a page is opened as a local file. If we don't
   catch it, the whole script crashes and the problem list never appears.
   So we wrap every storage call in try/catch with a safe fallback. */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
};

/* ---------- STATE ---------- */
// submissions looks like: { "1": { solved: true }, "3": { solved: true } }
let submissions = store.get("submissions", {});
let currentProblem = null; // the problem object currently open

const $ = (id) => document.getElementById(id);

function save() {
  store.set("submissions", submissions);
  // Dispatch custom event to notify React component of updates
  window.dispatchEvent(new CustomEvent("submissions-updated", { detail: submissions }));
}

function resetSubmissions() {
  submissions = {};
  save();
  renderList();
}

/* ---------- PAGE SWITCHING ---------- */
function showPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  $("page-" + name).classList.remove("hidden");
}
function goBack() {
  showPage("list");
  renderList(); // refresh in case we just solved something
}

/* ---------- PROBLEM LIST ---------- */
function renderList() {
  const search = $("search-input").value.toLowerCase();
  const diff = $("difficulty-filter").value;

  // filter by search text AND difficulty
  const list = PROBLEMS.filter((p) => {
    const matchText =
      p.title.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search);
    const matchDiff = diff === "All" || p.difficulty === diff;
    return matchText && matchDiff;
  });

  const body = $("problem-table-body");

  if (list.length === 0) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#8b949e;padding:24px">No problems found.</td></tr>`;
  } else {
    body.innerHTML = list
      .map((p) => {
        const solved = submissions[p.id] && submissions[p.id].solved;
        return `
        <tr>
          <td>${p.id}</td>
          <td><strong>${p.title}</strong></td>
          <td class="tag">${p.category}</td>
          <td><span class="badge badge-${p.difficulty.toLowerCase()}">${p.difficulty}</span></td>
          <td>${solved ? '<span class="solved-tag">✓ Solved</span>' : '<span class="unsolved-tag">○ Unsolved</span>'}</td>
          <td><button class="solve-btn" onclick="openProblem(${p.id})">Solve</button></td>
        </tr>`;
      })
      .join("");
  }

  updateStats();
}

function updateStats() {
  const solved = Object.values(submissions).filter((s) => s.solved).length;
  const total = PROBLEMS.length;
  const pct = total ? Math.round((solved / total) * 100) : 0;
  $("solved-count").textContent = `Solved: ${solved}`;
  $("total-count").textContent = `Total: ${total}`;
  $("progress-text").textContent = `Progress: ${pct}%`;
}

/* ---------- OPEN A PROBLEM ---------- */
function openProblem(id) {
  // find() returns the first item where the test is true
  currentProblem = PROBLEMS.find((p) => p.id === id);

  $("p-title").textContent = currentProblem.title;
  $("p-category").textContent = currentProblem.category;
  $("p-difficulty").textContent = currentProblem.difficulty;
  $("p-difficulty").className = "badge badge-" + currentProblem.difficulty.toLowerCase();
  $("p-description").innerHTML = currentProblem.description;

  // build the examples block
  $("p-examples").innerHTML = currentProblem.examples
    .map(
      (ex) => `
      <div class="example">
        <div><b>Input:</b> ${ex.input}</div>
        <div><b>Output:</b> ${ex.output}</div>
        ${ex.explanation ? `<div><b>Explanation:</b> ${ex.explanation}</div>` : ""}
      </div>`
    )
    .join("");

  // put the starter code in the editor
  $("code-editor").value = currentProblem.starterCode;
  $("results").innerHTML = "";

  showPage("solve");
}

function resetCode() {
  $("code-editor").value = currentProblem.starterCode;
  $("results").innerHTML = "";
}

/* ---------- RUN THE CODE ---------- */
function runCode() {
  const code = $("code-editor").value;
  const results = $("results");

  let userFn;
  try {
    // new Function(...) turns the typed text into a real function.
    // We append "return <fnName>;" so we can grab the function the user wrote.
    const fnName = code.match(/function\s+([a-zA-Z0-9_]+)/)[1];
    userFn = new Function(code + `\nreturn ${fnName};`)();
  } catch (err) {
    results.innerHTML = `<div class="result-banner banner-fail">Syntax error: ${err.message}</div>`;
    return;
  }

  // run the problem's own test runner against the user's function
  let cases;
  try {
    cases = currentProblem.testRunner(userFn);
  } catch (err) {
    results.innerHTML = `<div class="result-banner banner-fail">Runtime error: ${err.message}</div>`;
    return;
  }

  const allPass = cases.every((c) => c.pass);

  // banner
  let html = allPass
    ? `<div class="result-banner banner-pass">✓ All ${cases.length} tests passed!</div>`
    : `<div class="result-banner banner-fail">✗ ${cases.filter((c) => c.pass).length}/${cases.length} tests passed</div>`;

  // each test case
  html += cases
    .map(
      (c) => `
      <div class="result-case ${c.pass ? "case-pass" : "case-fail"}">
        <div class="case-line"><b>Input:</b> ${c.input}</div>
        <div class="case-line"><b>Expected:</b> ${c.expected}</div>
        <div class="case-line"><b>Got:</b> ${c.got} ${c.pass ? "✓" : "✗"}</div>
      </div>`
    )
    .join("");

  results.innerHTML = html;

  // if everything passed, mark solved and save
  if (allPass) {
    submissions[currentProblem.id] = { solved: true };
    save();
  }
}

/* ---------- WIRING ---------- */
$("search-input").addEventListener("input", renderList);
$("difficulty-filter").addEventListener("change", renderList);

/* ---------- FIRST DRAW ---------- */
renderList();

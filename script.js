const timerElement = document.getElementById("timer");
const timerStatus = document.getElementById("timerStatus");

const scrambleElement = document.getElementById("scramble");
const newScrambleButton = document.getElementById("newScramble");

const solveCountElement = document.getElementById("solveCount");
const bestTimeElement = document.getElementById("bestTime");
const averageTimeElement = document.getElementById("averageTime");

const historyElement = document.getElementById("history");
const clearHistoryButton = document.getElementById("clearHistory");




let state = "idle";

let startTime = 0;
let elapsedTime = 0;

let animationFrame = null;

let solves = [];




const moves = [
  "R", "L", "U", "D", "F", "B"
];

const modifiers = [
  "",
  "'",
  "2"
];

let currentScramble = "";


function generateScramble() {

  const scramble = [];

  let previousFace = null;

  while (scramble.length < 20) {

    const face =
      moves[Math.floor(Math.random() * moves.length)];

    // Prevent the same face twice in a row.
    if (face === previousFace) {
      continue;
    }

    const modifier =
      modifiers[
        Math.floor(Math.random() * modifiers.length)
      ];

    scramble.push(face + modifier);

    previousFace = face;
  }

  currentScramble = scramble.join(" ");

  scrambleElement.textContent = currentScramble;
}



function formatTime(milliseconds) {

  const totalSeconds =
    milliseconds / 1000;

  return totalSeconds.toFixed(2);
}




function updateTimer() {

  if (state !== "running") {
    return;
  }

  elapsedTime =
    performance.now() - startTime;

  timerElement.textContent =
    formatTime(elapsedTime);

  animationFrame =
    requestAnimationFrame(updateTimer);
}


/* =========================
   START
========================= */

function startTimer() {

  if (state !== "ready") {
    return;
  }

  state = "running";

  startTime = performance.now();

  timerElement.classList.remove("ready");
  timerElement.classList.add("running");

  timerStatus.classList.remove("ready");
  timerStatus.classList.add("running");

  timerStatus.textContent =
    "Solving...";

  animationFrame =
    requestAnimationFrame(updateTimer);
}




function stopTimer() {

  if (state !== "running") {
    return;
  }

  cancelAnimationFrame(animationFrame);

  elapsedTime =
    performance.now() - startTime;

  state = "idle";

  timerElement.textContent =
    formatTime(elapsedTime);

  timerElement.classList.remove("running");
  timerElement.classList.add("finished");

  timerStatus.classList.remove("running");
  timerStatus.textContent =
    "Solve complete";

  addSolve(elapsedTime);
}
  setTimeout(() => {

    timerElement.classList.remove("finished");

  }, 400);


document.addEventListener("keydown", (event) => {

  if (event.code !== "Space") {
    return;
  }

  event.preventDefault();

  
  if (event.repeat) {
    return;
  }



  if (state === "idle") {

    state = "ready";

    timerElement.classList.add("ready");

    timerStatus.classList.add("ready");

    timerStatus.textContent =
      "Release SPACE to start";

    return;
  }

  if (state === "ready") {

    startTimer();

    return;
  }

  if (state === "running") {

    stopTimer();

  }

});




document.addEventListener("keyup", (event) => {

  if (event.code !== "Space") {
    return;
  }

  event.preventDefault();

});


/* =========================
   ADD SOLVE
========================= */

function addSolve(time) {

  solves.unshift({
    time: time,
    scramble: currentScramble
  });

  renderHistory();
  updateStats();

  generateScramble();
}



function updateStats() {

  solveCountElement.textContent =
    solves.length;


  if (solves.length === 0) {

    bestTimeElement.textContent = "--";
    averageTimeElement.textContent = "--";

    return;
  }


  const best =
    Math.min(
      ...solves.map(solve => solve.time)
    );

  bestTimeElement.textContent =
    formatTime(best);


  const total =
    solves.reduce(
      (sum, solve) => sum + solve.time,
      0
    );

  const average =
    total / solves.length;

  averageTimeElement.textContent =
    formatTime(average);
}




function renderHistory() {

  if (solves.length === 0) {

    historyElement.innerHTML = `
      <div class="empty-history">
        Your solves will appear here
      </div>
    `;

    return;
  }


  historyElement.innerHTML =
    solves
      .slice(0, 20)
      .map((solve, index) => {

        return `
          <div class="solve">

            <span class="solve-number">
              ${solves.length - index}
            </span>

            <strong class="solve-time">
              ${formatTime(solve.time)}
            </strong>

            <span class="solve-scramble">
              ${solve.scramble}
            </span>

          </div>
        `;

      })
      .join("");
}



newScrambleButton.addEventListener(
  "click",
  () => {

    generateScramble();

    if (state !== "running") {

      state = "idle";

      timerElement.classList.remove("ready");

      timerStatus.classList.remove("ready");

      timerStatus.textContent =
        "Press SPACE to start";
    }

  }
);




clearHistoryButton.addEventListener(
  "click",
  () => {

    if (solves.length === 0) {
      return;
    }

    const confirmed =
      confirm(
        "Clear all solve history?"
      );

    if (!confirmed) {
      return;
    }

    solves = [];

    renderHistory();
    updateStats();

  }
);




generateScramble();
updateStats();
renderHistory();

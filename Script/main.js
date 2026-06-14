// ====================
// ELEMENTS
// ====================

const boot = document.getElementById("boot-screen");
const lock = document.getElementById("lock-screen");
const desktop = document.getElementById("desktop");
const progressBar = document.getElementById("progress-bar");
const clock = document.getElementById("clock");
const lockTime = document.getElementById("lock-time");
const windows = document.getElementById("windows");
const notifications = document.getElementById("notifications");
const template = document.getElementById("window-template");

let zIndex = 10;

// ====================
// BOOT SCREEN
// ====================

let progress = 0;

const bootInterval = setInterval(() => {
  progress += 5;
  progressBar.style.width = progress + "%";

  if (progress >= 100) {
    clearInterval(bootInterval);

    boot.classList.add("hidden");
    lock.classList.remove("hidden");
  }
}, 120);

// ====================
// CLOCK
// ====================

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  clock.textContent = time;
  lockTime.textContent = time;
}

updateClock();
setInterval(updateClock, 1000);

// ====================
// UNLOCK
// ====================

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    !lock.classList.contains("hidden")
  ) {
    lock.classList.add("hidden");
    desktop.classList.remove("hidden");

    notify("Welcome to MYveryOWNos");
  }
});

// ====================
// NOTIFICATIONS
// ====================

function notify(text) {
  const div = document.createElement("div");

  div.className = "notification";
  div.textContent = "✓ " + text;

  notifications.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

// ====================
// WINDOW CREATOR
// ====================

function createWindow(title, content) {
  const clone =
    template.content.firstElementChild.cloneNode(true);

  clone.querySelector(
    ".window-title"
  ).textContent = title;

  clone.querySelector(
    ".window-body"
  ).innerHTML = content;

  clone.style.zIndex = ++zIndex;

  windows.appendChild(clone);

  makeDraggable(clone);

  clone.addEventListener("mousedown", () => {
    clone.style.zIndex = ++zIndex;
  });

  clone
    .querySelector(".close-btn")
    .onclick = () => {
      clone.remove();
    };

  clone
    .querySelector(".min-btn")
    .onclick = () => {
      clone.style.display = "none";
    };

  return clone;
}

// ====================
// DRAGGABLE WINDOWS
// ====================

function makeDraggable(win) {
  const bar =
    win.querySelector(".titlebar");

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener(
    "mousedown",
    (e) => {
      dragging = true;

      offsetX =
        e.clientX - win.offsetLeft;

      offsetY =
        e.clientY - win.offsetTop;
    }
  );

  document.addEventListener(
    "mousemove",
    (e) => {
      if (!dragging) return;

      win.style.left =
        e.clientX - offsetX + "px";

      win.style.top =
        e.clientY - offsetY + "px";
    }
  );

  document.addEventListener(
    "mouseup",
    () => {
      dragging = false;
    }
  );
}
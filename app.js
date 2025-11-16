let validTickets = new Set();
let usedTickets = new Set();

const USED_TICKETS_KEY = "usedTickets";

function loadUsedTicketsFromStorage() {
  try {
    const stored = localStorage.getItem(USED_TICKETS_KEY);
    if (!stored) return;

    const arr = JSON.parse(stored);
    if (Array.isArray(arr)) {
      arr.forEach(code => usedTickets.add(code));
    }
  } catch (e) {
    console.error("Failed to load used tickets from storage:", e);
  }
}

function saveUsedTicketsToStorage() {
  try {
    const arr = Array.from(usedTickets);
    localStorage.setItem(USED_TICKETS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error("Failed to save used tickets to storage:", e);
  }
}


const statusEl = document.getElementById("status");
const resultMessageEl = document.getElementById("resultMessage");
const ticketInputEl = document.getElementById("ticketInput");
const checkButtonEl = document.getElementById("checkButton");

// Sound elements
const successSoundEl = document.getElementById("successSound");
const errorSoundEl   = document.getElementById("errorSound");

// For debug messages if sound fails
const debugOutputEl = document.getElementById("cameraStatus") || resultMessageEl;

function playSuccess() {
  if (!successSoundEl) {
    console.warn("successSound element not found");
    return;
  }
  try {
    successSoundEl.currentTime = 0;
    const p = successSoundEl.play();
    if (p && p.catch) {
      p.catch(err => {
        console.error("Success sound error:", err);
        if (debugOutputEl) {
          debugOutputEl.textContent = "Success sound error: " + err;
        }
      });
    }
  } catch (err) {
    console.error("Success sound error:", err);
    if (debugOutputEl) {
      debugOutputEl.textContent = "Success sound error: " + err;
    }
  }
}

function playError() {
  if (!errorSoundEl) {
    console.warn("errorSound element not found");
    return;
  }
  try {
    errorSoundEl.currentTime = 0;
    const p = errorSoundEl.play();
    if (p && p.catch) {
      p.catch(err => {
        console.error("Error sound error:", err);
        if (debugOutputEl) {
          debugOutputEl.textContent = "Error sound error: " + err;
        }
      });
    }
  } catch (err) {
    console.error("Error sound error:", err);
    if (debugOutputEl) {
      debugOutputEl.textContent = "Error sound error: " + err;
    }
  }
}

const testSuccessSoundButtonEl = document.getElementById("testSuccessSoundButton");
const testErrorSoundButtonEl   = document.getElementById("testErrorSoundButton");

if (testSuccessSoundButtonEl) {
  testSuccessSoundButtonEl.addEventListener("click", () => {
    playSuccess();
  });
}

if (testErrorSoundButtonEl) {
  testErrorSoundButtonEl.addEventListener("click", () => {
    playError();
  });
}






// Result auto-clear
let resultClearTimeoutId = null;

function scheduleClearResult() {
  // cancel any previous pending clear
  if (resultClearTimeoutId) {
    clearTimeout(resultClearTimeoutId);
  }

  resultClearTimeoutId = setTimeout(() => {
    resultMessageEl.textContent = "";
    resultMessageEl.className = "";
    // remove flash colors from body
    document.body.classList.remove("flash-success", "flash-error");
  }, 2000); // 1 second; increase if you want longer
}

function playSuccess() {
  if (!successSoundEl) return;
  try {
    successSoundEl.currentTime = 0;
    successSoundEl.play().catch(() => {});
  } catch (e) {
    console.warn("Could not play success sound:", e);
  }
}

function playError() {
  if (!errorSoundEl) return;
  try {
    errorSoundEl.currentTime = 0;
    errorSoundEl.play().catch(() => {});
  } catch (e) {
    console.warn("Could not play error sound:", e);
  }
}

function triggerFeedback(type) {
  // remove any previous flash classes
  document.body.classList.remove("flash-success", "flash-error");

  if (type === "success") {
    document.body.classList.add("flash-success");
    playSuccess();
  } else if (type === "error") {
    document.body.classList.add("flash-error");
    playError();
  }

  // schedule clearing both text and flash
  scheduleClearResult();
}



// New elements for QR scanner
const scannerSectionEl = document.getElementById("scannerSection");
const cameraStatusEl = document.getElementById("cameraStatus");
const startScannerButtonEl = document.getElementById("startScannerButton");

// html5-qrcode variables
let html5QrCode = null;
let isScanning = false;

// 1. Load tickets from tickets.json
async function loadTickets() {
  try {
    const response = await fetch("tickets.json");
    if (!response.ok) {
      throw new Error("Failed to load tickets.json");
    }
    const data = await response.json();
    // assume { "tickets": ["ABC123", ...] }
    data.tickets.forEach(code => {
      validTickets.add(code.trim());
    });
    statusEl.textContent = `Loaded ${validTickets.size} tickets.`;
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Error loading tickets. Check console.";
  }
}

// 2. Check a single ticket code

function checkTicket(codeRaw) {
  const code = (codeRaw || "").trim();

  resultMessageEl.className = "";

  if (!code) {
    resultMessageEl.textContent = "Please enter a ticket code.";
    // error feedback
    document.body.classList.remove("flash-success", "flash-error");
    document.body.classList.add("flash-error");
    playError();
    scheduleClearResult();
    return;
  }

  if (!validTickets.has(code)) {
    resultMessageEl.textContent = `Ticket "${code}" is NOT valid.`;
    resultMessageEl.classList.add("result-invalid");
    document.body.classList.remove("flash-success", "flash-error");
    document.body.classList.add("flash-error");
    playError();
    scheduleClearResult();
    return;
  }

  if (usedTickets.has(code)) {
    resultMessageEl.textContent = `Ticket "${code}" was already used.`;
    resultMessageEl.classList.add("result-used");
    document.body.classList.remove("flash-success", "flash-error");
    document.body.classList.add("flash-error");
    playError();
    scheduleClearResult();
    return;
  }

  // Mark as used
  usedTickets.add(code);
  // saveUsedTicketsToStorage && saveUsedTicketsToStorage();

  resultMessageEl.textContent = `Ticket "${code}" is VALID. Welcome!`;
  resultMessageEl.classList.add("result-valid");
  document.body.classList.remove("flash-success", "flash-error");
  document.body.classList.add("flash-success");
  playSuccess();
  scheduleClearResult();
}







// 3. Manual input event listeners
checkButtonEl.addEventListener("click", () => {
  checkTicket(ticketInputEl.value);
  ticketInputEl.value = "";
  ticketInputEl.focus();
});

// allow Enter key
ticketInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkTicket(ticketInputEl.value);
    ticketInputEl.value = "";
  }
});

// 4. QR scanner logic using html5-qrcode

function startQrScanner() {
  if (isScanning) return;

  if (typeof Html5Qrcode === "undefined") {
    cameraStatusEl.textContent = "QR library not loaded.";
    console.error("Html5Qrcode is not available on window.");
    return;
  }

  // Create a new scanner attached to the #qr-reader div
  html5QrCode = new Html5Qrcode("qr-reader");

  cameraStatusEl.textContent = "Requesting camera permission...";

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 }
  };

  // Use the back camera on mobile with facingMode: environment
  html5QrCode
    .start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        // When a QR code is successfully scanned
        ticketInputEl.value = decodedText;
        checkTicket(decodedText);

        // Option 1: stop after each successful scan
        //stopQrScanner();
      },
      (errorMessage) => {
        // Errors during scanning; usually safe to ignore
        // console.warn(`QR scan error: ${errorMessage}`);
      }
    )
    .then(() => {
      isScanning = true;
      cameraStatusEl.textContent = "Point your camera at a QR code.";
      startScannerButtonEl.textContent = "Stop QR Scanner";
    })
    .catch((err) => {
      cameraStatusEl.textContent = "Could not start camera: " + err;
      console.error("Camera start error:", err);
    });
}

function stopQrScanner() {
  if (html5QrCode && isScanning) {
    html5QrCode
      .stop()
      .then(() => {
        html5QrCode.clear();
        isScanning = false;
        cameraStatusEl.textContent = "Scanner stopped.";
        startScannerButtonEl.textContent = "Start QR Scanner";
      })
      .catch((err) => {
        console.error("Failed to stop scanner:", err);
      });
  }
}

// Button to toggle scanner on/off
if (startScannerButtonEl) {
  startScannerButtonEl.addEventListener("click", () => {
    // Prime audio on user tap so later automatic plays are allowed
    primeAudio();

    if (!isScanning) {
      startQrScanner();
    } else {
      stopQrScanner();
    }
  });
}


// Initialize
loadUsedTicketsFromStorage();
loadTickets();


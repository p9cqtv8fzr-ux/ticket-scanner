let validTickets = new Set();
let usedTickets = new Set();

const statusEl = document.getElementById("status");
const resultMessageEl = document.getElementById("resultMessage");
const ticketInputEl = document.getElementById("ticketInput");
const checkButtonEl = document.getElementById("checkButton");

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
    return;
  }

  if (!validTickets.has(code)) {
    resultMessageEl.textContent = `Ticket "${code}" is NOT valid.`;
    resultMessageEl.classList.add("result-invalid");
    return;
  }

  if (usedTickets.has(code)) {
    resultMessageEl.textContent = `Ticket "${code}" was already used.`;
    resultMessageEl.classList.add("result-used");
    return;
  }

  // Mark as used
  usedTickets.add(code);
  resultMessageEl.textContent = `Ticket "${code}" is VALID. Welcome!`;
  resultMessageEl.classList.add("result-valid");
}

// 3. Event listeners
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

// Initialize
loadTickets();

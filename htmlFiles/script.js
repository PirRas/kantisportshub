// Globale Variablen
const profileData = {
  name: "",
  stats: {
    ausdauer: null,
    kraft: null,
    schnelligkeit: null,
    koordination: null
  }
};

// HTML-Elemente
const studentNameInput = document.getElementById("studentName");

const enduranceInput = document.getElementById("endurance");
const strengthInput = document.getElementById("strength");
const speedInput = document.getElementById("speed");
const coordinationInput = document.getElementById("coordination");

const saveProfileBtn = document.getElementById("saveProfileBtn");
const outputText = document.getElementById("outputText");
const overallText = document.getElementById("overallText");

//Funktionen
function speichereProfil() {
  if (
    enduranceInput.value === "" ||
    strengthInput.value === "" ||
    speedInput.value === "" ||
    coordinationInput.value === ""
   ) {
    overallText.innerHTML = "Gesamtwert: Bitte alle vier Werte eingeben.";
    return;
  }
  profileData.name = studentNameInput.value;
  profileData.stats.ausdauer = Number(enduranceInput.value);
  profileData.stats.kraft = Number(strengthInput.value);
  profileData.stats.schnelligkeit = Number(speedInput.value);
  profileData.stats.koordination = Number(coordinationInput.value);

  outputText.innerHTML =
    "Name: " + profileData.name + "<br>" +
    "Ausdauer: " + profileData.stats.ausdauer + "<br>" +
    "Kraft: " + profileData.stats.kraft + "<br>" +
    "Schnelligkeit: " + profileData.stats.schnelligkeit + "<br>" +
    "Koordination: " + profileData.stats.koordination;
  

  let gesamtwert = berechneGesamtwert(); 
  overallText.innerHTML = "Gesamtwert: " + gesamtwert.toFixed(1);
} 

// Berechnungslogik: (ausdauer + kraft + schnelligkeit + koordination) / 4 (refs #2)

function berechneGesamtwert() {
  let summe =
    profileData.stats.ausdauer +
    profileData.stats.kraft +
    profileData.stats.schnelligkeit +
    profileData.stats.koordination;

  let durchschnitt = summe / 4;
  return durchschnitt;
}

// Event Listener

// Button reagiert auf Klick
saveProfileBtn.addEventListener("click", function () {
  speichereProfil();
  console.log("Aktuelles Profil:", profileData);
});

// Testaufruf der Berechnungsfunktion (refs #11)
console.log("Gesamtwert:", berechneGesamtwert());
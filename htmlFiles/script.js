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

//Funktionen
function speichereProfil() {
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
}

// Button reagiert auf Klick
let speichernButton = document.getElementById("saveProfileBtn");

speichernButton.addEventListener("click", function() {
    speichereProfil();
    
    console.log("Aktuelles Profil:", profileData);
});
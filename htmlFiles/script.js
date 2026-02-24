// Globale Variablen
const profileData = {
  name: "",
  stats: {
    endurance: null,
    strength: null,
    speed: null,
    coordination: null
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
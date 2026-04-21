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
// Token aus localStorage holen
const token = localStorage.getItem("token");
// Wenn kein Token vorhanden ist, zur Login-Seite weiterleiten
if (!token) {
  window.location.href = "login.html";
}

// HTML-Elemente
const studentNameInput = document.getElementById("studentName");
const enduranceInput = document.getElementById("endurance");
const strengthInput = document.getElementById("strength");
const speedInput = document.getElementById("speed");
const coordinationInput = document.getElementById("coordination");

const saveProfileBtn = document.getElementById("saveProfileBtn");
const outputText = document.getElementById("outputText");
const overallText = document.getElementById("overallText");

const profileImageInput = document.getElementById("profileImageInput");
const profileImagePreview = document.getElementById("profileImagePreview");

// HTML Elemente für Vergleich 
const compareUser1 = document.getElementById("compareUser1");
const compareUser2 = document.getElementById("compareUser2");
const compareBtn = document.getElementById("compareBtn");
const compareOutput = document.getElementById("compareOutput");

// HTML Elemente für Rangliste
const roleFilter = document.getElementById("roleFilter");
const loadRankingBtn = document.getElementById("loadRankingBtn");
const rankingOutput = document.getElementById("rankingOutput");

// Hier werden alle Benutzer gespeichert nachdem sie geladen wurden
let allUsers = [];

// Bild speichern
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.onload = () => imageData = reader.result;
    reader.readAsDataURL(file);
});

// Profil laden
async function loadProfile() {
    const res = await fetch("http://localhost:3000/api/profile", {
        headers: { Authorization: token }
    });

    const data = await res.json();

    if (data.name) {
        nameInput.value = data.name;
        nameInput.disabled = true; 
    }

    endurance.value = data.ausdauer;
    strength.value = data.kraft;
    speed.value = data.schnelligkeit;
    coordination.value = data.koordination;

    if (data.image) {
        document.getElementById("profileImagePreview").src = data.image;
    }
}


// Funktion lädt alle Benutzer vom Server
async function ladeAlleBenutzer() {

  // Anfrage an Backend, Token nötig wegen Login System
  const response = await fetch("http://localhost:3000/api/users", {
    headers: {
      Authorization: token
    }
  });

  const data = await response.json();

  // Falls Fehler kommt, wird eine Meldung angezeigt
  if (!response.ok) {
    compareOutput.innerHTML = "Fehler beim Laden der Benutzer.";
    return;
  }

  // Daten speichern, damit man später darauf zugreifen kann
  allUsers = data;

  // Dropdowns werden zuerst geleert, damit keine alten Daten bleiben
  compareUser1.innerHTML = "";
  compareUser2.innerHTML = "";

  // Für jeden Benutzer wird eine Auswahlmöglichkeit erstellt
  data.forEach(user => {

    const option1 = document.createElement("option");
    option1.value = user.id;
    option1.textContent = user.username;

    const option2 = document.createElement("option");
    option2.value = user.id;
    option2.textContent = user.username;

    compareUser1.appendChild(option1);
    compareUser2.appendChild(option2);
  });
}

//Funktionen
function speichereProfil() {
  if (
    enduranceInput.value < 0 || enduranceInput.value > 100 ||
    strengthInput.value < 0 || strengthInput.value > 100 ||
    speedInput.value < 0 || speedInput.value > 100 ||
    coordinationInput.value < 0 || coordinationInput.value > 100
  ) {
    outputText.innerHTML = "Fehler: Alle Werte müssen zwischen 0 und 100 liegen.";
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

  if (profileImageInput.files.length > 0) {
    let imageURL = URL.createObjectURL(profileImageInput.files[0]);
    profileImagePreview.src = imageURL;
  }
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

// Funktion lädt Rangliste vom Backend
async function ladeRangliste() {

  const response = await fetch(
    "http://localhost:3000/api/ranking?role=" + encodeURIComponent(roleFilter.value),
    {
      headers: {
        Authorization: token
      }
    }
  );

  const data = await response.json();

  // Fehler anzeigen
  if (!response.ok) {
    rankingOutput.innerHTML = "Fehler beim Laden der Rangliste.";
    return;
  }

  // Alte Anzeige löschen
  rankingOutput.innerHTML = "";

  // Jeder Benutzer bekommt eine Platzierung (Index +1)
  data.forEach((user, index) => {

    rankingOutput.innerHTML +=
      "<p>" +
      (index + 1) + ". " +
      user.username +
      " | " +
      user.role +
      " | Gesamtwert: " +
      Number(user.gesamtwert).toFixed(1) +
      "</p>";
  });
}

// Button reagiert auf Klick
saveProfileBtn.addEventListener("click", function () {
  speichereProfil();
  console.log("Aktuelles Profil:", profileData);
  const name = studentNameInput.value;
  const ausdauer = enduranceInput.value; 
  const kraft = strengthInput.value;
  const schnelligkeit = speedInput.value;
  const koordination = coordinationInput.value;

  fetch('http://localhost:3000/api/sports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, ausdauer, kraft, schnelligkeit, koordination })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Erfolg:', data);
    })
    .catch((error) => {
      console.error('Fehler:', error);
    });
});

// Wird ausgeführt wenn der Button geklickt wird
compareBtn.addEventListener("click", function () {

  // Gewählte Benutzer werden im Array gesucht
  const user1 = allUsers.find(user => user.id == compareUser1.value);
  const user2 = allUsers.find(user => user.id == compareUser2.value);

  // Falls nichts ausgewählt wurde, wird eine Meldung angezeigt
  if (!user1 || !user2) {
    compareOutput.innerHTML = "Bitte zwei Benutzer auswählen.";
    return;
  }

  // Werte werden einfach als Text ausgegeben, damit man sie direkt vergleichen kann
  compareOutput.innerHTML =
    "<h3>" + user1.username + " vs " + user2.username + "</h3>" +

    "<p>" + user1.username +
    ": Ausdauer " + user1.ausdauer +
    ", Kraft " + user1.kraft +
    ", Schnelligkeit " + user1.schnelligkeit +
    ", Koordination " + user1.koordination +
    ", Gesamtwert " + Number(user1.gesamtwert).toFixed(1) +
    "</p>" +

    "<p>" + user2.username +
    ": Ausdauer " + user2.ausdauer +
    ", Kraft " + user2.kraft +
    ", Schnelligkeit " + user2.schnelligkeit +
    ", Koordination " + user2.koordination +
    ", Gesamtwert " + Number(user2.gesamtwert).toFixed(1) +
    "</p>";
});

// Button verbindet Funktion mit Klick
loadRankingBtn.addEventListener("click", function () {
  ladeRangliste();
});

// Testaufruf der Berechnungsfunktion (refs #11)
console.log("Gesamtwert:", berechneGesamtwert());

console.log(ladeAlleBenutzer());
console.log(ladeRangliste());
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

//Funktionen
function speichereProfil() {

    // Werte aus den Input-Feldern holen
    let nameWert = document.getElementById("nameInput").value;
    let ausdauerWert = document.getElementById("ausdauerInput").value;
    let kraftWert = document.getElementById("kraftInput").value;
    let schnelligkeitWert = document.getElementById("schnelligkeitInput").value;
    let koordinationWert = document.getElementById("koordinationInput").value;

    // Werte im Benutzerprofil speichern
    benutzerProfil.name = nameWert;
    benutzerProfil.ausdauer = Number(ausdauerWert);
    benutzerProfil.kraft = Number(kraftWert);
    benutzerProfil.schnelligkeit = Number(schnelligkeitWert);
    benutzerProfil.koordination = Number(koordinationWert);

    // Ausgabe auf der Webseite anzeigen
    document.getElementById("profilAusgabe").innerHTML =
        "Name: " + benutzerProfil.name + "<br>" +
        "Ausdauer: " + benutzerProfil.ausdauer + "<br>" +
        "Kraft: " + benutzerProfil.kraft + "<br>" +
        "Schnelligkeit: " + benutzerProfil.schnelligkeit + "<br>" +
        "Koordination: " + benutzerProfil.koordination;
}
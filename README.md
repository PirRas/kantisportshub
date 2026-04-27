# KANTISPORTS HUB

## Beschreibung

KANTISPORTS HUB ist eine Webapplikation zur Erfassung, Speicherung und Auswertung sportlicher Leistungen im Schulsport.

Die Anwendung ermöglicht:

* Benutzer-Login und Registrierung
* Erfassung von sportlichen Grundwerten
* Automatische Berechnung eines Gesamtwerts
* Vergleich zwischen Benutzern
* Anzeige einer Rangliste mit Filter

---

## Technologien

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js mit Express
* Datenbank: SQLite (better-sqlite3)
* Sicherheit: bcrypt (Passwort Hashing), Token Authentifizierung

---

## Projektstruktur

* index.html → Hauptseite mit Profil, Vergleich und Rangliste 
* login.html → Login und Registrierung 
* script.js → Frontend Logik (Profil, Vergleich, Ranking) 
* login.js → Login und Registrierung Logik 
* server.js → Backend API und Datenbanklogik 
* database.db → SQLite Datenbank

---

## Installation

1. Repository klonen

```
git clone [REPO-LINK]
```

2. Abhängigkeiten installieren

```
npm install express better-sqlite3 cors bcrypt
```

3. Server starten

```
node server.js
```

4. Webseite öffnen

```
login.html im Browser öffnen
```

---

## Backend Funktionen (API)

### Authentifizierung

* POST /api/register → Benutzer registrieren
* POST /api/login → Benutzer einloggen

Passwörter werden mit bcrypt gehasht gespeichert. 

---

### Profil

* GET /api/profile → Eigenes Profil laden
* PUT /api/profile → Profil speichern

Gesamtwert wird automatisch berechnet:
(Ausdauer + Kraft + Schnelligkeit + Koordination) / 4 

---

### Benutzer & Vergleich

* GET /api/users → Alle Benutzer laden
  → Wird im Frontend für Vergleich verwendet 

---

### Rangliste

* GET /api/ranking?role=Schüler
  → Sortiert nach Gesamtwert absteigend 

---

## Frontend Funktionen

### Profil

* Eingabe von Werten (0–100)
* Bild Upload
* Anzeige des Gesamtwerts

### Vergleich

* Zwei Benutzer auswählen
* Werte direkt vergleichen

### Rangliste

* Filter nach Rolle (Schüler / Lehrperson)
* Sortierte Anzeige

---

## Sicherheit

* Passwort Hashing mit bcrypt
* Token basierte Authentifizierung
* Zugriff auf Daten nur mit gültigem Token

---

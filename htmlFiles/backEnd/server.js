const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const database = new Database('database.db', { timeout: 5000 });
// Tabelle für Benutzer (Login Daten)
database.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        token TEXT
    )
`).run();
// Tabelle für Profil (Werte des Benutzers); getrennt von users, damit Login und Daten sauber organisiert sind
database.prepare(`
    CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        image TEXT DEFAULT '',
        ausdauer INTEGER DEFAULT 0,
        kraft INTEGER DEFAULT 0,
        schnelligkeit INTEGER DEFAULT 0,
        koordination INTEGER DEFAULT 0,
        gesamtwert REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`).run();
// Tabelle für Sportdaten
database.prepare(`
    CREATE TABLE IF NOT EXISTS sportsdata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ausdauer INTEGER,
        kraft INTEGER,
        schnelligkeit INTEGER,
        koordination INTEGER,
        gesamtwert REAL
    )
`).run();
//Ist Benutzer eingeloggt?
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    // Überprüfen, ob ein Token vorhanden ist
    if (!token) {
        return res.status(401).json({ message: 'Nicht eingeloggt' });
    }
    // Benutzer wird anhand des Tokens gesucht, um die Authentifizierung zu überprüfen
    const user = database
        .prepare('SELECT * FROM users WHERE token = ?')
        .get(token);
    //Ungültiger Token
    if (!user) {
        return res.status(401).json({ message: 'Ungültiger Token' });
    }
    // Benutzer wird in der Anfrage gespeichert, damit man später darauf zugreifen kann
    req.user = user;
    next();
}
// Benutzer kann sich registrieren
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    // Überprüfung, ob alle Felder ausgefüllt sind
    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Alle Felder sind erforderlich' });
    }
    // Rolle muss gültig sein
    if (role !== 'Schüler' && role !== 'Lehrperson') {
        return res.status(400).json({ message: 'Ungültige Rolle' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Das Passwort muss mindestens 6 Zeichen lang sein' });
    }

    try {
        // Passwort wird gehasht, damit es nicht im Klartext gespeichert wird
        const hashedPassword = await bcrypt.hash(password, 10);

        // Benutzer speichern
        const info = database
            .prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
            .run(username, hashedPassword, role);
        // Leeres Profil wird direkt erstellt, damit jeder genau ein Profil hat
        database
            .prepare('INSERT INTO profiles (user_id) VALUES (?)')
            .run(info.lastInsertRowid);

        res.json({ message: 'Registrierung erfolgreich' });
    } catch (error) {
        // Fehler abfangen, z.B. wenn der Benutzername bereits existiert
        res.status(400).json({ message: 'Benutzer existiert bereits' });
    }
});
// Benutzer kann sich einloggen
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    //Benutzer wird anhand des Benutzernamens gesucht, um das Passwort zu überprüfen
    const user = database //Verify password (refs #19)
        .prepare('SELECT * FROM users WHERE username = ?')
        .get(username);
    // Wenn kein Benutzer gefunden wird, wird eine Fehlermeldung zurückgegeben
    if (!user) {
        return res.status(401).json({ message: 'Falsche Login Daten' });
    }
    // Überprüfung des Passworts mit bcrypt, da es gehasht in der Datenbank gespeichert ist
    const passwordIstRichtig = await bcrypt.compare(password, user.password);

    if (!passwordIstRichtig) {
        return res.status(401).json({ message: 'Falsche Login Daten' });
    }
    //Token wird generiert, damit der Benutzer bei zukünftigen Anfragen authentifiziert werden kann
    const token = crypto.randomUUID();
    // Token wird in der Datenbank gespeichert
    database
        .prepare('UPDATE users SET token = ? WHERE id = ?')
        .run(token, user.id);

    //Daten an Frontend zurückgeben
    res.json({
        message: 'Login erfolgreich',
        token: token,
        username: user.username,
        role: user.role
    });
});

// Profil laden (NUR EIGENES)
app.get('/api/profile', authMiddleware, (req, res) => {
    const profile = database
        .prepare('SELECT * FROM profiles WHERE user_id = ?')
        .get(req.user.id);

    res.json(profile);
});

// Profil speichern / Updaten
app.put('/api/profile', authMiddleware, (req, res) => {
    const { ausdauer, kraft, schnelligkeit, koordination, image } = req.body;

    const zahlen = [ausdauer, kraft, schnelligkeit, koordination].map(Number);
    if (zahlen.some(v => isNaN(v) || v < 0 || v > 100)) {
        return res.status(400).json({ message: 'Werte müssen 0–100 sein' });
    }

    const gesamtwert = zahlen.reduce((a, b) => a + b, 0) / 4;

    // Wir nutzen UPDATE, da bei der Registrierung bereits ein Profil angelegt wurde
    const stmt = database.prepare(`
        UPDATE profiles 
        SET image = ?, ausdauer = ?, kraft = ?, schnelligkeit = ?, koordination = ?, gesamtwert = ?
        WHERE user_id = ?
    `);

    try {
        stmt.run(image || '', zahlen[0], zahlen[1], zahlen[2], zahlen[3], gesamtwert, req.user.id);
        res.json({ message: 'Profil erfolgreich aktualisiert', gesamtwert });
    } catch (err) {
        res.status(500).json({ message: 'Datenbankfehler', error: err.message });
    }
});

app.put('/api/username', authMiddleware, async (req, res) => {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ message: 'Ungültiger Name' });
    }

    try {
        database
            .prepare('UPDATE users SET username = ? WHERE id = ?')
            .run(username.trim(), req.user.id);

        res.json({ message: 'Name erfolgreich aktualisiert' });
    } catch (error) {
        res.status(400).json({ message: 'Benutzername bereits vergeben' });
    }
});

// Route gibt alle Benutzer mit ihren Werten zurück
// Wird gebraucht, damit man später Benutzer vergleichen kann
app.get('/api/users', authMiddleware, (req, res) => {

    // Daten aus zwei Tabellen verbinden, weil Benutzer und Werte getrennt gespeichert sind
    const users = database.prepare(`
        SELECT 
            users.id,
            users.username,
            users.role,
            profiles.ausdauer,
            profiles.kraft,
            profiles.schnelligkeit,
            profiles.koordination,
            profiles.gesamtwert
        FROM users
        JOIN profiles ON users.id = profiles.user_id
        ORDER BY users.username ASC
    `).all();

    // Daten werden als JSON an das Frontend geschickt
    res.json(users);
});

// Route berechnet Rangliste nach Gesamtwert
app.get('/api/ranking', authMiddleware, (req, res) => {

    // Rolle wird aus URL gelesen (Filter)
    const role = req.query.role;

    // Grundabfrage für alle Benutzer
    let query = `
        SELECT 
            users.username,
            users.role,
            profiles.gesamtwert
        FROM users
        JOIN profiles ON users.id = profiles.user_id
    `;

    const params = [];

    // Wenn Filter gesetzt ist, wird nur diese Rolle angezeigt
    if (role && role !== 'Alle') {
        query += ' WHERE users.role = ?';
        params.push(role);
    }

    // Sortierung nach Gesamtwert, damit beste oben sind
    query += ' ORDER BY profiles.gesamtwert DESC';

    const ranking = database.prepare(query).all(...params);

    // Ergebnis zurückgeben
    res.json(ranking);
});

app.post('/api/sports', (req, res) => {
    const { name, ausdauer, kraft, schnelligkeit, koordination } = req.body;

    const zahlen = [
        Number(ausdauer),
        Number(kraft),
        Number(schnelligkeit),
        Number(koordination)
    ];

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Ungültiger Name' });
    }

    if (zahlen.some(wert => Number.isNaN(wert) || wert < 0 || wert > 100)) {
        return res.status(400).json({ message: 'Alle Werte müssen zwischen 0 und 100 liegen' });
    }

    const gesamtwert =
        (zahlen[0] + zahlen[1] + zahlen[2] + zahlen[3]) / 4;

    const stmt = database.prepare(`
        INSERT INTO sportsdata (
            name, ausdauer, kraft, schnelligkeit, koordination, gesamtwert
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
        name,
        zahlen[0],
        zahlen[1],
        zahlen[2],
        zahlen[3],
        gesamtwert
    );
    
    res.json({
        message: 'Daten erfolgreich gespeichert',
        id: info.lastInsertRowid,
        gesamtwert: gesamtwert
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
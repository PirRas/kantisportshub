const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const database = new Database('database.db', { timeout: 5000 });

database.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        token TEXT
    )
`).run();

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

function authMiddleware(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Nicht eingeloggt' });
    }

    const user = database
        .prepare('SELECT * FROM users WHERE token = ?')
        .get(token);

    if (!user) {
        return res.status(401).json({ message: 'Ungültiger Token' });
    }

    req.user = user;
    next();
}

app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Alle Felder sind erforderlich' });
    }

    if (role !== 'Schüler' && role !== 'Lehrperson') {
        return res.status(400).json({ message: 'Ungültige Rolle' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Das Passwort muss mindestens 6 Zeichen lang sein' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const info = database
            .prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
            .run(username, hashedPassword, role);

        database
            .prepare('INSERT INTO profiles (user_id) VALUES (?)')
            .run(info.lastInsertRowid);

        res.json({ message: 'Registrierung erfolgreich' });
    } catch (error) {
        res.status(400).json({ message: 'Benutzer existiert bereits' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const user = database //Verify password (refs #19)
        .prepare('SELECT * FROM users WHERE username = ?')
        .get(username);

    if (!user) {
        return res.status(401).json({ message: 'Falsche Login Daten' });
    }

    const passwordIstRichtig = await bcrypt.compare(password, user.password);

    if (!passwordIstRichtig) {
        return res.status(401).json({ message: 'Falsche Login Daten' });
    }

    const token = crypto.randomUUID();

    database
        .prepare('UPDATE users SET token = ? WHERE id = ?')
        .run(token, user.id);

    res.json({
        message: 'Login erfolgreich',
        token: token,
        username: user.username,
        role: user.role
    });
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

app.get('/api/sports', (req, res) => {
    
    console.log('GET /api/sports aufgerufen');
    const sportsData = database.prepare("SELECT * FROM sportsdata").all();
    console.log('Daten aus der Datenbank:', sportsData);
    
    res.json({
        message: 'Hallo Kai',
        data: sportsData
    });
});


app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
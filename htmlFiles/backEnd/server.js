const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const database = new Database('database.db', { timeout: 5000 });

database.prepare(`
    CREATE TABLE IF NOT EXISTS sportsdata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ausdauer INTEGER NOT NULL,
        kraft INTEGER NOT NULL,
        schnelligkeit INTEGER NOT NULL,
        koordination INTEGER NOT NULL,
        gesamtwert REAL NOT NULL
    )
`).run();

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
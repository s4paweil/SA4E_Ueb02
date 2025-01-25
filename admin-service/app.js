const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const SECRET_KEY = "supersecretkey";

// Middleware und View-Einstellungen
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Schema
const wishSchema = new mongoose.Schema({
    name: String,
    wish: String,
    status: { type: String, default: "formuliert" }
});
const Wish = mongoose.model('Wish', wishSchema);

// Nutzer aus Datei laden
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
console.log('Benutzer geladen:', users);

// Authentifizierung Middleware
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Token erforderlich' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Decodierte Benutzerinformationen speichern
        next();
    } catch (err) {
        res.status(401).send({ message: 'Ungültiger Token' });
    }
}

// Debugging Middleware (optional)
app.use((req, res, next) => {
    console.log('Host-Header:', req.headers.host);
    next();
});

// Login-Seite
app.get('/admin/login', (req, res) => {
    res.render('login');
});

// Login-Endpoint
app.post('/auth/login', (req, res) => {
    console.log('Anfrage erhalten:', req.body);

    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        console.log('Ungültige Anmeldedaten');
        return res.status(401).send({ success: false, message: 'Ungültige Anmeldedaten!' });
    }

    console.log('Benutzer gefunden:', username);
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    console.log('Token erstellt:', token);

    res.send({ success: true, token });
});

// Dashboard-Seite
app.get('/admin/dashboard', authenticate, (req, res) => {
    res.render('dashboard');
});

// Wünsche abrufen
app.get('/wishes', authenticate, async (req, res) => {
    try {
        const wishes = await Wish.find();
        res.send(wishes);
    } catch (err) {
        console.error('Fehler beim Abrufen der Wünsche:', err);
        res.status(500).send({ message: 'Fehler beim Abrufen der Wünsche' });
    }
});

// Wunschstatus ändern
app.put('/wishes/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedWish = await Wish.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedWish) {
            return res.status(404).send({ message: 'Wunsch nicht gefunden' });
        }
        res.send(updatedWish);
    } catch (err) {
        console.error('Fehler beim Aktualisieren des Wunsches:', err);
        res.status(500).send({ message: 'Fehler beim Aktualisieren des Wunsches' });
    }
});

// Verbindung zu MongoDB
mongoose.connect('mongodb://mongo:27017/xmas_wishes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Server starten
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Admin Service running on port ${PORT}`);
});

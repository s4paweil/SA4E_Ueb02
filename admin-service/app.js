const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const SECRET_KEY = "supersecretkey";

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

// Authentifizierung Middleware
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send({ message: 'Token erforderlich' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send({ message: 'Ungültiger Token' });
    }
}

// Login-Seite
app.get('/admin/login', (req, res) => {
    res.render('login');
});

// Login-Endpoint
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).send({ message: 'Ungültige Anmeldedaten' });

    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    res.send({ token });
});

// Dashboard-Seite
app.get('/admin/dashboard', authenticate, (req, res) => {
    res.render('dashboard');
});

// Wünsche abrufen
app.get('/wishes', authenticate, async (req, res) => {
    const wishes = await Wish.find();
    res.send(wishes);
});

// Wunschstatus ändern
app.put('/wishes/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedWish = await Wish.findByIdAndUpdate(id, { status }, { new: true });
    res.send(updatedWish);
});

// Verbindung zu MongoDB
mongoose.connect('mongodb://mongo:27017/xmas_wishes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = 3001;
app.listen(PORT, () => console.log(`Admin Service running on port ${PORT}`));

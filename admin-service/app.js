const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Schema
const wishSchema = new mongoose.Schema({
    name: { type: String, required: true },
    wish: { type: String, required: true },
    status: { type: String, enum: ["formuliert", "in Bearbeitung", "in Auslieferung", "unter dem Baum"], default: "formuliert" }
});

const Wish = mongoose.model('Wish', wishSchema);

// Verbindung zu MongoDB
mongoose.connect('mongodb://mongo:27017/xmas_wishes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Route für die Anzeige aller Wünsche
app.get('/', async (req, res) => {
    try {
        const wishes = await Wish.find(); // Alle Einträge aus der DB abrufen
        res.render('index', { wishes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Abrufen der Wünsche');
    }
});

// Route zum Aktualisieren des Status
app.post('/update-status', async (req, res) => {
    const { id, status } = req.body;
    try {
        await Wish.findByIdAndUpdate(id, { status }); // Status in der DB aktualisieren
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Fehler beim Aktualisieren des Status');
    }
});

// Server starten
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Admin-Service running on port ${PORT}`);
});

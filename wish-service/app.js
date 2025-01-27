const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Dateien
app.use(express.static(path.join(__dirname, 'public')));

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

// Route für die Eingabeseite
app.get('/', (req, res) => {
    res.render('index');
});

// Route für das Speichern eines Wunsches
app.post('/wish', async (req, res) => {
    const { name, wish } = req.body;
    if (!name || !wish) {
        return res.status(400).send({ message: 'Name und Wunsch sind erforderlich!' });
    }
    try {
        const newWish = new Wish({ name, wish });
        await newWish.save();
        console.log(`Wunsch gespeichert: Name = "${newWish.name}", Wunsch = "${newWish.wish}"`);
        res.render('success');
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Fehler beim Speichern des Wunsches!' });
    }
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Microservice running on port ${PORT}`);
});

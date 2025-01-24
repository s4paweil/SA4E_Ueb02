const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

// MongoDB Schema
const wishSchema = new mongoose.Schema({
    name: String,
    wish: String,
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
    const newWish = new Wish({ name, wish });
    await newWish.save();
    res.status(201).send({ message: 'Wunsch gespeichert!', wish: newWish });
});

// Server starten
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Microservice running on port ${PORT}`);
});
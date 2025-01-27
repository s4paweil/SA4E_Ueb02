import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 10 },  // 10 Benutzer für 30 Sekunden
        { duration: '1m', target: 50 },  // 50 Benutzer für 1 Minute
        { duration: '1m', target: 100 }, // 100 Benutzer für 1 Minute
        { duration: '30s', target: 0 },  // Benutzerzahl auf 0 reduzieren
    ],
};

export default function () {
    // Passe die URL entsprechend deinem Prototypen an
    const url = 'http://192.168.2.120/wish';

    // Beispiel-Daten für den POST-Request
    const payload = JSON.stringify({
        name: 'John Doe',
        wish: 'A new bike',
    });

    // Header für JSON-Daten
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Sende den POST-Request
    let response = http.post(url, payload, params);

    // Optional: Antwort überprüfen
    if (response.status !== 201) {
        console.error(`Fehlerhafte Antwort: ${response.status} ${response.body}`);
    }

    // Pause zwischen den Anfragen
    sleep(1);
}

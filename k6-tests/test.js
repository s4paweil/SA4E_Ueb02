import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 100 },  // 100 VUs für 30 Sekunden
        { duration: '30s', target: 200 },  // 200 VUs für 30 Sekunden
        { duration: '30s', target: 300 },  // 300 VUs für 30 Sekunden
        { duration: '30s', target: 400 },  // 400 VUs für 30 Sekunden
        { duration: '30s', target: 500 },  // 500 VUs für 30 Sekunden
    ],
    thresholds: {
        http_req_duration: ['p(95)<200'], // 95% der Anfragen sollen unter 200ms bleiben
        http_req_failed: ['rate<0.01'],  // Weniger als 1% Fehler erlaubt
    },
};

export default function () {
    const url = 'http://localhost/wish';
    const payload = JSON.stringify({
        name: `Test User ${__VU}-${__ITER}`,
        wish: 'This is a test wish.',
    });

    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(url, payload, params);

    check(res, {
        'status is 201': (r) => r.status === 201,
        'response time is < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1); // Simuliere, dass ein User nach dem Aufruf 1 Sekunde wartet
}

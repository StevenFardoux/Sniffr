import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/* 
* Custom metrics 
*/
const errorRate = new Rate('errors');

/* 
* Test scenarios configuration 
*/
export const options = {
    scenarios: {
        /* 
        * Normal load test 
        */
        normal_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 10 }, // Ramp up to 10 VUs in 30s 
                { duration: '1m', target: 10 },  // Maintain 10 VUs for 1m
                { duration: '30s', target: 0 },  // Ramp down to 0 VUs in 30s
            ],
        },
        /* 
        * High load test 
        */
        high_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 50 },  // Ramp up to 50 VUs in 30s
                { duration: '1m', target: 50 },   // Maintain 50 VUs for 1m
                { duration: '30s', target: 0 },   // Ramp down to 0 VUs in 30s
            ],
        },
        /* 
        * Stress test 
        */
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 100 }, // Ramp up to 100 VUs in 30s
                { duration: '1m', target: 100 },  // Maintain 100 VUs for 1m
                { duration: '30s', target: 0 },   // Ramp down to 0 VUs in 30s
            ],
        },
    },
    thresholds: {
        'http_req_duration': ['p(95)<500'], // 95% of requests must be below 500ms
        'errors': ['rate<0.1'],             // Less than 10% errors
    },
};

/* 
* Base configuration 
*/
const BASE_URL = 'http://localhost:3001'; // Adjust according url
const IMEI = '123456789012345';          // Test IMEI

export default function () {
    /* 
    * Test the /iot/gps/:imei route 
    */
    const response = http.get(`${BASE_URL}/iot/gps/${IMEI}`);

    /* 
    * Check response 
    */
    const success = check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    /* 
    * Record errors 
    */
    errorRate.add(!success);

    /* 
    * Pause between requests 
    */
    sleep(1);
} 
import request from 'supertest';
import Express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from '../config/passport';
import { Group, Device, User, Data } from '../DB';
import DataRouter from '../routes/DataRoutes';
import AuthRouter from '../routes/AuthRoutes';
import { IUsers, IGroups, IDevices } from '../interfaces';
import { Types } from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

/*
* Create Express application for testing
*/
const app = Express();
app.use(bodyParser.json());
app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(DataRouter);
app.use(AuthRouter);

let groupTest: IGroups;
let userTest: IUsers;
let deviceTest: IDevices;

let mongod: MongoMemoryServer;
let agent: any;

beforeAll(async () => {
    /*
    * Use MongoDB Memory Server for testing
    */
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    /*
    * Connect to in-memory database
    */
    await mongoose.connect(uri);

    /*
    * Create an agent to maintain the session between requests
    */
    agent = request.agent(app);

    /*
    * Create test group
    */
    groupTest = await Group.create({
        Name: 'TestGroup',
        Description: 'Group for testing'
    });

    /*
    * Create test user
    */
    userTest = await User.create({
        Username: 'TestUser',
        Email: 'test@example.com',
        Password: 'Test123!@#',
        Role: 1,
        Group_Id: [groupTest._id]
    });

    /*
    * Create test device
    */
    deviceTest = await Device.create({
        IMEI: '123456789012345',
        Name: 'Test-Device',
        BatterieStatus: 75,
        DateLastConn: new Date(),
        DateRegister: new Date(),
        Group_Id: [groupTest._id]
    });


    /*
    * Create some test data
    */
    await Data.create({
        IoT_Id: deviceTest._id,
        ValueReceive: 75,
        TypeValue: 'BATTERY',
        createdAt: new Date()
    });

    await Data.create({
        IoT_Id: deviceTest._id,
        ValueReceive: { latitude: 48.8566, longitude: 2.3522 },
        TypeValue: 'GPS',
        createdAt: new Date()
    });
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});

describe('Data Tests', () => {
    describe('Route /dataPerGroups', () => {
        beforeEach(async () => {
            await agent
                .post('/login')
                .send({
                    Email: userTest.Email,
                    Password: 'Test123!@#'
                }).expect(200);
        });

        test('should return data per groups for the last 7 days', async () => {
            const response = await agent
                .get('/dataPerGroups')
                .expect(200);

            expect(response.body).toHaveProperty('return');
            expect(Array.isArray(response.body.return)).toBe(true);
            
            response.body.return.forEach((day: any) => {
                expect(day).toHaveProperty('date');
                expect(day).toHaveProperty('groups');
                expect(Array.isArray(day.groups)).toBe(true);
                
                day.groups.forEach((group: any) => {
                    expect(group).toHaveProperty('name');
                    expect(group).toHaveProperty('data');
                    expect(typeof group.data).toBe('number');
                });
            });
        });

        test('should return empty array when no data exists', async () => {
            /*
            * Delete all existing data
            */
            await Data.deleteMany({});

            const response = await agent
                .get('/dataPerGroups')
                .expect(200);

            expect(response.body).toHaveProperty('return');
            expect(Array.isArray(response.body.return)).toBe(true);
            expect(response.body.return.length).toBe(0);
        });

        test('should return empty array when user has no groups', async () => {
            /*
            * Update user to have no groups
            */
            await User.findByIdAndUpdate(userTest._id, {
                Group_Id: []
            });

            const response = await agent
                .get('/dataPerGroups')
                .expect(200);

            expect(response.body).toHaveProperty('return');
            expect(Array.isArray(response.body.return)).toBe(true);
            expect(response.body.return.length).toBe(0);
        });
    });

    describe('Route /batteryHistory', () => {
        beforeEach(async () => {
            await agent
                .post('/login')
                .send({
                    Email: userTest.Email,
                    Password: 'Test123!@#'
                }).expect(200);
        });

        test('should return battery history for the last 6 months', async () => {
            const response = await agent
                .get('/batteryHistory')
                .expect(200);

            expect(response.body).toHaveProperty('return');
            expect(Array.isArray(response.body.return)).toBe(true);

            response.body.return.forEach((day: any) => {
                expect(day).toHaveProperty('date');
                expect(day).toHaveProperty('devices');
                expect(Array.isArray(day.devices)).toBe(true);

                day.devices.forEach((device: any) => {
                    expect(device).toHaveProperty('name');
                    expect(device).toHaveProperty('battery');
                    expect(typeof device.battery).toBe('number');
                });
            });
        });

        test('should return empty array when no battery data exists', async () => {
            /*
            * Delete all battery data
            */
            await Data.deleteMany({ TypeValue: 'BATTERY' });

            const response = await agent
                .get('/batteryHistory')
                .expect(200);

            expect(response.body).toHaveProperty('return');
            expect(Array.isArray(response.body.return)).toBe(true);
            expect(response.body.return.length).toBe(0);
        });

        test('should return empty array when device does not exist', async () => {
            /*
            * Delete all battery data
            */
            await Data.deleteMany({ TypeValue: 'BATTERY' });

            const response = await agent
                .get('/batteryHistory')
                .expect(200);

            expect(response.body).toHaveProperty('return');
            expect(Array.isArray(response.body.return)).toBe(true);
            expect(response.body.return.length).toBe(0);
        });
    });

    describe('Route /iot/gps/:imei', () => {
        beforeEach(async () => {
            await User.findByIdAndUpdate(userTest._id, {
                Group_Id: [ groupTest._id ]
            });

            await agent
                .post('/login')
                .send({
                    Email: userTest.Email,
                    Password: 'Test123!@#'
                }).expect(200);
        });

        test('should return GPS data for a specific device', async () => {
            const response = await agent
                .get(`/iot/gps/${deviceTest.IMEI}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            
            response.body.forEach((gpsData: any) => {
                expect(gpsData).toHaveProperty('latitude');
                expect(gpsData).toHaveProperty('longitude');
                expect(typeof gpsData.latitude).toBe('number');
                expect(typeof gpsData.longitude).toBe('number');
            });
        });

        test('should return 404 for non-existent device', async () => {
            /*
            * Delete any device with the tested IMEI to ensure it does not exist
            */
            await Device.deleteMany({ IMEI: '999999999999999' });

            const response = await agent
                .get('/iot/gps/999999999999999')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Device not found');
        });

        test('should return 404 for missing IMEI', async () => {
            const response = await agent
                .get('/iot/gps')
                .expect(404);
        });

        test('should return empty array when no GPS data exists', async () => {
            /*
            * Delete all GPS data
            */
            await Data.deleteMany({ TypeValue: 'GPS' });

            const response = await agent
                .get(`/iot/gps/${deviceTest.IMEI}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        test('should return empty array for device with no GPS data', async () => {
            /*
            * Create a new device without GPS data
            */
            const deviceWithoutGPS = await Device.create({
                IMEI: '111111111111111',
                Name: 'DeviceWithoutGPS',
                BatterieStatus: 100,
                DateLastConn: new Date(),
                DateRegister: new Date(),
                Group_Id: [ groupTest._id ]
            });

            const response = await agent
                .get(`/iot/gps/${deviceWithoutGPS.IMEI}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });
}); 
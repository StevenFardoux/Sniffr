import request from 'supertest';
import Express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from '../config/passport';
import { Group, Device, User } from '../DB';
import DeviceRouter from '../routes/DeviceRoutes'
import AuthRouter from '../routes/AuthRoutes';
import { IUsers,IGroups, IDevices } from '../interfaces';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Types } from 'mongoose';

/**
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
app.use(DeviceRouter);
app.use(AuthRouter);

let groupTestOneDevice: IGroups, groupTestSeveralDevices: IGroups;

let userWithOneDeviceTest: IUsers = {
    _id: new Types.ObjectId(),
    Username: 'TestUserWithOneDevice',
    Email: 'TestWithOneDevice@example.com',
    Password: 'Test123!@#',
    Role: 1,
    Group_Id: []
};

let userWithSeveralDevicesTest: IUsers = {
    _id: new Types.ObjectId(),
    Username: 'TestUserWithSeveralDevices',
    Email: 'TestWithSeveralDevices@example.com',
    Password: 'Test123!@#',
    Role: 1,
    Group_Id: []
};

let userWithoutDeviceTest: IUsers = {
    _id: new Types.ObjectId(),
    Username: 'TestUserWithoutDevice',
    Email: 'TestWithoutDevice@example.com',
    Password: 'Test123!@#',
    Role: 1,
    Group_Id: []
};

let deviceTest1: IDevices = {
    _id: new Types.ObjectId(),
    IMEI: '996838491396098',
    Name: 'IoT-test-001',
    BatterieStatus: 75,
    DateLastConn: new Date(),
    DateRegister: new Date(),
    Group_Id: []
};

let deviceTest2: IDevices = {
    _id: new Types.ObjectId(),
    IMEI: '449150848666618',
    Name: 'IoT-test-002',
    BatterieStatus: 10,
    DateLastConn: new Date(),
    DateRegister: new Date(),
    Group_Id: []
};

let mongod: MongoMemoryServer;
// Define the correct type for the agent
let agent: any;

beforeAll(async () => {
    // Use MongoDB Memory Server for testing
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to in-memory database instead of test database
    await mongoose.connect(uri);

    // Create an agent to maintain the session between requests
    agent = request.agent(app);


    /*
    *
    */
    groupTestOneDevice = await Group.create({
        Name: 'TestGroup1',
        Description: 'Group with one device'
    });

    groupTestSeveralDevices = await Group.create({
        Name: 'TestGroup2',
        Description: 'Group with several devices'
    });


    userWithOneDeviceTest = await User.create({
        ...userWithOneDeviceTest,
        Group_Id: [groupTestOneDevice._id]
    });

    userWithSeveralDevicesTest = await User.create({
        ...userWithSeveralDevicesTest,
        Group_Id: [groupTestSeveralDevices._id]
    });

    userWithoutDeviceTest = await User.create({
        ...userWithoutDeviceTest,
    });


    deviceTest1 = await Device.create({
        ...deviceTest1,
        Group_Id: [groupTestSeveralDevices._id, groupTestOneDevice._id]
    });

    deviceTest2 = await Device.create({
        ...deviceTest2,
        Group_Id: [groupTestSeveralDevices._id]
    });
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});


describe('Device Tests', () => {
    /*
    * Testing /iotbyuser route
    */

    describe('Route /iotbyuser', () => {

        describe("User with one decive", () => {
            beforeEach(async () => {
                await agent
                    .post('/login')
                    .send({
                        Email: userWithOneDeviceTest.Email,
                        Password: 'Test123!@#'
                    }).expect(200);
            });
    
            test("should return the information for the device associated with the user's group", async () => {
                const response = await agent
                    .get('/iotbyuser')
                    .expect(200);
                
                expect(response.body).toHaveProperty('devices');
                expect(response.body.devices.length).toBe(1);

                expect(response.body.devices[0]).toHaveProperty('IMEI', deviceTest1.IMEI);
                expect(response.body.devices[0]).toHaveProperty('Name', deviceTest1.Name);
                expect(response.body.devices[0]).toHaveProperty('BatterieStatus', deviceTest1.BatterieStatus);
                expect(new Date(response.body.devices[0].DateLastConn).toISOString()).toBe(new Date(deviceTest1.DateLastConn).toISOString());
                expect(new Date(response.body.devices[0].DateRegister).toISOString()).toBe(new Date(deviceTest1.DateRegister).toISOString());
                expect(response.body.devices[0].Group_Id.map((id: any) => (id._id ? id._id.toString() : id.toString())))
                    .toEqual(deviceTest1.Group_Id.map((id: any) => id.toString()));
            });
        });

        describe("User with several devices", () => {
            beforeEach(async () => {
                await agent
                .post('/login')
                .send({
                    Email: userWithSeveralDevicesTest.Email,
                    Password: 'Test123!@#'
                }).expect(200);
            });

            test("should return the information for devices associated with the user's group", async () => {
                const response = await agent
                    .get('/iotbyuser')
                    .expect(200);
                
                expect(response.body).toHaveProperty('devices');
                expect(response.body.devices.length).toBe(2);
            });
        });

        describe("User with several devices", () => {
            beforeEach(async () => {
                await agent
                .post('/login')
                .send({
                    Email: userWithoutDeviceTest.Email,
                    Password: 'Test123!@#'
                }).expect(200);
            });

            test("should return the information for devices associated with the user's group", async () => {
                const response = await agent
                    .get('/iotbyuser')
                    .expect(200);
                
                expect(response.body).toHaveProperty('devices');
                expect(response.body.devices.length).toBe(0);
            });
        });
        
    });

    describe('Route /paringIot', () => {
        beforeEach(async () => {
            await agent
                .post('/login')
                .send({
                    Email: userWithOneDeviceTest.Email,
                    Password: 'Test123!@#'
                }).expect(200);
        });

        test("should pair a new device with user's group", async () => {
            // Créer le device à associer dans la base
            await Device.create({
                IMEI: '123456789012345',
                Name: 'Device-to-pair',
                BatterieStatus: 100,
                DateLastConn: new Date(),
                DateRegister: new Date(),
                Group_Id: []
            });

            const newDevice = {
                IMEI: '123456789012345',
                Name: 'New-IoT-Device',
                Group_Id: [groupTestOneDevice._id]
            };

            const response = await agent
                .patch('/paringIot')
                .send(newDevice)
                .expect(200);

            expect(response.body).toHaveProperty('return', 'IoT Successfully paired');
        });

        test("should not pair an already paired device", async () => {
            const response = await agent
                .patch('/paringIot')
                .send({
                    IMEI: deviceTest1.IMEI,
                    Name: 'Already-Paired-Device',
                    Group_Id: [groupTestOneDevice._id]
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Device already paired');
        });

        test("should not pair a non-existent device", async () => {
            const response = await agent
                .patch('/paringIot')
                .send({
                    IMEI: '999999999999999',
                    Name: 'Non-Existent-Device',
                    Group_Id: [groupTestOneDevice._id]
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Device not found');
        });
    });

    describe('Route /updateIot', () => {
        beforeEach(async () => {
            await agent
                .post('/login')
                .send({
                    Email: userWithOneDeviceTest.Email,
                    Password: 'Test123!@#'
                }).expect(200);
        });

        test("should update device information", async () => {
            const updatedInfo = {
                IMEI: deviceTest1.IMEI,
                Name: 'Updated-Device-Name',
                Group_Id: [groupTestOneDevice._id]
            };

            const response = await agent
                .patch('/updateIot')
                .send(updatedInfo)
                .expect(200);

            expect(response.body).toHaveProperty('return', 'IoT successfully updated');
        });

        test("should not update with invalid name length", async () => {
            const response = await agent
                .patch('/updateIot')
                .send({
                    IMEI: deviceTest1.IMEI,
                    Name: 'AB',
                    Group_Id: [groupTestOneDevice._id]
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        test("should not update with missing information", async () => {
            const response = await agent
                .patch('/updateIot')
                .send({
                    IMEI: deviceTest1.IMEI,
                    Group_Id: [groupTestOneDevice._id]
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

    });
});
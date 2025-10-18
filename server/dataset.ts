import { Group, User, Device, Data } from './src/DB';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

/*
 * Generate a large and varied dataset: groups, users, devices, and data
 */
async function generateDataset() {

    /*
     * Create groups
     */
    const groupDatas = [
        { Name: 'Maison', Description: 'Maison familiale' },
        { Name: 'Refuge ESS', Description: 'Refuge pour les animaux' },
        { Name: 'Maison Isabella', Description: 'Maison de Bella' },
        { Name: 'SPA Lille', Description: 'SPA centre Lille' },
        { Name: 'Veterinaire Croix', Description: 'Clinique vétérinaire de Croix' },
        { Name: 'Junia', Description: 'Junia group' },
    ];
    const groups: any[] = [];
    for (const g of groupDatas) {
        let group;
        try {
            group = await Group.create(g);
        } catch (err) {
            group = await Group.findOne({ Name: g.Name });
        }
        groups.push(group);
    }

    /*
     * Create users
     */
    const userDatas = [
        { Username: 'Sage Morgan-Burke', Email: 'sage.morganburke@gmail.com', Password: 'DeltaIotaKappa', Role: 1, Group_Id: [groups[0]._id, groups[1]._id] },
        { Username: 'Jill Royce', Email: 'jill.royce@gmail.com', Password: 'pass', Role: 2, Group_Id: [groups[1]._id] },
        { Username: 'Isabella Roberts', Email: 'isabella.roberts@gmail.com', Password: 'pass', Role: 1, Group_Id: [groups[2]._id, groups[3]._id] },
        { Username: 'Derek Bailey', Email: 'derek.bailey@gmail.com', Password: 'pass4', Role: 1, Group_Id: [groups[3]._id] },
        { Username: 'Russell Burgmeister', Email: 'rusty.burgmeister@gmail.com', Password: 'pass', Role: 2, Group_Id: [groups[4]._id] },
        { Username: 'Maxime Deroulou', Email: 'maxime.deroulou@gmail.com', Password: 'Jun!a2025', Role: 1, Group_Id: [groups[0]._id, groups[1]._id, groups[5]._id] },
        { Username: 'Joseph De Gourcuff', Email: 'djosephdg@gmail.com', Password: 'Jun!a2025', Role: 1, Group_Id: [groups[2]._id, groups[3]._id, groups[5]._id] },
    ];
    const users: any[] = [];
    for (const u of userDatas) {
        let user;
        try {
            user = await User.create(u);
        } catch (err) {
            user = await User.findOne({ Email: u.Email });
        }
        users.push(user);
    }

    /*
     * Create devices
     */
    const deviceDatas: any[] = [];
    for (let i = 0; i < 10; i++) {
        deviceDatas.push({
            IMEI: (100000000000000 + i).toString().padStart(15, '0'),
            Name: `IoT-Device-${(i + 1).toString().padStart(3, '0')}`,
            BatterieStatus: Math.floor(Math.random() * 100),
            DateLastConn: new Date(),
            DateRegister: new Date(Date.now() - Math.random() * 1000000000),
            Group_Id: [groups[i % groups.length]._id, groups[(i + 1) % groups.length]._id]
        });
    }

    /*
     * Add 3 devices for Junia only
     */
    for (let i = 0; i < 3; i++) {
        deviceDatas.push({
            IMEI: (100000000000010 + i).toString().padStart(15, '0'),
            Name: `IoT-Junia-${(i + 1).toString().padStart(3, '0')}`,
            BatterieStatus: Math.floor(Math.random() * 100),
            DateLastConn: new Date(),
            DateRegister: new Date(Date.now() - Math.random() * 1000000000),
            Group_Id: [groups[5]._id]
        });
    }

    /*
     * Add Erwan's devices & Steven's devices
     */
    const specificIMEIs = ['860016044589690', '860016044684798'];
    for (const imei of specificIMEIs) {
        await Device.create({
            IMEI: imei,
            BatterieStatus: Math.floor(Math.random() * 100),
            DateLastConn: new Date(),
            DateRegister: new Date(Date.now() - Math.random() * 1000000000),
            Group_Id: []
        });
    }

    const devices: any[] = [];
    for (const d of deviceDatas) {
        let device;
        try {
            device = await Device.create(d);
        } catch (err) {
            device = await Device.findOne({ IMEI: d.IMEI });
        }
        devices.push(device);
    }

    /*
     * Create data for each device
     */
    for (const device of devices) {
        /*
         * Generate one BATTERY data per day for 2 months
         */
        const days = 60;
        for (let d = 0; d < days; d++) {
            const date = new Date();
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
            date.setDate(date.getDate() - (days - 1 - d));
            await Data.create({
                IoT_Id: device._id,
                ValueReceive: Math.floor(Math.random() * 101),
                TypeValue: 'BATTERY',
                createdAt: date
            });
        }
        /*
         * GPS data: 10 valeurs aléatoires comme avant
         */
        for (let i = 0; i < 10; i++) {
            try {
                await Data.create({
                    IoT_Id: device._id,
                    ValueReceive: { latitude: 48 + Math.random(), Longitude: 2 + Math.random() },
                    TypeValue: 'GPS',
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 60)) // up to 2 months ago
                });
            } catch { }
        }
    }
    console.log('Large dataset generated!');
}

if (require.main === module) {
    mongoose.connect('mongodb://localhost:27017/ess_company').then(() => {
        generateDataset().then(() => {
            console.log('Dataset import finished.');
            process.exit(0);
        }).catch((err) => {
            console.error('Dataset import failed:', err);
            process.exit(1);
        });
    });
}

export default generateDataset;

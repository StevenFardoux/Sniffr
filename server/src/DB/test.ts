import { Error } from "mongoose"
import { Data, Device, Group, User } from "../DB";
import { print } from "../utils";



async function testDb() {

    let group1, group2, device;


    /**
    * Test Groups creation
    */
    try {
        group1 = await Group.create({
            Name: "ASGame",
            Description: "An ESS company branch"
        });
        console.log(group1);
    } catch (err) {
        // console.log(err);
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            /*
            * 11000 code = deplicate data in mongo collection 
            */
            if (err.code == 11000) {
                group1 = await Group.findOne({ Name: "ASGame" });
                console.log(group1);
            }

            console.error("MongoDB error :", err.message);
        }
    }


     /**
    * Test Groups creation
    */
     try {
        group2 = await Group.create({
            Name: "Society",
            Description: "ESS parent company"
        });
        console.log(group2);
    } catch (err) {
        // console.log(err);
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            /*
            * 11000 code = deplicate data in mongo collection 
            */
            if (err.code == 11000) {
                group2 = await Group.findOne({ Name: "ASGame" });
                console.log(group2);
            }

            console.error("MongoDB error :", err.message);
        }
    }
    


    /**
    * Test Users creation
    */
    try {
        const user = await User.create({
            Username: "Sage",
            Email: "sage.morgan_burke@gmail.com",
            Password: "DeltaIotaKappa",
            Role: 1,
            Group_Id: [group1?._id, group2?._id]
        });
        console.log(user)
    } catch (err) {
        // console.log(err);
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            /*
            * 11000 code = deplicate data in mongo collection 
            */
             if (err.code == 11000) {
                const user = await User.findOne({ Email: "sage.morgan_burke@gmail.com" });
                console.log(user);
            }
            console.error("MongoDB error :", err.message);
        }
    }
    


    /**
    * Test Device creation with all groups
    */
    try {
        device = await Device.create({
            IMEI: "455213022107121",
            Name: "IoT-ESS-0001",
            BatterieStatus: 0,
            DateLastConn: new Date().toISOString(),
            DateRegister: new Date().toISOString(),
            Group_Id: [group1?._id, group2?._id]
        });
        console.log(device);
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            /*
            * 11000 code = deplicate data in mongo collection 
            */
            if (err.code == 11000) {
                device = await Device.findOne({ IMEI: "455213022107121" });
                console.log(device);
            }
            
            console.error("MongoDB error :", err.message);
        }
    }

    /**
    * Test Device creation with only group1 
    */
    try {
        device = await Device.create({
            IMEI: "499753041996010",
            Name: "IoT-ESS-0002",
            BatterieStatus: 0,
            DateLastConn: new Date().toISOString(),
            DateRegister: new Date().toISOString(),
            Group_Id: [group1?._id]
        });
        console.log(device);
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            /*
            * 11000 code = deplicate data in mongo collection 
            */
            if (err.code == 11000) {
                device = await Device.findOne({ IMEI: "455213022107121" });
                console.log(device);
            }
            
            console.error("MongoDB error :", err.message);
        }
    }

    /**
    * Test Device creation with only group2
    */
    try {
        device = await Device.create({
            IMEI: "016493711841766",
            Name: "IoT-ESS-0003",
            BatterieStatus: 0,
            DateLastConn: new Date().toISOString(),
            DateRegister: new Date().toISOString(),
            Group_Id: [group2?._id]
        });
        console.log(device);
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            /*
            * 11000 code = deplicate data in mongo collection 
            */
            if (err.code == 11000) {
                device = await Device.findOne({ IMEI: "455213022107121" });
                console.log(device);
            }
            
            console.error("MongoDB error :", err.message);
        }
    }

    /**
    * Test Device creation without group
    */
    try {
        device = await Device.create({
            IMEI: "548268205922901",
            Name: "IoT-ESS-0004",
            BatterieStatus: 0,
            DateLastConn: new Date().toISOString(),
            DateRegister: new Date().toISOString(),
            Group_Id: []
        });
        console.log(device);
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            /*
            * 11000 code = deplicate data in mongo collection 
            */
            if (err.code == 11000) {
                device = await Device.findOne({ IMEI: "455213022107121" });
                console.log(device);
            }
            
            console.error("MongoDB error :", err.message);
        }
    }


    /**
    * Test GPS Data creation
    */
    try {
        const dataGps = await Data.create({
            IoT_Id: device?._id,
            ValueReceive: {
                latitude: 48.862725,
                Longitude: 2.287592
            },
            TypeValue: "GPS"
        });
        console.log(dataGps);
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            console.error("MongoDB error :", err.message);
        }
    }


    /**
    * Test number Data creation
    */
    try {
        console.log(device)
        const dataNum = await Data.create({
            IoT_Id: device?._id,
            ValueReceive: 47.5,
            TypeValue: "NUMBER"
        });
        console.log(dataNum);
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            console.error("MongoDB error :", err.message);
        }
    }
    

    /**
    * Test string Data creation
    */
    try {
        
        const dataStr = await Data.create({
            IoT_Id: device?._id,
            ValueReceive: "Fire in the house !",
            TypeValue: "STR"
        });
        console.log(dataStr);
    } catch (err) {
        if (err instanceof Error.ValidationError) {
            console.error("Validation TesError :", err.message);
        } else {
            console.error("MongoDB error :", err.message);
        }
    }

    print("Data Created");
}


export default testDb;
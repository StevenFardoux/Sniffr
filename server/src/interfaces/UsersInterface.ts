import { Types } from 'mongoose';

/*
* ObjectId refers to the mongo automatic id
*/
export interface IUsers {
    _id: Types.ObjectId,
    Username: String,
    Email: String,
    Password: String,
    Role: Number,
    Group_Id: Types.ObjectId[]
}
import { ObjectId } from 'mongoose';

export interface IGroups {
    _id: ObjectId,
    Name: String,
    Description: String
}
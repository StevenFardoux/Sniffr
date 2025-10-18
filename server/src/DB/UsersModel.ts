import { compareSync, genSaltSync, hash } from "bcrypt";
import { Schema, model, ObjectId, Model } from "mongoose";
import { IUsers } from "../interfaces";

/**
 * User model schema definition
 * @property {string} Username - User's username
 * @property {string} Email - User's email address
 * @property {string} Password - Hashed password
 * @property {number} Role - User's role level
 * @property {ObjectId[]} Group_Id - References to associated groups
 */
const UsersSchema = new Schema<IUsers>({
    Username: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
    Role: {
        type: Number,
        required: true,
    },
    Group_Id: {
        type: [Schema.Types.ObjectId],
        ref: "Group",
    },
});

/**
 * User class extending Mongoose Model with password verification method
 */
class UserClass extends Model<IUsers> {
    /**
     * Verifies if provided password matches the hashed password
     * @param {string} password - Plain text password to verify
     * @returns {boolean} True if password matches, false otherwise
     */
    verifyPassword(password: string): boolean {
        return compareSync(password, this.Password);
    }
}

UsersSchema.loadClass(UserClass);

UsersSchema.pre("save", async function (this: UserClass, next) {
    if (this.isModified("Password") || this.isNew) {
        this.Password = await hash(this.Password, genSaltSync(10));
    }

    /**
     * Defines the user as a simple user (just for security)
     */
    this.Role = 1;

    next();
});

const User = model<IUsers, UserClass>("User", UsersSchema);

export default User;

import { Document, Types} from "mongoose";

 export interface IUser extends Document {
readonly name?: string;
readonly email?: string;
readonly password?: string;
readonly roomId?: Types.ObjectId;
readonly avatar?: string;
readonly googleToken?: string;
}

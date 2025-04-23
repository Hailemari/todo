import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the User document
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

// Define the schema for the User model
const userSchema: Schema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password']
  }
}, {
  timestamps: true
});

// Create the User model from the schema and export it
const User = mongoose.model<IUser>('User', userSchema);
export default User;

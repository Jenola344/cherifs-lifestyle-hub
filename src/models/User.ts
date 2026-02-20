import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    image: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    favorites: [{ type: String }], // Array of Art IDs
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);

import mongoose from 'mongoose';

const ArtSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    sizes: [{ type: String }],
    image: { type: String, required: true }, // Cloudinary URL
    status: { type: String, enum: ['available', 'sold out'], default: 'available' },
}, { timestamps: true });

export default mongoose.models.Art || mongoose.model('Art', ArtSchema);

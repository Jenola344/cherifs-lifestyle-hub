import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    artId: { type: String, required: true, index: true },
    userName: { type: String, required: true, maxlength: 100 },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 2000, default: '' },
}, { timestamps: true });

// One review per user per artwork — enforced at the DB level
ReviewSchema.index({ artId: 1, userEmail: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);

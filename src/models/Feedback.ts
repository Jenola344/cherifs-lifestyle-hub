import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    userName: { type: String, required: true, maxlength: 100 },
    email: { type: String, maxlength: 200, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, maxlength: 3000 },
}, { timestamps: true });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

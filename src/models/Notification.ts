import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: { type: String, default: 'all' },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    readBy: [{ type: String }] // Array of User IDs who have read this
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

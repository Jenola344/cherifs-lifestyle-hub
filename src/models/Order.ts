import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    customerName: { type: String },
    userEmail: { type: String },
    platform: { type: String, default: 'web' },
    items: [{
        artId: String,
        title: String,
        price: Number,
        image: String,
        size: String,
        frame: String,
        quantity: Number
    }],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    shippingAddress: {
        name: String,
        address: String,
        city: String,
        phone: String
    }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

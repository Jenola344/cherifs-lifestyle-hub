import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: [{
        artId: String,
        title: String,
        price: Number,
        image: String
    }],
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    shippingAddress: {
        name: String,
        address: String,
        city: String,
        phone: String
    }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

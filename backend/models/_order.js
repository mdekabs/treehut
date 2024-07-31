import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
        quantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true }
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;

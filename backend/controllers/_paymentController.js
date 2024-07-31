import HttpStatus from 'http-status-codes';
import stripe from "stripe";
import {Order, Payment} from '../models/index.js';
import { responseHandler } from '../utils/index.js';

const stripeInstance = stripe(process.env.STRIPE_KEY);

const PaymentController = {
    async create_payment(req, res) {
        try {
            const { tokenId, amount, orderId } = req.body;
            const userId = req.user.id;

            const order = await Order.findById(orderId);
            if (!order) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Order not found");
            }

            const charge = await stripeInstance.charges.create({
                source: tokenId,
                amount,
                currency: "usd"
            });

            const payment = new Payment({
                order: orderId,
                user: userId,
                transactionId: charge.id,
                amount,
                status: charge.status
            });

            const savedPayment = await payment.save();

            responseHandler(res, HttpStatus.OK, "success", "Payment processed successfully", { payment: savedPayment });
        } catch (error) {
            console.error("Error processing payment:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Payment processing failed", { error });
        }
    },

    async get_payments(req, res) {
        try {
            const payments = await Payment.find({ user: req.user.id }).populate('order');
            responseHandler(res, HttpStatus.OK, "success", "Payments retrieved successfully", { payments });
        } catch (error) {
            console.error("Error retrieving payments:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to retrieve payments", { error });
        }
    },

    async get_payment_by_id(req, res) {
        try {
            const payment = await Payment.findById(req.params.id).populate('order');
            if (!payment || payment.user.toString() !== req.user.id) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Payment not found");
            }
            responseHandler(res, HttpStatus.OK, "success", "Payment retrieved successfully", { payment });
        } catch (error) {
            console.error("Error retrieving payment:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to retrieve payment", { error });
        }
    }
};

export default PaymentController;

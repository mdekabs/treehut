import HttpStatus from 'http-status-codes';
import { Order, User, Food, StoreCredit, Payment } from '../models/index.js';
import { responseHandler } from '../utils/index.js';
import { scheduleShipmentEmails, responseHandler } from '../utils/index.js';
import StoreCreditController from './storeCreditController.js';
import ShipmentController from './shipmentController.js';

const STORE_CREDIT_EXPIRY = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 months

const OrderController = {
    // Create a new order
    create_order: async (req, res) => {
        try {
            const { items, paymentTokenId } = req.body; // Add paymentTokenId for payment processing
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'User not found');
            }

            const foodItems = await Promise.all(items.map(async (item) => {
                const food = await Food.findById(item.food);
                if (!food) {
                    throw new Error(`Food item with ID ${item.food} not found`);
                }
                return {
                    food: item.food,
                    quantity: item.quantity,
                    price: item.quantity * food.pricePerLiter
                };
            }));

            const totalPrice = foodItems.reduce((sum, item) => sum + item.price, 0);
            const fixedShippingFee = 2;
            let payableAmount = totalPrice + fixedShippingFee;

            // Apply store credit if available
            let storeCredit = await StoreCredit.findOne({ user: userId });
            if (storeCredit && storeCredit.amount > 0) {
                const creditToApply = Math.min(storeCredit.amount, payableAmount);
                payableAmount -= creditToApply;
                storeCredit.amount -= creditToApply;
                if (storeCredit.amount === 0) {
                    storeCredit.expiryDate = null;
                }
                await storeCredit.save();
            }

            // Create the order
            const newOrder = new Order({
                user: userId,
                items: foodItems,
                totalPrice: totalPrice,
                deliveryAddress: user.deliveryAddress,
                contactPhoneNumber: user.contactPhoneNumber,
                email: user.email,
                status: 'pending'
            });

            const order = await newOrder.save();

            // Create a payment
            if (paymentTokenId) {
                const payment = new Payment({
                    orderId: order._id,
                    tokenId: paymentTokenId,
                    amount: payableAmount
                });
                await payment.save();
            }

            // Create a shipment
            const trackingNumber = `${userId}-${order._id}`;
            const shipment = await ShipmentController.createShipment({
                orderId: order._id,
                carrier: 'default-carrier', // Set default carrier or use dynamic data
                estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 1 day later
            });

            // Schedule shipment emails
            scheduleShipmentEmails(user.email, trackingNumber);

            responseHandler(res, HttpStatus.CREATED, 'success', 'Order created successfully', { order, shipment });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong, please try again', { error: err.message });
        }
    },

    // Get all orders for the authenticated user
    get_orders: async (req, res) => {
        try {
            const orders = await Order.find({ user: req.user.id }).populate('items.food');
            responseHandler(res, HttpStatus.OK, 'success', 'Orders retrieved successfully', { orders });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong, please try again', { error: err.message });
        }
    },

    // Get a specific order by ID
    get_order_by_id: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id).populate('items.food');
            if (!order || order.user.toString() !== req.user.id) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'Order not found');
            }
            responseHandler(res, HttpStatus.OK, 'success', 'Order retrieved successfully', { order });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong, please try again', { error: err.message });
        }
    },

    // Update an order (for completeness, though orders should not be updated with new deliveryAddress, etc.)
    update_order: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);
            if (!order || order.user.toString() !== req.user.id) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'Order not found');
            }
            responseHandler(res, HttpStatus.OK, 'success', 'Order updated successfully', { order });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong, please try again', { error: err.message });
        }
    },

    // Cancel an order and issue store credit
    cancel_order_and_issue_store_credit: async (req, res) => {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId);
            if (!order) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'Order not found');
            }

            const user = await User.findById(order.user);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'User not found');
            }

            if (order.status !== 'pending') {
                return responseHandler(res, HttpStatus.BAD_REQUEST, 'error', 'Order cannot be cancelled');
            }

            const storeCreditAmount = order.totalPrice;
            let storeCredit = await StoreCredit.findOne({ user: user._id });

            if (!storeCredit) {
                storeCredit = new StoreCredit({
                    user: user._id,
                    amount: storeCreditAmount,
                    expiryDate: STORE_CREDIT_EXPIRY
                });
            } else {
                storeCredit.amount += storeCreditAmount;
                storeCredit.expiryDate = STORE_CREDIT_EXPIRY; // Extend expiry date if needed
            }

            await storeCredit.save();
            order.status = 'cancelled';
            await order.save();

            responseHandler(res, HttpStatus.OK, 'success', 'Order cancelled and store credit issued', { storeCredit });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong, please try again', { error: err.message });
        }
    }
};

export default OrderController;

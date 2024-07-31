import HttpStatus from 'http-status-codes';
import {StoreCredit, Order} from '../models/StoreCredit.js';
import { responseHandler } from '../utils/index.js';

const STORE_CREDIT_EXPIRY = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 months

const StoreCreditController = {
    // Issue store credit for a canceled order
    async issue_store_credit(req, res) {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId);

            if (!order) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Order not found");
            }

            const userId = order.user;
            const storeCreditAmount = order.totalPrice;

            let storeCredit = await StoreCredit.findOne({ user: userId });

            if (!storeCredit) {
                storeCredit = new StoreCredit({
                    user: userId,
                    amount: storeCreditAmount,
                    expiryDate: STORE_CREDIT_EXPIRY
                });
            } else {
                storeCredit.amount += storeCreditAmount;
                storeCredit.expiryDate = STORE_CREDIT_EXPIRY; // Extend expiry date if needed
            }

            await storeCredit.save();

            responseHandler(res, HttpStatus.OK, "success", "Store credit issued successfully", { storeCredit });
        } catch (error) {
            console.error("Error issuing store credit:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to issue store credit", { error });
        }
    },

    // Get available store credit for the authenticated user
    async get_store_credits(req, res) {
        try {
            const userId = req.user.id;
            const storeCredit = await StoreCredit.findOne({ user: userId });

            if (!storeCredit) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "No store credit found for the user");
            }

            responseHandler(res, HttpStatus.OK, "success", "Store credit retrieved successfully", { storeCredit });
        } catch (error) {
            console.error("Error retrieving store credit:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to retrieve store credit", { error });
        }
    },

    // Apply store credit to a new order
    async apply_store_credit(req, res) {
        try {
            const userId = req.user.id;
            const { amountToApply } = req.body;
            let storeCredit = await StoreCredit.findOne({ user: userId });

            if (!storeCredit || storeCredit.amount <= 0) {
                return responseHandler(res, HttpStatus.BAD_REQUEST, "error", "No store credit available to apply");
            }

            const creditToApply = Math.min(storeCredit.amount, amountToApply);
            storeCredit.amount -= creditToApply;

            if (storeCredit.amount === 0) {
                storeCredit.expiryDate = null;
            }

            await storeCredit.save();
            responseHandler(res, HttpStatus.OK, "success", "Store credit applied successfully", { appliedAmount: creditToApply });
        } catch (error) {
            console.error("Error applying store credit:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to apply store credit", { error });
        }
    },

    // Check if store credit has expired
    async check_expiry(req, res) {
        try {
            const userId = req.user.id;
            const storeCredit = await StoreCredit.findOne({ user: userId });

            if (!storeCredit) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "No store credit found for the user");
            }

            const isExpired = storeCredit.expiryDate && new Date() > new Date(storeCredit.expiryDate);
            responseHandler(res, HttpStatus.OK, "success", "Store credit expiry status retrieved successfully", { isExpired });
        } catch (error) {
            console.error("Error checking store credit expiry:", error);
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Failed to check store credit expiry", { error });
        }
    }
};

export default StoreCreditController;

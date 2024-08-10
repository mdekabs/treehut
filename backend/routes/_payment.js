import express from "express";
import { PaymentController } from "../controllers/index.js";
import { authenticationVerifier, isAdminVerifier } from "../middlewares/index.js";
import { validateRequest } from "../middlewares/index.js";
import Joi from "joi";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: API for managing payments
 */

// Define validation schemas
const createPaymentSchema = Joi.object({
    tokenId: Joi.string().required(),
    amount: Joi.number().integer().min(1).required(),
    orderId: Joi.string().required()
});

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: The token ID for the payment
 *               amount:
 *                 type: integer
 *                 description: The amount to be charged (in cents)
 *               orderId:
 *                 type: string
 *                 description: The ID of the order being paid for
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticationVerifier, validateRequest(createPaymentSchema), PaymentController.create_payment);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments for the authenticated user
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', isAdminVerifier, PaymentController.get_payments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get a specific payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the payment
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', isAdminVerifier, authenticationVerifier, PaymentController.get_payment_by_id);

export default router;

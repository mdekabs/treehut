import express from "express";
import { OrderController } from "../controllers/index.js";
import { authenticationVerifier, isAdminVerifier, accessLevelVerifier } from "../middlewares/index.js";
import { validateRequest } from "../middlewares/index.js";
import Joi from "joi";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API for managing orders
 */

// Define validation schemas
const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            food: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
        })
    ).required(),
    paymentTokenId: Joi.string().required(),
});

const updateOrderSchema = Joi.object({
    deliveryAddress: Joi.string(),
    contactPhoneNumber: Joi.string(),
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     food:
 *                       type: string
 *                       description: The ID of the food item
 *                     quantity:
 *                       type: integer
 *                       description: The quantity of the food item
 *               paymentTokenId:
 *                 type: string
 *                 description: The payment token ID
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticationVerifier, validateRequest(createOrderSchema), OrderController.create_order);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', isAdminVerifier, OrderController.get_orders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticationVerifier, accessLevelVerifier, OrderController.get_order_by_id);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryAddress:
 *                 type: string
 *               contactPhoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', isAdminVerifier, validateRequest(updateOrderSchema), OrderController.update_order);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   delete:
 *     summary: Cancel an order and issue store credit
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled and store credit issued
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/cancel', isAdminVerifier, OrderController.cancel_order_and_issue_store_credit);

export default router;

import express from "express";
import Joi from "joi";
import { ReviewController } from "../controllers/index.js";
import { authenticationVerifier } from "../middlewares/index.js";
import { validateRequest } from "../middlewares/index.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API for managing reviews
 */

// Define validation schemas
const createReviewSchema = Joi.object({
    foodId: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().optional()
});

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foodId:
 *                 type: string
 *                 description: The ID of the food item being reviewed
 *               rating:
 *                 type: integer
 *                 description: The rating given to the food item (1 to 5)
 *               comment:
 *                 type: string
 *                 description: Optional comment about the food item
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticationVerifier, validateRequest(createReviewSchema), ReviewController.create_review);

/**
 * @swagger
 * /reviews/{foodId}:
 *   get:
 *     summary: Get all reviews for a food item
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: foodId
 *         required: true
 *         description: The ID of the food item
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:foodId', ReviewController.get_reviews);

export default router;

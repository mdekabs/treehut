import express from "express";
import Joi from "joi";
import { FoodController } from "../controllers/index.js";
import { validateRequest, isAdminVerifier } from "../middlewares/index.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Food
 *   description: Food management
 */

// Define schemas for validation
const foodSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().uri().required(),
    basePrice: Joi.number().positive().required(),
    pricePerLiter: Joi.number().positive().required()
});

/**
 * @swagger
 * /food:
 *   post:
 *     summary: Create a new food item
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Food'
 *     responses:
 *       201:
 *         description: Food item created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       500:
 *         description: Internal server error
 */
router.post('/', isAdminVerifier, validateRequest(foodSchema), FoodController.create_food);

/**
 * @swagger
 * /food:
 *   get:
 *     summary: Get all food items
 *     tags: [Food]
 *     responses:
 *       200:
 *         description: Food items retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/', FoodController.get_foods);

/**
 * @swagger
 * /food/{id}:
 *   get:
 *     summary: Get a food item by ID
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the food item
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food item retrieved successfully
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', FoodController.get_food_by_id);

/**
 * @swagger
 * /food/{id}:
 *   put:
 *     summary: Update a food item
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the food item to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Food'
 *     responses:
 *       200:
 *         description: Food item updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', isAdminVerifier, validateRequest(foodSchema), FoodController.update_food);

/**
 * @swagger
 * /food/{id}:
 *   delete:
 *     summary: Delete a food item
 *     tags: [Food]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the food item to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food item deleted successfully
 *       404:
 *         description: Food item not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', isAdminVerifier, FoodController.delete_food);

export default router;

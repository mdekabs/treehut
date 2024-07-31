import HttpStatus from "http-status-codes";
import Food from "../models/_food.js";
import User from "../models/_user.js";
import { responseHandler } from "../utils/index.js";

const FoodController = {
    create_food: async (req, res) => {
        try {
            const { title, description, image, basePrice, pricePerLiter } = req.body;
            const userId = req.user.id;

            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            const newFood = new Food({
                title,
                description,
                image,
                basePrice,
                pricePerLiter,
                user: userId
            });

            const food = await newFood.save();
            responseHandler(res, HttpStatus.CREATED, "success", "Food item created successfully", { food });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    },

    get_foods: async (req, res) => {
        try {
            const userId = req.user.id; // Ensure user is authenticated
            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            // Retrieve all food items without populating the user field
            const foods = await Food.find();
            responseHandler(res, HttpStatus.OK, "success", "Food items retrieved successfully", { foods });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    },

    get_food_by_id: async (req, res) => {
        try {
            const userId = req.user.id; // Ensure user is authenticated
            const user = await User.findById(userId);
            if (!user) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "User not found");
            }

            // Retrieve a specific food item by ID without populating the user field
            const food = await Food.findById(req.params.id);
            if (!food) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Food item not found");
            }
            responseHandler(res, HttpStatus.OK, "success", "Food item retrieved successfully", { food });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    },

    update_food: async (req, res) => {
        try {
            const { title, description, image, basePrice, pricePerLiter } = req.body;
            const userId = req.user.id;

            const food = await Food.findById(req.params.id);

            if (!food) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Food item not found");
            }

            food.title = title || food.title;
            food.description = description || food.description;
            food.image = image || food.image;
            food.basePrice = basePrice || food.basePrice;
            food.pricePerLiter = pricePerLiter || food.pricePerLiter;

            const updatedFood = await food.save();
            responseHandler(res, HttpStatus.OK, "success", "Food item updated successfully", { updatedFood });
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    },

    delete_food: async (req, res) => {
        try {
            const userId = req.user.id;

            const food = await Food.findById(req.params.id);
            if (!food) {
                return responseHandler(res, HttpStatus.NOT_FOUND, "error", "Food item not found");
            }

            await food.remove();
            responseHandler(res, HttpStatus.OK, "success", "Food item deleted successfully");
        } catch (err) {
            responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, "error", "Something went wrong, please try again", { error: err.message });
        }
    }
};

export default FoodController;

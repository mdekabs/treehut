import HttpStatus from 'http-status-codes';
import Review from '../models/_review.js';
import Food from '../models/_food.js'; // Adjust the import path as necessary
import { responseHandler } from '../utils/index.js';

const ReviewController = {
  // Create a new review
  async create_review(req, res) {
    const { foodId, rating, comment } = req.body;
    const userId = req.user._id; // Get user ID from req.user

    try {
      const food = await Food.findById(foodId);
      if (!food) {
        return responseHandler(res, HttpStatus.NOT_FOUND, 'error', 'Food item not found');
      }

      const newReview = new Review({
        foodId,
        userId,
        rating,
        comment,
      });

      const savedReview = await newReview.save();
      responseHandler(res, HttpStatus.CREATED, 'success', 'Review created successfully', { review: savedReview });
    } catch (err) {
      responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong, please try again', { err });
    }
  },

  // Get all reviews for a food item
  async get_reviews(req, res) {
    const { foodId } = req.params;

    try {
      const reviews = await Review.find({ foodId });
      responseHandler(res, HttpStatus.OK, 'success', 'Reviews retrieved successfully', { reviews });
    } catch (err) {
      responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong, please try again', { err });
    }
  },
};

export default ReviewController;

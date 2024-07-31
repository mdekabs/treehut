import Joi from 'joi';
import { responseHandler } from "../utils/index.js";
import HttpStatus from "http-status-codes";
import emailValidator from 'email-validator';
import { parsePhoneNumberFromString, isValidNumber } from 'libphonenumber-js';

// Function to validate phone number globally
const validatePhoneNumber = (phoneNumber) => {
    const phoneNumberObj = parsePhoneNumberFromString(phoneNumber);
    return phoneNumberObj && isValidNumber(phoneNumberObj.number);
};

// Middleware function
const validateRequest = (schema) => {
    return async (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return responseHandler(res, HttpStatus.BAD_REQUEST, 'error', error.details[0].message);
        }

        const validations = [
            { 
                condition: req.body.email && !emailValidator.validate(req.body.email), 
                message: 'Invalid email address' 
            },
            { 
                condition: req.body.phoneNumber && !validatePhoneNumber(req.body.phoneNumber), 
                message: 'Invalid phone number' 
            }
        ];

        try {
            for (const validation of validations) {
                if (validation.condition) {
                    return responseHandler(res, HttpStatus.BAD_REQUEST, 'error', validation.message);
                }
            }
        } catch (err) {
            return responseHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'error', 'Something went wrong during validation', { error: err.message });
        }

        next();
    };
};

export default validateRequest;

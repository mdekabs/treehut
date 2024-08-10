import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import fs from "fs";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import { swaggerOptions } from "./swaggerConfig.js";
import { Pagination, cacheResponse } from "./middlewares/index.js";
import { authRoute, userRoute, foodRoute, orderRoute, paymentRoute, reviewRoute } from "./routes/index.js";

dotenv.config();

const app = express();
const theme = new SwaggerTheme();

// Enable CORS
app.use(cors());

// Middleware configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Morgan Logging to Console and File
const logStream = fs.createWriteStream('./access.log', { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// Swagger setup
const swaggerDocs = swaggerJsdoc(swaggerOptions);
const options = {
  explorer: true,
  customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK)
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));

// Route definitions
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", Pagination, userRoute);
app.use("/api/v1/foods", Pagination, cacheResponse(300), foodRoute);
app.use("/api/v1/orders", Pagination, orderRoute);
app.use("/api/v1/payments", Pagination, paymentRoute);
app.use("/api/v1/reviews", Pagination, cacheResponse(300), reviewRoute);

// Database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Successfully connected to the database");
  } catch (err) {
    console.error("Could not connect to the database:", err);
    process.exit(1);
  }
}

connectToDatabase();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server on HTTP
const PORT = process.env.PORT;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT} with HTTP`);
});

export { app, server };

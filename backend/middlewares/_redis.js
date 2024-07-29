import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CONNECTION_TIMEOUT = 12000;
const DEFAULT_EXPIRATION = 3700;

let instance = null;

class RedisClient {
  constructor() {
    if (!instance) {
      instance = this;
      this.client = createClient({
        url: REDIS_URL,
        socket: {
          connectTimeout: CONNECTION_TIMEOUT,
        },
      });

      this.alive = false;
      this.client.connect()
        .then(() => {
          this.alive = true;
          console.log("Redis client ready");
        })
        .catch((error) => {
          console.error("Redis connection error:", error);
        });

      this.client.on("error", (error) => {
        console.error("Redis error:", error);
        this.alive = false;
      });

      this.client.on("ready", () => {
        this.alive = true;
      });
    }

    return instance;
  }

  isAlive = () => this.alive;

  get = async (key) => {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis GET error:", error);
    }
  };

  set = async (key, value, duration = DEFAULT_EXPIRATION) => {
    try {
      await this.client.set(key, value, { EX: duration });
    } catch (error) {
      console.error("Redis SET error:", error);
    }
  };

  del = async (key) => {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Redis DEL error:", error);
    }
  };
}

const redisClient = new RedisClient();

const redisMiddleware = (req, res, next) => {
  req.redisClient = redisClient;
  next();
};

export { redisClient, redisMiddleware };

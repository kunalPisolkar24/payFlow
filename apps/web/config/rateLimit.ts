import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redisDB"

const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(30, "60 s"), 
});

export default rateLimiter;
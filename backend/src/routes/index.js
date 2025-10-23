import { Router } from "express";
import userRouter from "./auth.routes.js";

const mainRouter = Router();

mainRouter.use("/auth", userRouter);

export default mainRouter;

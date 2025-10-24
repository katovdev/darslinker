import { Router } from "express";
import {
  create,
  findAll,
  findOne,
  remove,
  update,
} from "../controllers/user.controller.js";

import {
  updateUserSchema,
  userIdSchema,
} from "../validations/user.validation.js";

import { validate } from "../middlewares/validation.middleware.js";

const userRouter = Router();

userRouter.post("/create", create);
userRouter.get("/find-all", findAll);
userRouter.get("/:id", validate(userIdSchema), findOne);
userRouter.patch("/update:id", validate(updateUserSchema), update);
userRouter.delete("/delete:id", validate(userIdSchema), remove);

export default userRouter;

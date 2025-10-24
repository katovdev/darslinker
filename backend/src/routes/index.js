import { Router } from "express";

import authRouter from "./auth.routes.js";
import teacherRouter from "./teacher.routes.js";
import studentRouter from "./student.routes.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/teachers", teacherRouter);
mainRouter.use("/students", studentRouter);

export default mainRouter;

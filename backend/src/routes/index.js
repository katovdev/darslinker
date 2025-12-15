import { Router } from "express";

import authRouter from "./auth.routes.js";
import teacherRouter from "./teacher.routes.js";
import studentRouter from "./student.routes.js";
import courseRouter from "./course.routes.js";
import moduleRouter from "./module.routes.js";
import lessonRouter from "./lesson.routes.js";
import assignmentRouter from "./assignment.routes.js";
import submissionRouter from "./submission.routes.js";
import uploadRouter from "./upload.routes.js";
import landingRouter from "./landing.routes.js";
import landingAuthRouter from "./landing-auth.routes.js";
import telegramRouter from "./telegram.routes.js";
import streamRouter from "./stream.routes.js";
import notificationRouter from "./notification.routes.js";
import subAdminRouter from "./sub-admin.routes.js";
import paymentRouter from "./payment.routes.js";
import blogRouter from "./blog.routes.js";
import categoryRouter from "./category.routes.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/teachers", teacherRouter);
mainRouter.use("/students", studentRouter);
mainRouter.use("/courses", courseRouter);
mainRouter.use("/modules", moduleRouter);
mainRouter.use("/lessons", lessonRouter);
mainRouter.use("/assignments", assignmentRouter);
mainRouter.use("/submissions", submissionRouter);
mainRouter.use("/upload", uploadRouter);
mainRouter.use("/stream", streamRouter);
mainRouter.use("/landing", landingRouter);
mainRouter.use("/landing-auth", landingAuthRouter);
mainRouter.use("/telegram", telegramRouter);
mainRouter.use("/notifications", notificationRouter);
mainRouter.use("/sub-admins", subAdminRouter);
mainRouter.use("/payments", paymentRouter);
mainRouter.use("/blogs", blogRouter);
mainRouter.use("/categories", categoryRouter);

export default mainRouter;

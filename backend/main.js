import express from "express";
import swaggerDocs from "./config/swagger.js";
import connectToDB from "./config/database.js";
import mainRouter from "./src/routes/index.js";

import { PORT } from "./config/env.js";

connectToDB();

const app = express();
app.use(express.json());

app.use("/api-docs", mainRouter);

swaggerDocs(app);

app.listen(PORT, () =>
  console.log(
    `Project server started successfully on port ${PORT} || Swagger URL: http://localhost:${PORT}/api-docs`
  )
);

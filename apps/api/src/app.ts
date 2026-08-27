import express from "express";
import cors from "cors";
import pino from "pino";
import { setGlobalOptions } from "express-zod-safe";
import { playerRoutes } from "./modules/players";
import groupRoutes from "./modules/groups/routes";
import { errorHandler } from "./middleware/error-handler";

setGlobalOptions({ missingSchemaBehavior: "any" });

const logger = pino();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/players", playerRoutes);
app.use("/groups", groupRoutes);

app.use(errorHandler);

export { app, logger };

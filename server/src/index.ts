import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import "module-alias/register";
import passport from "passport";

import connectDB from "config/database";
import env from "config/env";
import { jwtStrategy } from "lib/passport";
import { errorHandler } from "middleware/errorHandler";
import { verifyToken } from "middleware/verifyToken";
import issueRoutes from "routes/issues";
import organizationRoutes from "routes/organizations";
import projectRoutes from "routes/projects";
import userRoutes from "routes/users";

const initializeServer = async () => {
  passport.use(jwtStrategy);

  const app = express();

  await connectDB();

  app.use(express.json());
  app.use(
    cors({
      origin: env.cors.origin,
      optionsSuccessStatus: 200,
    })
  );
  app.use(helmet());
  app.use(compression());
  app.get("/", (req: Request, res: Response) => {
    return res.json({ message: "Hello, World!" });
  });

  app.use("/api/users", userRoutes);
  app.use(
    "/api/org/:orgId/projects",
    verifyToken(),
    (req, res, next) => {
      req.orgId = req.params.orgId;
      next();
    },
    projectRoutes
  );
  app.use("/api/projects", verifyToken(), projectRoutes);
  app.use("/api/issues", verifyToken(), issueRoutes);
  app.use("/api/organizations", verifyToken(), organizationRoutes);

  app.use(errorHandler);

  const { port } = env;
  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
  });
};

initializeServer().catch(console.log);

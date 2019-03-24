import { Application } from "express";
import * as mockAuth from "./auth";

export const register = (app: Application) => {
    mockAuth.register(app);
};

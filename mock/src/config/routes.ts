import { EventEmitter } from "events";
import { Application, Request, Response, Router } from "express";
import path from "path";

/**
 *
 * @param app
 */
export const register = (app: Application) => {
    const emitter: EventEmitter = app.locals.eventEmitter;
    const router = Router();

    router.get("/gw.properties", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "text/html");
        res.sendFile(path.join(__dirname + "/gw.html"));
    });

    app.use("/config", router);
};

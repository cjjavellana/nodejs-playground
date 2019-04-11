import { EventEmitter } from "events";
import { Application, Request, Response } from "express";

/**
 *
 * @param app
 */
export const register = (app: Application) => {
    const emitter: EventEmitter = app.locals.eventEmitter;

    /**
     * Testing:
     * $ curl -X POST \
     * http://localhost:9090/data/dispatch-mock-upload-complete-event
     */
    app.post("/data/dispatch-mock-upload-complete-event", (req: Request, res: Response) => {
        emitter.emit("uploadComplete");
        res.send({ message: "success" });
    });
};

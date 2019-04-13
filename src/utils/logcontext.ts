import { Logger } from "log4js";

export class Log {

    public static addLogContext(logger: Logger,
                                correlationId: string, username: string, event: string = "message",
                                direction: string = "in") {
        if (!correlationId || correlationId.length < 1) {
            throw new Error("Incoming WebSocket Message Requires Correlation Id");
        }

        logger.addContext("RequestId", correlationId);
        logger.addContext("UserId", username);
        logger.addContext("direction", direction);
        logger.addContext("event", event);
    }

    public static withContext(logger: Logger, correlationId: string,
                              username: string, event: string = "message", direction: string = "in",
                              logFunction: () => void) {

        this.addLogContext(logger, correlationId, username, event, direction);
        logFunction();
        logger.clearContext();
    }
}

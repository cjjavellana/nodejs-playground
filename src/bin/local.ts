import express from "express";
import log4js from "log4js";
import mainapp = require("../app");

const logger = log4js.getLogger("startup");
(mainapp as express.Express).listen(process.env.SERVER_PORT || 8989, () => {
    logger.info(`Server started on port ${process.env.SERVER_PORT}`);
});

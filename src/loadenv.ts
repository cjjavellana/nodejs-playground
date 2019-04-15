import dotenv from "dotenv";

export const config = () => {
    dotenv.config();

    // multiline env fix
    for (const key of Object.keys(process.env)) {
        try {
            const val = process.env[key];
            if (hasNewLine(val)) {
                process.env[key] = JSON.parse(`"${process.env[key]}"`);
            }
        } catch (error) {
            /* tslint:disable:no-console */
            console.log("Unable to convert %s", error);
            /* tslint:enable:no-console */
        }
    }
};

const hasNewLine = (val: string) => {
    return val.indexOf("\\n") !== -1;
};

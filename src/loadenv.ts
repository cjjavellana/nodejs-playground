import dotenv from "dotenv";

export const config = () => {
    dotenv.config();
    Configurations.ConfigResolver.resolve(process.env);
};

export namespace Configurations {

    export class ConfigResolver {

        private env: NodeJS.ProcessEnv;

        private constructor(env: NodeJS.ProcessEnv) {
            this.env = env;
        }

        protected init() {
            for (const key of Object.keys(process.env)) {
                try {
                    const val = process.env[key];
                    if (this.hasNewLine(val)) {
                        // Only resolve entries having \n in them
                        process.env[key] = this.fixMultilineValue(val);
                    }
                } catch (error) {
                    // env resolution happens before logging system initialization

                    /* tslint:disable:no-console */
                    console.log("Unable to convert %s", error);
                    /* tslint:enable:no-console */
                }
            }
        }

        protected fixMultilineValue(val: string) {
            return JSON.parse(`"${val}"`);
        }

        protected hasNewLine(val: string) {
            return val.indexOf("\\n") !== -1;
        }

        protected isEncrypted(val: string) {
            return val.startsWith("[enc]");
        }

        public static resolve(env: NodeJS.ProcessEnv): ConfigResolver {
            const envConfig = new ConfigResolver(env);
            envConfig.init();
            return envConfig;
        }

    }
}


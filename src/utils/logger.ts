import { inspect } from 'util';
import winston, { format } from 'winston';
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam';

const jsonPrinter = format((info) => {
    if (typeof info.message === 'object') {
        info.message = inspect(info.message, { depth: Infinity });
    }
    return info;
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-any @typescript-eslint/no-unsafe-assignment
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(jsonPrinter()),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

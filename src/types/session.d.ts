
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userDetails: {
            username: string;
            password: string;
        };
    }
}

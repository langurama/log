declare module '@langurama/log' {
    interface LanguramaTerminalConfiguration {
        type: 'terminal';
        level?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
        callee?: boolean;
        chalk?: Object;
    }

    interface LanguramaFileConfiguration {
        type: 'file';
        level?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
        callee?: boolean;
        path?: string;
        json?: boolean;
    }

    type LanguramaConfiguration = LanguramaTerminalConfiguration | LanguramaFileConfiguration;

    interface LanguramaLog {
        error: (...messages: any) => void;
        warn: (...messages: any) => void;
        info: (...messages: any) => void;
        debug: (...messages: any) => void;
        trace: (...messages: any) => void;
    }

    export default function createLanguramaLog(
        configurationOrConfigurations?: LanguramaConfiguration | LanguramaConfiguration[]
    ): LanguramaLog;
}

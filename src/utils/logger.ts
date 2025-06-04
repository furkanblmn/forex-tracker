type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
    component?: string
    action?: string
    data?: any
}

class Logger {
    private isDevelopment = import.meta.env.DEV

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString()
        const prefix = context?.component ? `[${context.component}]` : ''
        const action = context?.action ? ` - ${context.action}` : ''

        return `${timestamp} ${level.toUpperCase()} ${prefix}${action}: ${message}`
    }

    info(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.log(this.formatMessage('info', message, context), context?.data)
        }
    }

    warn(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.warn(this.formatMessage('warn', message, context), context?.data)
        }
    }

    error(message: string, error?: Error | any, context?: LogContext): void {
        if (this.isDevelopment) {
            console.error(this.formatMessage('error', message, context), error, context?.data)
        }
    }

    debug(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.log(this.formatMessage('debug', message, context), context?.data)
        }
    }
}

export const logger = new Logger() 
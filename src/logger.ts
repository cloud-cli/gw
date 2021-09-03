export interface Logger {
  log: (...args: any[]) => void;
}

export const defaultLogger = console;

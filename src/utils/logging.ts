export enum LogLevels {
  Error = "ERROR",
  Info = "INFO",
  WARN = "WARN",
}

export const log = (level: LogLevels, message: string, args?: any) => {
  switch (level) {
    case LogLevels.Error:
      console.error(message, args);
      break;
    case LogLevels.Info:
      console.info(message, args);
      break;
    case LogLevels.WARN:
      console.log(message, args);
      break;
    default:
      console.log("Invalid log level");
  }
};

const PAY_NOTIFICATION_URL = (serverName: string, endpoint?: string): string =>
  `${serverName}${endpoint}`;

export default PAY_NOTIFICATION_URL;

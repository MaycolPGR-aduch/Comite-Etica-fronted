export const MOCK_LATENCY_MS = 350;

export const wait = (ms = MOCK_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

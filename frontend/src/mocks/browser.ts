import { setupWorker } from "msw/browser";
import { createMockHandlers } from "./handlers";

export const worker = setupWorker(...createMockHandlers());

import { setupServer } from "msw/node";
import { createMockHandlers } from "../mocks/handlers";

export const server = setupServer(...createMockHandlers());

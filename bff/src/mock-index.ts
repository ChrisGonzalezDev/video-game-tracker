import { createMockBackendClient } from "./mock-backend-client.js";
import { startServer } from "./server.js";

startServer(createMockBackendClient());

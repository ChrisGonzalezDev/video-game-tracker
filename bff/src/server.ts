import type { BackendClient } from "./backend-client.js";
import { createBackendClient } from "./backend-client.js";
import { createApp } from "./app.js";

export function startServer(
  backendClient: BackendClient = createBackendClient(),
): void {
  const port = Number(process.env.PORT ?? 3001);
  const app = createApp(backendClient);

  app.listen(port, () => {
    console.log(`BFF listening at http://localhost:${port}`);
  });
}

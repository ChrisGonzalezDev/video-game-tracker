import "@testing-library/jest-dom";
import { createMockHandlers } from "../mocks/handlers";
import { server } from "./testServer";

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers(...createMockHandlers());
});

afterAll(() => {
  server.close();
});

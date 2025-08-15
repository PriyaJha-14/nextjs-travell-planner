
import { register } from "./src/instrumentation";

register().catch((err) => {
  console.error("Worker failed to start", err);
});

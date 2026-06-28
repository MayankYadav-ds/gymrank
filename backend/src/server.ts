import { createApp } from "./app/create-app.js";
import { loadConfig } from "./config/env.js";

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`${config.appName} API listening on port ${config.port}`);
});

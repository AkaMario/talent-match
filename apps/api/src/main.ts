import { Logger } from "@nestjs/common";
import { createApp } from "./app";
createApp()
  .then((app) => app.listen(3000, "0.0.0.0"))
  .catch((error) => {
    Logger.error(error);
    process.exit(1);
  });

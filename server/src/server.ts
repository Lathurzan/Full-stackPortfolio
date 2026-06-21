import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const listenWithRetry = (port: number, maxAttempts = 10): Promise<number> => {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const tryListen = (p: number) => {
      const server = app.listen(p);

      const onError = (err: any) => {
        server.close?.();
        if (err && err.code === "EADDRINUSE") {
          attempt += 1;
          if (attempt >= maxAttempts) {
            reject(new Error(`Port ${port} in use; exhausted retries`));
            return;
          }
          // try next port
          tryListen(p + 1);
          return;
        }
        reject(err);
      };

      const onListening = () => {
        // cleanup listeners
        server.off("error", onError);
        resolve(p);
      };

      server.once("error", onError);
      server.once("listening", onListening);
    };

    tryListen(port);
  });
};

const startServer = async () => {
  await connectDB();

  const startingPort = Number(env.PORT) || 5000;
  try {
    const boundPort = await listenWithRetry(startingPort, 10);
    console.log(`Server running on port ${boundPort}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
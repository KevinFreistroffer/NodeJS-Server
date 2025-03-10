const EventEmitter = require("node:events");

try {
  const emitter = new EventEmitter();
  emitter.captureRejections = true;
  let i = 0;

  /**
   * TODO set types
   *
   *
   * interface MyEvents {
       'userCreated': (user: { id: number, name: string }) => void;
       'orderPlaced': (order: { id: number, amount: number }) => void;
     }

    class MyEmitter extends EventEmitter {
      on<K extends keyof MyEvents>(event: K, listener: MyEvents[K]): this {
        return super.on(event, listener);
      }

      emit<K extends keyof MyEvents>(event: K, ...args: Parameters<MyEvents[K]>): boolean {
        return super.emit(event, ...args);
      }
    }
   */
  emitter.once("newListener", function (event: any, listener: any) {
    if (event === "error") {
      emitter.on("error", function (err: any) {
        console.error("error captured: ", err);
      });
    }

    if (event === "event_logUserId") {
      emitter.on("event_logUserId", function (userId: any) {});
    }
  });

  const interval = setInterval(() => {
    i++;
  }, 300);

  if (i >= 10) {
    clearInterval(interval);
  }
} catch (error) {
  console.error("Error: ", error);
}

import initializeApp from "./app";

initializeApp()
  .then((app) => {
    app.set("port", process.env.PORT || 3000);
    app.listen(app.get("port"), () => {
      app.get("emitter").emit("appStarted");
    });
  })
  .catch(error => {
    console.log("Error occurred when initializing app.");
    console.log(error);
    process.exit(1);
  });

export {}
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  !req.headers.authorization
    ? res.setHeader("WWW-Authenticate", "Basic").status(401).end()
    : Buffer.from(req.headers.authorization.split(" ")[1], "base64")
        .toString()
        .split(":")[0] == "edemone" &&
      Buffer.from(req.headers.authorization.split(" ")[1], "base64")
        .toString()
        .split(":")[1] == "secret"
    ? res.send("Youre in")
    : res.setHeader("WWW-Authenticate", "Basic").status(401).end();
});

app.listen(port, () => {
  console.log(`Basic auth http://localhost:${port}`);
});

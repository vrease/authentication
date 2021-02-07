const express = require("express");
let crypt = require("crypto-js");
const app = express();
const port = 3000;

var credentials = {
  userName: "jonathan",
  password: "secret",
  realm: "DigestAuthentication",
};

let hash = crypt.MD5(credentials.realm).toString();

const authUser = (res) => {
  res
    .set({
      "WWW-Authenticate": `Digest realm=${
        credentials.realm
      }, qop=auth, nonce=${Math.random()}, opaque=${hash}`,
    })
    .status(401)
    .end();
};

const parseAuthInfo = (authData) => {
  var authObj = {};
  authData.split(", ").forEach((d) => {
    d = d.split("=");
    authObj[d[0]] = d[1].replace(/"/g, "");
  });
  return authObj;
};

app.get("/", (req, res) => {
  if (!req.headers.authorization) {
    authUser(res);
    return;
  }
  let authInfo = parseAuthInfo(
    req.headers.authorization.replace(/^Digest /, "")
  );

  if (authInfo.username !== credentials.userName) {
    authUser(res);
    return;
  }

  let ha1 = crypt.MD5(
    `${credentials.userName}:${credentials.realm}:${credentials.password}`
  );
  let ha2 = crypt.MD5(`${req.method}:${authInfo.uri}`);
  let response = crypt.MD5(
    [ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, ha2].join(
      ":"
    )
  );

  if (authInfo.response !== response.toString()) {
    authUser(res);
    return;
  }

  res.end("Your're in");
});

app.listen(port, () => {
  console.log("listening");
});

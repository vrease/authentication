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

const parseAuthInfo = (authData) => {
  var authObj = {};
  authData.split(", ").forEach((d) => {
    d = d.split("=");
    console.log(d);
    authObj[d[0]] = d[1].replace(/"/g, "");
  });
  return authObj;
};

app.get("/", (req, res) => {
  if (!req.headers.authorization) {
    res
      .set({
        "WWW-Authenticate": `Digest realm=${
          credentials.realm
        }, qop=auth, nonce=${Math.random()}, opaque=${hash}`,
      })
      .status(401)
      .end();
    return;
  }
  let authInfo = req.headers.authorization.replace(/^Digest /, "");
  authInfo = parseAuthInfo(authInfo);

  if (authInfo.username !== credentials.userName) {
    res
      .set({
        "WWW-Authenticate": `Digest realm=${
          credentials.realm
        }, qop=auth, nonce=${Math.random()}, opaque=${hash}`,
      })
      .status(401)
      .end();
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
    res
      .set({
        "WWW-Authenticate": `Digest realm=${
          credentials.realm
        }, qop=auth, nonce=${Math.random()}, opaque=${hash}`,
      })
      .status(401)
      .end();
    return;
  }

  res.end("Your ine");
});

app.listen(port, () => {
  console.log("listening");
});

#!/usr/bin/env node

const open = require("react-dev-utils/openBrowser");
const dev = require("./lib/dev");

const opt = { port: 8080 };

dev(opt)
  .then(res => {
    const url = "http://localhost:" + res.port;
    open(url);
    console.log(url);
  })
  .catch(err => {
    console.log(err);
  });

#!/usr/bin/env node

const open = require("react-dev-utils/openBrowser");
const dev = require("./lib/dev");

const opt = {};

dev(opt)
  .then(res => {
    const url = "http://localhost:" + res.port;
    open(url);
    consol.log(url);
  })
  .catch(err => {
    console.log(err);
  });

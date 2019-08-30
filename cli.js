#!/usr/bin/env node

const meow = require('meow')
const open = require('react-dev-utils/openBrowser')
const chalk = require('chalk')
const dev = require('./lib/dev')

const config = require('pkg-conf').sync('mdx-deck')

const log = (...arg) => {
  console.log(chalk.magenta('[mdx-deck]'), ...arg)
}

log.error = (...arg) => {
  console.log(chalk.red('[err]'), ...arg)
}

const cli = meow(
  `
  Usage
    $ mdx-deck deck.mdx
    $ mdx-deck build deck.mdx
  Options
    -p --port   Dev server port
    --no-open   Prevent from opening in default browser
  `,
  {
    flags: {
      port: {
        type: 'string',
        alias: 'p'
      },
      open: {
        type: 'boolean',
        alias: 'o',
        default: true
      }
    }
  }
)

const [entry] = cli.input

if (!entry) cli.showHelp(0)

const opt = Object.assign({ entry }, config, cli.flags)

dev(opt)
  .then(res => {
    const url = 'http://localhost:' + res.port
    open(url)
    console.log(url)
  })
  .catch(err => {
    console.log(err)
  })

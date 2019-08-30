#!/usr/bin/env node

const path = require('path')
const meow = require('meow')
const open = require('react-dev-utils/openBrowser')
const chalk = require('chalk')
const dev = require('ok-cli')

const config = require('pkg-conf').sync('mdx-deck')

const log = (...arg) => {
  console.log(chalk.magenta('[mdx-deck]'), ...arg)
}

log.error = (...arg) => {
  console.log(chalk.red('[err]'), ...arg)
}

const getConfig = conf => {
  conf.module.rules = [
    ...conf.module.rules.filter(rule => !rule.test.test('.mdx')),
    {
      test: /\.mdx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              'babel-preset-env',
              'babel-preset-stage-0',
              'babel-preset-react'
            ].map(require.resolve)
          }
        },
        require.resolve('./lib/loader.js')
      ]
    }
  ]

  return conf
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

const [doc] = cli.input

if (!doc) cli.showHelp(0)

const opt = Object.assign(
  {
    entry: path.join(__dirname, './lib/entry.js'),
    dirname: path.dirname(path.resolve(doc)),
    globals: {
      DOC_FILENAME: JSON.stringify(path.resolve(doc))
    },
    config: getConfig
  },
  config,
  cli.flags
)

dev(opt)
  .then(res => {
    const url = 'http://localhost:' + res.port
    open(url)
    console.log(url)
  })
  .catch(err => {
    console.log(err)
  })

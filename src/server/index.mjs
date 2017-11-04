/* eslint-disable import/first */

import config from '../../config'
import secret from '../../secret'

import Opbeat from 'opbeat'

if (config.isProd) {
  global.opbeat = Opbeat.start(secret.opbeat)
}

import '@babel/register'

// TODO: uncomment when https://github.com/babel/babel/issues/6737 is fixed
// Automatically compile view files with babel (for JSX)
// import babelRegister from '@babel/register'
// babelRegister({ only: [/views/], extensions: ['.js', '.jsm'] })

import ConnectSQLite from 'connect-sqlite3'
import downgrade from 'downgrade'
import http from 'http'
import path from 'path'
import session from 'express-session'
import unlimited from 'unlimited'

import appInit from './app'

const server = http.createServer()

export { init, server }

function init (port = config.port, cb = (err) => { if (err) throw err }) {
  server.listen(port, (err) => {
    if (err) cb(err)
    console.log('Listening on port %s', server.address().port)

    unlimited() // Upgrade the max file descriptor limit
    downgrade() // Set the process user identity to 'www-data'

    // Open DB as 'www-data' user
    const SQLiteStore = ConnectSQLite(session)
    const sessionStore = new SQLiteStore({ dir: path.join(config.rootPath, 'db') })

    server.on('request', appInit(sessionStore))

    cb(null)
  })
}

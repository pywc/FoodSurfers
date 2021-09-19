const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'foodsurfer',
  password: 'CHANGE_PASSWORD',
  port: 26257,
})

pool.on('error', function (err) {
  winston.error('idle client error', err.message, err.stack)
})

module.exports = {
    pool
}
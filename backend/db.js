const {Pool} = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://tohir:nzCBivhOYSqdfN0RQBL3YQyuyXwD5sk4@dpg-d0su89ruibrs73aqc96g-a.oregon-postgres.render.com/cloude',
  ssl: {
    rejectUnauthorized: false
  },
})

module.exports = pool
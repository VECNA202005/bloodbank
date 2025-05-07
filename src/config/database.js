const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'bloodbankdb_qmk3',
  'bloodbankdb_qmk3_user',
  'l54zB9ZQvCU2GUlF2dVcbmQfW0Amtjjl',
  {
    host: 'dpg-d0de3dp5pdvs7393196g-a.oregon-postgres.render.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize; 
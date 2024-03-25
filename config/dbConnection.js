const {DB_HOST,DB_USERNAME,DB_PASSWORD,DB_NAME} = process.env;

const mysql = require('mysql2');

// MySQL Database Connection Configuration
const db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME
});


db.connect(function(err){
 if(err) throw err;
 console.log(DB_NAME + "DB Connected Successfully")
})

module.exports = db;
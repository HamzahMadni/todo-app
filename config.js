require('dotenv').config()

const config = {
    db: {
        connection: process.env.DB_CONNECTION_STRING
    }
}

module.exports = config
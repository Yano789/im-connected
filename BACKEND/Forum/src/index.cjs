require('dotenv').config({ path: __dirname + '/../.env' });

// Set NODE_ENV to production if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const app = require("./app.cjs");

const {PORT}  = process.env;

const startApp = ()=>{
    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
};

startApp();
require('dotenv').config({ path: __dirname + '/../.env' });
const app = require("./app.cjs");

const {PORT}  = process.env;

const startApp = ()=>{
    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
};

startApp();
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_LINK).then (()=> {
    console.log(`connection successfull`);
}).catch((e) => {
    console.log(`no connection`);
})
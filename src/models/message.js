const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const messageSchema = new mongoose.Schema({
    name: {
        type:String, 
        require:true
    },
    email: {
        type:String,
        require:true
    },
    subject: {
        type:String,
        require: true
    },
    description: {
        type:String,
        require:true,
    }
});



// customerSchema.pre("save", async function(next){
//     if(this.isModified("password")){
//         console.log("this is current password " + this.password);
//         this.password = await bcrypt.hash(this.password, 10);
//         // this.confirmpassword = undefined;      remove this field
//         next();
//     }
// })


const Message = new mongoose.model("Message", messageSchema);

module.exports = Message
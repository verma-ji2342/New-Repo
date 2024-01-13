const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const customerSchema = new mongoose.Schema({
    firstname : {
        type:String, 
        require:true
    },
    lastname : {
        type:String,
        require:true
    },
    email : {
        type:String,
        require:true,
        unique:true
    }, 
    gender : {
        type:String, 
        require:true
    },
    phone : {
        type:Number, 
        require:true,
        unique:true
    }, 
    age : {
        type:Number,
        require:true
    },
    password : {
        type:String,
        require:true
    }, 
    confirmpassword : {
        type:String,
        require:true
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }]
});


customerSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        console.log(token);
        return token;
    } catch(error){
        res.send("The Error Part "+ error);
        console.log("print error : "+error);
    }
}

customerSchema.pre("save", async function(next){
    if(this.isModified("password")){
        console.log("this is current password " + this.password);
        this.password = await bcrypt.hash(this.password, 10);
        // this.confirmpassword = undefined;      remove this field
        next();
    }
})


const Register = new mongoose.model("Register", customerSchema);

module.exports = Register
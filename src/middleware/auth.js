const jwt = require("jsonwebtoken");
const Register = require("../models/registers");
const express = require("express");
const hbs = require("hbs");
const app = express();
app.use(express.urlencoded({extended:false}));


// const static_path = path.join(__dirname, "../public");
// const template_path = path.join(__dirname, "../templates/views");
// const partials_path = path.join(__dirname, "../templates/partials");



// app.use(express.static(static_path));
// app.set("view engine", "hbs");
// app .set('views', template_path);
// hbs.registerPartials(partials_path);

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

        const user = await Register.findOne({_id: verifyUser._id});
        console.log("Auth section" + verifyUser);

        req.token = token;
        req.user = user;
        next();
    }catch (error){
        res.render("login");
    }
}



module.exports = auth;
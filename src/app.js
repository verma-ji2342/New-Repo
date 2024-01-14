require('dotenv').config(); 
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const alert = require('alert'); 
const port = process.env.port || 4000;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("./db/conn");
const auth = require("../src/middleware/auth");
const Register = require("./models/registers");
const Message = require("./models/message");


const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app .set('views', template_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res)=> {
    res.render("index");
})

app.post("/", async(req, res) => {

    try {
        const p1 = req.body.password;
        const p2 = req.body.Cpassword;
        if(p1 != p2){
            res.send("Password Does not Match");
        }
        else{
            const RegisterEmployee = new Register({
                firstname : req.body.fname,
                lastname : req.body.lname,
                email : req.body.gmail, 
                gender : req.body.gender,
                phone : req.body.phoneno,
                age : req.body.age,
                password : p1,
                confirmpassword: p2 
            })


            const token = await RegisterEmployee.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 60000),
                httpOnly: true
            });
            const registered  = await RegisterEmployee.save();
            res.status(201).render("index");
        }
    }
    catch(e){
        res.status(400).send(e);
    }
})




app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", async(req, res) => {
    try{
        const email = req.body.gmail;
        const pass = req.body.password;
        const owner = req.body.owner;
        console.log("OWNER "+owner);
            
        const username = await Register.findOne({email:email});
    
        const isMatch = await bcrypt.compare(pass, username.password);

        const token = await username.generateAuthToken();


        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 60000),
            httpOnly: true
        });


        // console.log(isMatch);
        if(isMatch){

            if(owner == 'admin'){
                const table = await Register.find();
                res.render("table", {
                    student : table
                })
            }
            else{
                res.render("admin");
            }
        }
        else{
            res.send("password is invalid");
        }
        console.log(username);
    }catch(e){
        res.status(400).send("Invalid email or password");
    }
})

app.get("/logout", auth, async(req, res) => {
    try{
        res.clearCookie("jwt");
        // logout from one device
        // req.user.tokens = req.user.tokens.filter((element) => {
        //     return element req.token;
        // })

        req.user.tokens = [];

        await req.user.save();
        res.render("home");
    }catch(error){
        res.status(500).json({
            msg : "Error in logout form",
            Error : error
        })
    }
})


app.get("/nameupdate", auth, async(req, res) => {
    res.render("nameupdate");
})

app.post("/nameupdate", auth, async(req, res) => {
    const Fname = req.body.fname;
    const Nname = req.body.lname;
    const email = req.body.gmail;
    console.log(Fname + " " + email);
    try{
        const username = await Register.updateOne({email:email}, {
            $set : {
                firstname : Fname,
                lastname : Nname
            }
        });
        console.log(username);
        const x = "Name has been updated!";
        res.render("succ", {
            what: x
        });
    }catch(e){
        res.status(400).send("Invalid email or password");
    }
})



app.get("/ageupdate", auth, async(req, res) => {
    res.render("ageupdate");
})

app.post("/ageupdate", auth, async(req, res) => {
    const Age = req.body.age;
    const email = req.body.gmail;
    console.log(Age+" "+email);
    try{
        const username = await Register.updateOne({email:email}, {
            $set : {
                age : Age
            }
        });
        console.log(username);
        const x = "Age has been updated";
        res.render("succ", {
            what: x
        });
    }catch(e){
        res.status(400).send("Invalid email or password");
    }
})


app.get("/passupdate", auth, async(req, res) => {
    res.render("passupdate");
})

app.post("/passupdate", auth, async(req, res) => {
    let p1 = req.body.password;
    const p2 = req.body.Cpassword;
    const email = req.body.gmail;
    console.log(email);

    if(p1 != p2){
        res.json({
            msg : "confirm password is not match"
        })
    }

    p1 = await bcrypt.hash(p1, 10);
    console.log(p1);

    try{
        const username = await Register.updateOne({email:email}, {
            $set : {
                password : p1,
                confirmpassword: p2 
            }
        });
        console.log(username);
        const x = "Password Updated!";
        res.render("succ", {
            what: x
        });
    }catch(e){
        res.status(400).send("Invalid email or password");
    }
})


app.get("/phoneupdate", auth, async(req, res) => {
    res.render("phoneupdate");
})

app.post("/phoneupdate", auth, async(req, res) => {
    const phone = req.body.phoneno;
    const email = req.body.gmail;
    try{
        const username = await Register.updateOne({email:email}, {
            $set : {
                phone : phone
            }
        });
        console.log(username);
        const x = "Number has been Updated!";
        res.render("succ", {
            what: x
        });
    }catch(e){
        res.status(400).send("Invalid email or password");
    }
})


app.get("/find", auth, async(req, res) => {
    res.render("find");
})

app.post("/find", auth, async(req, res) => {
    const pass = req.body.password;
    const email = req.body.gmail;
    try{
        const username = await Register.findOne({email:email});
        const isMatch = await bcrypt.compare(pass, username.password);
        console.log(pass);
        if(!isMatch){
            res.send("Password is not valid");
        }
        else{
            
            res.render("Show", {
                fname: username.firstname,
                lname: username.lastname,
                age: username.age,
                pass: pass,
                email: username.email,
                phone: username.phone,
                gen: username.gender
            });
        }
        // res.send("Find ho gya :)");
    }catch(e){
        res.status(400).send("USER not found :(");
    }
})

app.get("/delete", auth, async(req, res) => {
    res.render("delete");
})

app.post("/delete", auth, async(req, res) => {
    const email = req.body.email;
    const pass = req.body.password;

    try{
        const username = await Register.deleteOne({email:email});
        // if(username.dele)
        if(username.deletedCount == 0){
            res.send("wrong password ");
        }
        else{
            const x = "Deleted Successfully";
            res.render("succ", {
                what:x
            });
        }
    }catch(e){
        res.status(400).send("User cant found :(");
    }
})


app.get("/succ", async(req, res) => {
    res.render("succ");
})


app.get("/home", async(req, res) => {
    res.render("home");
})

app.get("/about", async(req, res) => {
    res.render("about");
})

app.get("/contact", async(req, res) => {
    const messageList = await Message.find();
    res.render("contact", {
        messages: messageList
    });
})

app.post("/sendMessage", async(req, res) => {
    try{
        const name = req.body.name;
        const email = req.body.gmail;
        const subject = req.body.subject;
        const description = req.body.description;

        const MessageBox = new Message({
            name: name,
            email: email,
            subject: subject,
            description: description
        })

        const messageSent  = await MessageBox.save();
        const messageList = await Message.find();
        console.log(messageList);
        res.status(201).render("contact", {
            messages: messageList
        });

    }catch(e){
        res.status(400).json({
            msg : "Something went wrong in messagebox",
            suggestion: "Go back to previous page"
        })
    }
})

app.get("/course", async(req, res) => {
    res.render("course");
})

app.get("/blog", async(req, res) => {
    res.render("blog");
})

app.get("/update", auth, async(req, res) => {
    res.render("admin");
})


// app.get("/showStudents", async(req, res) => {
//     try{
//         const table = await Register.find();
//         res.render("table", {
//             student : table
//         })
//     }catch(e){
//         res.json({
//             msg : "Something went wrong"
//         })
//     }
// })


app.listen(port ,()=>{
    console.log(`server is running at port no ${port}`);
})

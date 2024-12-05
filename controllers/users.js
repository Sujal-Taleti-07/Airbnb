const User = require("../models/user.js");

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({email, username});
        const registerUser = await User.register(newUser, password);  //(user, password, callback(optional))
        console.log(registerUser);

        req.login(registerUser, (err) => {   //when singup done it will automatically login 
            if(err){
                return next(err)
            }
            req.flash("success", "User registered successfully");
            res.redirect("/listings");  
        });

    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs")
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to WanderLust !! LogIN Succefully Done");

    let redirect = res.locals.redirectUrl || "/listings" ;
    // if we directly login without going to any other page it will redirect in home page else it will directed to that working page
    res.redirect(redirect); 
   //after login or signup it will navigate you to our original page or last working page
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            next(err);
        }
        req.flash("success", "You are now Logged Out!!");
        res.redirect("/listings");
    })
};
if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');  //to use mongo based session
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

const dbURL = process.env.ATLASDB_URL; 

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main(){
    await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended : true}));   //use for parsing data

app.use(methodOverride("_method"));

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

//Custom wrapAsync
function wrapAsync(fn) {
    return function(req, res, next){
        fn(req, res, next).catch(next);
    }
}


// Mongo DB based session
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("Error in MONGO SESSION STORE", err);
});

// Session
const sessionOptions = {
    store,      //mongo based session
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,   
        //day * totalhrs in day * total min in hrs * totalsec in min * totalmilisec in sec 
        maxAge:  7 * 24 * 60 * 60 * 1000,  //expire date
        httpOnly: true,  //it is for secruity purpose
    },
}

app.use(session(sessionOptions));
app.use(flash());   //to display any message only for one time on the screen

app.use(passport.initialize());  //for every req passport will be initialize
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));  //it will authenticate user

passport.serializeUser(User.serializeUser());  //to store the total No.of session of user
passport.deserializeUser(User.deserializeUser());  //to remove the session of user

//middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;  //for login , signup and logout
    next();
});    


//Express Router
app.use("/listings", listingRouter);
app.use("/listings/:id/review", reviewRouter);
app.use("/", userRouter);

//Review & Rating

//Page Not Found 
// means if we route another page that is not in above route then it will show an error
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Cutom Error Handling
app.use((err, req, res, next)=>{
    // console.log(err);
    let {statusCode = 500, message = "something went wrong"}= err;
    res.status(statusCode).render("./listing/Error.ejs",{ message });
});

app.listen(8080, () => {
    console.log("Listening to port 8080");
});
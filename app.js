const homeStartingContent = "college Blog website";
const aboutContent = "This is a college blog website created by Shivam Rathi";

//Modules
const express = require("express");
const app = express();
// const ejs = require("ejs");
const mongoose = require('mongoose');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");


//Mongodb connect
mongoose.connect("mongodb+srv://test123:test123@cluster0.nto8y.mongodb.net/blog?retryWrites=true&w=majority", {
  useNewUrlParser: true
});


app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//Session & Authentication
app.use(require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Schema for User
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const postSchema = {
  title: String,
  content: String
};
const Post = mongoose.model("Post", postSchema);

//Get POSTS
app.get("/", isLoggedIn,
  function (req, res) {
      Post.find({}, function (err, posts) {
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts,
        });
      });
    });

//Register
app.get("/register", function (req, res) {
  res.render("register");
});
app.post("/register", function (req, res) {
  User.register(new User({
    username: req.body.username
  }), req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect("/");
    });
  });
});

//LOGIN
app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
}), function (req, res) {});
//Logout
app.get("/logout", function(req, res){
  req.logout();
  res.render("login");
});

//COMPOSE
app.get("/compose", isLoggedIn, function (req, res) {
  res.render("compose");
});
app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

//GET post detail
app.get("/posts/:postId", isLoggedIn, function (req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({
    _id: requestedPostId
  }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

//ABOUT
app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});


//MIDDLEWARE
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

//Delete
app.get("/delete/:id", isLoggedIn,(req, res) => {
  if(req.user.username==="s@r.com"){
    Post.deleteOne({
      _id: req.params.id
    }, function (err) {
      if (!err) res.redirect("/");
      else res.send(err);
    });
  }
  else{
    Post.find({}, function (err, posts) {
      res.render("home", {
        startingContent: "You are not authorized",
        posts: posts
      });
    });
  }
})
//SERVER

let port = process.env.PORT || 80;
app.listen(port, function () {
    console.log("Server started at " + port);
})
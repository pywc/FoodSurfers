const express = require('express')

const passport = require('passport')
const session = require('express-session')
const facebookStrategy = require('passport-facebook').Strategy
const pool = require('./models/dbConfig.js').pool
const db = require('./models/mealQueries.js')
const fs = require('fs')
const https = require('https')
const http = require('http')
var privateKey  = fs.readFileSync('cert/private.key', 'utf8');
var certificate = fs.readFileSync('cert/certificate.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
const app = express()

app.use(express.json());

// for post body
app.use(express.urlencoded({
    extended: true
}));

// set environment
app.set("view engine","ejs");
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session());

// facebook login
passport.use(new facebookStrategy({
    // pull in our app id and secret from our auth.js file
    clientID        : "YOUR_FACEBOOK_APP_ID",
    clientSecret    : "YOUR_FACEBOOK_APP_PW",
    callbackURL     : "https://foodsurfers.eastus.cloudapp.azure.com/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)','email']

},// facebook will send back the token and profile
function(token, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function() {
        pool.query('SELECT * FROM users WHERE uid = $1', [profile.id], (error, result) => {
            if (error) {
                throw error
            }

            user = result.rows[0];

            // if the user is found, then log them in
            if (user) {
                console.log("user found")
                return done(null, user); // user found, return that user
            } else {
                // if there is no user found with that facebook id, create them
                pool.query('INSERT INTO users (uid, token, name, email, gender, pic, description) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                [profile.id, token, profile.name.givenName + ' ' + profile.name.familyName, profile.emails[0].value, 'male', profile.photos[0].value, ''], 
                (error, results) => {
                    if (error) {
                        throw error
                    }

                    // if successful, return the new user
                    return done(null, user);
                })
            }
        })
    })
}));

// used to serialize the user
passport.serializeUser(function(user, done) {
    done(null, user.uid);
});

// used to deserialize the user
passport.deserializeUser(function(uid, done) {
    pool.query('SELECT * FROM users WHERE uid = $1', [uid], (error, result) => {
        user = result.rows[0];
        done(error, user);
    });
});

// get meals
app.get('/meals', isLoggedIn, db.getMeals) 

// show meal
app.get('/meals/:mid', isLoggedIn, db.getMealById)

// profile and show my meals
app.get('/profile', isLoggedIn, db.getMyMeals)

// create meal
app.post('/meals', isLoggedIn, db.createMeal)

// update meal
app.put('/meals/:mid', isLoggedIn, db.updateMeal)

// delete meal
app.delete('/meals/:mid', isLoggedIn, db.deleteMeal)

// logout
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}

app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

app.get('/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/meals',
			failureRedirect : '/'
		}));

app.get('/',(req,res) => {
    res.render("index")
})

app.get('/login',(req,res) => {
    // if user is authenticated in the session, carry on
	if (req.isAuthenticated())
        res.redirect('/profile');

    res.render("login")
})

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);
var httpsServer = https.createServer(credentials, app);

httpsServer.listen(443)
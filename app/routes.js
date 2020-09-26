module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

// Morning Challenge: Build a simple Roulette App
//- public should be able to bet any amount and either win or lose
//- casino owner should be able to log in and see the total wins
//  / losses && how much money has been made || lost.

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {

        db.collection('roulette').find({'userId': `${req.user._id}`}).toArray((err, result) => {
          console.log(req.user);
          console.log(result.length)
          if (err) return console.log(err)

          // for rendering... if the user exists then it will send the search result, otherwise it will send 0;
          if (result.length) {
            res.render('profile.ejs', {
              user : req.user,
              roulette: result
            })
          }else{
            const roulette =[{'userId':0}] // creates a roulette array and assigns the first value to 0, for the comparison in the profile .ejs file were sending data to
            res.render('profile.ejs', {
              user : req.user,
              roulette: roulette
            })
          }

        })
    });

    app.get('/ownersProfile', isLoggedIn, function(req, res) {

      // ask why req.user.owner outputs undefined
      // when logging req.user owner displays

      console.log(req.user.local.email);
      if(req.user.local.email==='leon'){
        db.collection('house balance').find().toArray((err, result) => {
          if (err) return console.log(err)

          // for rendering... if the user exists then it will send the search result, otherwise it will send 0;

          res.render('ownersProfile.ejs', {
            user : req.user,
            house: result
          })
        })
      }
      else {
        res.redirect('/ownersProfile')
      }

      // console.log('id is ' + req.user._id)
      // console.log(req.user[`${owner}`]);

    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.put('/bet', (req, res) => {
      let spin = Math.floor(Math.random()*37) // random selection from option  from 0-36
      let win = false
      let userWinnings;
      console.log('the spin landed at: ' + spin + 'your choice was ' + req.body.userChoice)

      // if user wins ////////
      if (spin === parseInt(req.body.userChoice)) {
        console.log('winner, winner, winner');
        win = true; // sets win to true
        userWinnings = req.body.wager * 35

        db.collection('roulette')
        .findOneAndUpdate({userId: req.body.userId}, {
          $set: {
            balance:req.body.balance + userWinnings
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          // res.send(spin)
        })
      } // end of if

      /////// if user loses /////////////
      else{
        console.log('you lossed');

        db.collection('roulette')
        .findOneAndUpdate({userId: req.body.userId}, {
          $set: {
            balance:req.body.balance - req.body.wager
          }
        }, {
          sort: {_id: -1},
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)

          res.json(spin)
        })
      }

      if (win ===true) {
        console.log('true');
        db.collection('house balance')
        .findOneAndUpdate({}, {
          $inc: {
            totalWins:+1,
            profit:-req.body.wager,
            balance:-req.body.wager,
          }
        }, {
          sort: {_id: -1},
        }, (err, result) => {
          if (err) return res.send(err)

          // res.json(spin),err json already sent
        })
      }
      else{
        //
        console.log('House Wins');
        db.collection('house balance')
        .findOneAndUpdate({}, {
          $inc: {
            totalLosses:+1,
            profit:+req.body.wager,
            balance:+req.body.wager,
          }
        }, {
          sort: {_id: -1},
        }, (err, result) => {
          if (err) return res.send(err)
          console.log('house balance updated');
          // res.send('house wins') err, json already sent
        })
      }

    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // owners login form
        app.get('/ownersLogin', function(req, res) {
            res.render('ownersLogin.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form -> to owners page
        app.post('/ownersLogin', passport.authenticate('local-login', {
            successRedirect : '/ownersProfile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

//importing controllers for all models
// =============================================================
const userController = require('./controllers/usersController');
const projectController = require('./controllers/projectsController');
const cohortController = require('./controllers/cohortsController');
const activityController = require('./controllers/activityFeedController');

module.exports = function(app, passport) {

    //Authentication through gitHub
    // =============================================================

    //route for github authentication and login
    app.get('/auth/github', cohortVerified, passport.authenticate('github', {
        scope: ['user:email']
    }));

    //handle the call back after github has authenticated the user
    app.get('/auth/github/callback',
        passport.authenticate('github', {
            failureRedirect: '/login',
            successRedirect: '/dashboard'
        }),
        function(req, res) {
            // Successful authentication, redirect home.
            console.log("logged in");

            //provide code
            // console.log('req.query', req.query);

            //will return true if logged in
            console.log(req.isAuthenticated())

            //provide user profile
            // console.log(req.user)
            res.end();
        });

    //API Routes
    // =============================================================

    //Routes to pull all data for all models

    //All USER data
    app.get('/api/users', userController.index);

    //All PROJECT data
    app.get('/api/projects', projectController.index);

    //All COHORT data
    app.get('/api/cohorts', cohortController.index);

    //All ACTIVITY FEED data
    app.get('/api/activityfeed', activityController.index);

    //Routes to pull specific data for all models

    //Specifc COHORT data based on code
    app.get('/api/cohortVerify', cohortVerified, function(req, res) {
        console.log("cohort exists");
        console.log(req.body);
        res.end();
    });

    //Routes to create instaces on for all models

    //USER record will be created through the authentication process
    //New user ACTIVITY will also be generated by the authentication process
    //refer to config/passport.js

    //Create a new instance of a PROJECT
    //New project ACTIVITY will also be generated 
    app.post('/api/projectNew', projectController.create)

    //Create a new instance of a COHORT
    app.post('/api/cohortNew', cohortController.create)

    //ACTIVITY will be generated as a result of other transactions.


    //Routes to update properties for all models

    //Update USER property
    app.patch('/api/users', userController.update);

    //Update PROJECT property
    app.patch('/api/projects', projectController.update);

    //Update COHORT property
    app.patch('/api/cohorts', cohortController.update);

    //Update ACTIVITY property
    app.patch('/api/activityfeed', activityController.update);


    //Routes to deactivate instance on a model

    //Deactivate USER
    //Will update isActive property to false
    app.patch('/api/userDeactivate', userController.deactivate);

    //Close PROJECT
    //Will update status property to closed
    app.patch('/api/projectClose', projectController.close);

    //Deactivate COHORT
    //Will update isActive property to false
    app.patch('/api/cohortDeactivate', cohortController.deactivate);

    //Hide ACTIVITY
    //will update visible to false
    app.patch('/api/activityHide', activityController.hide);

};

//route middleware to make sure a user is logged in 
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
};

function cohortVerified(req, res, next) {
    cohortController.verify(req, res).then(result => {
        if (result) {
            req.session.cohortId = result._id;
            console.log("req.body inside middleware: ", req.session);
            return next();
        }
        res.redirect('/');
    })
};
module.exports = function (app) {
    app.use('/', require('./home'))
    app.use('/home', require('./home'))
    app.use('/user', require('./user'))
    app.use('/anchor', require('./anchor'))
};

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Passport configuration
module.exports = function(passport, getUserByUsername, getUserById) {
    passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
        const user = await getUserByUsername(username);
        if (user == null) {
            console.log('No user with that username');
            return done(null, false, { error: 'No user with that username' });
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                console.log('Login successful');
                return done(null, user);
            } else {
                console.log('Password incorrect');
                return done(null, false, { error: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
    return done(null, await getUserById(id));
});

}
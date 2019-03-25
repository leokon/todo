const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('./models/user.js');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

module.exports = {
    JWTStrategy: new JwtStrategy(options, async (jwt_payload, done) => {
        let user = await User.getByEmail(jwt_payload.email);
        if (!user) {
            return done(null, false);
        } else {
            return done(null, user);
        }
    })
};
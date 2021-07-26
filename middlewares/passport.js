const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models');
import { JWT_SECRET } from '../config';
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
    new JWTstrategy({
            secretOrKey: JWT_SECRET,
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken('authorization')
        },
        async(token, done) => {
            try {
                return done(null, token._id);
            } catch (error) {
                done(error);
            }
        }
    )
);
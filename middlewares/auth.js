import { User } from "../models";
import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/jwtService";

const auth = async(req, res, next) => {
    // const authHeader = req.headers['authorization'];
    // const authHeader = req.headers['x-access-token'] || req.headers['authorization'];

    // console.log(authHeader, 'here')
    // if (!authHeader) return next(CustomErrorHandler.unAuthorized());

    // const token = authHeader.split(' ')[1];

    let token = req.cookies.jwt

    // if (!token) return next(CustomErrorHandler.unAuthorized());

    if (!token) return res.redirect('/api');
    // verify the token
    try {
        const { _id, role } = JwtService.verify(token.access_token);
        const user = await User.findOne({ _id });
        req.user = user;
        return next();
    } catch (err) {
        // return next(CustomErrorHandler.unAuthorized())
        return res.redirect('/api');
    }
}

export default auth;
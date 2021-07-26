import Joi from 'joi';
import { RefreshToken, User } from '../../models';
import { REFRESH_SECRET } from '../../config';
import { CustomErrorHandler, JwtService } from '../../services';

const refreshController = {
    async refresh(req, res, next) {
        // Fetching access token from cookies
        // let accessToken = req.cookies.jwt;

        // if (!accessToken) {
        //     return res.status(403).send('Cookies not set!');
        // }

        // Validation
        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required(),
        });

        const { error } = refreshSchema.validate(req.body);

        if (error) return next(error);

        let refresh_token;
        let userId;

        // Check if the refresh token is in the database
        try {
            refresh_token = await RefreshToken.findOne({ token: req.body.refresh_token });

            if (!refresh_token) return next(CustomErrorHandler.unAuthorized('Invalid Refresh Token!'));

            try {
                const { _id } = await JwtService.verify(refresh_token.token, REFRESH_SECRET);
                userId = _id;
            } catch (err) {
                return next(CustomErrorHandler.unAuthorized('Invalid Refresh Token!'));
            }

            const user = await User.findOne({ _id: userId });

            if (!user) return next(CustomErrorHandler.unAuthorized('No User Found!'));

            // Generate the access_token
            const access_token = JwtService.sign({ _id: user._id, role: user.role });
            refresh_token = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            // database whitelist
            await RefreshToken.create({ token: refresh_token });

            // send tokens
            // res.json({ access_token, refresh_token });

            res.redirect('/api/login');


        } catch (err) {
            return next(new Error('Something went wrong ' + err.message));
        }
    }
}

export default refreshController;
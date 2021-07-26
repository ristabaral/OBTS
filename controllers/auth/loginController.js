import Joi from 'joi';
import { RefreshToken, User } from '../../models';
import { CustomErrorHandler } from '../../services';
import { JwtService } from '../../services';
import { REFRESH_SECRET } from '../../config';
import bcrypt from 'bcrypt';

const loginController = {
    async login(req, res, next) {
        // Validation
        const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(5).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        });

        const { error } = loginSchema.validate(req.body);

        if (error) return next(error);

        const { email, password } = req.body;

        try {
            // Check if user exist in the database
            const user = await User.findOne({ email });
            if (!user) return next(CustomErrorHandler.wrongCredentials());

            // Compare the passwords
            const match = await bcrypt.compare(password, user.password);

            if (!match) return next(CustomErrorHandler.wrongCredentials());

            // Generate the access_token
            const access_token = JwtService.sign({ _id: user._id, role: user.role });
            const refresh_token = JwtService.sign({ _id: user._id, role: user.role }, '1y', REFRESH_SECRET);

            // database whitelist
            await RefreshToken.create({ token: refresh_token });

            // Send token
            // res.json({ access_token, refresh_token });

            //send the access token to the client inside a cookie
            res.cookie("jwt", { access_token, refresh_token, user }, { secure: true, httpOnly: true });

            res.redirect('/api/dashboard');
            // res.render('opDashboard', { refresh_token });

        } catch (err) {
            return next(err);
        }
    },

    async logout(req, res, next) {
        // Validation
        // const refreshSchema = Joi.object({
        //     refresh_token: Joi.string().required(),
        // });
        // console.log(req.params.token, 'this', typeof(req.params.token))

        // const token = mongoose.Types.ObjectId(req.body.refresh_token);

        // const { error } = refreshSchema.validate(req.params.token);

        // if (error) return next(error);
        // console.log('now here')

        try {
            await RefreshToken.deleteOne({ token: req.params.token });
        } catch (err) {
            return next(new Error('Something went wrong in the database!'));
        }
        // res.json({ status: 1 });

        // Clear cookie
        res.clearCookie("jwt");

        res.redirect('/api');
    },

    changePasswordPage(req, res, next) {
        res.render('changepassword');
    },

    async changePassword(req, res, next) {
        // Validation
        const pwdChangeSchema = Joi.object({
            opwd: Joi.string().min(5).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            npwd: Joi.string().min(5).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        });

        const { error } = pwdChangeSchema.validate(req.body);

        if (error) return next(error);

        const { opwd, npwd } = req.body;
        const user = await User.findOne({ _id: req.user._id });
        const opmatch = await bcrypt.compare(opwd, user.password);
        if (!opmatch) return res.redirect('/api/dashboard/changepassword');
        const np = await bcrypt.hash(npwd, 10);
        user.password = np;
        await user.save();
        return res.redirect('/api/dashboard');
    },

    // loginPage(req, res, next) {
    //     let token = req.cookies.jwt
    //     if (token) return res.redirect('/api/dashboard');
    //     res.render('login');
    // }
}

export default loginController;
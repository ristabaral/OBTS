import Joi from 'joi';
import { CustomErrorHandler } from '../../services';
import { RefreshToken, User } from '../../models';
import { JwtService } from '../../services';
import { REFRESH_SECRET } from '../../config';
import bcrypt from 'bcrypt';

const registerController = {
    // validate request
    // authorize the request
    // check if user exists in the database
    // prepare the model
    // store in the database
    // generate token
    // send response
    async register(req, res, next) {
        // Validation
        const registerSchema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            repeat_password: Joi.ref('password')
        });

        const { error } = registerSchema.validate(req.body);

        if (error) return next(error);

        // Check if user exist in the database
        try {
            const exist = await User.exists({ email: req.body.email });
            if (exist) return next(CustomErrorHandler.alreadyExist('This email is already taken.'));

        } catch (err) {
            return next(err);
        }

        const { name, email, password } = req.body;

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Prepare the model
        const user = new User({
            name,
            email,
            password: hashedPassword
        })

        let access_token, refresh_token;

        try {
            const result = await user.save();

            // Token
            access_token = JwtService.sign({ _id: result._id, role: result.role });
            refresh_token = JwtService.sign({ _id: result._id, role: result.role }, '1y', REFRESH_SECRET);

            // database whitelist
            await RefreshToken.create({ token: refresh_token });

        } catch (err) {
            return next(err);
        }

        // Send tokens
        // res.json({ access_token, refresh_token });

        return res.redirect('/api');
    },

    registerPage(req, res, next) {
        res.render('register');
    }
}

export default registerController;
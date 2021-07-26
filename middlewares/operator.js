import { User } from "../models"
import { CustomErrorHandler } from "../services";

const operator = async(req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.user._id });

        if (user.role === 'operator') {
            next();
        } else {
            return next(CustomErrorHandler.unAuthorized());
        }
    } catch (err) {
        return next(CustomErrorHandler.serverError());
    }
}

export default operator;
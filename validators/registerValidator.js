import Joi from 'joi';

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    repeat_password: Joi.ref('password')
});

export default registerSchema;
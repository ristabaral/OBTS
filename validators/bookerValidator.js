import Joi from 'joi';

const bookerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(10).required(),
});

export default bookerSchema;
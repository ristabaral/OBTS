import Joi from 'joi';

const passengerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    age: Joi.number().required(),
    gender: Joi.string().required(),
});

export default passengerSchema;
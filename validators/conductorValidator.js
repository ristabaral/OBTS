import Joi from 'joi';

const conductorSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    phone: Joi.string().min(10).max(10).required(),
    bus: Joi.string().required()
});

export default conductorSchema;
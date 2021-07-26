import Joi from 'joi';

const seatSchema = Joi.object({
    status: Joi.boolean(),
    number: Joi.number().required()
});

export default seatSchema;
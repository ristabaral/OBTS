import Joi from 'joi';

const busSchema = Joi.object({
    busNo: Joi.string().required(),
    busName: Joi.string().required(),
    type: Joi.string().required(),
    image: Joi.string(),
    scheduled: Joi.boolean(),
    numOfSeats: Joi.number(),
});

export default busSchema;
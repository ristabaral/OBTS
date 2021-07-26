import Joi from 'joi';

const scheduleSchema = Joi.object({
    depart: Joi.date().required(),
    arrival: Joi.date().required(),
    departTime: Joi.string().required(),
    arrivalTime: Joi.string().required(),
    pickup: Joi.string().required(),
    dropoff: Joi.string().required(),
    price: Joi.number().required(),
    checkpoints: Joi.array(),
    bus: Joi.string()
});

export default scheduleSchema;
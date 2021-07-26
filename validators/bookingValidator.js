import Joi from 'joi';

const bookingSchema = Joi.object({
    numOfSeats: Joi.number().required(),
    amount: Joi.number().required(),
    paymentStatus: Joi.boolean(),
});

export default bookingSchema;
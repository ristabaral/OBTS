import Joi from 'joi';

const checkpointSchema = Joi.object({
    checkpoint: Joi.string().required(),
});

export default checkpointSchema;
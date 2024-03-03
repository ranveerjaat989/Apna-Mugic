const joi=require('joi');

module.exports.mugicSchema=joi.object({
    mugic:joi.object({
        singer:joi.string().required(),
        title:joi.string().required(),
        mugic:joi.string().required(),
        img:joi.string().required(),
    }).required()
});
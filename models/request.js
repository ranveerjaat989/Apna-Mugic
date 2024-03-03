const mongoose=require('mongoose');
const Schema= mongoose.Schema;

const requestSchema=new Schema({
    username:String,
    title:String,
    mugic:String,
    img:{
        url:String,
        filename:String,
        },
    rating:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
}
)
const Request=mongoose.model('Request',requestSchema);
module.exports=Request;
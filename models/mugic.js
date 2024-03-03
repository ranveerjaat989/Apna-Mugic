const mongoose=require('mongoose');
const Schema= mongoose.Schema;

const mugicSchema=new Schema({
    username:String,
    title:String,
    mugic:String,
    img:{
        url:String,
        filename:String,
        },
}
)
const Mugic=mongoose.model('Mugic',mugicSchema);
module.exports=Mugic;

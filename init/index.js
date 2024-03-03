const mongoose=require('mongoose');
const initdata=require('./data.js');
const Mugic=require('../models/mugic.js');
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/mugictext');

}


main()
.then(()=>{
    console.log('Connect to DB');
})
.catch((err)=>{
    console.log(err);
})


const initDb= async()=>{
     await Mugic.deleteMany({});
    let x=initdata.data;
// x=x.map((obj)=>({...obj ,owner :"65acba0650de6f0b5e893d15"}))
   await Mugic.insertMany(x);
    console.log(x);
    console.log("Ho gya")
}
initDb();
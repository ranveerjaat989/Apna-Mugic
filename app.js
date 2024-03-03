if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}

const express=require('express');
const app=express();
const port=8080;
const path=require('path');
const mongoose=require('mongoose');
 const MONGO_URL='mongodb://127.0.0.1:27017/mugictext';
const ejsMate=require('ejs-mate');
const Mugic=require('./models/mugic');
const wrapAsync=require('./utils/wrapAsync.js');
const ExpressError=require("./utils/ExpressError");
const {mugicSchema}=require('./schema.js');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');
const Request=require('./models/request.js');
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');
const {isLoggedIn}=require('./middleware.js');
const {saveRedirectUrl}=require('./middleware.js');
const multer  = require('multer')
const {storage}=require('./cloudConfig.js');
const methodOverride = require('method-override')
const http = require("http");

const upload = multer({storage});
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,'/public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.engine('ejs',ejsMate);
app.use(methodOverride('_method'))
main()
.then((e)=>{
    console.log("Connect to db");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}


validateMugic=(req,res,next)=>{
  const {error}=mugicSchema.validate(req.body);
  if(error){
      let errMeg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,errMeg);
  }
  else{
      next();
  }
}

const store=MongoStore.create({
  mongoUrl:`${MONGO_URL}`,
  crypto:{
      secret:'MysupperSecuirt',
  },
  touchAfter:24*3600,
});
store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE", err)
})

const sessionOptions={
  secret:'MysupperSecuirt',
  store,
  resave:false,
  saveUninitialized: true,
  cookie:{
      expires: Date.now()+ 7*24*60*60*1000,
      maxAge: 7*24*60*60*1000,
      httpOnly:true
  }
}
app.use(session(sessionOptions));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currUser=req.user;
    next();
})

app.get('/mugic',wrapAsync(async(req,res)=>{
     let mugics= await Mugic.find();  
     res.render('mugics/index.ejs',{mugics}); 

}))
app.get('/mugic/new',isLoggedIn,(req,res)=>{
  res.render('mugics/new.ejs');
})

app.post('/mugic',upload.single('mugic[img]'),wrapAsync(async(req,res)=>{
 
  let url=req.file.path;
  let filename=req.file.filename;
  console.log('hd')
  console.log(url,filename)
  let newMugic=new Mugic(req.body.mugic);
  newMugic.username=req.user.username;
  newMugic.img={url,filename};
  await newMugic.save();
  req.flash('success','New Music Created!');  
  res.redirect('/mugic');
}));

app.delete('/mugic/:id',async(req,res)=>{
  let {id}=req.params;
  await Mugic.findByIdAndDelete(id);
  req.flash('success','Mugic Deleted!');
  res.redirect("/profile");
})

app.get('/mugic/:id/edit',async(req,res)=>{
  let {id}=req.params;
  let mugic=await Mugic.findById(id);
  if(!mugic)
  {
      req.flash('error',"Listing you required for does not exist!");
      res.redirect('/listings');
  }
  res.render('mugics/edit.ejs',{mugic});
})
app.put('/mugic/:id',upload.single('mugic[img]'),async(req,res)=>{
  let {id}=req.params;
  let mugic= await Mugic.findByIdAndUpdate(id, {...req.body.mugic});
  if(typeof req.file!=='undefined'){
    let url=req.file.path;
    let filename=req.file.filename;
    mugic.img={url,filename};
    await mugic.save();
    req.flash('success','Edit Music! '); 
    res.redirect(`/profile`);  
}
})

//User
app.get('/album',async(req,res)=>{
  let mugics= await Mugic.find();  
  let users= await User.find();

  res.render('mugics/myalbom',{mugics,users})
})
app.get('/singersong/:username',async(req,res)=>{
   const {username}=req.params;

   mugics= await Mugic.find({username:`${username}`});  
   res.render('singersong',{mugics})
})
app.get('/signup',(req,res)=>{
  res.render('user/signup');
})
app.post('/signup',upload.single('img'),async(req,res)=>{
  try{ 
  let url=req.file.path;
  let filename=req.file.filename;
    let {username,name,email,password}=req.body; 
    const newUser=new User({email,name,username});
    newUser.img={url,filename};
    const registerUser=await User.register(newUser,password);
    req.login(registerUser,(err)=>{
      if(err){
        return next(err);
      }
      req.flash('success',"wellcome");
      res.redirect('/mugic')
    })
   
  }
  catch(err){
    req.flash('error',err.message);
    res.redirect('/signup')
  }
})
app.get('/login',(req,res)=>{
  res.render('user/login')
})
app.post('/login',saveRedirectUrl,passport.authenticate('local',{failureRedirect:'/login' ,failureFlash:true}),(req,res)=>{
  req.flash('success','Well-Come');
 const redirectUrl=res.locals.redirectUrl ||'/mugic';
  res.redirect(redirectUrl);
})

app.get('/logout',(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err)
    }
    req.flash('success','Logout succesfully!');
    res.redirect('/mugic')
  })
})

//admin----------
app.get('/admin',(req,res)=>{
  res.render('user/adminFOrm')
})

app.post('/admin',async(req,res)=>{
  const {code}=req.body
  if(code==process.env.ADMIN_SECRET)
  {
    let mugics= await Mugic.find();  
    let users= await Mugic.find();  
    res.render('allaccess');
    req.flash('success','Logout succesfully!');
  }
  else{
    req.flash('error','Please Enter Correct Code!');
    res.redirect('/admin');
  }
  
})
app.get('/adminmugics',async(req,res)=>{
  let mugics= await Mugic.find();  
  res.render('user/adminmugic',{mugics})
})
app.delete('/adminmugic/:id',async(req,res)=>{
  let {id}=req.params;
  await Mugic.findByIdAndDelete(id);
  req.flash('success','Mugic Deleted!');
  res.redirect("/adminmugics");
})

app.get('/adminusers',async(req,res)=>{
  let users= await User.find(); 
  res.render('user/adminuser',{users}); 
})

app.get('/adminrquests',async(req,res)=>{
  let requests= await Request.find(); 
  res.render('user/adminrequest',{requests}); 
})
app.delete('/adminuser/:id',async(req,res)=>{
  let {id}=req.params;
  await User.findByIdAndDelete(id);
  req.flash('success','Listing Deleted!');
  res.redirect("/adminusers");
})

//profile=-------------------
app.get('/profile',isLoggedIn,wrapAsync(async(req,res)=>{
  let mugics= await Mugic.find({username:`${req.user.username}`});  
  const user=req.user;
  res.render('user/profile',{user,mugics})
}))

app.all('*',(req,res,next)=>{
  next(new ExpressError(404,'Page Not Found!'))
})

app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something want wrong!"}=err;

  res.status(statusCode).render('error.ejs',{message});
})


app.listen(port,()=>{
    console.log("Port 3000 are listing");
})

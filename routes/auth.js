const express=require('express')
const router=express.Router()
const mongoose=require('mongoose')
const User=mongoose.model("User")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../keys')
const requireLogin=require('../middleware/requireLogin')



router.get('/',(req,res)=>{
    res.send("hello")
})

router.post('/signup', (req,res)=> {
  const {name,email,password,image} =req.body

  if(!email || !password || !name)
  {
      return res.status(422).json({error:"please add all fields"})
  }
  User.findOne({email:email}).then ((savedUser)=>{
      if(savedUser)
      {
        return res.status(422).json({error:"ser already existed"})
      }
      bcrypt.hash(password,12)
      .then (hashedpassword =>{
        const user=new User({
            email,
            password:hashedpassword,
            name,
            image:image
        })
        user.save()
        .then(user =>{
            res.json({message:"svaed done"})
        })
        .catch(err=>{
            console.log(err)
        })
        })
         .catch (err =>{
        console.log(err)
        })
    
      })
     
})

router.post('/signin',(req,res)=>{
    const {email,password}=req.body

    if(!email || !password)
    {
        res.status(422).json({error:"please add email and passowrd"}
        )}

    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser)
        {
            return res.status(422).json({error:"invalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then (doMatch=>{
            if(doMatch )
            {
                //res.json({message:"sucessfully signed in "})
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
                const{_id,name,email,followers,following,image}=savedUser
                res.json({token,user:{_id,name,email,followers,following,image}})

            }
            else{
                return res.status(422).json({error:"invalid email or password"})

            }
        })
        .catch (err=>
        {
            console.log(err)
        })
    })
})
module.exports=router
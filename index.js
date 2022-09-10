
import express from "express"
import cors from "cors"
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { MongoClient } from 'mongodb';
const app = express()
app.use(express.json());
dotenv.config()
app.use(cors())

var mongoUrl = process.env.mongoUrl
async function createConnection(){
    var client = new MongoClient(mongoUrl);
    await client.connect()
    console.log("connection is ready ")
 return client
}
export var client = await createConnection()

async function passwordMatch(pass){
    var salt = await bcrypt.genSalt(4);
    var hash = await bcrypt.hash(pass,salt);
    return hash;
}


app.post("/signin", async function(req,res){
    let {email,password} = req.body
    let hash = await passwordMatch(password)
    let result = await client.db("product").collection("users").insertOne({email,"password":hash})
    res.send(result)
})
  app.post("/login",async function(req,res){
    let {email,password}=req.body;
    let result =await client.db("product").collection("users")
    .findOne({email});
    if(!result){
        res.status(401).send({msg:"invalid"})
    }else{
        var storedPassword = result.password
        var compare = await bcrypt.compare(password,storedPassword)
        if(!compare){
            res.status(401).send({msg:"invalid"})
        }else{
            const token = await jwt.sign({id:result._id},"santhosh");
            async function nodemail(){
                var transfer = nodemailer.createTransport({
                    service:"hotmail",
                    auth:{
                       user:"santhoshbalaji304@gmail.com",
                       pass:"santhosh1234"
                    }
                 
                 })
                   const options={
                    from:"santhoshbalaji304@gmail.com",
                    to:email,
                    subject:"your login",
                    text:"your login into pizz shop"
                   }
                 
                   transfer.sendMail(options,(err)=>{
                    if(err){
                       console.log(err)
                    }else{
                       console.log({msg:"mail send"})
                    }
                   })
                   transfer.verify()
                }
                nodemail()
                res.send({msg:"login sucessfully",token:token})
        }
    }
  })

app.listen(process.env.PORT,()=>{
    console.log("server is ready")
});
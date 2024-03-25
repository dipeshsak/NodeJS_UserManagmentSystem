const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')

const db = require('../config/dbConnection');

const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail')

const register =(req,res)=>{
    console.log("REQ IS",req.body)
   const errors = validationResult(req)

   if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array() });
   }

   db.query(
    `SELECT * FROM users WHERE LOWER(email)=LOWER(${db.escape(req.body.email)});`,
    (err,result)=>{
        if(result && result.length){
            return res.status(409).send({
                msg:'This user already in use!'
            })
        }else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                console.log("HASHING PASSWORD",err)
              if(err){
               return res.status(500).send({
                msg:err
               })
              }else{
                console.log("IN ELSE HASHING PASSWORD",hash)

                db.query(
                    `INSERT INTO users (name,email,password) VALUES ('${req.body.name}',${db.escape(req.body.email)},${db.escape(hash)});`,
                    (err,result)=>{
                        if(err){
                            return res.status(500).send({
                                msg:err
                            })
                        }

                        let mailSubject = 'Mail Verification';
                        const randomToken = randomstring.generate();
                        let content = '<p> Hi '+req.body.name +', \
                        Please <a href="http://localhost:3000/mail-verification?token='+randomToken+'"> Verify </a> your Mail.  </p>'

                        sendMail(req.body.email,mailSubject,content);

                        db.query('UPDATE users SET token=? WHERE email=?',[randomToken,req.body.email],function(error,result,fields){


                            if(error){
                                return res.status(400).send({
                                    msg:error
                                })
                            }
                        })

                        return res.status(201).send({
                            msg:'User register Suceess'
                        })
                    }

                )
              }
            })
        }
    }
   )
}

module.exports={
    register
}
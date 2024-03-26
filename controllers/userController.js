const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')

const db = require('../config/dbConnection');

const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail');


const jwt=require('jsonwebtoken');
const {JWT_SECRET} = process.env

const register =(req,res)=>{

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
                    `INSERT INTO users (name,email,password,image) VALUES ('${req.body.name}',${db.escape(req.body.email)},${db.escape(hash)},'images/${req.file.filename}');`,
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

const verifyMail =(req,res)=>{
  var token = req.query.token;

  db.query('SELECT * FROM users where token=? limit 1',token,function(error,result,fields){
    if(error){
        console.log(error.message)
    }

    if(result.length > 0){
       db.query(`
        UPDATE users SET token=null,is_verified =1 WHERE id ='${result[0].id}'
       `);

       return res.render('mail-verification',{message:'Mail Verified Successfully.'})
    }else{
        return res.render('404')
    }

  })
}

const login =(req,res)=>{
   const errors = validationResult(req)


   if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array() });
   }

   db.query(
    `SELECT * FROM users WHERE email= ${db.escape(req.body.email)};`,
    (err,result)=>{
      if(err){
        return res.status(400).send({
            msg:err
        })
      }

      if(!result.length){
        return res.status(401).send({
            msg:'Email or Password is Incorrect!'
        })
      }

      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr,bResult)=>{
        if(bErr){
            return res.status(400).send({
                msg:bErr
            })
        }
        if(bResult){
          const token =  jwt.sign({id:result[0]['id'], is_admin:result[0]['is_admin']},JWT_SECRET,{expiresIn:'1h'});

          db.query(`
          UPDATE users SET last_login =now() WHERE id='${result[0]['id']}'
          `);

          return res.status(200).send({
            msg:'Logged In!',
            token,
            user:result[0]
        })

        }
        return res.status(401).send({
            msg:'Email or Password is Incorrect!'
        })

        }
      )

    }
   )
}

const getUser =(req,res)=>{
    const authToken = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(authToken,JWT_SECRET)

    db.query('SELECT * FROM users where id=?',decode.id,function(error,result,fields){
      if(error) throw error;

      return res.status(200).send({success:true,data:result[0],message:'FETCH SUCCESSFULLY'})
    })

}

const updateProfile=(req,res)=>{

    try{
    const errors = validationResult(req)


    if(!errors.isEmpty()){
     return res.status(400).json({errors:errors.array() });
    }

    const token = req.headers.authorization.split(' ')[1];
    const decode =jwt.verify(token,JWT_SECRET)

    var sql='',data;

    if(req.file != undefined){
        sql=`UPDATE users SET name=?, email=?, image= ? where id = ? `;
        data=[req.body.name,req.body.email,'images/'+req.file.filename,decode.id]
    }else{
        sql=`UPDATE users SET name=?, email=? where id = ? `;
        data=[req.body.name,req.body.email,decode.id]
    }

    db.query(sql,data,function(error,result,fields){
       if(error){
        res.status(400).send({
            msg:error
        })
       }

       res.status(200).send({
        msg:'Profile Update Success'
       })
    })


    }catch(error){
        return res.status(400).json({msg:error.message})
    }
    

}

module.exports={
    register,
    verifyMail,
    login,
    getUser,
    updateProfile
}
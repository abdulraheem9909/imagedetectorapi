const express = require('express');
const app =express();
const bodyParser= require('body-parser');
const cors = require('cors');
var knex = require('knex');
const bcrypt =require('bcrypt-nodejs');
const db=knex({
        client: 'pg',
        connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'abdul9909',
        database : 'samrtbrain'
    }
  });
 //console.log( db.select('*').table('user'));
app.use(bodyParser.json());
app.use(cors());

app.get ('/',(req,res)=>{
    res.json(database.user);
});
app.post('/signin',(req,res)=>{
    db.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data=>{
            const valid=bcrypt.compareSync(req.body.password, data[0].hash)
            if(valid){
                return db.select('*').from('user').where('email','=',req.body.email)
                .then(user=>{
                    res.json(user[0])
                })
                .catch(err=> res.status(400).json('unable to get user'));
            }
            else{
                res.status(400).json('wrong credentials')
            }
    })
    .catch(err=> res.status(400).json('wrong credentials'));

    
});
app.post('/register',(req,res)=>{
    const {email,password,first_name,last_name}=req.body;
    if(email.length){
        var hash = bcrypt.hashSync(password);
        db.transaction(trx=>{
            trx.insert({
                hash:hash,
                email:email
            })
            .into('login')
            .returning('email')
            .then(resEmail=>{
                return trx('user')
                .returning('*')
                .insert({
                    email:resEmail[0],
                    first_name:first_name,
                    last_name:last_name,
                    joinned: new Date
                  })
                  .then(data=>{
                      res.json(data[0])
                  })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    
        })
        .catch(err=>{
            res.status(400).json('unable to register');
        });
      
       

    }
    else{
        res.status(400).json('empty register');

    }
   
    
});
app.get('/home/:id',(req,res)=>{
    const {id}= req.params;
   db.select('*').from ('user').where({id})
   .then(user=>{
       if(user.length)
       {
           res.json(user[0]);
           console.log(res.json(user[0]));
       }
       else{
           res.status(400).json('Not Found');
           console.log(res.json(user[0]));
       }
   })
   .catch(err=> res.status(400).json('error connecting user'));
});

app.put('/image',(req,res)=>{
    const { id }= req.body;
   db('user').where({id})
   .increment('entries',1)
   .returning('entries')
   .then(user=>{
       res.json(user[0]);
   })
   .catch(err=>{
       res.status(400).json('eroor getting to get enteries');
   })
});





const PORT = process.env.PORT||5000;
app.listen (PORT,()=>console.log(`server is riunning in port : ${PORT}`));
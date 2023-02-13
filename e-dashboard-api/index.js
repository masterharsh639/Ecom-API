const express = require("express");
const cors = require('cors')
require('./db/config')
const User = require('./db/User')
const app = express();
const Product = require('./db/Product')
const Jwt = require('jsonwebtoken');
const jwtKey = 'e-commerce'

app.use(express.json())
app.use(cors());

app.post('/register', async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send({ result: "please try after sometime" });
        }
        resp.send({ user, auth: token });
    })

})


app.post('/login', async (req, resp) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body);
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    resp.send({ result: "please try after sometime" });
                }
                resp.send({ user, auth: token });
            })

        } else {
            resp.send({ result: "user not found" })
        }
    }
    else {
        resp.send("result not found")
    }
})


app.post('/addproduct', async (req, res) => {
    let product = new Product(req.body)
    let result = await product.save();
    res.send(result)
})

app.get('/productlist', async (req, res) => {
    let result = await Product.find();
    if (result.length < 0) {
        res.send('Error:No product Found')
    }
    else {
        res.send(result)
    }
})

app.delete('/product/:id', async (req, res) => {
    let result = await Product.deleteOne({ _id: req.params.id })
    res.send(result)
})

app.put('/product/:id', async (req, res) => {
    let result = await Product.updateOne({ _id: req.params.id }, {
        $set: req.body
    })
    if (result) {
        res.send(result)
    }
    else {
        res.send("no result found");
    }
})

app.get('/product/:id', async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id })
    res.send(result)
})

app.get("/search/:key", async (req, res) => {
    console.log(req.params.key)
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { price: { $regex: req.params.key } }
        ]
    });
    console.log(result);
    res.send(result)
})

function verifyToken(req,res,next){
    let token = req.headers['authorization']
    if(token){
        token = token.split('')[1];
        jwtKey.verify(token,jwtKey ,(err,valid) =>{
            if(err){
                resp.status(401).send({result:"please provide the token"})
            }
            else{
                next();
            }
        })
    }
    else{
        resp.status(403).send({result:"Please add token with header"})
    }
}

app.listen(5000);
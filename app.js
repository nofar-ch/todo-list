const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const path = require('path');
const db = require('./public/database/db');
const collection = "todo";
const joi = require('@hapi/joi');
const HTML_DIR = path.join(__dirname, '/public/');
app.use(express.static(HTML_DIR));

const PORT = 3001;

const schema = joi.object().keys({
    todo: joi.string().required(),   // todo must be string
});

app.use(bodyParser.json());

//Get
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'view.html'));
})

//Get todos arrays
app.get('/getTodos', (req, res, next) => {
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if(err) {
            const error = new Error("Failed to connect to database")
            error.status = 400;
            next(error);
        }
        else {
            res.json(documents);
        }
    });
});

//Edit
app.put('/:id', (req, res, next) => {
    const todoId = req.params.id;
    const userInput = req.body;
   joi.validate(userInput, schema, (err, result) => {
       if(err || userInput.todo.replace(/\s/g, '').length <= 0) {
            const error = new Error("Invalid input");
            error.status = 400;
            next(error);
       }
       else {
            db.getDB().collection(collection).findOneAndUpdate({_id: db.getPrimaryKey(todoId)}, {$set: {todo: userInput.todo}}, {returnOriginal: false}, 
                (err, result) => {
                if(err) {
                    const error = new Error("Failed to insert todo to the database");
                    error.status = 400;
                    next(error);
                }
                else {
                    res.json({result: result, msg: "successfully Updated", error: null});
                }
            });
       }
   });
});

//Create
app.post('/', (req, res, next) => {
    const userInput = req.body;
    joi.validate(userInput, schema, (err, result) => {
        if(err || userInput.todo.replace(/\s/g, "").length <= 0) {
            const error = new Error("Invalid input");
            error.status = 400;
            next(error);
        }
        else {
            db.getDB().collection(collection).insertOne(userInput, (err, result) => {
            if(err){
                const error = new Error("Failed to insert todo to the database");
                error.status = 400;
                next(error);
            }
            else
                res.json({result: result, document: result.ops[0], msg: "Added Successfully", error: null});
            });
            }
        });
});

//Delete
app.delete('/:id', (req, res, next) => {
    const todoId = req.params.id;
    db.getDB().collection(collection).findOneAndDelete({_id: db.getPrimaryKey(todoId)}, (err, result) => {
        if(err) {
            const error = new Error("Failed to delete todo");
            error.status = 400;
            next(error);
            }
        else
        res.json({result: result, msg: "Successfully Deleted", error: null});
        });
});

//Error handler
app.use((err,req,res,next)=>{
    res.status(400).json({
        error : {
            message : err.message
        }
    });
})

//Connect to DB
db.connect((err, next) => {
    if(err){
        const error = new Error("Unable to connent to database");
        error.status = 400;
        next(error);
        process.exit(1);
    }
    else {
        app.listen(PORT, () => {
            console.log(`connect to database, app listen to port ${PORT}`);
        });
    }
});

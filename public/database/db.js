const mongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectID;
const dbName = 'todos';
const url = 'mongodb://localhost:27017';
const mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true };


const state ={ 
    db: null
};

const connect = (funCallBack) => {
    if(state.db) // have database
        funCallBack();
    else {
        mongoClient.connect(url, mongoOptions, (err, client) => {
            if(err) 
                funCallBack(err);
            else{
                state.db = client.db(dbName);
                funCallBack();
            }

        })
    }
}

const getPrimaryKey = (id) => {
    return objectId(id);
}

const getDB = () => {
    return state.db;
}

module.exports = {connect, getPrimaryKey, getDB};
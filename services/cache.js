const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

//const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options={}){
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}

mongoose.Query.prototype.exec = async function(){
    if(!this.useCache){
      return exec.apply(this,arguments);
    }
    const key = JSON.stringify(Object.assign({},this.getQuery(), {
      collection:this.mongooseCollection.name
    }));

    // see if we have a value for key in redis
    // if yes then return this
    const cachedValue = await client.hget(this.hashKey,key);
    if(cachedValue){
      console.log('Serving from cache');
      const doc = JSON.parse(cachedValue);
      return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
    }

    const result = await exec.apply(this,arguments);
    client.hset(this.hashKey,key,JSON.stringify(result));
    //else return mongo query as normal and store value in redis
    return result;//exec.apply(this,arguments);
}

module.exports = {
  clearCache(hashKey){
    client.del(JSON.stringify(hashKey));
  },
  flushRedis(){
    client.flushall();
  }
}

const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  // const redis = require('redis');
  // const redisUrl = 'redis://127.0.0.1:6379';
  // const client = redis.createClient(redisUrl);
  // const util = require('util');
  // client.get = util.promisify(client.get);

  // app.get('/api/blogs', requireLogin, async (req, res) => {
  //
  //   // do we have any cached data in redis related to this request
  //   const cachedBlogs = await client.get(req.user.id);
  //   // if yes then return right away
  //   if(cachedBlogs){
  //     console.log('Serving from cache');
  //     return res.send(JSON.parse(cachedBlogs));
  //   }
  //
  //   console.log('Serving from mongodb');
  //   //if no then respond to request and update cache
  //   const blogs = await Blog.find({ _user: req.user.id });
  //   client.set(req.user.id,JSON.stringify(blogs));
  //   res.send(blogs);
  // });
  app.get('/api/blogs', requireLogin, async (req, res) => {
    // flushRedis();
    // Blog.remove({}, function(err,removed) {
    //   console.log('removed ', removed);
    // });
    const blogs = await Blog.find({ _user: req.user.id }).cache({key:req.user.id});
    res.send(blogs);

  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      //client.flushall();
      res.send(blog);
    } catch (err) {
      res.status(400).send(err);
    }
  });
};

const Page = require('./helpers/page');

describe('Blog Tests', function() {
  let page;
  beforeEach(async ()=>{
    page = await Page.build();
    await page.goto('http://localhost:3000');
  });

  describe('when user is logged in', async ()=>{
    beforeEach(async ()=>{
      await page.login();
      await page.click('a.btn-large.red');
    });

    it('should show the blog create form', async ()=>{
      const label = await page.getContentsOf('form label');
      expect(label).toEqual('Blog Title');
    });

    describe('when using valid inputs',()=>{
      beforeEach(async()=>{
        await page.type('.title input','Test Title');
        await page.type('.content input','Test Content');
        await page.click('form button');
      });
      it('should show a review screen when the Next button is pressed',async ()=>{
        const msg1 = await page.getContentsOf('h5');
        expect(msg1).toEqual('Please confirm your entries');
      })
      it('should add a blog post to the index page when the Save Blog button is pressed',async ()=>{
        await page.click('form button.green');
        await page.waitFor('span.card-title');
        const blogPost = await page.getContentsOf('span.card-title');
        expect(blogPost).toEqual('Test Title');
      })
    });
    describe('when using invalid inputs',()=>{
      beforeEach(async()=>{
        await page.click('form button');
      });
      it('should show a form error message',async ()=>{
        const msg1 = await page.getContentsOf('.title .red-text');
        const msg2 = await page.getContentsOf('.content .red-text');
        expect(msg1).toEqual('You must provide a value');
        expect(msg2).toEqual('You must provide a value');
      })
    })
  });

  describe('user is not logged in',async ()=>{
    const actions =[
      {
        method:'get',
        path:'/api/blogs'
      },
      {
        method:'post',
        path:'/api/blogs',
        data:{
          title:'T',
          content:'C'
        }
      }
    ];

    it('should reject all blog related actions',async ()=>{
      const results = await page.execRequests(actions);
      for(let result of results){
        expect(result).toEqual({error:'You must log in!'});
      }
    })

    // it('should reject an attempt to create a blog post',async () => {
      // await page.login();
      //const result = await page.post('/api/blogs',{'title':'T','content':'C'});
      // const result = await page.evaluate(
      //   ()=>{
      //     return fetch('/api/blogs',{
      //       method:'POST',
      //       credentials:'same-origin',
      //       headers:{
      //         'Content-Type':'application/json'
      //       },
      //       body:JSON.stringify({'title':'____AAAAAA','content':'___ZZZZZZZ'})
      //     }).then(res=>res.json());
      //   }
      // );
      //expect(result).toEqual({error:'You must log in!'});
    // });
    // it('should not return a list of blog posts',async ()=>{
      //const result = await page.get('/api/blogs');
      // const result  = await page.evaluate(
      //   ()=>{
      //     return fetch('/api/blogs',{
      //       method:'GET',
      //       credentials:'same-origin',
      //       headers:{
      //         'Content-Type':'application/json'
      //       }
      //     }).then(res=>res.json());
      //   }
      // )
      //expect(result).toEqual({error:'You must log in!'});
    // })
  })

  afterEach(async ()=>{
    await page.close();
  });
});

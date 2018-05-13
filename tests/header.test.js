//const puppeteer = require('puppeteer');
const customPage = require('./helpers/page');

describe('Browser Testing', function() {
  // Test the controller
  describe('Launch browser and do some tests', function() {
    let page;

    beforeEach(async ()=>{
      page = await customPage.build();
      await page.goto('http://localhost:3000');
    });
    
    afterEach(async ()=>{
      await page.close();
    });

    it('should show Logout button when credentials are supplied',async ()=>{
      await page.login();

      //const logoutBtn = await page.$eval('a[href="/auth/logout"]',el=>el.innerHTML);
      const text = await page.getContentsOf('a[href="/auth/logout"]');
      expect(text).toEqual('Logout');
    })
  });

});

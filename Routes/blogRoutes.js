const express = require("express");
const router = express.Router();

const { 
    createblog,
    updateblog,
    deleteblog,
    listblog,
    viewblog, 
    deletemultiblog,
    listblogAdmin,
    viewblogbyid,
    getblogSlugs,
    listblogWritter,
    getFeaturedblogs,
      getFeaturedblogsadmin,
      changeblogauther,
      viewblogbytitle
} = require("../Controller/blogController");



router.post('/create', createblog);
router.put('/update/:id', updateblog);
router.delete('/delete/:id', deleteblog);
router.get('/search', viewblogbytitle);
router.delete('/deleteMultiple', deletemultiblog);
router.get('/view/:slug', viewblog);
router.get('/viewbyid/:id', viewblogbyid);
router.get('/list', listblog);
router.get('/sluglist', getblogSlugs);
router.get('/adminlist', listblogAdmin);
router.get('/writerlist', listblogWritter);
router.get('/featured', getFeaturedblogs);
router.get('/featuredAdmin', getFeaturedblogsadmin);
router.get('/changeblogauther', changeblogauther);




module.exports = router;
const express = require("express");
const multer = require("multer");

const router = express.Router();
//seadistame vahevara fotode üleslaadimiseks kindlasse kataloogi
const uploader = multer({dest: "./public/newsphotos/"});

//kontrollerid
const {
	newsHome,
	addNewsPage,
	addNewsPagePost,
	newsListPage} = require("../controllers/newsControllers");

//app.get("/news", (req, res)=>{
router.route("/").get(newsHome);

router.route("/addnews").get(addNewsPage);

router.route("/addnews").post(uploader.single("photoInput"), addNewsPagePost);

router.route("/read").get(newsListPage);
	
module.exports = router;
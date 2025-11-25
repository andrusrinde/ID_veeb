const express = require("express");
const multer = require("multer");
const loginCheck = require("../src/checkLogin");

const router = express.Router();
//kõigile marsruutidele lisan sisselogimise kontrolli vahevara
router.use(loginCheck.isLogin);
//seadistame vahevara fotode üleslaadimiseks kindlasse kataloogi
const uploader = multer({dest: "./public/gallery/orig/"});

//kontrollerid
const {
	galleryphotoupPage,
	galleryphotoupPagePost} = require("../controllers/galleryphotoupControllers");

router.route("/").get(galleryphotoupPage);
router.route("/").post(uploader.single("photoInput"), galleryphotoupPagePost);
	
module.exports = router;
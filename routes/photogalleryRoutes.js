const express = require("express");
const loginCheck = require("../src/checkLogin");

const router = express.Router();
//kõigile marsruutidele lisan sisselogimise kontrolli vahevara
router.use(loginCheck.isLogin);

//kontrollerid
const {
	photogalleryHome,
	photogalleryPage} = require("../controllers/photogalleryControllers");

router.route("/").get(photogalleryHome);

router.route("/:page").get(photogalleryPage);
	
module.exports = router;
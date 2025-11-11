const express = require("express");

const router = express.Router();

//kontrollerid
const {
	photogalleryHome} = require("../controllers/photogalleryControllers");

router.route("/").get(photogalleryHome);
	
module.exports = router;
const express = require("express");
const router = express.Router();

//kontrollerid
const {
	filmHomePage,
	filmPeople,
	filmPeopleAdd,
	filmPeopleAddPost,
	filmPosition,
	filmPositionAdd,
	filmPositionAddPost} = require("../controllers/eestifilmControllers");

router.route("/").get(filmHomePage);
router.route("/inimesed").get(filmPeople);
router.route("/inimesed_add").get(filmPeopleAdd);
router.route("/inimesed_add").post(filmPeopleAddPost);
router.route("/ametid").get(filmPosition);
router.route("/ametid_add").get(filmPositionAdd);
router.route("/ametid_add").post(filmPositionAddPost);
	
module.exports = router;
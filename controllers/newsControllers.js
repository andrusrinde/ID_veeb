const mysql = require("mysql2/promise");
const dbInfo = require("../../../../../vp2025config");
const watermarkFile = "./public/images/vp_logo_small.png";

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

//@desc Home page for news section
//@route GET /news
//@access public

const newsHome = (req, res)=>{
	res.render("news");
};

//@desc page for adding news
//@route GET /news/addnews
//@access public

const addNewsPage = (req, res)=>{
	res.render("addnews");
};

//@desc page for uploading gallery pictures
//@route POST /news/addnews
//@access public

const addNewsPagePost = async (req, res)=>{
	let conn;
	console.log(req.body);
	console.log(req.file);
	
	try {
	  
	}
	catch(err) {
	  console.log(err);
	  res.render("addnews");
	}
	finally {
	  if(conn){
		await conn.end();
		console.log("Andmebaasiühendus suletud!");
	  }
	}
	
};


module.exports = {
	newsHome,
	addNewsPage,
	addNewsPagePost,
	newsListPage
};
const express = require("express");
const fs = require("fs");
const bodyparser = require("body-parser");
//nüüd, async jaoks kasutame mysql2 promise osa
const mysql = require("mysql2/promise");
//sessioonihaldur
const session = require("express-session");
const dbInfo = require("../../../../vp2025config");
const dateEt = require("./src/dateTimeET");
const loginCheck = require("./src/checkLogin");
const app = express();
app.use(session({secret: dbInfo.configData.sessionSecret, saveUninitialized: true, resave: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
//kui vormist tuleb ainult text, siis false, muidui true
app.use(bodyparser.urlencoded({extended: true}));

const dbConf = {
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
};

app.get("/", async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection(dbConf);
		let sqlReq = "SELECT filename, alttext FROM galleryphotos_id WHERE id=(SELECT MAX(id) FROM galleryphotos_id WHERE privacy=? AND deleted IS NULL)";
		const privacy = 3;
		const [rows, fields] = await conn.execute(sqlReq, [privacy]);
		//console.log(rows);
		let imgAlt = "Avalik foto";
		if(rows[0].alttext != ""){
			imgAlt = rows[0].alttext;
		}
		res.render("index", {imgFile: "gallery/normal/" + rows[0].filename, imgAlt: imgAlt});
	}
	catch(err){
		console.log(err);
		//res.render("index");
		res.render("index", {imgFile: "images/otsin_pilte.jpg", imgAlt: "Tunnen end, kui pilti otsiv lammas ..."});
	}
	finally {
		if(conn){
			await conn.end();
			console.log("Andmebaasiühendus suletud!");
		}
	}
});

//sisseloginud kasutajate osa avaleht
app.get("/home", loginCheck.isLogin, (req,res)=>{
  //console.log("Sisse logis kasutaja id: " + req.session.userId);
  res.render("home", {userName: req.session.userFirstName + " " + req.session.userLastName});
});

//Väljalogimine
app.get("/logout", (req,res)=>{
  console.log("Kasutaja id: " + req.session.userId + " logis välja!");
  //tühistame sessiooni
  req.session.destroy();
  res.redirect("/");
});

app.get("/timenow", (req, res)=>{
	res.render("timenow", {nowDate: dateEt.longDate(), nowWd: dateEt.weekDay()});
});

app.get("/vanasonad", (req, res)=>{
	fs.readFile("public/txt/vanasonad.txt", "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Valik Eesti tuntud vanasõnasid", listData: ["Kahjuks vanasõnasid ei leidnud!"]});
		} else {
			let folkWisdom = data.split(";");
			res.render("genericlist", {heading: "Valik Eesti tuntud vanasõnasid", listData: folkWisdom});
		}
	});
	
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw(err);
		}
		else {
			fs.appendFile("public/txt/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ", " + dateEt.longDate() + " kell " + dateEt.time() + ";", (err)=>{
				if(err){
					throw(err);
				}
				else {
					console.log("Salvestatud!");
					res.render("visitregistered", {visitor: req.body.firstNameInput + " " + req.body.lastNameInput});
				}
			});
		}
	});
});

app.get("/visitlog", (req, res)=>{
	let listData = [];
	fs.readFile("public/txt/visitlog.txt", "utf8", (err, data)=>{
		if(err){
			res.render("genericlist", {heading: "Registreeritud külastused", listData: ["Ei leidnud ühtegi külastust!"]});
		}
		else {
			let tempListData = data.split(";");
			for(let i = 0; i < tempListData.length - 1; i ++){
				listData.push(tempListData[i]);
			}
			res.render("genericlist", {heading: "Registreeritud külastused", listData: listData});
		}
	});
});

//Eesti filmi marsruudid
const eestifilmRouter = require("./routes/eestifilmRoutes");
app.use("/eestifilm", eestifilmRouter);

//Galeriipiltide üleslaadimise marsruudid
const galleryphotoupRouter = require("./routes/galleryphotoupRoutes");
app.use("/galleryphotoupload", galleryphotoupRouter);

//Galerii marsruudid
const photogalleryRouter = require("./routes/photogalleryRoutes");
app.use("/photogallery", photogalleryRouter);

//Uudiste osa eraldi marsruutide failiga
const newsRouter = require("./routes/newsRoutes");
app.use("/news", newsRouter);

//konto loomise marsruudid
const signupRouter = require("./routes/signupRoutes");
app.use("/signup", signupRouter);

//sisselogimise marsruudid
const signinRouter = require("./routes/signinRoutes");
app.use("/signin", signinRouter);

app.listen(5200);
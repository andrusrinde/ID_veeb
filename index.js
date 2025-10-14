const express = require("express");
const fs = require("fs");
const bodyparser = require("body-parser");
//lisan andmebaasiga suhtlemiseks mooduli
const mysql = require("mysql2");
//lisan andmebaasi juurdepääsuinfo
const dbInfo = require("../../../../vp2025config");
const dateEt = require("./src/dateTimeET");
//me loome objekti, mis ongi express.js programm ja edasi kasutamegi seda
const app = express();
//määrame renderdajaks ejs
app.set("view engine", "ejs");
//määrame kasutamiseks "avaliku" kataloogi
app.use(express.static("public"));
//päringu URL-i parsimine, eraldame POST osa. False, kui ainuylt tekst, true. kui muud infot ka
app.use(bodyparser.urlencoded({extended: false}));

//loon andmebaasiühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: "if25_inga_petuhhov_ID"
});

app.get("/", (req, res)=>{
	//res.send("Express.js läks edukalt käima!");
	res.render("index");
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
	//avan tekstifaili kirjutamiseks sellisel moel, et kui teda pole, luuakse (parameeter "a")
	fs.open("public/txt/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw(err);
		}
		else {
			//faili senisele sisule lisamine
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
			//kui tuleb viga, siis ikka väljastame veebilehe, liuhtsalt vanasõnu pole ühtegi
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

app.get("/eestifilm", (req, res)=>{
	res.render("eestifilm");
});

app.get("/eestifilm/inimesed", (req, res)=>{
	const sqlReq = "SELECT * FROM person";
	conn.execute(sqlReq, (err, sqlRes)=>{
		if(err){
			console.log(err);
			res.render("filmiinimesed", {personList: []});
		}
		else {
			console.log(sqlRes);
			res.render("filmiinimesed", {personList: sqlRes});
		}
		
	});
	//res.render("filmiinimesed");
});

app.get("/eestifilm/inimesed_add", (req, res)=>{
	res.render("filmiinimesed_add", {notice: "Ootan sisestust!"});
});

app.post("/eestifilm/inimesed_add", (req, res)=>{
	console.log(req.body);
	//kas andmed on olemas?
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || req.body.bornInput > new Date()){
		res.render("filmiinimesed_add", {notice: "Andmed on vigased! Vaata üle!"});
	}
	else {
		let deceasedDate = null;
		if(req.body.deceasedInput != ""){
			deceasedDate = req.body.deceasedInput;
		}
		let sqlReq = "INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)";
		conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.bornInput, deceasedDate], (err, sqlRes)=>{
			if(err){
				res.render("filmiinimesed_add", {notice: "Tekkis tehniline viga:" + err});
			}
			else {
				res.render("filmiinimesed_add", {notice: "Andmed on salvestatud!"});
			}
		});
	}
});


app.get("/eestifilm/ametid", (req, res)=>{
	const sqlReq = "SELECT * FROM position";
	conn.execute(sqlReq, (err, sqlRes)=>{
		if(err){
			console.log(err);
			res.render("filmiametid", {positionList: []});
		}
		else {
			console.log(sqlRes);
			res.render("filmiametid", {positionList: sqlRes});
		}
		
	});
});

app.get("/eestifilm/ametid_add", (req, res)=>{
	res.render("filmiametid_add", {notice: "Ootan sisestust!"});
});

app.post("/eestifilm/ametid_add", (req, res)=>{
	console.log(req.body);
	//kas andmed on olemas?
	if(!req.body.positionNameInput){
		res.render("filmiametid_add", {notice: "Palun kirjuta ameti nimetus!"});
	}
	else {
		let positionDescription = null;
		if(req.body.positionDescriptionInput != ""){
			positionDescription = req.body.positionDescriptionInput;
		}
		let sqlReq = "INSERT INTO `position` (position_name, description) VALUES (?,?)";
		conn.execute(sqlReq, [req.body.positionNameInput, positionDescription], (err, sqlRes)=>{
			if(err){
				res.render("filmiametid_add", {notice: "Tekkis tehniline viga:" + err});
			}
			else {
				//res.render("filmiametid_add", {notice: "Andmed on salvestatud!"});
				res.redirect("/eestifilm/ametid");
			}
		});
	}
});

app.listen(5200);
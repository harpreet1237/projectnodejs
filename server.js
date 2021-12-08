const{ static, json, response } = require("express");
var express = require("express");
var path = require("path");
var app = express();
app.use(express.static("public"));
var mysql = require("mysql");
const port=process.env.PORT || 6006;
var fileup = require("express-fileupload");
const { defaultMaxListeners } = require("events");
app.use(fileup());

// mysql://b1b9af79eb9e42:542756b3@us-cdbr-east-04.cleardb.com/heroku_656ad9a20fde205?reconnect=true
var dbconfig = {
    host: "us-cdbr-east-04.cleardb.com",
    user: "b1b9af79eb9e42",
    password: "542756b3",
    database: "heroku_656ad9a20fde205"
}

var dbcon = mysql.createConnection(dbconfig);

dbcon.connect(function (err) {
    if (err)
        console.log(err.message + "server connection lost!");
    else
        console.log("Connected....Congrats..");
})


app.listen(port, function () {
    console.log("Server Started");
})

app.use(express.urlencoded({ extended: true }));

///////////////trail section////////////////

app.get("/table", (req, resp) => {
    resp.sendFile(__dirname + "/public/table.html");
})


//////////////////user section///////////////////////////////////////////





app.get("/signup-saving", (req, resp) => {
    console.log(req.query.email + " " + req.query.pwd + " " + req.query.type);
    dbcon.query("select * from users where email=?", [req.query.email], function (err, result) {
        if (err)
            resp.send(err.message);
        else {
            if (result.length == 0) {
                dbcon.query("insert into users values(?,?,?,current_date())", [req.query.email, req.query.pwd, req.query.type], function (err, res) {
                    if (err)
                        resp.send(err.message);
                    else
                        resp.send("saved");
                })
            }
            else
                resp.send("no");
        }
    })
})

app.get("/login-process", (req, resp) => {
    dbcon.query("select * from users where email=?", [req.query.email], function (err, result) {
        if (err)
            resp.send(err.message);
        else {
            if (req.query.pwd == result[0].pwd)
                resp.send(result[0].type);
            else
                resp.send("no");
        }
    })
})


app.get("/change-password", (req, resp) => {
    dbcon.query("select * from users where email=?", [req.query.email], function (err, result) {
        if (err)
            resp.send(err.message);
        else {
            if (req.query.oldpwd == result[0].pwd) {
                dbcon.query("update users set pwd=? where email=?", [req.query.newpwd, req.query.email], function (err, res) {
                    if (err)
                        resp.send(err.message);
                    else
                        resp.send("ok");
                })
            }
            else {
                resp.send("not valid");
            }
        }
    })
})
/////////////////user section ends//////////////////////////////////////

////////////////////client section////////////////////////////////////////

app.get("/home", (req, resp) => {
    resp.sendFile(__dirname + "/public/index.html");
})

app.get("/profile-client", (req, resp) => {
    resp.sendFile(__dirname + "/public/profile-client.html");
    // var filePath=path.join(path.resolve(),"public","profile-client.html");
    // resp.sendFile(filePath);
})

app.post("/profile-client-saving", (req, resp) => {

    dbcon.query("select * from profileclient where email=?", [req.query.email], function (err, result) {
        if (result.length != 0) {

            req.body.picname = req.files.ppic.name;
            var uploadsFolder = path.join(path.resolve(), "public", "uploads", req.files.ppic.name);
            req.files.ppic.mv(uploadsFolder);



            var data = [req.body.uid, req.body.name, req.body.email, req.body.address, req.body.city, req.body.contact, req.body.picname]
            dbcon.query("insert into profileclient values(?,?,?,?,?,?,?)", data, function (err, result) {
                if (err)
                    resp.send(req.body + "dsgfsdgfzdgadfgd");
                else
                    resp.redirect("/profile-client.html");
            })
        }
        else {
            if (req.files == null)
                req.body.picname = "user.png";
            else {
                req.body.picname = req.files.ppic.name;
                var uploadsFolder = path.join(path.resolve(), "public", "uploads", req.files.ppic.name);
                req.files.ppic.mv(uploadsFolder);
            }
            var data = [req.body.name, req.body.address, req.body.city, req.body.contact, req.body.picname, req.body.email]

            dbcon.query("update profileclient set uname=?,address=?,city=?,contact=?,picpath=? where email=?", data, (err, result) => {
                if (err)
                    resp.send(err.message);
                else
                    resp.redirect("/profile-client.html");
            })
        }
    })


})

app.get("/chk-user-in-clienttable", function (req, resp) {
    dbcon.query("select * from profileclient where email=?", [req.query.email], function (err, result) {
        if (err)
            resp.send(err.message);
        else
            resp.send(result);
    })
})

app.get("/plan-function", (req, resp) => {
    resp.sendFile(__dirname + "/public/plan-function.html");
})



app.get("/plan-function",(req,resp)=>{
    resp.sendFile(__dirname+"/public/plan-function.html");
})

app.get("/fetch-states",(req,resp)=>{
    dbcon.query("select * from profilevendor" ,function(err,result){
        if(err)
        resp.send(err.message);
        else 
        resp.send(result);
    })
})


app.get("/fetch-cities",(req,resp)=>{
    dbcon.query("select * from profilevendor" ,function(err,result){
        if(err)
        resp.send(err.message);
        else 
        resp.send(result);
    })
})
//////////////////////client section ends/////////////////////////////////////////////////////////


//////////////////////vendor section///////////////////////////////////////////////////////////////


app.get("/profile-vendor", function (req, resp) {
    resp.sendFile(__dirname + "/public/profile-vendor.html");
})


app.post("/profile-vendor-saving", (req, resp) => {
    // req.body.picname="/uploads/"

    dbcon.query("select * from profilevendor where email=?", [req.query.email], function (err, result) {
        if (result.length != 0) {

            req.body.picname = req.files.proofpath.name;
            var uploadsFolder = path.join(path.resolve(), "public", "uploads", req.files.proofpath.name);
            req.files.proofpath.mv(uploadsFolder);

            var data = [req.body.email, req.body.name, req.body.contact, req.body.firm, req.body.estd, req.body.address, req.body.city, req.body.acard, req.body.picname, req.body.selservices, req.body.otherinfo]

            dbcon.query("insert into profilevendor values(?,?,?,?,?,?,?,?,?,?,?)", data, (err, result) => {
                if (err)
                    resp.send(err.message);
                else
                    resp.redirect("/profile-vendor.html");

            })
        }
        else {
            if (req.files == null)
                req.body.picname = "user.png";
            else {
                req.body.picname = req.files.proofpath.name;
                var uploadsFolder = path.join(path.resolve(), "public", "uploads", req.files.proofpath.name);
                req.files.proofpath.mv(uploadsFolder);
            }

            var data = [req.body.name, req.body.contact, req.body.firm, req.body.estd, req.body.address, req.body.city, req.body.acard, req.body.picname, req.body.selservices, req.body.otherinfo, req.body.email]
            dbcon.query("update profilevendor set name=?,contact=?,firm=?,estd=?,address=?,city=?,acard=?,proofpath=?,selservices=?,otherinfo=? where email=?", data, (err, result) => {
                if (err)
                    resp.send(err.message);
                else
                    resp.redirect("/profile-vendor.html");
            })
        }
    })

})

app.get("/chk-vendor-in-table", function (req, resp) {
    dbcon.query("select * from profilevendor where email=?", [req.query.email], function (err, result) {
        if (err)
            resp.send(err.message);
        else
            resp.send(result);
    })
})


//////////////////////vendor section ends////////////////////////////////////////////////////////




//////////////////////admin section//////////////////////////////////////////////////////////////
app.get("/fetch-all", function (req, resp) {
    
    dbcon.query("select * from profilevendor where city=? or selservices=?",[req.query.city,req.query.services], function (err, result) {
        if (err)
            resp.send(err.message);
        else
            resp.send(result);
    })
})

app.get("/user-del", function (req, resp) {
    var data = [req.query.email];

    dbcon.query("delete from profilevendor where email=?", data, function (err, res) {
        if (err)
            resp.send(err.message);
        else
            resp.send(res.affectedRows + "Rows Deleted");
    })
})


app.get("/admin-panel",(req,resp)=>{
    // resp.sendFile(__dirname+"/public/admin-panel.html")
    resp.sendFile(__dirname + "/public/admin-panel.html");
})

app.get("/admin-user",(req,resp)=>{
    resp.sendFile(__dirname+"/public/admin-user.html");
})



app.get("/get-city", (req, resp) => {

    dbcon.query("select city from profilevendor", (err, result) => {
        if (err)
            resp.send(err.message);
        else
            resp.send(result);
    })
})


app.get("/get-services", (req, resp) => {
    dbcon.query("select selservices from profile vendor", (err, result) => {
        if (err)
            resp.send(err.message);
        else
            resp.send(result);
    })
})

app.get("/admin-chk-user",(req,resp)=>{
    dbcon.query("select * from users",(err,result)=>{
        if(err)
        resp.send(err.message);
        else 
        resp.send(result);
    })
})


app.get("/delete-user",(req,resp)=>{
    dbcon.query("delete from users where email=?",[req.query.email],(err,res)=>{
        if(err)
        resp.send(err.message);
        else 
        {
            if(req.query.type=="vendor")
            {
                dbcon.query("delete from profilevendor where email=?",[req.query.email],(err,result)=>{
                    if(err)
                    resp.send(err.message);
                    else 
                    resp.send("Deleted..");
                })
            }
            if(req.query.type=="client")
            {
                dbcon.query("delete from profileclient where email=?",[req.query.email],(err,result)=>{
                    if(err)
                    resp.send(err.message);
                    else 
                    resp.send("Record deleted..");
                })
            }
            // resp.send("Record Not found.");
        }
    })

    
})
/////////////////////admin section ends ////////////////////////////////////////////////////////
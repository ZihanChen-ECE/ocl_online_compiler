const express = require('express');
const fs = require('fs');
const router = express.Router();
const marked = require('marked');
let titleArr = ['HelloWorld'];
let session = require('express-session');
const bodyParser = require('body-parser');
let execSync = require('child_process').execSync;

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

router.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});


var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "zihanchen",
    password: "qwertczh",
    database: "occlogin"
});

con.connect(function(err){
    if(!err) {
        console.log("Database is connected");
    } else {
        console.log("Error while connecting with database");
    }
});
    

router.get('/', (req, res) => {
    let data = {
        titleList : titleArr
    }
    res.render('index',data);
});

router.post('/save', (req, res) => {
    //获取数据
    let title = req.body.title;
    let markdown = req.body.markdown;
    let change = Number.parseInt(req.body.change);

    let html = `# ${title} # \n ${markdown}`;

    fs.exists('./docs/' + title + '.md', (exists) => {
        console.log(exists);
        if (!exists) {
            console.log(change);
            if (change === 1) {
                let oldTitle = req.body.oldTitle;
                fs.unlink('./docs/' + oldTitle + '.md', (err) => {
                    if (err) {
                        return console.error(err);
                    }
                    titleArr.forEach((item, index) => {
                        if (item === oldTitle) {
                            titleArr.splice(index, 1, title);
                        }
                    })
                    console.log('删除成功!');
                });
            } else {
                titleArr.splice(0, 0, title);
                console.log(titleArr);
            }
        }
    });

    //写入文件
    let writeStream = fs.createWriteStream('./docs/' + title + '.md');
    writeStream.write(markdown);
    writeStream.end();

    writeStream.on('finish', () => {
        console.log('写入完成');
    });

    //传递数据
    let data = {};
    data.html = marked(html);
    res.json(data);
});

//删除文件
router.post('/delete',(req,res) => {
    let title = req.body.title;
    fs.unlink('./docs/' + title + '.md', (err) => {
        if (err) {
            return console.error(err);
        }
        titleArr.forEach((item, index) => {
            if (item === title) {
                titleArr.splice(index, 1);
            }
        })
        console.log('删除成功!');
    });

    let data = {success:1}
    res.json(data);
});

//查看文件
router.post('/choice',(req,res) =>{
    let title = req.body.title;
    let text = fs.readFileSync('./docs/'+title+'.md','utf-8');
    let html = `# ${title} # \n ${text}`;

    let data = {
        text:text,
        html:marked(html)
    }

    res.json(data);
});

// execute the host
router.post('/execute-host',(req,res) => {
    let src = req.body.src;
    let args = req.body.args;
    let language = req.body.language;
    let result = "compile result:\nCompile success\n";
    let date_ob = new Date();
    let second = date_ob.getSeconds();
    let base = "file";
    let filename = base+"_"+second+".cpp";
    let temppath = "./tempfile";
    let srcfile = temppath + "/" + filename;
    let execfile = temppath + "/" + "exec_" + second + ".exe";
    let outlog = temppath + "/" + "output_" + second + ".log";
    let return_data = "";
    fs.writeFileSync(srcfile, src , function(err) {
        if(err) {
            return console.log(err);
        }
    });

    console.log("Successfully saved file "+ srcfile);

    // execute the code
    let compile_cmd = "./routes/compile.sh " + srcfile + " " + execfile + "";
    let exec_cmd = "./routes/exec.sh " + execfile + " " + outlog;
    let _ret = execSync(compile_cmd);
    _ret = execSync(exec_cmd);
    console.log("return code: "+_ret);
    
    //read the log and return to the frontend
    
    try {
        return_data = fs.readFileSync(outlog, 'utf8');
        console.log(return_data);    
    } catch(e) {
        console.log('Error:', e.stack);
    }
    try {
        fs.unlinkSync(srcfile);
        fs.unlinkSync(execfile);
        fs.unlinkSync(outlog);
        //file removed
      } catch(err) {
        console.error(err)
      }
    
    res.send(return_data);
});


router.post('/signup-form', (req, res) => {
    console.log(req.body);
	let email_addr = req.body.email_addr;
    let password = req.body.password_signup;
    let table_name = "accounts";
	if (email_addr && password) {
        //con.connect(function(err) {
        //    if (err) {
        //        console.log(err);
        //        return res.sendStatus(400);
        //    }
        //    let insert_sql = "INSERT INTO "+ table_name +" (" + email_addr + ", " + password + ", " + email_addr + ") \
        //                      SELECT 'email' FROM DUAL \
        //                      WHERE NOT EXISTS \
        //                      (SELECT * FROM " + table_name + " WHERE email='" + email_addr + "');";
        //    console.log(insert_sql);
        //});
        //con.end();

        con.query('SELECT * FROM accounts WHERE email = ?', [email_addr], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.email_addr = email_addr;
                console.log("account found!");
                res.redirect('/');
            } else {
                console.log('could insert!');
                con.query('INSERT INTO accounts (username, password, email) VALUE (?, ?, ? )', [email_addr, password, email_addr], function(error, results, fields) {
                    if (error) {
                        console.log("failed to insert");
                    }
                });
                res.redirect('/');
            }
        });

	} else {
        res.send('Please enter email_addr and Password!');
        //res.redirect('/');
		res.end();
    }
});

router.post('/login-form', (req, res) => {
    console.log(req.body);
	let email_addr = req.body.email_addr;
    let password = req.body.password;
    let table_name = "accounts";
	if (email_addr && password) {

        con.query('SELECT * FROM accounts WHERE email = ? AND password = ?', [email_addr, password], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.email_addr = email_addr;
                console.log("successfully logged in");
                res.redirect('/');
            } else {
                res.send('Incorrect email_addr and/or Password!');
                res.end();
            }
        });

	} else {
		res.send('Please enter email_addr and Password!');
		res.end();
	}
});


module.exports = router;
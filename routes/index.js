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
    user: "hc",
    password: "hcpd",
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

/* let the user save the notes with markdown. FE not completed yet... */
router.post('/save', (req, res) => {
    //fetch data
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
                    console.log('delete successully!');
                });
            } else {
                titleArr.splice(0, 0, title);
                console.log(titleArr);
            }
        }
    });

    //write in data
    let writeStream = fs.createWriteStream('./docs/' + title + '.md');
    writeStream.write(markdown);
    writeStream.end();

    writeStream.on('finish', () => {
        console.log('finish write');
    });

    //pass data to respond
    let data = {};
    data.html = marked(html);
    res.json(data);
});


/* execute the host code */
/* basic logic:
    1. The req shoud contain the filename, file content. 
       The file name would be the md5(uname + rand_16char) + cpp_name
       If not logged in, the uname will be replaced by a rand_16char string
       The content will be the code
    
    2. The res should contain the result, including the compile
       log and execution output
    
    3. The compiler is dpcpp CPU, a script is used for the jit execution
       (needs the env var)
       
    4. The execution mode will be async. this means the server could handle the 
       request aynchronizely (for better parallelization), and the host shall wait
       for the callback, or we can call it blocked async.
*/
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
    let compile_cmd = "./routes/compile.sh " + srcfile + " " + execfile + " " + outlog;
    let exec_cmd = "./routes/exec.sh " + execfile + " " + outlog;
    try{
        let _ret = execSync(compile_cmd, function (error, stdout, stderr) {
            console.log("error: ", error);
            console.log("stdout: ", stdout);
            console.log("stderr: ", stderr);
        
            console.log('BLE initialization DONE');
            puts(error, stdout, stderr);
        });
    } catch(e) {
        return_data = fs.readFileSync(outlog, 'utf8');
        fs.unlinkSync(srcfile);
        fs.unlinkSync(outlog);
        res.send(return_data)
        return
    }
    try {
        _ret = execSync(exec_cmd);
    } catch(e) {
        return_data = fs.readFileSync(outlog, 'utf8');
        fs.unlinkSync(srcfile);
        fs.unlinkSync(execfile);
        fs.unlinkSync(outlog);
        res.send(return_data)
        return
    }

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
    return
});


router.post('/signup-form', (req, res) => {
    console.log(req.body);
	let email_addr = req.body.email_addr;
    let password = req.body.password_signup;
    let table_name = "accounts";
	if (email_addr && password) {

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
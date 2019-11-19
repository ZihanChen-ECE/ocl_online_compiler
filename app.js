const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const swig = require('swig');

const index = require('./routes/index');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/public',express.static('public'));

app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');
 
app.use('/',index);

const server = app.listen(8000,() => {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`连接成功,http://${host}:${port}`);
});
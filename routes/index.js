const express = require('express');
const fs = require('fs');
const router = express.Router();

const marked = require('marked');

let titleArr = ['HelloWorld'];

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

module.exports = router;
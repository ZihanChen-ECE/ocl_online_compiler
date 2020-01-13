# SimpleMarkdown - 一款简单的Markdown编辑器 #

>源码地址： <https://github.com/zhuangZhou/SimpleMarkdown>
<br> 预览地址：<http://hawkzz.com:8000>
<br> 作者网站：<http://hawkzz.com> 

## 简介 ##

这是一款基于NodeJs开发的简单的Markdown编辑器，其UI是仿照简书的Markdown编辑器；主要功能：实时解析，实时保存，实时预览，全屏等

## 预览 ##

![image.png](http://upload-images.jianshu.io/upload_images/6194826-22d57a83c1344f17.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 技术栈 ##

+ NodeJs
+ Express
+ Swig
+ Marked
+ highJs
+ Jquery


## 实时解析、保存 ##

经常使用简书的Markdown编辑器书写博客，它的有点很明显，一是，可以实时保存，二是，可以实时解析；因为自己想做个个人网站，其中就有书写博客功能，考虑过使用已经目前很成熟的富文本编辑器，比如：ueditor编辑器；但是感觉这些编辑器都太过于庞大，于是，就有了自己写一个编辑器的念头，说干就干；研究了简书的Markdown编辑器的工作原理，它是怎么实现实时保存和解析的；然后开始了自己的构思。

想要实时保存，就需要不断的给后台传输数据，那么是以什么频率去给后台传输数据呢？以什么样的形式去保存呢，是直接保存在数据库，还是保存在一个文件里面呢？

首先，是第一个问题，既然是实时保存，所以我这里是以每输入一个字符，就开始实时保存，这样的一个缺点就是请求次数太多，如果各位有什么好建议，请拍砖；

然后，是第二个问题，我这里是通过把标题写在一个数组里（当然在实际项目中这是写在数据库里的，这里只是不想开数据库，所以使用数组），文章放在一个文件里，通过标题（或数据库标识）来查询文章；

下面为主要的NodeJs后台代码

```js
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
```

前台代码：

```js
//实时保存解析文档
function transformMd() {
    var markdown = $('#editArea').val();
    var title = $('#markTitle').val();
    var oldTitle = $('#markTitle').attr('data-old');
    var change = 0;
    if (oldTitle != undefined && title != oldTitle) {
        change = 1;
    }
    $.post('/save', {
        markdown: markdown,
        title: title,
        oldTitle: oldTitle,
        change: change
    }, function (res) {
        $('.right').html(res.html);
        $('#markTitle').attr('data-old', title);
        $('pre code').each(function (i, block) {
            hljs.highlightBlock(block);
        });
    }, 'json');
}
```

## 后记 ##

这篇博客只是介绍了核心功能，其余的感觉无需多介绍，需要了解的可以看源码，都有注释，多多谅解！！！

目前只是实现了新建文档和实时解析，实时保存以及一些基本功能，还有一些构思没有实现，比如：上传文档解析；敬请期待！！！


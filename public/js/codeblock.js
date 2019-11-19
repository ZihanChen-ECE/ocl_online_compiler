
    var editor = CodeMirror.fromTextArea(document.getElementById("codeBlock"), {
        mode: "text/groovy",    //实现groovy代码高亮
        mode: "text/x-c++src", // high lights C++
        mode: "text/x-csrc", // high-light c
        mode: "text/x-c++hdr",
        lineNumbers: true,	//显示行号
        theme: "dracula",	//设置主题
        lineWrapping: true,	//代码折叠
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        matchBrackets: true,	//括号匹配
        //readOnly: true,        //只读
    });

    var positionInfo = document.getElementById("codeBlock").getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    var off_w = width = document.getElementById('codeBlock').offsetWidth

    //editor.setSize('500px','300px');     //reset the size of the code block

    editor.setValue("");    // clear the code block
    // editor.setValue(obj.scriptCode);    // assign the code block
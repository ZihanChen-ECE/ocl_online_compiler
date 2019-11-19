hljs.initHighlightingOnLoad();

$(document).ready(function () {

    // create the a new src code
    // will rewrite the existing one
    $('#new').on('click', function () {
        refresh_editor("");
    });

    // open the file from local
    $('#open').on('click', function() {
        if (editor.getValue()) {
            var input = document.createElement('input');
            input.type = 'file';
            input.onchange = e => { 
                // getting a hold of the file reference
                var file = e.target.files[0]; 

                // setting up the reader
                var reader = new FileReader();
                reader.readAsText(file,'UTF-8');

                // here we tell the reader what to do when it's done reading...
                reader.onload = readerEvent => {
                    var content = readerEvent.target.result; // this is the content!
                    //console.log( content );
                    refresh_editor(content);
                }
            }
            input.click();
        }     
    });

    // save the file to local
    $('#save').on('click', function() {
        function data2blob(data, isBase64) {
            var chars = "";
          
            if (isBase64)
              chars = atob(data);
            else
              chars = data;
          
            var bytes = new Array(chars.length);
            for (var i = 0; i < chars.length; i++) {
              bytes[i] = chars.charCodeAt(i);
            }
          
            var blob = new Blob([new Uint8Array(bytes)]);
            return blob;
          }
        var _congtent = editor.getValue();
        // might need the pre-browser attr set to "chose the path before downloading"
        saveAs( data2blob(_content), "opencl_host.cpp" );
    });

    // execute the src (creating the POST and send to router)
    $('#exec').on('click', function() {
        var 
    
    
    }


    $(document).on('mouseenter','.mdList .deleteMd', function () {
        $(this).parents('li').css({opacity: 0.8});
    });
    $(document).on('mouseleave', '.mdList .deleteMd',function () {
        $(this).parents('li').css({opacity: 1});
    });
    $(document).on('click','.mdList .deleteMd',function(e){
        e.stopPropagation();
        var $self = $(this);
        var title = $(this).prev('.mdTitle').text();
        $.post('/delete',{title:title},function(res) {
            if(res.success == 1){
                $self.parents('li').remove();
                $('#markTitle').val('').removeAttr('data-old');
                $('#editArea').val('');
                $('.right').html('');
            }
        },'json');
    });

    //功能按键 粗体设置

    $('#boldSet').on('click', function () {
        var str = $('#editArea').val();
        $('#editArea').val(str + '## text ## \n');
        transformMd();
    });

    //斜体设置
    $('#xieSet').on('click', function () {
        var str = $('#editArea').val();
        $('#editArea').val(str + '*text* \n');
        transformMd();
    });

    //超链接设置
    $('#httpSet').on('click', function () {
        var str = $('#editArea').val();
        $('#editArea').val(str + '[](http://) \n');
        transformMd();
    });

    //图片设置
    $('#imgSet').on('click', function () {
        var str = $('#editArea').val();
        $('#editArea').val(str + '![]() \n');
        transformMd();
    });

    //表格设置
    $('#tableSet').on('click', function () {
        var str = $('#editArea').val();
        $('#editArea').val(str + '| a | b | c | \n | --- | --- | --- | \n | 1 | 2 | 3 | \n');
        transformMd();
    });

    //预览设置
    $('#previewSet').on('click', function () {
        var show = $(this).attr('data-show');
        if (show == 'false') {
            $('.codeArea .right').removeClass('none');
            $(this)
                .parents('.left')
                .css({width: '50%'});
            $(this).attr('data-show', true);
        } else {
            $('.codeArea .right').addClass('none');
            $(this)
                .parents('.left')
                .css({width: '100%'});
            $(this).attr('data-show', false);
        }
    });

    //全屏设置
    $('#fullScreen').on('click', function () {
        fullScreen();
    });

    //退出全屏
    $('#exitFullScreen').on('click', function () {
        exitFullScreen();
    });

    //监听全屏
    document.addEventListener('fullscreenchange', function () {
        if (document.fullscreenElement) {
            $('#fullScreen').css({'display': 'none'});
            $('#exitFullScreen').removeAttr('style');
        } else {
            $('#exitFullScreen').css({'display': 'none'});
            $('#fullScreen').removeAttr('style');
        }
    }, false);
    document.addEventListener('msfullscreenchange', function () {
        if (document.msFullscreenElement) {
            $('#fullScreen').css({'display': 'none'});
            $('#exitFullScreen').removeAttr('style');
        } else {
            $('#exitFullScreen').css({'display': 'none'});
            $('#fullScreen').removeAttr('style');
        }
    }, false);
    document.addEventListener('mozfullscreenchange', function () {
        if (document.mozFullScreen) {
            $('#fullScreen').css({'display': 'none'});
            $('#exitFullScreen').removeAttr('style');
        } else {
            $('#exitFullScreen').css({'display': 'none'});
            $('#fullScreen').removeAttr('style');
        }
    }, false);
    document.addEventListener('webkitfullscreenchange', function () {
        if (document.webkitIsFullScreen) {
            $('#fullScreen').css({'display': 'none'});
            $('#exitFullScreen').removeAttr('style');
        } else {
            $('#exitFullScreen').css({'display': 'none'});
            $('#fullScreen').removeAttr('style');
        }
    }, false);

    $('#editArea').on("keyup", function () {
        transformMd();
    });

    $('#markTitle').on('blur', function () {
        var title = $(this).val();
        $('.mdList li.active').find('.mdTitle').text(title);
        transformMd();
    });

    $('#saveMd').on('click', function () {
        transformMd();
    });

});

function refresh_editor(new_content) {
    if (editor.getValue()) {
        // try to clean the code area if there already been contents
        // ask the user if he would like to refresh the page
        var r = confirm("It will replace the current code. Do you like to continue?");
        if (r == true) {
            console.log("The current block is refreshed");
            editor.setValue(new_content);    // clear the code block
        } else {
            console.log("Do not refresh the src code");
        }
    }

}

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

//进入全屏
function fullScreen() {
    var obj = document.getElementById('codeArea');
    if (obj.requestFullScreen) {
        obj.requestFullScreen();
    } else if (obj.webkitRequestFullScreen) {
        obj.webkitRequestFullScreen();
    } else if (obj.msRequestFullScreen) {
        obj.msRequestFullScreen();
    } else if (obj.mozRequestFullScreen) {
        obj.mozRequestFullScreen();
    }
}

function exitFullScreen() {
    var obj = document.getElementById('codeArea');
    if (document.exitFullscree) {
        document.exitFullscree();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
}

hljs.initHighlightingOnLoad();

// a global dict that stores the script of each tab
var content_dict = {};

$(document).ready(function () {

    // open the file from local
    $('#open').on('click', function() {
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
                refresh_editor(content);
            }
        }
        input.click();
    
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
        var _content = editor.getValue();
        // might need the pre-browser attr set to "chose the path before downloading"
        saveAs( data2blob(_content), "opencl_host.cpp" );
    });

    // execute the src (creating the POST and send to router)
    $('#exec').on('click', function() {
        var _src=editor.getValue(); // source code
        var _args=$("#cmdArgsBlock").val(); // compile args
        var _language=$("#jumpmenuid option:selected").text(); // language selected
        $.post('/execute-host',
        {
            src:_src,
            args:_args,
            language:_language
        },
        function (data, status) {
            console.log(data);
            console.log(status);
            let display_data = data.replace(/\n/g, "<br />");
            // render data to the result area
            $(".resultsArea").html(display_data);
        });
    });

    $('#fpga-report').on('click', function() {
        var _src=editor.getValue();
        $.post('/fpga-report',
        {
            _src:_src
        },
        function (data, status) {
            console.log(data);
            console.log(status);
        });
    });

    $(".dropdown").on("hide.bs.dropdown", function(){
        $(".btn").html('SYCL C++ <span class="caret"></span>');
        });
        $(".dropdown").on("show.bs.dropdown", function(){
        $(".btn").html('SYCL C++ <span class="caret caret-up"></span>');
    });

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

    $('body').on('click','#new',function(event){
        var index = $('.nav-tabs li').length+1;
        var filename = 'main_'+index+'_.cpp';
        // get the prompt for input
        var fname_in = prompt("new file name", "main");
        var is_bad = 0;
        if (fname_in != null) {
            // handle the .cpp as input
            var re = /(?:\.([^.]+))?$/;
            var ext = re.exec(fname_in)[1];
            if (ext != '.cpp') {
                fname_in += '.cpp';
            }
            filename = fname_in;

            var curTabName = $('.nav-tabs > li.active').text();
            console.log("current tab name: " + curTabName);
            event.preventDefault();//stop browser to take action for clicked anchor

            var active_tab_selector = $('.nav-tabs > li.active > a').attr('href');					

            //find actived navigation and remove 'active' css
            var actived_nav = $('.nav-tabs > li.active');
            actived_nav.removeClass('active');

            //hide displaying tab content
            $(active_tab_selector).removeClass('active');
            $(active_tab_selector).addClass('hide');

            var newTabName = filename;

            $('.nav-tabs').append('<li class="active" id='+filename+'><a href="#tab'+index+'">'+filename+'<i class="close" id="close-icon"></i></a></li>');
            $('.ui-page').append('<section id="tab'+index+'" class="tab-content active">Tab '+index+' content</section>');
        
            $( "#popupLogin" ).popup( "close" );
            $('a[href="#tab'+index+'"]').click();


            alternate_tab_content(curTabName, newTabName);
        } else {
            alert("Invalid input, please provide a valid file name");
        }
    });
    
    $('.body').on('click', '#dosignup', function(event){
        let pwd = $('#password_signup').val();
        let pwd_confirm = $('#confirm_password').val();
        console.log('pwd: ' + pwd + 'pwd_confirm: '+pwd_confirm);
    })

    $('.nav-tabs').on('click','li > a',function(event){
        // get the content from curTabName and overwrite the content
        event.preventDefault();//stop browser to take action for clicked anchor

        //get displaying tab content jQuery selector
        var active_tab_selector = $('.nav-tabs > li.active > a').attr('href');					

        //find actived navigation and remove 'active' css
        var actived_nav = $('.nav-tabs > li.active');
        actived_nav.removeClass('active');
        var curTabName = actived_nav.text();

        //add 'active' css into clicked navigation
        $(this).parents('li').addClass('active');

        //hide displaying tab content
        $(active_tab_selector).removeClass('active');
        $(active_tab_selector).addClass('hide');

        //show target tab content
        var target_tab_selector = $(this).attr('href');
        $(target_tab_selector).removeClass('hide');
        $(target_tab_selector).addClass('active');
        var newTabName =  $('.nav-tabs > li.active').text();

        // update the editor content
        alternate_tab_content(curTabName, newTabName);

    });

    $(".nav-tabs").on('click', '.close', (event) =>{
        // get the content from curTabName and overwrite the content
        event.preventDefault();//stop browser to take action for clicked anchor
        // refresh the editor
        editor.setValue("");
        $('li.active').remove();
    });

    $("#login").click(function(){
        showpopup(1);
    });

    $("#signup").click(function(){
        showpopup(0);
    });

    $("#close_login").click(function(){
        hidepopup(1);
    });

    $("#close_signup").click(function(){
        hidepopup(0);
    });
    //功能按键 粗体设置
/*
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
*/
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
    } else {
        editor.setValue(new_content);
    }
}

function alternate_tab_content(curTabName, newTabName) {

    var curContent = editor.getValue();
    content_dict[curTabName] = curContent;
    var newContent = "";
    if (newTabName in content_dict) {
        newContent = content_dict[newTabName];
    }
    // render the editor
    editor.setValue(newContent);
}

function showpopup(login_flag)
{
    if (login_flag == 1) {
        $("#loginform").fadeIn();
        $("#loginform").css({"visibility":"visible","display":"block"});
    } else {
        $("#signupform").fadeIn();
        $("#signupform").css({"visibility":"visible","display":"block"});
    }
    $.get('/');
}

function hidepopup(login_flag)
{
    if (login_flag == 1) {  
        $("#loginform").fadeOut();
        $("#loginform").css({"visibility":"hidden","display":"none"});
    } else {
        $("#signupform").fadeOut();
        $("#signupform").css({"visibility":"hidden","display":"none"});
    }

}

/*
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
        // it is already async
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
*/


$(function(){

    var _G = {};
    $('.logContent').hide();
    /**
     * 读取文件
     * @param {Object} file File对象
     */
    function readFile(file,type){
        var reader = new FileReader();
        var defer = $.Deferred();
        reader.onload = function(e){
            var res;
            if(type === 'JSON'){
                try {
                    var res = JSON.parse(this.result);
                } catch (error) {
                    console.error('-- File format error --');
                    res = null;
                }
            }else{
                res = this.result;
            }
            
            defer.resolve(res);
        }
        reader.readAsText(file);
        return defer.promise();
    }

    /**
     * 选取JSON文件
     * @param {Object} file  文件对象
     */
    $('#uploadJSON').change(function(){
        var fileObj = this.files[0];
        $('.logContent').hide();
        readFile(fileObj, 'JSON').then(function(res){
            $('#jsonInfo').show();
            if(res){
                $('#rightInfo').show();
                $('#errorInfo').hide();
                $($('#rightInfo .showSpan')[0]).text(res.name);
                $($('#rightInfo .showSpan')[1]).text(res.dataNumber + '条');
                $($('#rightInfo .showSpan')[2]).text(res.employeeID);
            }else{
                $('#rightInfo').hide();
                $('#errorInfo').show();
            }
        });
        $('.uploadArea #jsonFileName span').text(fileObj.name);
    })

    /**
     * 上传Log
     */
    $('#uploadLog').change(function(){
        var fileObj = this.files[0];
        readFile(fileObj).then(function(res){
            $('#logInfo').show();
            var logData = getLogDetail(res);
            $($('#logoDetail .showSpan')[0]).text(logData.name);
            $($('#logoDetail .showSpan')[1]).text(logData.time);
            $($('#logoDetail .showSpan')[2]).text(logData.totalNum + '条');
            $($('#logoDetail .showSpan')[3]).text(logData.employeeID);
        });
        $('.uploadArea #logFileName span').text(fileObj.name);
    })

    /**
     * 上传JSON文件
     */
    $('#importJSON').click(function(){
        var formData = new FormData();
        formData.set('file', $('#uploadLog')[0].files);
        var url = '/dev/trunk/service/mapspotter/data/info/thirdparty/upload';
        ajaxService(url, formData).then(function(res){
            res = JSON.parse(res);
            $('.logContent').show();
            if(res && res.errcode !== -1){
                _G.logUrl = res.logUrl;
                ajaxService(res.logUrl).then(function(logText){
                    $('.logContent textarea').text(logText);
                });
            }else{
                $('.logContent').text('导入失败！');
            }
        });
    });

    /**
     * 导出文件
     */
    $('#exportLog').click(function(){
        exportFile(_G.logUrl);
    })

    /**
     * 反馈导出功能
     */
    $('#reportExport').click(function(){
        var url = '/dev/trunk/service/mapspotter/data/info/thirdparty/export';
        readFile($('#uploadLog')[0].files[0]).then(function(res){
            var param = getLogDetail(res);
            url += '?importdate=' + param.time + '&infoname=' + param.name + '&userid=' + param.employeeID;
            exportFile(url);
        });
    })

    $('#closeData').click(function(){
        $('.confirmContent').show();
    })

    /**
     * 取消关闭
     */
    $('#cancelClose').click(function(){
        $('.confirmContent').hide();
    })

    /**
     * 确认关闭
     */
    $('#confirmClose').click(function(){
        var url = '/dev/trunk/service/mapspotter/data/info/thirdparty/close';
        readFile($('#uploadLog')[0].files[0]).then(function(res){
            var param = getLogDetail(res);
            url += '?importdate=' + param.time + '&infoname=' + param.name + '&userid=' + param.employeeID;
            ajaxService(url);
            $('.confirmContent').hide();
        });
    })

    /**
     * 读取Log文件中的信息
     * @param {String} res log内容
     */
    function getLogDetail(res){
        var detailList = {name:'数据名称', employeeID: '导入人工号', time: '导入时间',totalNum: '总数据量'};
        var returnParam = {};
        for(var o in detailList){
            var firstIndex = res.indexOf(detailList[o]) + detailList[o].length + 1;
            var tempStr = res.substr(firstIndex, res.length);
            var lastIndex = tempStr.indexOf(';');
            returnParam[o] = res.substr(firstIndex, lastIndex).trim();
        }
        return returnParam;
    }

    /**
     * 导出文件
     * @param {*} url 
     * @param {*} param 
     */
    function exportFile(url, param){
        var formObj = $('#exportFile');
        if(param){
            var formData = new FormData(formObj[0]);
            for(var o in param){
                formData.set(o, param[o]);
            }
        }
        formObj.attr('action', url);
        formObj.submit();
    }

    /**
     * 服务接口
     * @param {*} url 
     * @param {*} param 
     */
    function ajaxService(url){
        var ajaxDefer = $.Deferred();
        $.ajax({ 
            url:url, 
            type:"get", 
            processData:false,
            contentType:false,
            success:function(res){
                $('.tips span').text('操作成功！');
                $('.tips').show();
                $('#successImg').show();
                $('#errorImg').hide();
                setTimeout(function(){
                    $('.tips').hide();
                },5000);
                ajaxDefer.resolve(res);
            },
            error:function(err){
                $('.tips span').text('操作失败！');
                $('.tips').show();
                $('#successImg').hide();
                $('#errorImg').show();
                setTimeout(function(){
                    $('.tips').hide();
                },5000);
                ajaxDefer.resolve(null);
            }
        });
        return ajaxDefer.promise();
    }
})

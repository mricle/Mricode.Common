/**
 * 事件订阅发布
 * 
 * @example
 * ```javascript
 * //订阅事件
 * $.subscribe('eventName', function (e, data) { ... });
 * //发布事件
 * $.publish('eventName',[object]);
 * ```
 */
!function ($) {
    var o = $({});
    $.subscribe = function () {
        var eventName = arguments[0];
        var arrEvent = eventName.split(',');
        for (var i = 0; i < arrEvent.length; i++) {
            arguments[0] = arrEvent[i];
            o.on.apply(o, arguments);
            //console.log(arguments[0] + " subscribed");
        }
    };
    $.unsubscribe = function () {
        var eventName = arguments[0];
        var arrEvent = eventName.split(',');
        for (var i = 0; i < arrEvent.length; i++) {
            arguments[0] = arrEvent[i];
            o.off.apply(o, arguments);
            //console.log(arguments[0] + " unsubscribed");
        }
    };
    $.publish = function () {
        o.trigger.apply(o, arguments);
        //console.log(arguments[0] + " published");
    }
}(window.jQuery)

/*
"abort",     图像的加载被中断。
"blur",      元素失去焦点。
"change",    域的内容被改变。
"click",     当用户点击某个对象时调用的事件句柄。
"dblclick",  当用户双击某个对象时调用的事件句柄。
"error",     在加载文档或图像时发生错误。
"focus",     元素获得焦点。
"keydown",   某个键盘按键被按下。
"keypress",  某个键盘按键被按下并松开。
"keyup",     某个键盘按键被松开。
"load",      一张页面或一幅图像完成加载。
"mousedown", 鼠标按钮被按下。
"mousemove", 鼠标被移动。
"mouseout",  鼠标从某元素移开。
"mouseover", 鼠标移到某元素之上。
"mouseup",   鼠标按键被松开。
"reset",     重置按钮被点击。
"resize",    窗口或框架被重新调整大小。
"select",    文本被选中。
"submit",    确认按钮被点击。
"unload"     用户退出页面。
*/
var allEvents = ["abort",
                 "blur",
                 "change",
                 "click",
                 "dblclick",
                 "error",
                 "focus",
                 "keydown",
                 "keypress",
                 "keyup",
                 "load",
                 "mousedown",
                 "mousemove",
                 "mouseout",
                 "mouseover",
                 "mouseup",
                 "reset",
                 "resize",
                 "select",
                 "submit",
                 "unload"
];
var initDataEvents = function () {
    $(allEvents).each(function (i, e) {
        $("body").on(e, "[" + e + "]", function () {
            var action = $(this).attr(e);
            var target = $(this)[0];
            if (!action)
                console.error("event is null");
            var actionarr = action.split(',');
            for (var i = 0; i < actionarr.length; i++) {
                $.publish($.trim(actionarr[i]), [$.extend($(this).data(), { target: target })]);
            }
        });
    });
}

$(function () {
    initDataEvents();
});


var utility = {
    renderFormData: function (form, data) {
        var $form;
        if (form instanceof jQuery) {
            $form = form;
        } else {
            $form = $(form);
        }
        render($form, data, '');

        function render($form, data, prefix) {
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    var value = data[prop];
                    if (typeof value === 'object') {
                        render($form, value, prefix + prop);
                    } else {
                        var $input = $form.find('[name="' + (prefix ? prefix + '.' : '') + prop + '"]');
                        if ($input.attr('type') === 'text') {
                            $input.val(value);
                        } else if ($input.attr('type')==='radio') {
                            $input.prop('checked', true);
                        } else if ($input.attr('type') === 'checkbox') {
                            $input.prop('checked', true);
                        }
                    }
                }
            }
        }
    },

    /**
     * 获取form表单数据
     * input及select包含name属性的值
     * 
     * @param {(object｜string)} form标签，可以是jQuery选择器或form对象
     * @param {object} data 其他数据
     */
    getFormData: function (form, data) {
        var $form;
        if (form instanceof jQuery) {
            $form = form;
        } else {
            $form = $(form);
        }
        var postData = $form.data('postData') || {};

        //var $inputs = $form.find('input[type!=radio][type!=checkbox][name],textarea[name],input[type=radio][name]:checked,input[type=checkbox][name]:checked');
        var $inputs = $form.find('input[type!=radio][type!=checkbox][name],textarea[name]');

        if ($inputs.length > 0) {
            $inputs.each(function (i, e) {
                var $input = $(this);
                var name = $input.attr("name");
                if (name != null) {
                    var value = utility.getInputValue($input);
                    postData = utility.constructObject(postData, name, value);
                }
            })
        }

        var checkboxNameArr = {};
        $form.find('input:checkbox[name]').each(function (i, e) {
            var name = $(e).attr('name');
            if (checkboxNameArr[name] === undefined) {
                checkboxNameArr[name] = name;
            }
        });
        for (var i in checkboxNameArr) {
            if (checkboxNameArr.hasOwnProperty(i)) {
                var name = checkboxNameArr[i];
                var $checkboxInputs = $form.find('input:checkbox[name="' + name + '"]');
                if ($checkboxInputs.length == 1) {
                    var value = utility.getInputValue($checkboxInputs);
                    postData = utility.constructObject(postData, name, value);
                }
                else if ($checkboxInputs.length > 1) {
                    var $input = $form.find('input:checkbox[name="' + name + '"]:checked');
                    if ($input.length > 0) {
                        var value = utility.getInputValue($input);
                        postData = utility.constructObject(postData, name, value);
                    }
                }
            }
        }

        var radioNameArr = {};
        $form.find('input:radio[name]').each(function (i, e) {
            var name = $(e).attr('name');
            if (radioNameArr[name] === undefined) {
                radioNameArr[name] = name;
            }
        });
        for (var i in radioNameArr) {
            if (radioNameArr.hasOwnProperty(i)) {
                var name = radioNameArr[i];
                var $radioInputs = $form.find('input:radio[name="' + name + '"]');
                if ($radioInputs.length == 1) {
                    var value = utility.getInputValue($radioInputs);
                    postData = utility.constructObject(postData, name, value);
                }
                else if ($radioInputs.length > 1) {
                    var $input = $form.find('input:radio[name="' + name + '"]:checked');
                    if ($input.length > 0) {
                        var value = utility.getInputValue($input);
                        postData = utility.constructObject(postData, name, value);
                    }
                }
            }
        }

        //select
        var $selects = $form.find('select[name]');
        $selects.each(function (i, e) {
            var $select = $(this);
            var name = $select.attr("name");
            postData = utility.constructObject(postData, name, $select.val());
        });
        if (data) {
            postData = $.extend({}, postData, data);
        }
        return postData;
    },

    /**
     * 获取标签值
     * 
     * @param {(object｜string)} input 
     */
    getInputValue: function (input) {
        var $input = input;
        if (typeof input === 'string') {
            $input = $(input);
        }
        var value = '';
        if ($input.attr('type') == 'radio' || $input.attr('type') == 'checkbox') {
            value = ($input.attr('value') == 'boolean' || $input.attr('value') == 'bool') ? $input.prop('checked') : $input.val();
        } else {
            value = $input.val();
        }
        return value;
    },

    /**
     * 构造对象
     * 
     * @param {object=} obj 构造对象属性的对象
     * @param {string} name 属性名，包含'.'创建成对象属性；包含'[]' 创建成数组
     * @param {string} value 属性值
     */
    constructObject: function (obj, name, value) {
        obj || {};
        var target = obj;
        var arr = name.split('.');
        for (var j = 0; j < arr.length; j++) {
            var n = arr[j];
            var i = null;
            var k = n.indexOf('[');
            if (k != -1) {
                i = n.substring(k + 1, n.indexOf(']'));
                n = n.substr(0, k);
            }
            //对象的最后一个属性
            if (j + 1 == arr.length) {
                if (target[n] === undefined) {
                    target[n] = value;
                } else if (target[n] instanceof Array) {
                    target[n].push(value);
                } else {
                    target[n] = [target[n], value];
                }
            } else {
                //是数组属性
                if (i != null) {
                    if (target[n] === undefined) {
                        target[n] = [];
                        target[n][i] = {};
                    } else if (target[n] instanceof Array) {
                        if (typeof target[n][i] !== 'object') {
                            target[n][i] = {};
                        }
                    }
                    target = target[n][i];
                }
                    //是非数组属性
                else {
                    if (target[n] === undefined) {
                        target[n] = {};
                    }
                    target = target[n];
                }
            }
        }
        return obj;
    }
}
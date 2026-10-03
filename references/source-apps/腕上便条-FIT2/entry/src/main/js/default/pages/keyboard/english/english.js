import router from '@system.router';
import file from '@system.file';
import vibrator from '@system.vibrator';
import textlayout from '../../../common/textlayout.js'

let daxie = 'QWERTYUIOPASDFGHJKLZXCVBNM'
let xiaoxie = 'qwertyuiopasdfghjklzxcvbnm'
let symbol = '@#$_&-+=（）/、~%“”：；？《，！。,.》'

var content = ''

export default {
    data: {
        showdata: "数据获取失败，请重试",
        rawdata: "",
        olddata: "",
        numberarray: "1234567890",
        letterarray: "QWERTYUIOPASDFGHJKLZXCVBNM",
        changebutton: "ABC",
        mainshow: true,
        exitshow: false,
    },
    onInit() {
        if (this.lastpagesletterarray != undefined) { //判断数据是否从pages/keyboard/pinyin/pinyin传递过来的
            this.letterarray = this.lastpagesletterarray
            if (this.letterarray == daxie) {
                this.changebutton = 'ABC'
                this.numberarray = "1234567890"
            } else if (this.letterarray == xiaoxie) {
                this.changebutton = 'abc'
                this.numberarray = "1234567890"
            } else if (this.letterarray == symbol){
                this.changebutton = ', . !'
                this.numberarray = "空格 回车 ￥×÷|"
            }
            this.olddata = this.lastpagesolddata
            this.rawdata = this.lastpagesrawdata
            this.getstr();
        } else {
            this.getdata();
        }
    },
    getdata() {
        var that = this;
        file.get({
            uri: 'internal://app/content.txt',
            success: function (data) {
                let length = data.length //获取content.txt的长度
                let p = Math.ceil(length / 4096) //获取需要循环读取的次数
                for (let i = 0;i < p; i++) {
                    let position = i * 4096 //计算出每次循环开始读取文件的起始位置
                    let u = i + 1 //给下面判断文件是否读取完成提供判断依据
                    file.readText({
                        uri: 'internal://app/content.txt',
                        position: position,
                        length: 4096, //读取长度，默认为4096
                        success: function (data) {
                            content = content + data.text //因为多次读取，在第一次读取内容的基础上叠加数据
                            if (u == p) { //当u=p时，写入数据到hml展示给用户
                                that.writedata();
                            }
                        },
                        fail: function (data, code) {
                            that.failfunction(data, code);
                        },
                    });
                }
            },
            fail: function (data, code) {
                that.failfunction(data, code);
            },
        })
    },
    writedata() {
        content = content.split(',') //将string形式的content转化为array形式
        let data = content[this.index] //获取用户点击的文件内容
        this.showdata = data.slice(1, -1) //给数据做截断，去除单括号
        this.rawdata = this.showdata
        this.olddata = this.showdata
        this.getstr(); //获取能展示的最大str内容
    },
    savedata() {
        var that = this;
        if (this.lastpagesletterarray != undefined) { //判断数据是否从pages/keyboard/english/english传递过来的
            file.get({
                uri: 'internal://app/content.txt',
                success: function (data) {
                    let length = data.length //获取content.txt的长度
                    let p = Math.ceil(length / 4096) //获取需要循环读取的次数
                    for (var i = 0;i < p; i++) {
                        let position = i * 4096 //计算出每次循环开始读取文件的起始位置
                        let u = i + 1 //给下面判断文件是否读取完成提供判断依据
                        file.readText({
                            uri: 'internal://app/content.txt',
                            position: position,
                            length: 4096, //读取长度，默认为4096
                            success: function (data) {
                                content = content + data.text //因为多次读取，在第一次读取内容的基础上叠加数据
                                if (u == p) { //当u=p时，写入数据到content.txt
                                    content = content.split(',') //将string形式的content转化为array形式
                                    that.writetext();
                                }
                            },
                            fail: function (data, code) {
                                that.failfunction(data, code);
                            },
                        });
                    }
                },
                fail: function (data, code) {
                    that.failfunction(data, code);
                },
            });
        } else { //如果不是直接写入数据
            this.writetext();
        }
    },
    writetext() {
        var that = this;
        var newdata = "'" + this.rawdata + "'" //给数据加上单括号
        content[this.index] = newdata //往content写入数据，此处IDE不知道content已经转化为了array形式，会报错，无需理会
        let content2string = String(content) //将array形式的content转化为string形式
        file.writeText({
            uri: 'internal://app/content.txt',
            text: content2string,
            success: function () {
                that.exit();
            },
            fail: function (data, code) {
                that.failfunction(data, code);
            },
        })
    },
    exit(){
        router.replace({
            uri: 'pages/showdata/showdata',
            params: {
                index: this.index,
                opacity: this.opacity
            }
        })
    },
    onswipe(e) {
        if (e.direction == 'right') {
            if (this.rawdata == this.olddata) {
                this.exit();
            } else {
                this.mainshow = false
                this.exitshow = true
            }
        }
    },
    exitonswipe(e) {
        if (e.direction == 'right') {
            this.exitshow = false
            this.mainshow = true
        }
    },
    onclick(data) {
        if (data == "空" || data == "格") {
            let newdata = this.rawdata.concat(" "); //往rawdata插入用户输入的数据data
            this.rawdata = newdata
            this.getstr(); //获取能展示的最大str内容
        } else if (data == "回" || data == "车") {
            let newdata = this.rawdata.concat("\n"); //往rawdata插入用户输入的数据data
            this.rawdata = newdata
            this.showdata = ""
        } else if (data != " ") {
            let newdata = this.rawdata.concat(data); //往rawdata插入用户输入的数据data
            this.rawdata = newdata
            this.getstr(); //获取能展示的最大str内容
        }
    },
    delete() {
        let length = this.rawdata.length
        this.rawdata = this.rawdata.substr(0, length - 1) //删除string的最后一个字符
        this.getstr(); //获取能展示的最大str内容
    },
    deleteall() { //删除全部
        this.rawdata = ''
        this.showdata = this.rawdata;
        vibrator.vibrate({
            mode: 'short'
        });
    },
    getstr() {
        if (this.rawdata.lastIndexOf("\n") == -1) { //查找回车是否存在
            this.showdata = textlayout.getTextByLayoutReverse(this.rawdata, 322, 1, 0, -40).str //获取能展示的最大str内容
        } else {
            let oldlength = this.rawdata.lastIndexOf("\n") //获取回车最后出现的位置
            let newdata = this.rawdata.slice(oldlength + 1, this.rawdata.length) //截取回车后的数据
            this.showdata = textlayout.getTextByLayoutReverse(newdata, 322, 1, 0, -40).str //获取能展示的最大str内容
        }
    },
    changekeyboard() { //切换键盘
        if (this.letterarray == daxie) {
            this.letterarray = xiaoxie
            this.numberarray = "1234567890"
            this.changebutton = 'abc'
        } else if (this.letterarray == xiaoxie) {
            this.letterarray = symbol
            this.numberarray = "空格 回车 ￥×÷|"
            this.changebutton = ', . !'
        } else if (this.letterarray == symbol){
            this.letterarray = daxie
            this.numberarray = "1234567890"
            this.changebutton = 'ABC'
        }
    },
    changepinyin(){ //切换拼音
        router.replace({
            uri: 'pages/keyboard/pinyin/pinyin',
            params: {
                opacity: this.opacity,
                index: this.index,
                lastpagesletterarray: this.letterarray,
                lastpagesrawdata: this.rawdata,
                lastpagesolddata: this.olddata,
            }
        })
    },
    failfunction(data, code) { //当异步函数抛出异常调用该函数跳转错误页
        router.replace({
            uri: 'pages/index/index',
            params: {
                opacity: this.opacity,
                error: true,
                data: data,
                code: code,
            },
        })
    }
}

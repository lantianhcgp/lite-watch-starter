import router from '@system.router';
import file from '@system.file';
import storage from '@system.storage';
import textlayout from '../../common/textlayout.js'

var content = ''

export default {
    data: {
        showdata: '数据获取失败，请重试',
        height: 50,
        showmian: true,
        showdelete: false,
        showdeletesuccess: false,
    },
    onInit() {
        this.getdata();
    },
    onShow() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation();
        }
    },
    onHide() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation({
                focus: false
            });
        }
    },
    getdata() {
        var that = this;
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
        let data = content[this.index] //获取数据，this.index为pages/content/content传递过来的item参数
        if (data == "''") {
            this.showdata = '无内容'
        } else {
            this.showdata = data.slice(1,-1)
        }
        this.height = textlayout.getTextHeight(this.showdata) //list-item的高度固定，通过第三方库实现高度的的计算
    },
    deleteonswipe(e) {
        if (e.direction == "right" && e.distance >= 100) {
            this.exit();
        }
    },
    exit() {
        this.onShow();
        this.showmian = true
        this.showdelete = false
    },
    onswipe(e) {
        if (e.direction == "right" && e.distance >= 100) {
            router.replace({
                uri: 'pages/content/content',
                params: {
                    from: 'showdata',
                    index: this.index,
                    opacity: this.opacity
                }
            })
        }
    },
    deletedata() {
        this.onHide();
        this.showmian = false
        this.showdelete = true
    },
    agree() { //用户同意删除该index的数据的回调函数
        var that = this;
        content.splice(this.index, 1) //删除该index
        let data = String(content) //把array形式的content转化为string形式临时储存
        let length = content.length //获取content的index数量，方便下面判断
        if (length == 0) {
            file.delete({
                uri: 'internal://app/content.txt',
                success: function () {
                    router.replace({
                        uri: 'pages/index/index',
                        params: {
                            opacity: that.opacity,
                            error: false,
                        }
                    })
                },
                fail: function (data, code) {
                    that.failfunction(data, code);
                },
            })
        } else {
            file.writeText({
                uri: 'internal://app/content.txt',
                text: data,
                success: function () {
                    router.replace({
                        uri: 'pages/content/content',
                        params: {
                            opacity: that.opacity
                        }
                    })
                },
                fail: function (data, code) {
                    that.failfunction(data, code);
                },
            })
        }
    },
    changedata() {
        var that = this;
        storage.get({
            key: 'usepinyin',
            default: 'false',
            success: function (data) {
                switch (data) {
                    case 'true':
                        router.replace({
                            uri: 'pages/keyboard/pinyin/pinyin',
                            params: {
                                index: that.index,
                                opacity: that.opacity
                            }
                        })
                        break;
                    case 'false':
                        router.replace({
                            uri: 'pages/keyboard/english/english',
                            params: {
                                index: that.index,
                                opacity: that.opacity
                            }
                        })
                        break;
                }
            },
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

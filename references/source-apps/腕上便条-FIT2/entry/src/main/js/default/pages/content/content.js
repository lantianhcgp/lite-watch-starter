import router from '@system.router';
import app from '@system.app';
import file from '@system.file';
import vibrator from '@system.vibrator';

var content = ''

export default {
    data: {
        content: [],
        showranktomuch: false,
    },
    onInit() {
        this.renderui();
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
    renderui() {
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
        let length = content.length //获取content的index数量
        for (var i = 0;i < length; i++) {
            let data = content[i] //获取index为i的数据
            let rank = i + 1 //获取当前index序号，展示给用户
            if (data == "''") {
                var obj = {
                    data: '无内容',
                    rank: rank,
                }
            } else {
                obj = {
                    data: data.slice(1, -1), //给数据做截断，去除单括号
                    rank: rank,
                }
            }
            this.content.push(obj) //往数组推送对象
        }
        this.scrollindex(); //自动滚动list
    },
    scrollindex() {
        if (this.from == 'showdata') { //如果是从pages/showdata/showdata跳转过来，这里会返回true
            if (this.index >= 3) { //如果index大于或等于3（rank大于或等于4）自动滚动list
                this.$refs.list.scrollTo({
                    index: this.index - 2
                })
            }
        }
    },
    addnewcontent() {
        var that = this;
        content.push("''") //添加一个新空值
        let content2string = String(content) //把array形式的content转化为string形式临时储存
        let contentlength = content.length //获取content的index数量，方便下面判断
        if (contentlength > 60) { //如果index大于60向用户显性发出警告
            this.showranktomuch = true
            this.onHide();
            setTimeout(function () {
                that.showranktomuch = false
                that.onShow();
            }, 1000)
        } else {
            file.writeText({
                uri: 'internal://app/content.txt',
                text: content2string,
                success: function () { //这里是重新渲染一遍数据，并向用户展示
                    let length = content.length
                    let newcontent = []
                    for (var i = 0;i < length; i++) {
                        let data = content[i]
                        let rank = i + 1
                        if (data == "''") {
                            var obj = {
                                data: '无内容',
                                rank: rank,
                            }
                        } else {
                            obj = {
                                data: data.slice(1, -1),
                                rank: rank,
                            }
                        }
                        newcontent.push(obj)
                    }
                    that.content = newcontent
                    if (length > 3) { //自动滚动list
                        that.$refs.list.scrollTo({
                            index: length - 3
                        })
                    }
                },
                fail: function (data, code) {
                    that.failfunction(data, code);
                },
            })
        }
    },
    settings() {
        router.replace({
            uri: 'pages/settings/settings',
            params: {
                opacity: this.opacity
            }
        })
    },
    onlongpress(index) { //长按调出批量删除ui，index为用户点击的item
        var that = this;
        vibrator.vibrate({
            mode: 'short',
            success: function () {
                router.replace({
                    uri: 'pages/deletecontent/deletecontent',
                    params: {
                        index: index,
                        opacity: that.opacity
                    }
                })
            },
        })
    },
    showdata(index) { //用户点击item时跳转到showdata界面展示数据
        router.replace({
            uri: 'pages/showdata/showdata',
            params: {
                index: index,
                opacity: this.opacity
            },
        })
    },
    exit() { //addnewcontent()若触发显性警告，用户可以通过点击屏幕任何位置调用该函数退出该场景
        this.showranktomuch = false
        this.onShow();
    },
    onswipe(e) {
        if (e.direction == "right" && e.distance >= 100) {
            app.terminate();
        }
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
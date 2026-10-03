import file from '@system.file';
import router from '@system.router';

var content = ''

export default {
    data: {
        content: [],
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
        var that = this;
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
                    data: data.slice(1,-1), //给数据做截断，去除单括号
                    rank: rank,
                }
            }
            that.content.push(obj) //往hml for绑定的content内push上面赋值的obj对象
        }
        //自动滚动list
        if (this.index == 3) {
            this.$refs.list.scrollTo({
                index: 1
            })
        } else if (this.index >= 4) {
            this.$refs.list.scrollTo({
                index: this.index - 2
            })
        }
    },
    onswipe(e) {
        if (e.direction == "right" && e.distance >= 100) {
            router.replace({
                uri: 'pages/content/content',
                params: {
                    opacity: this.opacity
                }
            })
        }
    },
    deletedata(index) {
        var that = this;
        content.splice(index, 1) //移除用户点击的index
        let data = String(content) //把array形式的content转化为string形式临时储存
        let length = content.length //获取content的index数量，方便下面判断
        if (length == 0) { //判断到array内index只有1个时直接删除文件
            file.delete({
                uri: 'internal://app/content.txt',
                success: function () {
                    router.replace({
                        uri: 'pages/index/index',
                        params: {
                            error: false,
                            opacity: that.opacity
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
                },
                fail: function (data, code) {
                    that.failfunction(data, code);
                },
            })
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

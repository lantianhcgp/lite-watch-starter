import router from '@system.router';
import file from '@system.file';
import app from '@system.app';
import storage from '@system.storage';

export default {
    data: {
        main_if: true,
        error_if: false,
        empty_if: false,
        error_code: '未知',
        error_data: '未知',
    },
    onInit() {
        if (this.error == true) { //如果是从错误回调跳转的页面，展示错误界面
            this.main_if = false
            this.error_if = true
            this.error_data = this.data
            this.error_code = this.code
        } else { //正常开启应用时的流程
            let that = this;
            file.access({
                uri: 'internal://app/content.txt',
                success: function () {
                    that.mainprocess1();
                },
                fail: function (data, code) {
                    if (code == 301) {
                        setTimeout(function () {
                            that.main_if = false
                            that.empty_if = true
                        }, 300)
                    } else {
                        that.failfunction(data, code);
                    }
                },
            })
        }
    },
    mainprocess1() {
        let that = this;
        storage.get({
            key: 'IsFirstOpen',
            default: '0',
            success: function (data) {
                that.mainprocess2(data);
            }
        })
    },
    mainprocess2(data) {
        let that = this;
        if (data == '0') {
            storage.set({
                key: 'IsFirstOpen',
                value: '1'
            });
            that.startpages('pages/content/content');
        } else if (data == '1') {
            storage.get({
                key: 'IsViewLock',
                default: '0',
                success: function (data) {
                    if (data == '0') {
                        that.startpages('pages/settings/settings', {
                            "want": "lock"
                        })
                    } else if (data == '1') {
                        storage.get({
                            key: 'password',
                            default: '',
                            success: function (data) {
                                if (data != '') {
                                    that.startpages('pages/unlock/unlock', {
                                        "get_password": data
                                    });
                                } else {
                                    that.startpages('pages/content/content');
                                }
                            }
                        })
                    }
                }
            })
        }
    },
    startpages(pages, params={}) {
        this.onstart = setTimeout(function () { //设置一个计时器，跳转页面
            router.replace({
                uri: pages,
                params: params
            });
        }, 300)
    },
    onswipe(e) {
        if (e.direction == 'right') {
            app.terminate();
        }
    },
    addcontent() { //写入content.txt，添加第一个index
        var that = this;
        var array = ["''"];
        var array2string = String(array)
        file.writeText({
            uri: 'internal://app/content.txt',
            text: array2string,
            success: function () {
                router.replace({
                    uri: 'pages/content/content',
                })
            },
            fail: function (data, code) {
                that.failfunction(data, code);
            },
        })
    },
    failfunction(data, code) { //错误回调
        this.main_if = false
        this.error_if = true
        this.error_data = data
        this.error_code = code
    }
}

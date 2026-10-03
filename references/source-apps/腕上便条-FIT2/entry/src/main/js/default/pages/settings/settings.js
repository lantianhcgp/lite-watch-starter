import file from '@system.file';
import router from '@system.router';
import app from '@system.app';
import storage from '@system.storage';
import vibrator from '@system.vibrator';

export default {
    data: {
        showmain: true,
        showdelete: false,
        showabout: false,
        showsponsor: false,
        show_success: false,
        showlocksetting: false,
        showlock: false,
        alwayson_checked: true,
        pinyin_checked: false,
        showopensource: false,
        isclick: true,
        islock: false,
        versionName: '',
        length: 0,
        letter_space: 0,
        lock_process: 'input',
        lock_tips: '设置密码',
        password: '',
        confirm_password: '',
    },
    onInit() {
        if (this.want == 'lock') {
            this.showmain = false
            this.showlock = true
        } else {
            this.getlength();
            this.getalwaysonstate();
            this.getpinyinstate();
            this.getlockstate();
        }
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
    getlockstate() {
        let that = this;
        storage.get({
            key: 'password',
            default: '',
            success: function (data) {
                if (data == '') {
                    that.islock = false
                } else {
                    that.islock = true
                }
            }
        })
    },
    getalwaysonstate() {
        var that = this;
        storage.get({
            key: 'alwayson',
            default: 'true',
            success: function (data) {
                switch (data) {
                    case 'true':
                        that.alwayson_checked = true
                        break;
                    case 'false':
                        that.alwayson_checked = false
                        break;
                }
            },
        })
    },
    getpinyinstate() {
        var that = this;
        storage.get({
            key: 'usepinyin',
            default: 'false',
            success: function (data) {
                switch (data) {
                    case 'true':
                        that.pinyin_checked = true
                        break;
                    case 'false':
                        that.pinyin_checked = false
                        break;
                }
            },
        })
    },
    alwaysonclick() {
        this.alwayson_checked = !this.alwayson_checked
        this.savealwaysonstate();
    },
    pinyinclick() {
        this.pinyin_checked = !this.pinyin_checked
        this.savepinyinsate();
    },
    savealwaysonstate() {
        if (this.alwayson_checked == true) {
            storage.set({
                key: 'alwayson',
                value: 'true',
            })
        } else if (this.alwayson_checked == false) {
            storage.set({
                key: 'alwayson',
                value: 'false',
            })
        }
    },
    savepinyinsate() {
        if (this.pinyin_checked == true) {
            storage.set({
                key: 'usepinyin',
                value: 'true',
            })
        } else if (this.pinyin_checked == false) {
            storage.set({
                key: 'usepinyin',
                value: 'false',
            })
        }
    },
    backup() {
        router.replace({
            uri: 'pages/backup/backup'
        })
    },
    locksetting() {
        this.showlock = false
        this.showlocksetting = true
    },
    clean() {
        this.onHide();
        this.showmain = false
        this.showdelete = true
    },
    lock() {
        this.onHide();
        this.showmain = false
        this.showlock = true
    },
    modify_lock() {
        this.onHide();
        this.showmain = false
        this.showlocksetting = true
        this.lock_process = 'modify'
        this.lock_tips = '输入原密码'
    },
    disable_lock() {
        this.onHide();
        this.showmain = false
        this.showlocksetting = true
        this.lock_process = 'delete'
        this.lock_tips = '输入原密码'
    },
    onswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            router.replace({
                uri: 'pages/content/content',
                params: {
                    swiper_index: this.swiper_index,
                    from: 'settings'
                }
            })
        }
    },
    input(data) {
        if (this.isclick == true) {
            let that = this;
            if (this.lock_process == 'input') {
                if (this.password.length < 6) {
                    if (this.password.length == 0) {
                        this.lock_tips = "*"
                    } else {
                        this.lock_tips += '*'
                    }
                    this.password += data
                    this.letter_space = 6
                    if (this.password.length == 6) {
                        this.isclick = false
                        setTimeout(function () {
                            that.lock_process = 'confirm'
                            that.lock_tips = '确认密码'
                            that.letter_space = 0
                            that.isclick = true
                        }, 300)
                    }
                }
            } else if (this.lock_process == 'confirm') {
                if (this.confirm_password.length < 6) {
                    if (this.confirm_password.length == 0) {
                        this.lock_tips = "*"
                    } else {
                        this.lock_tips += '*'
                    }
                    this.confirm_password += data
                    this.letter_space = 6
                    if (this.confirm_password.length == 6) {
                        this.isclick = false
                        if (that.confirm_password != that.password) {
                            that.lock_tips = '密码不一致'
                            that.letter_space = 0
                            vibrator.vibrate({
                                mode: 'short'
                            });
                            setTimeout(function () {
                                that.lock_tips = '设置密码'
                                that.lock_process = 'input'
                                that.password = ''
                                that.confirm_password = ''
                                that.isclick = true
                            }, 1000)
                        } else if (that.confirm_password == that.password) {
                            that.lock_tips = '设置完成'
                            that.letter_space = 0
                            storage.set({
                                key: 'password',
                                value: that.password,
                                success: function () {
                                    setTimeout(function () {
                                        that.password = ''
                                        that.confirm_password = ''
                                        that.lock_process = 'input'
                                        that.isclick = true
                                        that.lockexit();
                                        that.getlockstate();
                                        that.lock_tips = '设置密码'
                                    }, 1000)
                                },
                            });
                        }
                    }
                }
            } else if (this.lock_process == 'modify') {
                if (this.password.length < 6) {
                    if (this.password.length == 0) {
                        this.lock_tips = "*"
                    } else {
                        this.lock_tips += '*'
                    }
                    this.password += data
                    this.letter_space = 6
                    if (this.password.length == 6) {
                        this.isclick = false
                        storage.get({
                            key: 'password',
                            success: function (data) {
                                if (data == that.password) {
                                    setTimeout(function () {
                                        that.lock_process = 'input'
                                        that.lock_tips = '设置密码'
                                        that.letter_space = 0
                                        that.password = ''
                                        that.isclick = true
                                    }, 300)
                                } else {
                                    that.lock_tips = '密码错误'
                                    that.letter_space = 0
                                    that.password = ''
                                    vibrator.vibrate({
                                        mode: 'short',
                                        success: function () {
                                            setTimeout(function () {
                                                that.isclick = true
                                                that.lock_tips = '输入原密码'
                                            }, 1000)
                                        }
                                    });
                                }
                            }
                        })
                    }
                }
            } else if (this.lock_process == 'delete') {
                if (this.password.length < 6) {
                    if (this.password.length == 0) {
                        this.lock_tips = "*"
                    } else {
                        this.lock_tips += '*'
                    }
                    this.password += data
                    this.letter_space = 6
                    if (this.password.length == 6) {
                        this.isclick = false
                        storage.get({
                            key: 'password',
                            success: function (data) {
                                if (data == that.password) {
                                    storage.delete({
                                        key: 'password'
                                    });
                                    that.lock_tips = '密码已删除'
                                    that.letter_space = 0
                                    setTimeout(function () {
                                        that.lock_process = 'input'
                                        that.lock_tips = '设置密码'
                                        that.password = ''
                                        that.isclick = true
                                        that.getlockstate();
                                        that.lockexit();
                                    }, 1000)
                                } else {
                                    that.lock_tips = '输入错误'
                                    that.letter_space = 0
                                    that.password = ''
                                    vibrator.vibrate({
                                        mode: 'short',
                                        success: function () {
                                            setTimeout(function () {
                                                that.isclick = true
                                                that.lock_tips = '输入原密码'
                                            }, 1000)
                                        }
                                    });
                                }
                            }
                        })
                    }
                }
            }
        }
    },
    delete() {
        if (this.password.length != 0 && this.isclick == true) {
            this.password = this.password.substr(0, this.password.length - 1)
            this.lock_tips = this.lock_tips.substr(0, this.lock_tips.length - 1)
        }
    },
    sponsor() {
        this.onHide();
        this.showmain = false
        this.showsponsor = true
    },
    exit() {
        this.showmain = true
        this.showdelete = false
        this.onShow();
    },
    deleteonswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            this.exit();
        }
    },
    aboutswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            this.showabout = false
            this.showmain = true
            this.onShow();
        }
    },
    opensourceswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            this.showopensource = false
            this.showabout = true
        }
    },
    lockswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            this.lockexit();
        }
    },
    lockexit() {
        if (this.want == 'lock') {
            storage.set({
                key: 'IsViewLock',
                value: '1'
            });
            router.replace({
                uri: 'pages/content/content'
            })
        } else {
            this.showlock = false
            this.showlocksetting = false
            this.showmain = true
            this.onShow();
        }
    },
    locksettingswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            this.showlocksetting = false
            this.showmain = true
            this.onShow();
        }
    },
    sponsorswipe(e) {
        if (e.direction == "right" && e.distance >= 150) {
            this.showsponsor = false
            this.showmain = true
            this.onShow();
        }
    },
    agree() {
        var that = this;
        file.access({
            uri: 'internal://app/content.txt',
            success: function () {
                file.delete({
                    uri: 'internal://app/content.txt',
                    fail: function (data, code) {
                        that.failfunction(data, code);
                    },
                })
            },
            fail: function (data, code) {
                if (code != 301) {
                    that.failfunction(data, code);
                }
            },
        });
        storage.clear({
            success: function () {
                that.show_success = true
                setTimeout(function () {
                    router.replace({
                        uri: 'pages/index/index'
                    })
                }, 2000)
            },
            fail: function (data, code) {
                that.failfunction(data, code);
            },
        })
    },
    about() {
        this.onHide();
        this.showmain = false
        this.showabout = true
        this.versionName = app.getInfo().versionName
    },
    getlength() {
        var that = this;
        file.list({
            uri: 'internal://app',
            success: function (data) {
                let content = data.fileList //获取fileList 文件列表
                let length = content.length //获取content数组的index长度
                let total_length = 0
                content.forEach(function (a) {
                    total_length += a.length
                })
                total_length = total_length / 1024
                let length_data = total_length.toFixed(5)
                that.length = length_data
            },
            fail: function (data, code) {
                that.failfunction(data, code);
            },
        })
    },
    failfunction(data, code) {
        router.replace({
            uri: 'pages/index/index',
            params: {
                error: true,
                data: data,
                code: code,
            },
        })
    },
    quit() { //空函数，主要是为了让button的onclick事件生效，禁止click其他组件
    },
    opensourcethanks() {
        this.onHide();
        this.showabout = false
        this.showopensource = true
    },
}

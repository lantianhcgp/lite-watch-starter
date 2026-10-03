import router from '@system.router';
import storage from '@system.storage';
import file from '@system.file';

export default {
    data: {
        isEnableLog: false,
        isShowAppName: false,
        isAlwaysOn: true,
        isEnableFlicker: false,
        isScreenOffAlive: true,
        Flicker_Frequency_value: '正常',
        toast_if: true,
        toast_show: false,
        error_text: '',
        ani_name: '',
        toast_width: 0,
        toast_left: 0
    },
    onInit() {
        let that = this;
        this.getkeyboolean('EnableLog', '0');
        this.getkeyboolean('ShowAppName', '0');
        this.getkeyboolean('AlwaysOn', '1');
        this.getkeyboolean('ScreenOffAlive', '1');
        this.getkeyboolean('EnableFlicker', '0');
        storage.get({
            key: 'Flicker_Frequency',
            default: '正常',
            success: function (data) {
                that.Flicker_Frequency_value = data
                that.catchlog('settings: call storage.get(EnableFlicker) succeed, return data is ' + data + '.', 'DEBUG', true)
            },
            fail: function (data, code) {
                that.catchlog('settings: call storage.get(EnableFlicker) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
            }
        });
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
    Enable_Log() {
        let that = this;
        if (!this.isEnableLog == false) {
            this.catchlog('end record app log.', 'DEBUG', true);
        }
        this.isEnableLog = !this.isEnableLog
        if (this.isEnableLog == true) {
            this.catchlog('start record app log.', 'DEBUG', true);
            storage.set({
                key: 'EnableLog',
                value: '1',
                success: function () {
                    that.catchlog('settings: call storage.set(EnableLog="1") succeed.', 'DEBUG', true)
                },
                fail: function (data, code) {
                    that.catchlog('settings: call storage.set(EnableLog="1") failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
                }
            });
        } else {
            storage.set({
                key: 'EnableLog',
                value: '0',
                success: function () {
                    that.catchlog('settings: call storage.set(EnableLog="0") succeed.', 'DEBUG', true)
                },
                fail: function (data, code) {
                    that.catchlog('settings: call storage.set(EnableLog="0") failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
                }
            });
        }
    },
    ChangeKeyBoolean(key) {
        let that = this;
        this['is'+key] = !this['is'+key]
        if (this['is'+key] == true) {
            storage.set({
                key: key,
                value: '1',
                success: function () {
                    that.catchlog('settings: call storage.set(' + key + '="1") succeed.', 'DEBUG', true)
                },
                fail: function (data, code) {
                    that.catchlog('settings: call storage.set(' + key + '="1") failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
                }
            });
        } else {
            storage.set({
                key: key,
                value: '0',
                success: function () {
                    that.catchlog('settings: call storage.set(' + key + '="0") succeed.', 'DEBUG', true)
                },
                fail: function (data, code) {
                    that.catchlog('settings: call storage.set(' + key + '="0") failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
                }
            });
        }
    },
    CleanLog() {
        let that = this;
        file.delete({
            uri: 'internal://app/applog.log',
            success: function () {
                that.show_toast('日志清除完成', 260, 2000)
                that.catchlog('settings: call file.delete(applog.log) succeed.', 'DEBUG', true)
                that.catchlog('start record app log.', 'DEBUG', true);
            },
            fail: function (data, code) {
                if (code == 301) {
                    that.show_toast('日志清除完成', 260, 2000)
                    that.catchlog('settings: call file.delete(applog.log) succeed.', 'DEBUG', true)
                    that.catchlog('start record app log.', 'DEBUG', true);
                } else {
                    that.show_toast('日志清除失败', 260, 2000)
                    that.catchlog('settings: call file.delete(applog.log) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
                }
            }
        })
    },
    ReAnalysis() {
        let that = this;
        storage.delete({
            key: 'last_analysis_time',
            success: function () {
                that.catchlog('settings: call storage.delete(last_analysis_time) succeed.', 'DEBUG', true)
                router.replace({
                    uri: 'pages/app/app'
                })
            },
            fail: function (data, code) {
                that.catchlog('settings: call storage.delete(last_analysis_time) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true);
            }
        })
    },
    SortHome() {
        router.replace({
            uri: 'pages/sort/sort'
        })
    },
    Flicker_Frequency() {
        router.replace({
            uri: 'pages/flashlight_settings/flashlight_settings',
            params: {
                want: 'frequency'
            }
        })
    },
    Flicker_Color() {
        router.replace({
            uri: 'pages/flashlight_settings/flashlight_settings',
            params: {
                want: 'color'
            }
        })
    },
    touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
    show_toast(text, width, time) {
        clearTimeout(this.unshow)
        clearTimeout(this.unshow2)
        let that = this;
        this.error_text = text
        this.toast_width = width
        this.toast_left = (466 - this.toast_width) / 2
        //this.ani_name = 'appear'
        this.toast_show = true
        this.unshow = setTimeout(function () {
            //that.ani_name = 'disappear'
        }, time)
        let time2 = time + 310
        this.unshow2 = setTimeout(function () {
            that.ani_name = ''
            that.toast_show = false
            that.toast_if = false
            that.toast_if = true
        }, time2)
    },
    catchlog(logdata, type, isprint) {
        if (this.isEnableLog == true) {
            let date = new Date();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            if (minutes < 10) {
                minutes = '0' + minutes
            }
            if (minutes == 0) {
                minutes = '00'
            }
            if (seconds < 10) {
                seconds = '0' + seconds
            }
            if (seconds == 0) {
                seconds = '00'
            }
            let time_string = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + minutes + ':' + seconds
            let write_data = '[' + time_string + ' ' + type + '] ' + logdata
            file.writeText({
                uri: 'internal://app/applog.log',
                append: true,
                text: write_data + '\n',
                success: function () {
                    if (isprint == true) {
                        console.log(write_data)
                    }
                },
                fail: function (data, code) {
                    console.log('catchlog: call catchlog failed. fail reason is ' + data + ', fail code is ' + code + '.')
                }
            })
        }
    },
    getkeyboolean(key, default_value) {
        let that = this;
        storage.get({
            key: key,
            default: default_value,
            success: function (data) {
                if (data == '0') {
                    that['is'+key] = false
                } else {
                    that['is'+key] = true
                }
                that.catchlog('settings: call storage.get(' + key + ') succeed.', 'DEBUG', true)
            },
            fail: function (data, code) {
                that.catchlog('settings: call storage.get(' + key + ') failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
            }
        });
    }
}

import router from '@system.router';
import device from '@system.device';
import brightness from '@system.brightness';
import battery from '@system.battery';
import app from '@system.app';
import configuration from '@system.configuration';
import {catchlog} from '../../common/catchlog.js'
import storage from '@system.storage';

export default {
    data: {
        content: []
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
    onInit() {
        this.getdevicesinfo();
        this.getbrightness();
        this.getbatterystate();
        this.getappinfo();
        this.getconfiguration();
        this.gettime();
        this.getacedetails();
    },
    getdevicesinfo() {
        var that = this;
        device.getInfo({
            success: function (data) {
                let obj1 = {
                    title: '品牌', text: data.brand
                }
                let obj2 = {
                    title: '生产商', text: data.manufacturer
                }
                let obj3 = {
                    title: '型号', text: data.model
                }
                let obj4 = {
                    title: '代号', text: data.product
                }
                let obj5 = {
                    title: '系统语言', text: data.language
                }
                let obj6 = {
                    title: '系统地区', text: data.region
                }
                let obj7 = {
                    title: '可使用的窗口宽度', text: data.windowWidth
                }
                let obj8 = {
                    title: '可使用的窗口高度', text: data.windowHeight
                }
                let obj9 = {
                    title: '屏幕密度', text: data.screenDensity
                }
                let obj10 = {
                    title: '屏幕形状', text: data.screenShape
                }
                let obj11 = {
                    title: '系统API版本号', text: data.apiVersion
                }
                let obj12 = {
                    title: '设备类型', text: data.deviceType
                }
                that.content.push(obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8, obj9, obj10, obj11, obj12)
            }
        })
    },
    getbrightness() {
        var that = this;
        brightness.getValue({
            success: function (data) {
                let obj = {
                    title: '设备亮度', text: data.value
                }
                that.content.push(obj)
                brightness.getMode({
                    success: function (data) {
                        if (data.mode == 1) {
                            let obj = {
                                title: '自动亮度', text: '启用'
                            }
                            that.content.push(obj)
                        } else {
                            let obj = {
                                title: '自动亮度', text: '关闭'
                            }
                            that.content.push(obj)
                        }
                    }
                })
            }
        })
    },
    getbatterystate() {
        var that = this;
        battery.getStatus({
            success: function (data) {
                if (data.charging == true) {
                    let obj1 = {
                        title: '电池状态', text: '正在充电'
                    }
                    let obj2 = {
                        title: '电池电量', text: data.level * 100
                    }
                    that.content.push(obj1, obj2)
                } else {
                    let obj1 = {
                        title: '电池状态', text: '正在放电'
                    }
                    let obj2 = {
                        title: '电池电量', text: data.level * 100 + '%'
                    }
                    that.content.push(obj1, obj2)
                }
            }
        })
    },
    getappinfo() {
        var info = app.getInfo();
        let obj1 = {
            title: '应用名称', text: info.appName
        }
        let obj2 = {
            title: '应用对外版本号', text: info.versionName
        }
        let obj3 = {
            title: '应用内部版本号', text: info.versionCode
        }
        this.content.push(obj1, obj2, obj3)
    },
    getconfiguration() {
        let info = configuration.getLocale();
        if (info.dir == 'ltr') {
            let obj = {
                title: '文字布局方向', text: '从左到右'
            }
            this.content.push(obj)
        } else {
            let obj = {
                title: '文字布局方向', text: '从右到左'
            }
            this.content.push(obj)
        }
    },
    gettime() {
        let date = new Date();
        let obj = {
            title: '当前时间戳', text: date
        }
        this.content.push(obj)
    },
    getacedetails() {
        let obj = {
            title: '方舟运行时版本', text: getAceVersion()
        }
        let obj2 = {
            title: '方舟运行时编译时间', text: getAceStamp()
        }
        let obj3 = {
            title: '方舟运行时提交 ID', text: getAceCommit()
        }
        this.content.push(obj, obj2, obj3)
        catchlog('a','DEBUG',true)
        catchlog('check: all object data: ' + JSON.stringify(this.content) + ' .', 'DEBUG', true)
    },
    onswipe(e) {
        if ((e.direction == 'right') && (e.distance >= 150)) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
    restart() {
        app.terminate();
    },
    delete() {
        var that = this;
        storage.clear({
            success: function () {
                that.restart();
            },
        })
    },
}

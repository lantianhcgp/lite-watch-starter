import app from '@system.app';
import router from '@system.router';
import file from '@system.file';
import storage from '@system.storage';
import { catchlog } from '../../common/catchlog.js'
import '../../common/get_bundle_name.js'

let home_version = 7

export default {
    onInit() {
        file.get({
            uri: 'internal://app/color_array.json',
            fail: function (data, code) {
                if (code == 301) {
                    file.writeText({
                        uri: 'internal://app/color_array.json',
                        text: JSON.stringify(["#FFFFFF"])
                    })
                }
            }
        });
        storage.get({
            key: 'current_home_version',
            default: '1',
            success: function (data) {
                let current_home_version = Number(data)
                if (home_version > current_home_version) {
                    file.writeText({
                        uri: 'internal://app/home_array.json',
                        text: JSON.stringify([{"name":"应用管理","value":"app"}/*,{"name":"录音机","value":"record"}*/,{"name":"音乐分析","value":"music"},{"name":"函数绘画","value":"draw_function"}/*,{"name":"垃圾清理","value":"clean"}*/,{"name":"手电筒","value":"flashlight"},{"name":"震动器","value":"vibrator"},{"name":"重置应用列表","value":"resetlist"},{"name":"随机数生成","value":"ramdomnum"},{"name":"定位","value":"location"},{"name":"蓝牙扫描","value":"bluetooth"},{"name":"磁盘测速","value":"speed"},{"name":"传感器查看","value":"health"},{"name":"系统检测","value":"check"},{"name":"设置","value":"settings"},{"name":"关于","value":"about"}]),
                        success: function () {
                            storage.set({
                                key: 'current_home_version',
                                value: String(home_version),
                            })
                        }
                    })
                }
            }
        });
        storage.get({
            key: 'ScreenOffAlive',
            default: '1',
            success: function (data) {
                if (data == '1') {
                    app.screenOnVisible({
                        visible: true
                    })
                }
                catchlog('settings: call storage.get(ScreenOffAlive) succeed.', 'DEBUG', true)
            },
            fail: function (data, code) {
                catchlog('settings: call storage.get(ScreenOffAlive) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
            }
        });
        FeatureAbility.sendMsg({

        })
    },
    onswipe(e) {
        if ((e.direction == 'right') && (e.distance >= 150)) {
            app.terminate();
        }
    },
    onShow() {
        setTimeout(() => {
            router.replace({
                uri: 'pages/home/home'
            })
        }, 400)
    }
}

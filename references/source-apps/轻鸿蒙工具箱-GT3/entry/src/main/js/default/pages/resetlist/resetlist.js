import router from '@system.router';
import file from '@system.file';
import { catchlog } from '../../common/catchlog.js'

export default {
    data: {
        toast_show: false,
        toast_if: true,
        error_text: '',
        ani_name: '',
        toast_width: 0,
        toast_left: 0
    },
    reset() {
        let that = this;
        file.get({
            uri: 'internal://app/..\\..\\..\\chessboard_launcher',
            success: function () {
                catchlog('app: succeed call on file.get(uri=user\\chessboard_launcher).', 'DEBUG', true)
                file.rmdir({
                    uri: 'internal://app/..\\..\\..\\chessboard_launcher',
                    recursive: true,
                    success: function () {
                        that.show_toast('重置应用列表完成 即将重启', 430, 1800);
                        catchlog('app: succeed call on file.rmdir(uri=user\\chessboard_launcher).', 'DEBUG', true)
                        setTimeout(function () {
                            router.replace({
                                uri: 'pages/restart/restart'
                            })
                        }, 1000)
                    },
                    fail: function (data, code) {
                        if (code == 301) {
                            that.show_toast('设备不支持', 220, 1800);
                        } else {
                            that.show_toast('重置应用列表失败', 320, 1800);
                        }
                        catchlog('app: failed call on file.rmdir(uri=user\\chessboard_launcher), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
                    }
                })
            },
            fail: function (data, code) {
                catchlog('app: failed call on file.get(uri=user\\chessboard_launcher), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
                if (code == 301) {
                    that.show_toast('设备不支持', 220, 1800);
                } else {
                    that.show_toast('重置应用列表失败', 320, 1800);
                }
            }
        })
    },
    onswipe(e) {
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
    }
}

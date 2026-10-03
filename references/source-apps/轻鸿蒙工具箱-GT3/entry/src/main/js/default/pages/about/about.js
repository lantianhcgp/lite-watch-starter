import router from '@system.router';
import app from '@system.app';

export default {
    data: {
        versionName: '',
        toast_if: true,
        toast_show: false,
        error_text: '',
        ani_name: '',
        toast_width: 0,
        toast_left: 0
    },
    onInit() {
        this.versionName = app.getInfo().versionName
    },
    touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            });
        }
    },
    opensourcethanks() {
        router.replace({
            uri: 'pages/thanks/thanks'
        })
    },
    developer() {
        this.show_toast('再点击 ∞ 次开启开发者模式', 440, 2000);
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
}

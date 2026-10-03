import router from '@system.router';
import storage from '@system.storage';
import vibrator from '@system.vibrator';

export default {
    data: {
        interval: 500,
        duration: 10,
        start_text: '开始震动!',
        isvibrating: false,
    },
    onInit() {
        var that = this;
        storage.get({
            key: 'interval',
            default: '500',
            success: function (data) {
                that.interval = Number(data)
            }
        });
        storage.get({
            key: 'duration',
            default: '10',
            success: function (data) {
                that.duration = Number(data)
            }
        });
    },
    onswipe(e) {
        if ((e.direction == 'right') && (e.distance >= 150)) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
    increase(type) {
        switch (type) {
            case 'interval':
                this.interval = this.interval + 100
                break;
            case 'duration':
                this.duration = this.duration + 1
                break;
        }
        this.savedata();
    },
    reduce(type) {
        switch (type) {
            case 'interval':
                if (this.interval > 100) {
                    this.interval = this.interval - 100
                }
                break;
            case 'duration':
                if (this.duration >= 2) {
                    this.duration = this.duration - 1
                }
                break;
        }
        this.savedata();
    },
    savedata() {
        var that = this;
        storage.set({
            key: 'interval',
            value: String(that.interval)
        });
        storage.set({
            key: 'duration',
            value: String(that.duration)
        });
    },
    start() {
        let that = this;
        if (this.isvibrating == false) {
            this.start_text = '正在震动...'
            this.isvibrating = true
            let vibrator_function = function () {
                vibrator.vibrate({
                    mode: 'short'
                })
            }
            vibrator_function();
            that.vib = setInterval(function () {
                vibrator_function();
            }, that.interval)
            that.check = setTimeout(function () {
                that.isvibrating = false
                that.start_text = '震动完成!'
                clearInterval(that.vib)
                clearTimeout(that.check)
            }, that.duration * 1000)
        } else {
            clearInterval(that.vib)
            clearTimeout(that.check)
            that.isvibrating = false
            that.start_text = '开始震动!'
        }
    },
    onDestroy() {
        clearInterval(this.vib)
        clearTimeout(this.check)
    }
}

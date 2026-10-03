import router from '@system.router';
import storage from '@system.storage';
import app from '@system.app';

export default {
    data: {
        whenstart: ''
    },
    onShow() {
        this.getstate();
    },
    selectpages() {
        router.push({
            uri: "pages/startSettings/startSettings"
        });
    },
    timer() {
        router.push({
            uri: "pages/timerSettings/timerSettings"
        });
    },
    getstate() {
        var that = this;
        storage.get({
            key: 'whenstart',
            default: 'index',
            success: function (data) {
                switch (data) {
                    case 'index':
                        that.whenstart = '首页'
                        break;
                    case 'details':
                        that.whenstart = '详情'
                        break;
                    case 'festival':
                        that.whenstart = '节假日'
                        break;
                    case 'adjustholiday':
                        that.whenstart = '调休'
                        break;
                    case 'solarterm':
                        that.whenstart = '节气'
                        break;
                    case 'timer':
                        that.whenstart = '时间进度条'
                        break;
                }
            },
        })
    }
}

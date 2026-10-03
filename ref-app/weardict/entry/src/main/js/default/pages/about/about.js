import router from '../../common/router.js'
import app from '@system.app';

let timeInterval

export default {
    data: {
        timeString: "",
        versionName: '',
        versionCode: 0
    },
    onInit() {
        this.getTime();
        this.versionName = app.getInfo().versionName
        this.versionCode = app.getInfo().versionCode
    },
    touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.back();
        }
    },
    getTime() {
        var getTime = () => {
            var date = new Date();
            var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
            var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
            let timeString = hh + ':' + mm;
            if (this.timeString != timeString) this.timeString = timeString;
        }
        timeInterval = setInterval(getTime, 1000);
        getTime();
    },
    onDestroy() {
        clearInterval(timeInterval);
    },
    opensourcethanks() {
        router.push({
            uri: 'pages/thanks/thanks'
        })
    }
}

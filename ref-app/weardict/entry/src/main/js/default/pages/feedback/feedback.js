import router from '../../common/router.js';

let timeInterval

export default {
    data: {
        timeString: "",
    },
    onInit() {
        this.getTime();
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
    handleSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.back();
        }
    }
}

import router from '../../common/router.js'

let timeInterval

export default {
    data: {
        isShowMain: true,
        isShowQrCode: false,
        QrValue: ""
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
    watchQrCode(data) {
        this.onHide();
        this.isShowMain = false
        this.isShowQrCode = true
        this.QrValue = data
    },
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.back();
        }
    },
    qrSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.isShowQrCode = false
            this.isShowMain = true
            this.onShow();
        }
    },
    onShow() {
        if (this.$refs.swiper.rotation) {
            this.$refs.swiper.rotation();
        }
    },
    onHide() {
        if (this.$refs.swiper.rotation) {
            this.$refs.swiper.rotation({
                focus: false
            });
        }
    },
    onDestroy() {
        clearInterval(timeInterval);
    }
}

import router from '../../common/router.js'

export default {
    data: {
        isShowMain: true,
        isShowQrCode: false,
        QrValue: ""
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
    }
}

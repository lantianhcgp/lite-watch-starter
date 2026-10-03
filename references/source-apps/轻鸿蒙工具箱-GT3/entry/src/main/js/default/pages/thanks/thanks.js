import router from '@system.router'

export default {
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/about/about'
            });
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

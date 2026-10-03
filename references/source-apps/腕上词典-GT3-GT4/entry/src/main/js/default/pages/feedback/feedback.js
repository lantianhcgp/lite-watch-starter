import router from '../../common/router.js';

export default {
    handleSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.back();
        }
    }
}

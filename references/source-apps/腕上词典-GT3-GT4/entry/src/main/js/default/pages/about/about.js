import router from '../../common/router.js'
import app from '@system.app';

export default {
    data: {
        versionName: '',
        versionCode: 0
    },
    onInit() {
        this.versionName = app.getInfo().versionName
        this.versionCode = app.getInfo().versionCode
    },
    touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.back();
        }
    },
    opensourcethanks() {
        router.push({
            uri: 'pages/thanks/thanks'
        })
    }
}

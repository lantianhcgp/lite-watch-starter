import router from '@system.router';
import app from '@system.app';

export default {
    settings() {
        router.push({
            uri: 'pages/settings/settings',
        })
    },
    timer() {
        router.push({
            uri: 'pages/timer/timer'
        })
    },
    about() {
        router.push({
            uri: "pages/about/about"
        })
    }
}

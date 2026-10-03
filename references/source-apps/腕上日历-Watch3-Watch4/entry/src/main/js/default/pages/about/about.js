import app from '@system.app';

export default {
    data: {
        versionName: '',
        versionCode: 0
    },
    onInit() {
        var info = app.getInfo();
        this.versionName = info.versionName
        this.versionCode = info.versionCode
    }
}

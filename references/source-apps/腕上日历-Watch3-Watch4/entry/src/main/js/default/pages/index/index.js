import storage from '@system.storage';
import router from '@system.router';
import app from '@system.app';
import prompt from '@system.prompt';


export default {
    data: {
        error_if: false,
        main_if: true,
        private_if: false,
        onstart: null
    },
    onInit() {
        const date = new Date();
        let year = date.getFullYear();
        var that = this;
        if (year > 2037 || year < 1970) {
            this.main_if = false
            this.error_if = true
        } else {
            this.onstart = setTimeout(function () {
                storage.get({
                    key: 'already_view_privacy',
                    default: '0',
                    success: function (data) {
                        var already_view_privacy = +data;
                        switch (already_view_privacy) {
                            case 0:
                                that.main_if = false
                                that.private_if = true
                                break;
                            default:
                                router.replace({
                                    uri: 'pages/index1/index1'
                                })
                                break;
                        }
                    }
                });
                clearTimeout(that.onstart)
            }, 300)
        }
    },
    exit() {
        app.terminate();
    },
    agree() {
        storage.set({
            key: 'already_view_privacy',
            value: '1',
        });
        router.replace({
            uri: 'pages/index1/index1'
        });
    },
}

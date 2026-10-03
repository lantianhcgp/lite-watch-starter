import app from '@system.app';
import brightness from '@system.brightness';
import storage from '@system.storage';

export default {
    onCreate() {
        storage.get({
            key: 'alwayson',
            default: 'true',
            success: function (data) {
                switch (data) {
                    case 'true':
                        brightness.setKeepScreenOn({
                            keepScreenOn: true,
                        });
                }
            },
        });
        app.screenOnVisible({
            value: true,
        });
    },
    onDestroy() {
        storage.get({
            key: 'alwayson',
            default: 'true',
            success: function (data) {
                switch (data) {
                    case 'true':
                        brightness.setKeepScreenOn({
                            keepScreenOn: false,
                        });
                }
            },
        });
        app.screenOnVisible({
            value: false,
        });
    }
}
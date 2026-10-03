import brightness from '@system.brightness';
import storage from '@system.storage';

function KeepLight(type) {
    switch (type){
        case true:
            brightness.setKeepScreenOn({
                keepScreenOn: true
            });
        break;
        case false:
            storage.get({
                key: 'AlwaysOn',
                default: '1',
                success: function (data) {
                    if (data == "0") {
                        brightness.setKeepScreenOn({
                            keepScreenOn: false
                        })
                    }
                }
            })
        break;
    }
}

export { KeepLight }
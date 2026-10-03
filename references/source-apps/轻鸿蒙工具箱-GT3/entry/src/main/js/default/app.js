import brightness from '@system.brightness';
import storage from '@system.storage';
import { catchlog } from '../default/common/catchlog.js'

export default {
    onCreate: function () {
        storage.get({
            key: 'AlwaysOn',
            default: '1',
            success: function (data) {
                catchlog('main: call storage.get(AlwaysOn) succeed.', 'DEBUG', true)
                if (data == '1') {
                    brightness.setKeepScreenOn({
                        keepScreenOn: true,
                        success: function () {
                            catchlog('main: call brightness.setKeepScreenOn(keepScreenOn=true) succeed.', 'DEBUG', true)
                        },
                        fail: function (data, code) {
                            catchlog('main: call brightness.setKeepScreenOn(keepScreenOn=true) failed, fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
                        }
                    })
                }
            },
            fail: function (data, code) {
                catchlog('main: call storage.get(AlwaysOn) failed, fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        })
    },
    onDestroy: function () {
        brightness.setKeepScreenOn({
            keepScreenOn: false,
            success: function () {
                catchlog('main: call brightness.setKeepScreenOn(keepScreenOn=false) succeed.', 'DEBUG', true)
            },
            fail: function (data, code) {
                catchlog('main: call brightness.setKeepScreenOn(keepScreenOn=false) failed, fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        })
    },
}

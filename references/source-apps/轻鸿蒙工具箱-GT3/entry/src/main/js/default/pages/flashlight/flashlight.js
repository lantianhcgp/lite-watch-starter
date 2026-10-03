import router from '@system.router';
import brightness from '@system.brightness';
import storage from '@system.storage';
import file from '@system.file';
import { catchlog } from '../../common/catchlog.js';

export default {
    data: {
        get_time: 0,
        flicker: 0,
        default_value: 0,
        flicker_count: 0,
        flashlight_state: true,
        background_color: '#FFFFFF',
        current_time: '00:00',
        isEnableFlicker: false,
        Flicker_Frequency_value: '正常',
        save_array: []
    },
    gettime() {
        let that = this;
        let time = function () {
            const date = new Date();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            if (minutes < 10) { //如果时间小于10自动补0
                minutes = '0' + minutes
            }
            that.current_time = hours + ':' + minutes
        }
        time();
        this.get_time = setInterval(function () {
            time();
        }, 5000)
    },
    getflickerconfig() {
        let that = this;
        storage.get({
            key: 'EnableFlicker',
            default: '0',
            success: function (data) {
                if (data == '0') {
                    that.isEnableFlicker = false
                } else {
                    that.isEnableFlicker = true
                }
                catchlog('settings: call storage.get(EnableFlicker) succeed.', 'DEBUG', true)
                storage.get({
                    key: 'Flicker_Frequency',
                    default: '正常',
                    success: function (data) {
                        that.Flicker_Frequency_value = data
                        catchlog('settings: call storage.get(EnableFlicker) succeed, return data is ' + data + '.', 'DEBUG', true)
                        file.get({
                            uri: 'internal://app/color_array.json',
                            success: function (data) {
                                let length = data.length
                                let read_count = Math.ceil(length / 4096)
                                let temp = ''
                                for (let i = 0;i < read_count; i++) {
                                    file.readText({
                                        uri: 'internal://app/color_array.json',
                                        position: i * 4096,
                                        length: 4096,
                                        success: function (data) {
                                            temp = temp + data.text
                                            if (i + 1 == read_count) {
                                                that.save_array = JSON.parse(temp)
                                                temp = ''
                                                if (that.isEnableFlicker) {
                                                    that.showflicker();
                                                } else {
                                                    that.background_color = that.save_array[0]
                                                }
                                            }
                                        }
                                    })
                                }
                            }
                        });
                    },
                    fail: function (data, code) {
                        catchlog('settings: call storage.get(EnableFlicker) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
                    }
                });
            },
            fail: function (data, code) {
                catchlog('settings: call storage.get(EnableFlicker) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
            }
        });
    },
    showflicker() {
        let that = this;
        var duration
        if (this.Flicker_Frequency_value == '很快') {
            duration = 150
        } else if (this.Flicker_Frequency_value == '快') {
            duration = 300
        } else if (this.Flicker_Frequency_value == '正常') {
            duration = 400
        } else if (this.Flicker_Frequency_value == '慢') {
            duration = 500
        } else if (this.Flicker_Frequency_value == '很慢') {
            duration = 600
        }
        this.flicker = setInterval(function () {
            if (that.flicker_count == that.save_array.length) {
                that.flicker_count = 0
                that.background_color = that.save_array[that.flicker_count]
                that.flicker_count++
            } else {
                that.background_color = that.save_array[that.flicker_count]
                that.flicker_count++
            }
        }, duration)
    },
    onShow() {
        let that = this;
        this.gettime();
        this.getflickerconfig();
        brightness.getValue({
            success: function (data) {
                that.default_value = data.value
                catchlog('flashlight: succeed to call brightness.getValue(), return data is ' + data.value + '.', 'DEBUG', true)
            },
            fail: function (data, code) {
                catchlog('flashlight: failed to call brightness.getValue(), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        });
        brightness.setValue({
            value: 255,
            success: function () {
                catchlog('flashlight: succeed to call brightness.setValue(value=255).', 'DEBUG', true)
            },
            fail: function (data, code) {
                catchlog('flashlight: failed to call brightness.setValue(value=255), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        });
    },
    onHide() {
        let that = this;
        brightness.setValue({
            value: that.default_value,
            success: function () {
                catchlog('flashlight: succeed to call brightness.setValue(value=' + that.default_value + ').', 'DEBUG', true)
            },
            fail: function (data, code) {
                catchlog('flashlight: failed to call brightness.setValue(value=' + that.default_value + '), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        });
        clearInterval(this.flicker)
        clearInterval(this.get_time)
    },
    switch_state() {
        this.flashlight_state = !this.flashlight_state
    },
    onswipe(e) {
        if (e.distance >= 150 && e.direction == 'right') {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    }
}

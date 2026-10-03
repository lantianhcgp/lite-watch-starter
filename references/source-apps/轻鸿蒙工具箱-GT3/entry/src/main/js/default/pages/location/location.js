import router from '@system.router';
import geolocation from '@system.geolocation';
import { catchlog } from '../../common/catchlog.js'

// @ts-ignore
Date.prototype.toCustomString = function () {
    return this.getFullYear() + '/' + (this.getMonth() + 1) + '/' + this.getDay() + ' ' + this.getHours() + ':' + this.getMinutes() + ':' + this.getSeconds()
}

export default {
    data: {
        longitude: '未知',
        latitude: '未知',
        accuracy: '未知',
        locate_time: '未知',
        sys_time: '未知'
    },
    onInit() {
        this.getLocationType();
        this.getSupportedCoordTypes();
    },
    get() {
        let that = this;
        this.longitude = '正在获取...'
        this.latitude = '正在获取...'
        this.accuracy = '正在获取...'
        this.locate_time = '正在获取...'
        this.sys_time = '正在获取...'
        geolocation.getLocation({
            timeout: 60000,
            success: function (data) {
                catchlog('location: succeed get locaction.', 'DEBUG', true)
                that.longitude = data.longitude
                that.latitude = data.latitude
                that.accuracy = data.accuracy
                that.locate_time = new Date(data.time).toCustomString();
                that.sys_time = new Date().toCustomString();
                catchlog('location: longitude: ' + data.longitude + '.', 'DEBUG', false)
                catchlog('location: latitude: ' + data.latitude + '.', 'DEBUG', false)
                catchlog('location: accuracy: ' + data.accuracy + '.', 'DEBUG', false)
                catchlog('location: time: ' + data.time + '.', 'DEBUG', false)
            },
            fail: function (data, code) {
                catchlog('location: fail to get location. fail code:' + code + ', fail reason:' + data, 'ERROR', true);
                if (code == 800) {
                    that.longitude = '定位超时'
                    that.latitude = '定位超时'
                    that.accuracy = '定位超时'
                    that.locate_time = '定位超时'
                    that.sys_time = '定位超时'
                } else if (code == 601) {
                    that.longitude = '权限未授予'
                    that.latitude = '权限未授予'
                    that.accuracy = '权限未授予'
                    that.locate_time = '权限未授予'
                    that.sys_time = '权限未授予'
                } else if (code == 801) {
                    that.longitude = '定位未开启'
                    that.latitude = '定位未开启'
                    that.accuracy = '定位未开启'
                    that.locate_time = '定位未开启'
                    that.sys_time = '定位未开启'
                }
            },
        });
    },
    sub() {
        let that = this;
        this.longitude = '正在获取...'
        this.latitude = '正在获取...'
        this.accuracy = '正在获取...'
        this.locate_time = '正在获取...'
        this.sys_time = '正在获取...'
        geolocation.subscribe({
            success: function (data) {
                catchlog('location: succeed get locaction.', 'DEBUG', true)
                that.longitude = data.longitude
                that.latitude = data.latitude
                that.accuracy = data.accuracy
                that.locate_time = new Date(data.time).toCustomString();
                that.sys_time = new Date().toCustomString();
                catchlog('location: longitude: ' + data.longitude + '.', 'DEBUG', false)
                catchlog('location: latitude: ' + data.latitude + '.', 'DEBUG', false)
                catchlog('location: accuracy: ' + data.accuracy + '.', 'DEBUG', false)
                catchlog('location: time: ' + data.time + '.', 'DEBUG', false)
            },
            fail: function (data, code) {
                catchlog('location: fail to get location. fail code:' + code + ', fail reason:' + data, 'ERROR', true);
                if (code == 601) {
                    that.longitude = '权限未授予'
                    that.latitude = '权限未授予'
                    that.accuracy = '权限未授予'
                    that.locate_time = '权限未授予'
                    that.sys_time = '权限未授予'
                } else if (code == 801) {
                    that.longitude = '定位未开启'
                    that.latitude = '定位未开启'
                    that.accuracy = '定位未开启'
                    that.locate_time = '定位未开启'
                    that.sys_time = '定位未开启'
                }
            },
        });
    },
    getLocationType() {
        geolocation.getLocationType({
            success: function (data) {
                catchlog('location: success get location type:' + JSON.stringify(data.types), 'DEBUG', true);
            },
            fail: function (data, code) {
                catchlog('location: fail to get location type. fail code:' + code + ', fail reason:' + data, 'ERROR', true);
            }
        });
    },
    getSupportedCoordTypes() {
        catchlog('locaction: success get locaction coord type: ' + JSON.stringify(geolocation.getSupportedCoordTypes()), 'DEBUG', true)
    },
    onDestroy() {
        geolocation.unsubscribe();
    },
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
}

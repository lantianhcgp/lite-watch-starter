import router from '@system.router';
import sensor from '@system.sensor';
import { catchlog } from '../../common/catchlog.js'

export default {
    data: {
        steps: '获取中',
        pressure: '获取中',
        heartRate: '获取中',
        onbody: '获取中',
        axisX: '获取中',
        axisY: '获取中',
        axisZ: '获取中'
    },
    onInit() {
        this.subscribeStepCounter();
        this.subscribeBarometer();
        this.subscribeHeartRate();
        this.subscribeOnBodyState();
        this.subscribeAccelerometer();
    },
    subscribeStepCounter() {
        let that = this;
        sensor.subscribeStepCounter({
            success: function (data) {
                that.steps = data.steps
                catchlog('health: successfully get step value:' + data.steps, 'DEBUG', true);
            },
            fail: function (data, code) {
                catchlog('health: subscribeStepCounter failed. fail code: ' + code + ', fail reason: ' + data, 'ERROR', true);
            },
        });
    },
    subscribeBarometer() {
        let that = this;
        sensor.subscribeBarometer({
            success: function (data) {
                that.pressure = data.pressure
                catchlog('health: successfully get pressure value:' + data.pressure, 'DEBUG', true);
            },
            fail: function (data, code) {
                catchlog('health: subscribeBarometer failed. fail code: ' + code + ', fail reason: ' + data, 'ERROR', true);
            },
        });
    },
    subscribeHeartRate() {
        let that = this;
        sensor.subscribeHeartRate({
            success: function (data) {
                that.heartRate = data.heartRate
                catchlog('health: successfully get heartRate value:' + data.heartRate, 'DEBUG', true);
            },
            fail: function (data, code) {
                catchlog('health: subscribeHeartRate failed. fail code: ' + code + ', fail reason: ' + data, 'ERROR', true);
            },
        });
    },
    subscribeOnBodyState() {
        let that = this;
        sensor.subscribeOnBodyState({
            success: function (data) {
                if (data.value == true) {
                    that.onbody = '已佩戴'
                } else {
                    that.onbody = '未佩戴'
                }
                catchlog('health: successfully get onbody value:' + data.value, 'DEBUG', true);
            },
            fail: function (data, code) {
                catchlog('health: subscribeOnBodyState failed. fail code: ' + code + ', fail reason: ' + data, 'ERROR', true);
            },
        });
    },
    subscribeAccelerometer() {
        let that = this;
        sensor.subscribeAccelerometer({
            interval: 'normal',
            success: function (data) {
                that.axisX = data.x
                that.axisY = data.y
                that.axisZ = data.z
                catchlog('health: successfully get accelerometer value:' + data.x + ',' + data.y + ',' + data.z, 'DEBUG', true);
            },
            fail: function (data, code) {
                catchlog('health: subscribeAccelerometer failed. fail code: ' + code + ', fail reason: ' + data, 'ERROR', true);
            },
        });
    },
    onDestroy() {
        sensor.unsubscribeBarometer();
        sensor.unsubscribeHeartRate();
        sensor.unsubscribeOnBodyState();
        sensor.unsubscribeStepCounter();
        sensor.unsubscribeAccelerometer();
    },
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
}

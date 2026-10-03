import router from '@system.router';
import bluetooth from '@system.bluetooth';
import file from '@system.file';
import storage from '@system.storage';

let isEnableLog = false
storage.get({
    key: 'EnableLog',
    default: '0',
    success: function (data) {
        if (data == '0') {
            isEnableLog = false
        } else {
            isEnableLog = true
        }
    }
})


export default {
    data: {
        show_scan: true,
        scan_state: '扫描尚未开始...',
        content: [],
        index: 0,
    },
    onShow() {
        let that = this;
        this.rotation();
        this.bluetooth();
    },
    bluetooth() {
        let that = this;
        bluetooth.startBLEScan({
            interval: 0,
            success: function () {
                console.log('start ble scan succeed.')
                that.scan_state = '持续扫描中...'
                that.show_scan = false
            },
            fail: function (data, code) {
                console.log('start ble scan error. error reason is ' + data + ', error code is ' + code + '.')
                that.scan_state = '扫描失败...'
            },
            complete: function () {
                console.log('start ble scan completed.')
            }
        });
        bluetooth.subscribeBLEFound({
            success: (data) => {
                console.log('subscribe ble found succeed.')
                let content_length = this.content.length
                if (content_length === 0) {
                    this.content.push(data)
                } else {
                    for (let i = 0;i < content_length; i++) {
                        if (this.content[i].addr == data.addr) {
                            this.content[i].rssi = data.rssi
                            this.content[i].data = data.data
                            break;
                        }
                        if (i == content_length - 1) {
                            this.content.push(data)
                        }
                    }
                }
            },
            fail: function (data, code) {
                console.log('subscribe ble found error. error reason is ' + data + ', error code is ' + code + '.')
                that.scan_state = '扫描失败...'
            }
        });
    },
    scan() {
        this.show_scan = false
        this.scan_state = '持续扫描中...'
        this.bluetooth();
    },
    rotation() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation();
        }
    },
    onHide() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation({
                focus: false
            });
        }
    },
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            });
        }
    },
    onDestroy() {
        bluetooth.stopBLEScan();
        bluetooth.unsubscribeBLEFound();
        if (isEnableLog) {
            file.writeText({
                uri: 'internal://app/last_bluetooth_devices_list.json',
                text: JSON.stringify(this.content)
            });
        }
    }
}

import router from '@system.router';
import file from '@system.file';
import storage from '@system.storage';
import { catchlog } from '../../common/catchlog.js'

let buffer = null;
let time = 1
let time_temp = []
let src = 'internal://app/temp'
let dst = 'internal://app/temp1'

export default {
    data: {
        state: '开始测试',
        percent: 0,
        write: '未知',
        read: '未知',
        copy: '未知',
        move: '未知',
        operation: '',
    },
    touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
    start() {
        if (this.state != '正在测试...') {
            let that = this;
            buffer = new Uint8Array(61440)
            this.state = '正在测试...'
            catchlog('speedtest: start speed test now.', 'DEBUG', true)
            that.percent = 2.5
            that.operation = '正在进行写入测试 1/10'
            setTimeout(function () {
                that.writefile(2);
            }, 10)
        }
    },
    writefile(count) {
        let that = this;
        let start_time = new Date().valueOf();
        file.writeArrayBuffer({
            uri: src,
            buffer: buffer,
            success: function () {
                let end_time = new Date().valueOf();
                let time = end_time - start_time
                catchlog('speedtest: call file.writeArrayBuffer succeed, count is ' + count + '.', 'DEBUG', true)
                time_temp.push(time)
                that.percent += 2.5
                that.operation = '正在进行写入测试 ' + count + '/10'
                if (count == 10) {
                    setTimeout(function () {
                        let time_data = []
                        time_temp.forEach(function (ele) {
                            let speed = 61440 / (ele / 1000)
                            time_data.push(speed)
                        })
                        time_temp = []
                        let temp2 = 0
                        time_data.forEach(function (ele) {
                            temp2 += ele
                        })
                        temp2 = temp2 / 10
                        if (temp2 > 1048576) {
                            temp2 = (temp2 / 1048576).toFixed(1) + 'MB/s'
                        } else if (temp2 < 1048576) {
                            temp2 = (temp2 / 1024).toFixed(1) + 'KB/s'
                        }
                        that.write = temp2
                        that.percent += 2.5
                        that.operation = '正在进行读取测试 1/10'
                        buffer = null;
                        setTimeout(function () {
                            that.readfile(2);
                        }, 20)
                    }, 20)
                } else {
                    file.delete({
                        uri: 'internal://app/temp',
                        success: function () {
                            catchlog('speedtest: call file.delete succeed.', 'DEBUG', true)
                            setTimeout(function () {
                                that.writefile(count + 1);
                            }, 20)
                        },
                        fail: function (data, code) {
                            that.throwerror(data, code, 'delete');
                        }
                    })
                }
            },
            fail: function (data, code) {
                that.throwerror(data, code, 'read');
            }
        })
    },
    readfile(count) {
        let that = this;
        let start_time = new Date().valueOf();
        file.readArrayBuffer({
            uri: src,
            success: function () {
                let end_time = new Date().valueOf();
                let time = end_time - start_time
                catchlog('speedtest: call file.readArrayBuffer succeed, count is ' + count + '.', 'DEBUG', true)
                time_temp.push(time)
                that.percent += 2.5
                that.operation = '正在进行读取测试 ' + count + '/10'
                if (count == 10) {
                    setTimeout(function () {
                        let time_data = []
                        time_temp.forEach(function (ele) {
                            let speed = 61440 / (ele / 1000)
                            time_data.push(speed)
                        })
                        time_temp = []
                        let temp2 = 0
                        time_data.forEach(function (ele) {
                            temp2 += ele
                        })
                        temp2 = temp2 / 10
                        if (temp2 > 1048576) {
                            temp2 = (temp2 / 1048576).toFixed(1) + 'MB/s'
                        } else if (temp2 < 1048576) {
                            temp2 = (temp2 / 1024).toFixed(1) + 'KB/s'
                        }
                        that.read = temp2
                        that.percent += 2.5
                        that.operation = '正在进行复制测试 1/10'
                        setTimeout(function () {
                            that.copyfile(2);
                        }, 20)
                    }, 20)
                } else {
                    setTimeout(function () {
                        that.readfile(count + 1);
                    }, 20)
                }
            },
            fail: function (data, code) {
                that.throwerror(data, code, 'read');
            }
        })
    },
    copyfile(count) {
        let that = this;
        let start_time = new Date().valueOf();
        file.copy({
            srcUri: src,
            dstUri: dst,
            success: function () {
                let end_time = new Date().valueOf();
                let time = end_time - start_time
                catchlog('speedtest: call file.copy succeed, count is ' + count + '.', 'DEBUG', true)
                time_temp.push(time)
                that.percent += 2.5
                that.operation = '正在进行复制测试 ' + count + '/10'
                if (count == 10) {
                    setTimeout(function () {
                        let time_data = []
                        time_temp.forEach(function (ele) {
                            let speed = 61440 / (ele / 1000)
                            time_data.push(speed)
                        })
                        time_temp = []
                        let temp2 = 0
                        time_data.forEach(function (ele) {
                            temp2 += ele
                        })
                        temp2 = temp2 / 10
                        if (temp2 > 1048576) {
                            temp2 = (temp2 / 1048576).toFixed(1) + 'MB/s'
                        } else if (temp2 < 1048576) {
                            temp2 = (temp2 / 1024).toFixed(1) + 'KB/s'
                        }
                        that.copy = temp2
                        that.percent += 2.5
                        that.operation = '正在进行移动测试 1/10'
                        setTimeout(function () {
                            that.movefile(2);
                        }, 20)
                    }, 20)
                } else {
                    setTimeout(function () {
                        that.copyfile(count + 1);
                    }, 20)
                }
            },
            fail: function (data, code) {
                that.throwerror(data, code, 'copy');
            }
        })
    },
    movefile(count, uri='internal://app/temp') {
        let that = this;
        if (uri == src) {
            var uri2 = dst
        } else if (uri == dst) {
            uri2 = src
        }
        let start_time = new Date().valueOf();
        file.move({
            srcUri: uri,
            dstUri: uri2,
            success: function () {
                let end_time = new Date().valueOf();
                let time = end_time - start_time
                catchlog('speedtest: call file.move succeed, count is ' + count + '.', 'DEBUG', true)
                time_temp.push(time)
                that.percent += 2.5
                that.operation = '正在进行移动测试 ' + count + '/10'
                if (count == 10) {
                    setTimeout(function () {
                        let time_data = []
                        time_temp.forEach(function (ele) {
                            let speed = 61440 / (ele / 1000)
                            time_data.push(speed)
                        })
                        time_temp = []
                        let temp2 = 0
                        time_data.forEach(function (ele) {
                            temp2 += ele
                        })
                        temp2 = temp2 / 10
                        if (temp2 > 1048576) {
                            temp2 = (temp2 / 1048576).toFixed(1) + 'MB/s'
                        } else if (temp2 < 1048576) {
                            temp2 = (temp2 / 1024).toFixed(1) + 'KB/s'
                        }
                        that.move = temp2
                        that.operation = ''
                        that.percent = 100
                        catchlog('speedtest: end speed test.', 'DEBUG', true)
                        catchlog('speedtest: write speed is ' + that.write + ', read speed is ' + that.read + ', copy speed is ' + that.copy + ', move speed is ' + that.move + '.', 'DEBUG', true)
                        that.state = '测试完成'
                        file.delete({
                            uri: 'internal://app/temp1',
                            success: function () {
                                catchlog('speedtest: call file.delete succeed.', 'DEBUG', true)
                            },
                            fail: function (data, code) {
                                that.throwerror(data, code, 'move');
                            }
                        })
                    }, 20)
                } else {
                    setTimeout(function () {
                        that.movefile(count + 1, uri2);
                    }, 20)
                }
            },
            fail: function (data, code) {
                that.throwerror(data, code, 'move');
            }
        })
    },
    throwerror(data, code, _function) {
        catchlog('speedtest: test ' + _function + ' error. error reason is ' + data + ', code is ' + code + '.', 'ERROR', true)
        this.operation = '测试出现错误，无法继续。请参阅应用日志获取更多信息。'
    },
}

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
    },
    fail: function (data, code) {
        catchlog('catchlog: call storage.get(EnableLog) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
    }
})

function catchlog(logdata, type, isprint=false) {
    if (isEnableLog == true) {
        let date = new Date();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        if (minutes < 10) {
            minutes = '0' + minutes
        }
        if (minutes == 0) {
            minutes = '00'
        }
        if (seconds < 10) {
            seconds = '0' + seconds
        }
        if (seconds == 0) {
            seconds = '00'
        }
        let time_string = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + minutes + ':' + seconds
        let write_data = '[' + time_string + ' ' + type + '] ' + logdata
        file.writeText({
            uri: 'internal://app/applog.log',
            append: true,
            text: write_data + '\n',
            success: function () {
                if (isprint == true) {
                    console.log(write_data)
                }
            },
            fail: function (data, code) {
                console.log('catchlog: call catchlog failed. fail reason is ' + data + ', fail code is ' + code + '.')
            }
        })
    }
}

export { catchlog }
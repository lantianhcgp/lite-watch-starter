import router from '@system.router';
import file from '@system.file';
import storage from '@system.storage';
import app from '@system.app';
import { catchlog } from '../../common/catchlog.js'
import { replaceAll } from '../../common/replaceAll.js'
import { KeepLight } from '../../common/Light.js'

let app_bundle_name = ''
storage.get({
    key: 'bundle_name',
    default: '',
    success: (data) => {
        app_bundle_name = data
    }
})

let dir_length = 0
let app_run_size = 0
let app_data_size = 0
let system_1 = 0
let system_2 = 0
let music = 0
let res_1 = 0
let res_2 = 0
let res_3 = 0
let res_4 = 0
let bundle_name = ''
let app_name = ''
let app_image = ''
let config = {}
let file_length_array = []
let task_list = []

export default {
    data: {
        analysis_bundle_name: '未知',
        isShowAppName: false,
        isShowLoading: true,
        isShowMain: false,
        isShowDetails: false,
        isShowWarning: false,
        isShowUninstall: false,
        isSystemApps: false,
        isUninstallPreinstalled: false,
        isHide: false,
        analysis_list: [],
        analysis_count: 0,
        percent: 0,
        each_percent: 0,
        analysis_type: 'run',
        analysis_special_uri: '',
        content: [],
        uninstall_content: [],
        details: {
            app_image: '',
            app_name: '未知',
            app_version_name: '未知',
            app_version_code: '未知',
            app_bundle_name: '未知',
            app_run_size: '未知',
            app_data_size: '未知',
            app_total_size: '未知',
            app_vendor: '未知',
            app_min_api: '未知',
            app_target_api: '未知'
        },
        details_index: 0,
        warning_text: '',
        warning_tips: '',
        want_type: '',
        toast_show: false,
        toast_if: true,
        error_text: '',
        ani_name: '',
        toast_width: 0,
        toast_left: 0
    },
    onReady() {
        let that = this;
        storage.get({
            key: 'ShowAppName',
            default: '0',
            success: function (data) {
                if (data == '0') {
                    that.isShowAppName = false
                } else {
                    that.isShowAppName = true
                }
                catchlog('settings: call storage.get(ShowAppName) succeed.', 'DEBUG', true)
            },
            fail: function (data, code) {
                catchlog('settings: call storage.get(ShowAppName) failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
            }
        });
        storage.get({
            key: 'last_analysis_time',
            default: '0',
            success: function (data) {
                catchlog('app: succeed call on storage.get(key=last_analysis_time), return data is ' + data + '.', 'DEBUG', true)
                let analysis_time = Number(data)
                let current_time = new Date().valueOf()
                let passing_time = current_time - analysis_time
                if (passing_time >= 259200000) {
                    that.analysis_data();
                    KeepLight(true);
                } else {
                    that.show_data();
                }
            },
            fail: function (data, code) {
                catchlog('app: failed call on storage.get(key=last_analysis_time), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        })
    },
    show_data() {
        let that = this;
        file.get({
            uri: 'internal://app/app_details.json',
            success: function (data) {
                catchlog('app: succeed call on file.get(uri=user\\ace\\data\\com.cnoim.wearable.toolbox.user\\app_details.json).', 'DEBUG', true)
                let length = data.length
                let read_count = Math.ceil(length / 4096)
                let temp = ''
                for (let i = 0;i < read_count; i++) {
                    file.readText({
                        uri: 'internal://app/app_details.json',
                        position: i * 4096,
                        length: 4096,
                        success: function (data) {
                            temp = temp + data.text
                            if (i + 1 == read_count) {
                                catchlog('app: succeed call on file.readText(uri=user\\ace\\data\\com.cnoim.wearable.toolbox.user\\app_details.json).', 'DEBUG', true)
                                that.content = JSON.parse(temp)
                                temp = ''
                                that.isShowLoading = false
                                that.isShowMain = true
                                that.listroation();
                            }
                        }
                    })
                }
            }
        });
    },
    analysis_data() {
        let that = this;
        file.list({
            uri: 'internal://app/..\\..\\etc\\bundles',
            success: function (data) {
                catchlog('app: succeed call on file.list(uri=user\\ace\\etc\\bundles).', 'DEBUG', true)
                that.analysis_list = data.fileList
                that.each_percent = 100 / (that.analysis_list.length + 3)
                that.percent = (that.analysis_count + 1) * that.each_percent
                bundle_name = replaceAll(data.fileList[0].uri, '.json', '')
                that.analysis_bundle_name = bundle_name
                setTimeout(function () {
                    that.analysis_process_1();
                }, 5)
            },
            fail: function (data, code) {
                catchlog('app: failed call on file.list(uri=user\\ace\\etc\\bundles), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        })
    },
    analysis_process_1() {
        let that = this;
        file.list({
            uri: 'internal://app/..\\..\\run\\' + bundle_name + '\\assets',
            success: function (data) {
                catchlog('app: succeed call on file.list(uri=user\\ace\\run\\' + bundle_name + '\\assets).', 'DEBUG', true)
                app_image = 'internal://app/..\\..\\run\\' + bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources\\base\\media\\icon_small.bin'
                file.readText({
                    uri: 'internal://app/..\\..\\run\\' + bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources.index',
                    position: 194,
                    success: function (_data) {
                        catchlog('app: succeed call on file.readText(uri=user\\ace\\run\\' + bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources.index).', 'DEBUG', true)
                        if (_data.text == '') {
                            file.readText({
                                uri: 'internal://app/..\\..\\run\\' + bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources.index',
                                position: 202,
                                success: function (__data) {
                                    catchlog('app: succeed call on file.readText(uri=user\\ace\\run\\' + bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources.index).', 'DEBUG', true)
                                    app_name = __data.text
                                    that.analysis_process_2();
                                },
                                fail: function (data3, code) {
                                    catchlog('app: failed call on file.readText(uri=user\\ace\\etc\\run\\' + bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources.index), fail reason is ' + data3 + ', fail code is ' + code + '.', 'ERROR', true)
                                }
                            });
                        } else {
                            app_name = _data.text
                            that.analysis_process_2();
                        }
                    },
                    fail: function (data2, code) {
                        catchlog('app: failed call on file.readText(uri=user\\ace\\etc\\run\\' + bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources.index), fail reason is ' + data2 + ', fail code is ' + code + '.', 'ERROR', true)
                    }
                });
            },
            fail: function (data, code) {
                catchlog('app: failed call on file.list(uri=user\\ace\\etc\\run\\' + bundle_name + '\\assets), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        })
    },
    analysis_process_2() {
        let that = this;
        file.get({
            uri: 'internal://app/..\\..\\run\\' + bundle_name + '\\config.json',
            success: function (data) {
                catchlog('app: succeed call on file.get(uri=user\\ace\\run\\' + bundle_name + '\\config.json).', 'DEBUG', true)
                let length = data.length
                let read_count = Math.ceil(length / 4096)
                let temp = ''
                for (let i = 0;i < read_count; i++) {
                    file.readText({
                        uri: 'internal://app/..\\..\\run\\' + bundle_name + '\\config.json',
                        position: i * 4096,
                        length: 4096,
                        success: function (data) {
                            temp = temp + data.text
                            if (i + 1 == read_count) {
                                catchlog('app: succeed call on file.readText(uri=user\\ace\\run\\' + bundle_name + '\\config.json).', 'DEBUG', true)
                                config = JSON.parse(temp)
                                temp = ''
                                that.analysis_process_3('internal://app/..\\..\\' + that.analysis_type + '\\' + bundle_name, that.analysis_process_4);
                            }
                        },
                        fail: function (data, code) {
                            catchlog('app: failed call on file.readText(uri=user\\ace\\etc\\run\\' + bundle_name + '\\config.json), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
                        }
                    })
                }
            },
            fail: function (data, code) {
                catchlog('app: failed call on file.get(uri=user\\ace\\etc\\run\\' + bundle_name + '\\config.json), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
            }
        })
    },
    analysis_process_3(uri, callback) {
        let that = this;
        setTimeout(function () {
            that.get_dir_size(uri, callback);
        }, 5)
    },
    analysis_process_4() {
        let that = this;
        dir_length = file_length_array.reduce(function (a, b) {
            return a + b
        }, 0)
        if (that.analysis_type == 'run') {
            that.analysis_type = 'data'
            app_run_size = dir_length
            dir_length = 0
            file_length_array = []
            that.analysis_process_3('internal://app/..\\..\\' + that.analysis_type + '\\' + bundle_name, that.analysis_process_4);
        } else if (that.analysis_type == 'data') {
            app_data_size = dir_length
            that.analysis_type = 'run'
            dir_length = 0
            file_length_array = []
            if (app_run_size > 1048576) {
                var _app_run_size = (app_run_size / 1048576).toFixed(2) + 'M'
            } else if (app_run_size < 1048576) {
                _app_run_size = (app_run_size / 1024).toFixed(2) + 'K'
            }
            if (app_data_size > 1048576) {
                var _app_data_size = (app_data_size / 1048576).toFixed(2) + 'M'
            } else if (app_data_size < 1048576) {
                _app_data_size = (app_data_size / 1024).toFixed(2) + 'K'
            }
            var app_total_size = app_run_size + app_data_size
            if (app_total_size > 1048576) {
                var _app_total_size = (app_total_size / 1048576).toFixed(2) + 'M'
            } else if (app_total_size < 1048576) {
                _app_total_size = (app_total_size / 1024).toFixed(2) + 'K'
            }
            let app_obj = that.generate_app_obj(app_name, bundle_name, app_image, _app_run_size, _app_data_size, _app_total_size, app_run_size, app_data_size, app_total_size, config.app.version.name, config.app.version.code, config.app.apiVersion.target, config.app.apiVersion.compatible, config.app.vendor);
            catchlog('app: analysis app succeed! analysis raw data is ' + JSON.stringify(app_obj) + '.', 'DEBUG', true)
            that.content.push(app_obj)
            if (that.analysis_count == that.analysis_list.length - 1) {
                catchlog('app: analysis app list succeed! start analysis system list.', 'DEBUG', true)
                that.analysis_type = 'system_1'
                dir_length = 0
                file_length_array = []
                that.analysis_special_uri = 'internal://app/..\\..\\..\\data'
                that.analysis_bundle_name = 'ohos'
                that.analysis_count++
                that.percent = that.analysis_count * that.each_percent
                setTimeout(function () {
                    that.analysis_process_3(that.analysis_special_uri, that.analysis_special);
                }, 5)
            } else {
                that.analysis_count++
                that.analysis_bundle_name = replaceAll(that.analysis_list[that.analysis_count].uri, '.json', '')
                bundle_name = that.analysis_bundle_name
                that.percent = that.analysis_count * that.each_percent
                setTimeout(function () {
                    that.analysis_process_1();
                }, 5)
            }
        }
    },
    analysis_special() {
        let that = this;
        dir_length = file_length_array.reduce(function (a, b) {
            return a + b
        }, 0)
        if (that.analysis_type == 'system_1') {
            system_1 = dir_length
            dir_length = 0
            file_length_array = []
            that.analysis_type = 'system_2'
            that.analysis_special_uri = 'internal://app/..\\..\\..\\appicon'
            that.analysis_process_3(that.analysis_special_uri, that.analysis_special);
        } else if (that.analysis_type == 'system_2') {
            system_2 = dir_length
            dir_length = 0
            file_length_array = []
            var system_total_size = system_1 + system_2
            if (system_total_size > 1048576) {
                var _system_total_size = (system_total_size / 1048576).toFixed(2) + 'M'
            } else if (system_total_size < 1048576) {
                _system_total_size = (system_total_size / 1024).toFixed(2) + 'K'
            }
            let app_obj = that.generate_app_obj('系统', 'ohos', 'common/app_system.png', '0.00K', _system_total_size, _system_total_size, 0, system_total_size, system_total_size, '3.0.0', 1, 6, 6, 'huawei');
            catchlog('app: analysis app succeed! analysis raw data is ' + JSON.stringify(app_obj) + '.', 'DEBUG', true)
            that.content.push(app_obj)
            that.analysis_bundle_name = 'com.huawei.music'
            that.analysis_type = 'music'
            that.analysis_special_uri = 'internal://app/..\\..\\..\\music'
            that.analysis_count++
            that.percent = that.analysis_count * that.each_percent
            setTimeout(function () {
                that.analysis_process_3(that.analysis_special_uri, that.analysis_special);
            }, 5)
        } else if (that.analysis_type == 'music') {
            music = dir_length
            dir_length = 0
            file_length_array = []
            if (music > 1048576) {
                var _music = (music / 1048576).toFixed(2) + 'M'
            } else if (music < 1048576) {
                _music = (music / 1024).toFixed(2) + 'K'
            }
            let app_obj = that.generate_app_obj('音乐', 'com.huawei.music', 'common/app_music.png', '0.00K', _music, _music, 0, music, music, '2.1.0', 1, 6, 6, 'huawei');
            catchlog('app: analysis app succeed! analysis raw data is ' + JSON.stringify(app_obj) + '.', 'DEBUG', true)
            that.content.push(app_obj)
            that.analysis_bundle_name = 'com.huawei.watchface'
            that.analysis_type = 'res_1'
            that.analysis_special_uri = 'internal://app/..\\..\\..\\res'
            that.analysis_count++
            that.percent = that.analysis_count * that.each_percent
            setTimeout(function () {
                that.analysis_process_3(that.analysis_special_uri, that.analysis_special);
            }, 5)
        } else if (that.analysis_type == 'res_1') {
            res_1 = dir_length
            dir_length = 0
            file_length_array = []
            that.analysis_type = 'res_2'
            that.analysis_special_uri = 'internal://app/..\\..\\..\\album'
            that.analysis_process_3(that.analysis_special_uri, that.analysis_special);
        } else if (that.analysis_type == 'res_2') {
            res_2 = dir_length
            dir_length = 0
            file_length_array = []
            that.analysis_type = 'res_3'
            that.analysis_special_uri = 'internal://app/..\\..\\..\\weardial'
            that.analysis_process_3(that.analysis_special_uri, that.analysis_special);
        } else if (that.analysis_type == 'res_3') {
            res_3 = dir_length
            dir_length = 0
            file_length_array = []
            that.analysis_type = 'res_4'
            that.analysis_special_uri = 'internal://app/..\\..\\..\\kaleidoscope'
            that.analysis_process_3(that.analysis_special_uri, that.analysis_special);
        } else if (that.analysis_type == 'res_4') {
            res_4 = dir_length
            dir_length = 0
            file_length_array = []
            var res_total_size = res_1 + res_2 + res_3 + res_4
            if (res_total_size > 1048576) {
                var _res_total_size = (res_total_size / 1048576).toFixed(2) + 'M'
            } else if (res_total_size < 1048576) {
                _res_total_size = (res_total_size / 1024).toFixed(2) + 'K'
            }
            let app_obj = that.generate_app_obj('表盘', 'com.huawei.watchface', 'common/app_watchface.png', '0.00K', _res_total_size, _res_total_size, 0, res_total_size, res_total_size, '3.0.0', 2, 7, 7, 'huawei');
            catchlog('app: analysis app succeed! analysis raw data is ' + JSON.stringify(app_obj) + '.', 'DEBUG', true)
            that.content.push(app_obj)
            that.content.sort((a, b) => {
                if (a.app_total_raw_size > b.app_total_raw_size) {
                    return -1;
                } else if (a.app_total_raw_size < b.app_total_raw_size) {
                    return 1;
                } else {
                    return 0;
                }
            });
            file.writeText({
                uri: 'internal://app/app_details.json',
                text: JSON.stringify(that.content),
                success: function () {
                    catchlog('app: succeed call on file.writeText(uri=user\\ace\\data\\com.cnoim.wearable.toolbox.user\\app_details.json).', 'DEBUG', true)
                    catchlog('app: write app details ok!', 'DEBUG', true)
                },
                fail: function (data, code) {
                    catchlog('app: failed call on file.writeText(uri=user\\ace\\data\\com.cnoim.wearable.toolbox.user\\app_details.json), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
                }
            });
            storage.set({
                key: 'last_analysis_time',
                value: String(new Date().valueOf())
            });
            that.isShowLoading = false
            that.isShowMain = true
            that.listroation();
            KeepLight(false);
        }
    },
    onHide() {
        this.listunroation();
        this.detailsunroation();
    },
    generate_app_obj(name, bundle_name, image, run_size, data_size, total_size, run_raw_size, data_raw_size, total_raw_size, version_name, version_code, target_api, min_api, vendor) {
        return {
            app_name: name,
            app_bundle_name: bundle_name,
            app_image: image,
            app_run_size: run_size,
            app_data_size: data_size,
            app_total_size: total_size,
            app_run_raw_size: run_raw_size,
            app_data_raw_size: data_raw_size,
            app_total_raw_size: total_raw_size,
            app_version_name: version_name,
            app_version_code: version_code,
            app_target_api: target_api,
            app_min_api: min_api,
            app_vendor: vendor
        }
    },
    get_dir_size(uri, callback) {
        let that = this;
        file.list({
            uri: uri,
            success: function (data) {
                catchlog('app: succeed call on file.list(uri=' + uri + ').', 'DEBUG', true)
                for (let i = 0, len = data.fileList.length, obj = data.fileList;i <= len; i++) {
                    if (obj[i].type == 'dir') {
                        let _uri = uri + '\\' + obj[i].uri
                        task_list.push(_uri)
                    } else if (obj[i].type == 'file') {
                        file_length_array.push(obj[i].length)
                    }
                    if (i + 1 == len) {
                        if (task_list.length == 0) {
                            setTimeout(function () {
                                task_list = []
                                callback();
                            }, 5)
                        } else {
                            setTimeout(function () {
                                that.process_task(0, callback);
                            }, 5)
                        }
                    }
                }
            },
            fail: function (data, code) {
                if (code == 300) {
                    if (task_list.length == 0) {
                        setTimeout(function () {
                            task_list = []
                            callback();
                        }, 5)
                    } else {
                        setTimeout(function () {
                            that.process_task(0, callback);
                        }, 5)
                    }
                } else {
                    catchlog('app: failed call on file.list(uri=' + uri + '), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
                }
            }
        })
    },
    process_task(index, callback) {
        var that = this;
        file.list({
            uri: task_list[index],
            success: function (data) {
                catchlog('app: succeed call on file.list(uri=' + task_list[index] + ').', 'DEBUG', true)
                for (let i = 0, len = data.fileList.length, obj = data.fileList;i <= len; i++) {
                    if (obj[i].type == 'dir') {
                        let _uri = task_list[index] + '\\' + obj[i].uri
                        task_list.push(_uri)
                    } else if (obj[i].type == 'file') {
                        file_length_array.push(obj[i].length)
                    }
                    if (i + 1 == len) {
                        if (task_list.length - 1 == index) {
                            setTimeout(function () {
                                task_list = []
                                callback();
                            }, 5)
                        } else {
                            setTimeout(function () {
                                that.process_task(index + 1, callback);
                            }, 5)
                        }
                    }
                }
            },
            fail: function (data, code) {
                if (code == 300) {
                    if (task_list.length - 1 == index) {
                        setTimeout(function () {
                            task_list = []
                            callback();
                        }, 5)
                    } else {
                        setTimeout(function () {
                            that.process_task(index + 1, callback);
                        }, 5)
                    }
                } else {
                    catchlog('app: failed call on file.list(uri=' + task_list[index] + '), fail reason is ' + data + ', fail code is ' + code + '.', 'ERROR', true)
                }
            },
        })
    },
    replacedetails(index) {
        this.listunroation();
        this.isShowMain = false
        this.isShowDetails = true
        this.details_index = index
        this.detailsroation();
        this.details.app_name = this.content[index].app_name
        this.details.app_bundle_name = this.content[index].app_bundle_name
        this.details.app_image = this.content[index].app_image
        this.details.app_total_size = this.content[index].app_total_size
        this.details.app_run_size = this.content[index].app_run_size
        this.details.app_data_size = this.content[index].app_data_size
        this.details.app_vendor = this.content[index].app_vendor
        this.details.app_version_name = this.content[index].app_version_name
        this.details.app_version_code = this.content[index].app_version_code
        this.details.app_target_api = this.content[index].app_target_api
        this.details.app_min_api = this.content[index].app_min_api
        if (this.content[index].app_bundle_name == 'com.huawei.music' || this.content[index].app_bundle_name == 'com.huawei.watchface' || this.content[index].app_bundle_name == 'ohos') {
            this.isSystemApps = true
        }
        file.list({
            uri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets',
            success: (data) => {
                file.get({
                    uri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + data.fileList[0].uri + '\\resources\\base\\media\\icon.bin.hide',
                    success: () => {
                        this.isHide = true
                    }
                })
            }
        });
        setTimeout(() => {
            this.$refs.details.scrollTo({
                index: 0
            });
        }, 20)
    },
    mainswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
    detailsswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.detailsunroation();
            this.isShowDetails = false
            this.isShowMain = true
            this.isSystemApps = false
            this.isHide = false
            this.details = {
                app_image: '',
                app_name: '未知',
                app_version_name: '未知',
                app_version_code: '未知',
                app_bundle_name: '未知',
                app_run_size: '未知',
                app_data_size: '未知',
                app_total_size: '未知',
                app_vendor: '未知',
                app_min_api: '未知',
                app_target_api: '未知'
            }
            this.details_index = 0
            this.listroation();
        }
    },
    uninstallswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.uninstallunrotation();
            this.isShowUninstall = false
            this.isShowMain = true
            this.listroation();
        }
    },
    warningswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.exit();
        }
    },
    listroation() {
        setTimeout(() => {
            if (this.$refs.list.rotation) {
                this.$refs.list.rotation({
                    focus: true
                });
            }
        }, 30)
    },
    listunroation() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation({
                focus: false
            });
        }
    },
    detailsroation() {
        setTimeout(() => {
            if (this.$refs.details.rotation) {
                this.$refs.details.rotation({
                    focus: true
                });
            }
        }, 30)
    },
    detailsunroation() {
        if (this.$refs.details.rotation) {
            this.$refs.details.rotation({
                focus: false
            });
        }
    },
    uninstallrotation() {
        setTimeout(() => {
            if (this.$refs.uninstall.rotation) {
                this.$refs.uninstall.rotation({
                    focus: true
                });
            }
        }, 30)
    },
    uninstallunrotation() {
        if (this.$refs.uninstall.rotation) {
            this.$refs.uninstall.rotation({
                focus: false
            });
        }
    },
    uninstall() {
        if (this.isSystemApps == true) {
            this.show_toast('你在幻想些什么', 280, 1800);
        } else {
            this.detailsunroation();
            this.warning_text = '是否卸载此应用？'
            this.warning_tips = '建议使用系统方法卸载应用。'
            this.isShowDetails = false
            this.isShowWarning = true
            this.want_type = 'uninstall'
        }
    },
    clean() {
        if (this.isSystemApps == true) {
            this.show_toast('你在幻想些什么', 280, 1800);
        } else {
            this.detailsunroation();
            this.warning_text = '是否清除应用数据？'
            this.warning_tips = '系统会永久删除此应用的所有数据。该操作不可逆。'
            this.isShowDetails = false
            this.isShowWarning = true
            this.want_type = 'clean'
        }
    },
    hide() {
        if (this.isSystemApps == true) {
            this.show_toast('你在幻想些什么', 280, 1800);
        } else {
            this.detailsunroation();
            if (this.isHide) {
                this.warning_text = '是否显示该应用？'
                this.warning_tips = '实验性功能，请谨慎使用。\n目前仅支持显示应用图标。'
                this.isShowDetails = false
                this.isShowWarning = true
                this.want_type = 'show'
            } else {
                this.warning_text = '是否隐藏该应用？'
                this.warning_tips = '实验性功能，请谨慎使用。\n目前仅支持隐藏应用图标。'
                this.isShowDetails = false
                this.isShowWarning = true
                this.want_type = 'hide'
            }
        }
    },
    exit() {
        this.want_type = ''
        this.isShowWarning = false
        this.isShowDetails = true
        this.isUninstallPreinstalled = false
        this.detailsroation();
    },
    agree() {
        let that = this;
        if (this.want_type == 'uninstall') {
            file.rmdir({
                uri: 'internal://app/..\\..\\run\\' + that.details.app_bundle_name,
                recursive: true
            });
            file.rmdir({
                uri: 'internal://app/..\\..\\data\\' + that.details.app_bundle_name,
                recursive: true
            });
            file.delete({
                uri: 'internal://app/..\\..\\etc\\bundles\\' + that.details.app_bundle_name + '.json'
            });
            file.delete({
                uri: 'internal://app/..\\..\\etc\\permissions\\' + that.details.app_bundle_name
            });
            this.content.splice(this.details_index, 1)
            this.write_details_data();
            if (this.isUninstallPreinstalled) {
                file.readText({
                    uri: 'internal://app/..\\..\\etc\\uninstalled_delbundle.json',
                    success: function (data) {
                        let json = JSON.parse(data.text)
                        json.packages.push(that.details.app_bundle_name)
                        file.writeText({
                            uri: 'internal://app/..\\..\\etc\\uninstalled_delbundle.json',
                            text: JSON.stringify(json),
                            success: function () {
                                that.show_toast('卸载完成', 200, 1000);
                            }
                        })
                    },
                    fail: function () {
                        that.show_toast('卸载失败', 200, 1500);
                    }
                })
            } else {
                that.show_toast('卸载完成', 200, 1000);
            }
            setTimeout(function () {
                router.replace({
                    uri: 'pages/restart/restart'
                })
            }, 1000)
        } else if (this.want_type == 'clean') {
            file.list({
                uri: 'internal://app/..\\..\\data\\' + that.details.app_bundle_name,
                success: function (data) {
                    if (data.fileList.length == 0) {
                        that.show_toast('清除完成', 200, 1000);
                        that.exit();
                    } else {
                        data.fileList.forEach((object) => {
                            if (object.type == 'dir') {
                                file.rmdir({
                                    uri: 'internal://app/..\\..\\data\\' + that.details.app_bundle_name + '\\' + object.uri,
                                    recursive: true
                                })
                            } else if (object.type == 'file') {
                                file.delete({
                                    uri: 'internal://app/..\\..\\data\\' + that.details.app_bundle_name + '\\' + object.uri,
                                })
                            }
                        });
                        that.show_toast('清除完成', 200, 1000);
                        that.content[that.details_index].app_total_raw_size = that.content[that.details_index].app_total_raw_size - that.content[that.details_index].app_data_raw_size
                        that.content[that.details_index].app_data_raw_size = 0
                        that.content[that.details_index].app_data_size = '0.00K'
                        if (that.content[that.details_index].app_total_raw_size > 1048576) {
                            var _app_total_size = (that.content[that.details_index].app_total_raw_size / 1048576).toFixed(2) + 'M'
                        } else if (that.content[that.details_index].app_total_raw_size < 1048576) {
                            _app_total_size = (that.content[that.details_index].app_total_raw_size / 1024).toFixed(2) + 'K'
                        }
                        that.content[that.details_index].app_total_size = _app_total_size
                        that.details.app_data_size = '0.00K'
                        that.details.app_total_size = _app_total_size
                        that.write_details_data();
                        that.exit();
                    }
                },
                fail: function (data, code) {
                    if (code == 300) {
                        that.show_toast('清除完成', 200, 1000);
                        that.write_details_data();
                        that.exit();
                    }
                }
            })
        } else if (this.want_type == 'hide') {
            file.list({
                uri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets',
                success: (_data) => {
                    file.move({
                        srcUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon.bin',
                        dstUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon.bin.hide',
                        success: () => {
                            file.move({
                                srcUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon_small.bin',
                                dstUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon_small.bin.hide',
                                success: () => {
                                    file.copy({
                                        srcUri: 'internal://app/..\\..\\run\\' + app_bundle_name + '\\assets\\js\\default\\common\\app_icon.bin',
                                        dstUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon.bin',
                                        success: () => {
                                            file.copy({
                                                srcUri: 'internal://app/..\\..\\run\\' + app_bundle_name + '\\assets\\js\\default\\common\\app_icon_small.bin',
                                                dstUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon_small.bin',
                                                success: () => {
                                                    this.show_toast('隐藏成功', 200, 1000);
                                                    setTimeout(() => {
                                                        app.terminate();
                                                    }, 1000)
                                                },
                                                fail: () => {
                                                    this.show_toast('隐藏失败', 200, 1000);
                                                    this.exit();
                                                }
                                            })
                                        },
                                        fail: () => {
                                            this.show_toast('隐藏失败', 200, 1000);
                                            this.exit();
                                        }
                                    })
                                },
                                fail: () => {
                                    this.show_toast('隐藏失败', 200, 1000);
                                    this.exit();
                                }
                            });
                        },
                        fail: () => {
                            this.show_toast('隐藏失败', 200, 1000);
                            this.exit();
                        }
                    });
                },
                fail: () => {
                    this.show_toast('隐藏失败', 200, 1000);
                    this.exit();
                }
            });
        } else if (this.want_type == 'show') {
            file.list({
                uri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets',
                success: (_data) => {
                    file.move({
                        srcUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon.bin.hide',
                        dstUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon.bin',
                        success: () => {
                            file.move({
                                srcUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon_small.bin.hide',
                                dstUri: 'internal://app/..\\..\\run\\' + this.details.app_bundle_name + '\\assets\\' + _data.fileList[0].uri + '\\resources\\base\\media\\icon_small.bin',
                                success: () => {
                                    this.show_toast('显示成功', 200, 1000);
                                    setTimeout(() => {
                                        app.terminate();
                                    }, 1000)
                                },
                                fail: () => {
                                    this.show_toast('显示失败', 200, 1000);
                                    this.exit();
                                }
                            });
                        },
                        fail: () => {
                            this.show_toast('显示失败', 200, 1000);
                            this.exit();
                        }
                    });
                },
                fail: () => {
                    this.show_toast('显示失败', 200, 1000);
                    this.exit();
                }
            });
        }
    },
    write_details_data() {
        let that = this;
        file.writeText({
            uri: 'internal://app/app_details.json',
            text: JSON.stringify(that.content)
        })
    },
    checkbox_click() {
        this.isUninstallPreinstalled = !this.isUninstallPreinstalled
    },
    reinstall(index) {
        let that = this;
        this.uninstall_content.splice(index, 1)
        file.writeText({
            uri: 'internal://app/..\\..\\etc\\uninstalled_delbundle.json',
            text: JSON.stringify({
                "packages": that.uninstall_content
            })
        });
        that.show_toast('恢复完成', 200, 1000);
        setTimeout(function () {
            router.replace({
                uri: 'pages/restart/restart'
            })
        }, 1000)
    },
    founduninstall() {
        this.listunroation();
        this.isShowMain = false
        this.isShowUninstall = true
        this.uninstallrotation();
        let that = this;
        file.readText({
            uri: 'internal://app/..\\..\\etc\\uninstalled_delbundle.json',
            success: function (data) {
                that.uninstall_content = JSON.parse(data.text).packages
            }
        });
    },
    show_toast(text, width, time) {
        //clearTimeout(this.unshow)
        clearTimeout(this.unshow2)
        let that = this;
        this.error_text = text
        this.toast_width = width
        this.toast_left = (466 - this.toast_width) / 2
        //this.ani_name = 'appear'
        this.toast_show = true
        //this.unshow = setTimeout(function () {
        //that.ani_name = 'disappear'
        //}, time)
        let time2 = time + 310
        this.unshow2 = setTimeout(function () {
            that.ani_name = ''
            that.toast_show = false
            that.toast_if = false
            that.toast_if = true
        }, time2)
    }
}

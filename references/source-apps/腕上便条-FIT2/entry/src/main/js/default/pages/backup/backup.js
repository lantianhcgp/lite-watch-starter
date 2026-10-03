import router from '@system.router';
import file from '@system.file';

let temp = ''

export default {
    data: {
        content: {
            "data": []
        },
        main_if: true,
        warning_if: false,
        content_if: true,
        empty_if: false,
        show_toast: false,
        error_text: '',
        warning_text: '',
        from: '',
        toast_width: 0,
        toast_left: 0,
        index: 0,
    },
    main_touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/settings/settings',
                params: {
                    from: 'backup',
                    swiper_index: this.swiper_index
                }
            })
        }
    },
    warning_touchmove(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.exit();
        }
    },
    onInit() {
        let that = this;
        file.get({
            uri: 'internal://app/backup_list.json',
            success: function (data) {
                let length = data.length
                let read_count = Math.ceil(length / 4096)
                for (let i = 0;i < read_count; i++) {
                    let position = i * 4096
                    file.readText({
                        uri: 'internal://app/backup_list.json',
                        position: position,
                        length: 4096, //读取长度，默认为4096
                        success: function (data) {
                            temp = temp + data.text //因为多次读取，在第一次读取内容的基础上叠加数据
                            if (i + 1 == read_count) {
                                that.content = JSON.parse(temp)
                                temp = ''
                            }
                        },
                        fail: function (data, code) {
                            console.error("read file 'internal://app/backup_list.json' error. error reason is " + data + ', error code is ' + code + '.')
                        }
                    });
                }
            },
            fail: function (data, code) {
                if (code == 301) {
                    that.content_if = false
                    that.empty_if = true
                } else {
                    console.error("get file 'internal://app/backup_list.json' error. error reason is " + data + ', error code is ' + code + '.')
                }
            }
        })
    },
    onShow() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation();
        }
    },
    onHide() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation({
                foucs: false
            });
        }
    },
    exit() {
        this.warning_if = false
        this.main_if = true
    },
    add() {
        if (this.show_toast == false) {
            let that = this;
            file.get({
                uri: 'internal://app/content.txt',
                success: function () {
                    let date = new Date();
                    let year = date.getFullYear();
                    let month = date.getMonth() + 1;
                    let day = date.getDate();
                    let hours = date.getHours();
                    let minutes = date.getMinutes();
                    let seconds = date.getSeconds();
                    if (minutes < 10) {
                        minutes = '0' + minutes
                    }
                    if (seconds < 10) {
                        seconds = '0' + seconds
                    }
                    let backup_text = '备份 ' + year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
                    let source = 'internal://app/content.txt'
                    let target = 'internal://app/content_' + year + '_' + month + '_' + day + '_' + hours + '_' + minutes + '_' + seconds + '.txt'
                    file.copy({
                        srcUri: source,
                        dstUri: target,
                        success: function () {
                            that.write_backup_list(backup_text, target);
                        },
                    })
                },
                fail: function (data, code) {
                    if (code == 301) {
                        that.toast_width = 460
                        that.compute_toast_left();
                        that.error_text = '当前待办为空，无法创建备份'
                        that.show_toast = true
                        setTimeout(function () {
                            that.show_toast = false
                        }, 1500)
                    } else {
                        console.error('fail to get "internal://app/content.txt". fail reason is ' + data + ', code is ' + code + '.')
                    }
                }
            })
        }
    },
    write_backup_list(name, path) {
        let obj = {
            backup_name: name,
            backup_path: path
        }
        this.content.data.push(obj)
        file.writeText({
            uri: 'internal://app/backup_list.json',
            text: JSON.stringify(this.content)
        })
        this.content_if = true
        this.empty_if = false
    },
    restore(index) {
        this.index = index
        this.from = 'restore'
        this.main_if = false
        this.warning_if = true
        this.warning_text = '你确定要恢复到\n' + this.content.data[index].backup_name + ' 吗?'
    },
    delete_content(index) {
        this.index = index
        this.from = 'delete'
        this.main_if = false
        this.warning_if = true
        this.warning_text = '你确定要删除\n' + this.content.data[index].backup_name + ' 吗?'
    },
    confirm() {
        let that = this;
        switch (this.from) {
            case 'delete':
                file.delete({
                    uri: that.content.data[that.index].backup_path,
                    success: function () {
                        that.content.data.splice(that.index, 1)
                        if (that.content.data.length == 0) {
                            file.delete({
                                uri: 'internal://app/backup_list.json',
                                fail: function (data, code) {
                                    console.error('fail to delete "internal://app/backup_list.json". fail reason is ' + data + ', code is ' + code + '.')
                                }
                            });
                            that.content_if = false
                            that.empty_if = true
                        } else {
                            file.writeText({
                                uri: 'internal://app/backup_list.json',
                                text: JSON.stringify(that.content),
                                fail: function (data, code) {
                                    console.error('fail to writetext "internal://app/backup_list.json". fail reason is ' + data + ', code is ' + code + '.')
                                }
                            })
                        }
                        that.exit();
                    },
                    fail: function (data, code) {
                        console.error('fail to delete "' + that.content.data[that.index].backup_path + '". fail reason is ' + data + ', code is ' + code + '.')
                    }
                })
                break;
            case 'restore':
                file.delete({
                    uri: 'internal://app/content.txt',
                    success: function () {
                        that.restoreprocess();
                    },
                    fail: function (data, code) {
                        if (code == 301) {
                            that.restoreprocess();
                        } else {
                            console.error('fail to rmdir "internal://app/content.txt". fail reason is ' + data + ', code is ' + code + '.')
                        }
                    }
                })
        }
    },
    restoreprocess() {
        let that = this;
        file.copy({
            srcUri: that.content.data[that.index].backup_path,
            dstUri: 'internal://app/content.txt',
            success: function () {
                that.exit();
            },
            fail: function (data, code) {
                console.error('fail to restore "' + that.content.data[that.index].backup_path + '" to "internal://app/content.txt". fail reason is ' + data + ', code is ' + code + '.')
                that.toast_width = 400
                that.compute_toast_left();
                that.error_text = '恢复备份失败，请重试'
                that.show_toast = true
                setTimeout(function () {
                    that.show_toast = false
                }, 1500)
            }
        })
    },
    copydir(source, target, backup_text) {
        let that = this;
        file.list({
            uri: source,
            success: function (data) {
                file.mkdir({
                    uri: target,
                    success: function () {
                        data.fileList.forEach(function (ele) {
                            file.copy({
                                srcUri: source + '/' + ele.uri,
                                dstUri: target + '/' + ele.uri,
                                fail: function (data, code) {
                                    console.error('fail to copy "' + source + '/' + ele.uri + '" to "' + target + '/' + ele.uri + '". fail reason is ' + data + ', code is ' + code + '.')
                                }
                            })
                        })
                        that.write_backup_list(backup_text, target);
                    },
                    fail: function (data, code) {
                        console.error('fail to mkdir "' + target + '". fail reason is ' + data + ', code is ' + code + '.')
                    }
                })
            },
            fail: function (data, code) {
                if (code == 300) {
                    that.toast_width = 460
                    that.compute_toast_left();
                    that.error_text = '当前课程为空，无法创建备份'
                    that.show_toast = true
                    setTimeout(function () {
                        that.show_toast = false
                    }, 1500)
                } else {
                    console.error('fail to list "' + source + '". fail reason is ' + data + ', code is ' + code + '.')
                }
            }
        })
    },
    compute_toast_left() {
        this.toast_left = (466 - this.toast_width) / 2
    }
}

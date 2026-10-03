import file from '@system.file';
import { KeepLight } from '../../common/Light.js'

export default {
    data: {
        search_percent: 0,
        content: [],
        search_if: true,
        main_if: false,
        search_name: '未知',
        operation: 'title',
        position: 8,
        title: '',
        singer: '',
        name: '',
    },
    onShow() {
        KeepLight(true);
        this.getfile();
    },
    getfile() {
        let that = this;
        file.readText({
            uri: 'internal://app/..\\..\\..\\music\\folder0',
            position: that.position,
            success: function (data) {
                if (that.operation == 'title') {
                    if (data.text == '') {
                        that.position += 656
                        that.search_percent += 0.12
                        setTimeout(function () {
                            that.getfile();
                        }, 5)
                    } else {
                        that.title = data.text
                        that.operation = 'singer'
                        that.position += 121
                        setTimeout(function () {
                            that.getfile();
                        }, 5)
                    }
                } else if (that.operation == 'singer') {
                    that.singer = data.text
                    that.operation = 'name'
                    that.position += 61
                    setTimeout(function () {
                        that.getfile();
                    }, 5)
                } else if (that.operation == 'name') {
                    that.name = data.text
                    that.operation = 'title'
                    if (that.title != '' && that.singer != '' && that.name != '') {
                        let object = {
                            title: that.title,
                            singer: that.singer,
                            name: that.name
                        }
                        that.content.push(object)
                    }
                    that.position += 474
                    that.search_percent += 0.12
                    setTimeout(function () {
                        that.getfile();
                    }, 5)
                }
            },
            fail: function (data, code) {
                if (code == 200) {
                    that.title = '正在渲染列表...'
                    file.writeText({
                        uri: 'internal://app/music_info.json',
                        text: JSON.stringify(that.content)
                    });
                    setTimeout(function () {
                        that.search_if = false
                        that.main_if = true
                        that.rotation();
                    }, 50)
                    KeepLight(false);
                }
            }
        })
    },
    rotation() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation();
        }
    },
    unrotation() {
        if (this.$refs.list.rotation) {
            this.$refs.list.rotation({
                focus: false
            });
        }
    },
}

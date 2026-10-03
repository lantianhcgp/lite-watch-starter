import router from '@system.router';
import storage from '@system.storage';
import file from '@system.file';
import { catchlog } from '../../common/catchlog.js'

let color_array = [
    "#FFB6C1",
    "#DC143C",
    "#C71585",
    "#800080",
    "#4169E1",
    "#0000FF",
    "#7B68EE",
    "#00BFFF",
    "#87CEEB",
    "#40E0D0",
    "#20B2AA",
    "#3CB371",
    "#00FF7F",
    "#228B22",
    "#006400",
    "#FFFF00",
    "#FFA500",
    "#FFD700",
    "#D2691E",
    "#FF4500",
    "#FF6347",
    "#FF0000",
    "#8B0000",
    "#FFFFFF",
    "#C0C0C0",
    "#000000"
]

export default {
    data: {
        frequency_if: false,
        color_if: false,
        select_if: false,
        save_array: [],
        color_content: [],
        color_list_height: 100,
        select_content: [],
        select_list_height: 0,
        frequency_content: [
            {
                object_name: 'veryfast',
                object_string: '很快',
                object_checked: false
            }, {
                object_name: 'fast',
                object_string: '快',
                object_checked: false
            }, {
                object_name: 'normal',
                object_string: '正常',
                object_checked: true
            }, {
                object_name: 'slow',
                object_string: '慢',
                object_checked: false
            }, {
                object_name: 'veryslow',
                object_string: '很慢',
                object_checked: false
            }
        ],
        toast_if: true,
        toast_show: false,
        error_text: '',
        ani_name: '',
        toast_width: 0,
        toast_left: 0
    },
    onInit() {
        if (this.want == 'frequency') {
            let that = this;
            this.frequency_if = true
            storage.get({
                key: 'Flicker_Frequency',
                default: '正常',
                success: function (data) {
                    that.frequency_content.forEach((a) => {
                        if (a.object_string == data) {
                            a.object_checked = true
                        } else {
                            a.object_checked = false
                        }
                    })
                }
            })
        } else if (this.want == 'color') {
            this.color_if = true
            this.get_save_array();
        }
    },
    get_save_array() {
        let that = this;
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
                                that.render_color_list();
                                that.get_color_list_height();
                            }
                        }
                    })
                }
            }
        });
    },
    onShow() {
        switch (this.want) {
            case 'frequency':
                if (this.$refs.frequency_list.rotation) {
                    this.$refs.frequency_list.rotation();
                }
                break;
            case 'color':
                if (this.$refs.color_list.rotation) {
                    this.$refs.color_list.rotation();
                }
                break;
        }
    },
    onHide() {
        switch (this.want) {
            case 'frequency':
                if (this.$refs.frequency_list.rotation) {
                    this.$refs.frequency_list.rotation({
                        focus: false
                    });
                }
                break;
            case 'color':
                if (this.$refs.color_list.rotation) {
                    this.$refs.color_list.rotation({
                        focus: false
                    });
                }
                break;
        }
    },
    selectonShow() {
        if (this.$refs.select_list.rotation) {
            this.$refs.select_list.rotation();
        }
    },
    selectonHide() {
        if (this.$refs.select_list.rotation) {
            this.$refs.select_list.rotation({
                focus: false
            });
        }
    },
    replace_select() {
        this.render_select_list();
        this.color_if = false
        this.select_if = true
        this.get_select_list_height();
        this.onHide();
        this.selectonShow();
    },
    radio_change(index, data) {
        this.frequency_content[index].object_checked = data.checked
        this.save_frequency_data();
    },
    get_color_list_height() {
        let array_length = this.color_content.length + 1
        if (array_length == 0) {
            array_length = 1
        }
        this.color_list_height = Math.ceil(array_length / 3) * 110
    },
    get_select_list_height() {
        let array_length = this.select_content.length + 2
        this.select_list_height = Math.ceil(array_length / 3) * 110
    },
    select_random() {
        if (this.select_content[this.select_content.length - 1].israndom == true) {
            this.select_content[this.select_content.length - 1].background = this.random_color();
        } else {
            this.select_content.push({
                background: this.random_color(),
                width: 0,
                israndom: true
            })
            this.get_select_list_height();
        }
    },
    render_color_list() {
        let that = this;
        let temp = []
        this.save_array.forEach(function (a) {
            temp.push({
                background: a
            });
        });
        that.color_content = temp
        that.get_color_list_height();
    },
    render_select_list() {
        let that = this;
        let temp = []
        color_array.forEach(function (a) {
            if (that.save_array.indexOf(a) != -1) {
                var width = 5
            } else {
                width = 0
            }
            temp.push({
                background: a,
                width: width
            });
        });
        that.select_content = temp
        that.get_select_list_height();
    },
    select_click(index) {
        if (this.select_content[index].width == 5) {
            this.select_content[index].width = 0
        } else if (this.select_content[index].width == 0) {
            this.select_content[index].width = 5
        }
    },
    color_click(index) {
        if (this.save_array.length == 1) {
            this.show_toast('请至少保留一个颜色', 340, 2000);
        } else {
            this.color_content.splice(index, 1)
            this.save_array.splice(index, 1)
        }
    },
    save_frequency_data() {
        this.frequency_content.forEach(function (a) {
            if (a.object_checked == true) {
                storage.set({
                    key: 'Flicker_Frequency',
                    value: a.object_string,
                    success: function () {
                        catchlog('flashlight_settings: call storage.set(Flicker_Frequency="' + a.object_string + '") succeed.', 'DEBUG', true)
                    },
                    fail: function (data, code) {
                        catchlog('flashlight_settings: call storage.set(Flicker_Frequency="' + a.object_string + '") failed. fail code is ' + code + ', fail reason is ' + data + '.', 'ERROR', true)
                    }
                })
            }
        })
    },
    save_color_data() {
        let that = this;
        file.writeText({
            uri: 'internal://app/color_array.json',
            text: JSON.stringify(that.save_array)
        });
    },
    save_color_array_data() {
        let that = this;
        this.select_content.forEach((a) => {
            let c = that.save_array.indexOf(a.background)
            if (a.width == 5 && c == -1) {
                that.save_array.push(a.background)
            } else if (a.width == 0 && c != -1) {
                that.save_array.splice(c, 1)
            }
        });
    },
    frequencyswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/settings/settings'
            })
        }
    },
    ok() {
        let that = this;
        let count = 0
        this.select_content.forEach((a) => {
            let c = that.save_array.indexOf(a.background)
            if (a.width == 5) {
                count++
            }
        });
        if (count == 0) {
            this.show_toast('请至少保留一个颜色', 340, 2000);
        } else {
            this.save_color_array_data();
            this.save_color_data();
            this.selectexit();
        }
    },
    colorswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            let that = this;
            file.writeText({
                uri: 'internal://app/color_array.json',
                text: JSON.stringify(that.save_array),
            });
            router.replace({
                uri: 'pages/settings/settings'
            })
        }
    },
    selectswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.selectexit();
        }
    },
    selectexit() {
        this.render_color_list();
        this.select_if = false
        this.color_if = true
        this.selectonHide();
        this.onShow();
    },
    random_color() {
        var r = Math.floor(Math.random() * 256);
        var g = Math.floor(Math.random() * 256);
        var b = Math.floor(Math.random() * 256);
        var color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
        return color;
    },
    show_toast(text, width, time) {
        clearTimeout(this.unshow)
        clearTimeout(this.unshow2)
        let that = this;
        this.error_text = text
        this.toast_width = width
        this.toast_left = (466 - this.toast_width) / 2
        //this.ani_name = 'appear'
        this.toast_show = true
        this.unshow = setTimeout(function () {
            //that.ani_name = 'disappear'
        }, time)
        let time2 = time + 310
        this.unshow2 = setTimeout(function () {
            that.ani_name = ''
            that.toast_show = false
            that.toast_if = false
            that.toast_if = true
        }, time2)
    },
}

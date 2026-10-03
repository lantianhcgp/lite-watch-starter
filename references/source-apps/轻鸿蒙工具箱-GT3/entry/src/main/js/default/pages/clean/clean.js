import router from '@system.router';
import file from '@system.file';

var delete_length_array = []
var clean_index = 0
var clean_array = []
let fail_list = []

export default {
    data: {
        process: "正在删除",
        tips: "未知文件"
    },
    onShow() {
        this.clean_init();
    },
    clean_init() {
        let that = this;
        file.list({
            uri: 'internal://app/..\\..\\run',
            success: function (data) {
                clean_array = data.fileList
                that.handle_clean();
            }
        })
    },
    handle_clean() {
        let that = this;
        if (clean_index == clean_array.length - 1) {
            this.process = "删除完成"
            let delete_length = delete_length_array.reduce((a, b) => {
                return a + b;
            }, 0)
            this.tips = "共删除" + (delete_length / 1048576).toFixed(4) + "MB"
        } else {
            this.tips = clean_array[clean_index].uri
            setTimeout(() => {
                that.clean();
            }, 5)
        }
    },
    clean() {
        let that = this;
        let clean_bundle_name = clean_array[clean_index].uri
        file.delete({
            uri: 'internal://app/..\\..\\run\\' + clean_bundle_name + '\\assets\\js\\default\\image_convert_result.txt'
        });
        file.get({
            uri: 'internal://app/..\\..\\run\\' + clean_bundle_name + '\\assets\\js\\default\\app.js.map',
            success: (data) => {
                file.delete({
                    uri: 'internal://app/..\\..\\run\\' + clean_bundle_name + '\\assets\\js\\default\\app.js.map',
                    success: () => {
                        delete_length_array.push(data.length)
                    }
                })
            }
        });
        file.get({
            uri: 'internal://app/..\\..\\run\\' + clean_bundle_name + '\\assets\\js\\default\\preview_css.json',
            success: (data) => {
                file.delete({
                    uri: 'internal://app/..\\..\\run\\' + clean_bundle_name + '\\assets\\js\\default\\preview_css.json',
                    success: () => {
                        delete_length_array.push(data.length)
                    }
                })
            }
        });
        file.list({
            uri: 'internal://app/..\\..\\run\\' + clean_bundle_name + '\\assets\\js\\default\\pages',
            success: function (data) {
                that.handleDelete(data.fileList, clean_bundle_name, 0);
            }
        });
    },
    handleFail(uri) {

    },
    handleDelete(file_array, bundle_name, index) {
        let that = this;
        if (index == file_array.length) {
            clean_index++
            this.handle_clean();
        } else {
            setTimeout(() => {
                that.delete_file(file_array, bundle_name, index);
            }, 5)
        }
    },
    delete_file(file_array, bundle_name, index) {
        let that = this;
        file.list({
            uri: 'internal://app/..\\..\\run\\' + bundle_name + '\\assets\\js\\default\\pages\\' + file_array[index].uri,
            success: (data) => {
                let js_map_index = data.fileList.findIndex((ele) => {
                    return ele.uri.indexOf('.js.map') != -1
                });
                if (js_map_index == -1) {
                    that.handleDelete(file_array, bundle_name, index + 1);
                } else {
                    file.delete({
                        uri: 'internal://app/..\\..\\run\\' + bundle_name + '\\assets\\js\\default\\pages\\' + file_array[index].uri + '\\' + data.fileList[js_map_index].uri,
                        success: () => {
                            delete_length_array.push(data.fileList[js_map_index].length)
                            that.handleDelete(file_array, bundle_name, index + 1);
                        },
                        fail: (data, code) => {
                            that.handleDelete(file_array, bundle_name, index + 1);
                        }
                    });
                }
            }
        })
    }
}

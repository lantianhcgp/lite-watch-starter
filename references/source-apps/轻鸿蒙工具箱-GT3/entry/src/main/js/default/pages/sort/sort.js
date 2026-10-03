import router from '@system.router';
import file from '@system.file';
import { catchlog } from '../../common/catchlog.js'

let temp = ''

export default {
    data: {
        content: []
    },
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/settings/settings'
            })
        }
    },
    onShow() {
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
    onInit() {
        let that = this;
        file.get({
            uri: 'internal://app/home_array.json',
            success: function (data) {
                let length = data.length //获取文件的长度
                let p = Math.ceil(length / 4096) //获取需要循环读取的次数
                for (var i = 0;i < p; i++) {
                    let position = i * 4096 //计算出每次循环开始读取文件的起始位置
                    let u = i + 1 //给下面判断文件是否读取完成提供判断依据
                    file.readText({
                        uri: 'internal://app/home_array.json',
                        position: position,
                        length: 4096, //读取长度，默认为4096
                        success: function (data) {
                            temp = temp + data.text //因为多次读取，在第一次读取内容的基础上叠加数据
                            if (u == p) { //当u=p时（文件读取完成），进行下一个函数操作
                                that.content = JSON.parse(temp)
                                temp = ''
                            }
                        }
                    })
                }
            }
        })
    },
    up(index) {
        if (index != 0) {
            let temp = this.content
            let object_temp = temp[index-1]
            temp[index-1] = temp[index]
            temp[index] = object_temp
            this.content = temp
        }
    },
    onDestroy() {
        file.writeText({
            uri: 'internal://app/home_array.json',
            text: JSON.stringify(this.content)
        })
    }
}

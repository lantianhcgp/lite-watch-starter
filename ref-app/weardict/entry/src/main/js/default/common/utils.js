import app from '@system.app';
import brightness from '@system.brightness';

var SWIPE_DISTANCE = 150; //判断为返回手势的滑动距离阈值
var timeoutList = {};

export default class utils {
    /**
     * 传入触摸事件的参数, 返回用户当前是否在执行返回手势
     * @param params 传入触摸事件的参数
     * @return 是否在执行返回手势
     */
    static checkIsSwipingBack(params) {
        return params.direction === "right" && (params.distance ? (params.distance >= SWIPE_DISTANCE) : true);
    }

    /**
     * 赋予/取消表冠焦点
     */
    static rotationFocus(context, name, focus) {
        if (!context) return;
        if (!context.$refs) return;
        if (!context.$refs[name]) return;
        if (!context.$refs[name].rotation) return;
        context.$refs[name].rotation({
            focus: focus
        });
    }

    /**
     * list scrollTo
     */
    static scrollTo(context, name, index) {
        if (!context) return;
        if (!context.$refs) return;
        if (!context.$refs[name]) return;
        if (!context.$refs[name].scrollTo) return;
        context.$refs[name].scrollTo({
            index: index
        });
    }

    /**
     * list scrollBy
     */
    static scrollBy(context, name, distance) {
        if (!context) return;
        if (!context.$refs) return;
        if (!context.$refs[name]) return;
        if (!context.$refs[name].scrollBy) return;
        context.$refs[name].scrollBy({
            distance: distance
        });
    }

    /**
     * 创建一个timeout
     */
    static createTimeout(name, func, time) {
        timeoutList[name] = setTimeout(func, time);
    }

    /**
     * 如果存在，清空这个timeout
     */
    static deleteTimeout(name) {
        if (timeoutList[name]) {
            clearTimeout(timeoutList[name]);
            delete timeoutList[name];
        }
    }

    /**
     * 清空所有timeout，推荐在页面销毁期间使用
     */
    static deleteAllTimeout() {
        for (let name in timeoutList) {
            clearTimeout(timeoutList[name]);
            delete timeoutList[name];
        }
        timeoutList = null;
    }

    /**
     * 设置是否常亮
     */
    static setAlwaysOn(isAlwaysOn) {
        brightness.setKeepScreenOn({
            keepScreenOn: isAlwaysOn
        });
    }

    /**
     * 设置是否保活
     */
    static setAppSave(isAppSave) {
        app.screenOnVisible({
            visible: isAppSave
        });
    }

    /**
     * 格式化时间戳
     * @param ts 时间戳
     * @returns 格式化文本, 格式为 YYYY/MM/DD hh:mm
     */
    static formatTimeStamp(ts) {
        if (ts != null && !isNaN(ts)) {
            var date = new Date(ts);
            var YY = date.getFullYear();
            var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
            var DD = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
            var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
            var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
            var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
            return YY + '/' + MM + '/' + DD + ' ' + hh + ':' + mm + ':' + ss;
        } else {
            return "未知时间";
        }
    }

    /**
     * 格式化文件大小
     * @param size 文件大小
     * @returns 格式化文本, 格式为 XXX MB/GB/KB
     */
    static formatSize(size) {
        let value = Number(size);
        if (size && !isNaN(value)) {
            const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'];
            let index = 0;
            let k = value;
            if (value >= 1024) {
                while (k > 1024) {
                    k = k / 1024;
                    index++;
                }
            }
            return `${(k).toFixed(2)}${units[index]}`;
        }
        return '0B';
    }

    /**
     * 判断当前是否为新特性设备（如GT4）
     * 当前通过接口支持判断是否为新设备
     */
    static isNewDevice() {
        return !!app.setSwipeToDismiss;
    }

    /**
     * 停止事件冒泡
     */
    static stopPropagation(event) {
        //停止事件冒泡的一系列操作
        if (event.stopPropagation) event.stopPropagation();
        if (event.StopPropagation) event.StopPropagation();
    }

    /**
     * 释放对象下所有变量的引用
     */
    static nullObjectData(object) {
        for (let name in object) {
            object[name] = null;
        }
    }
}
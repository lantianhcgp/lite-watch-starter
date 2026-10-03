import file from '@system.file';

export default class common {

    /**
     * 添加多个params。
     * @param paramsObj 存放params的对象。
     * @param callback 写入完成后的callback函数，可不带。
     */
    static addMultiParams(paramsObj, callback=undefined) {
        $app.addAllParams(paramsObj);
        if (callback) callback();
    }

    /**
     * 添加多个params，但是加入前会清空所有params。
     * @param paramsObj 存放params的对象。
     * @param callback 写入完成后的callback函数，可不带。
     */
    static writeMultiParams(paramsObj, callback=undefined) {
        this.clean();
        this.addMultiParams(paramsObj, callback);
    }

    /**
     * 获取params并写入js上下文。
     * @param context js需要传递的上下文，一般为this。
     * @param callback 写入完成后的callback函数，可不带。
     */
    static getParams(context, callback=undefined) {
        $app.getAllParams((params) => {
            for (let name in params) {
                context[name] = params[name];
            }
            if (callback) callback();
        })
    }

    /**
     * 清空所有params。
     */
    static clean() {
        $app.cleanAllParams();
    }
}
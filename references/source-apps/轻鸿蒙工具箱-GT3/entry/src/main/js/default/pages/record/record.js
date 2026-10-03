import router from '@system.router';
import file from '@system.file';
import storage from '@system.storage';

let app_bundle_name = ''
storage.get({
    key: 'bundle_name',
    default: '',
    success: (data) => {
        app_bundle_name = data
    }
})
let isAllowOperation = false

let record_version = 1

export default {
    data: {
        icon_type: "",
        warning_text: "",
        input_text: ""
    },
    onInit() {
        /*file.get({
            uri: 'internal://app/..\\..\\etc\\bundles\\com.tencent.wechatrtos.json',
            success: () => {
                file.get({
                    uri: 'internal://app/..\\..\\run\\com.tencent.wechatrtos\\assets\\js\\default\\pages\\setting\\setting.bc.bak',
                    success: () => {
                        storage.get({
                            key: 'record_version',
                            default: '1',
                            success: (data) => {
                                if (Number(data) < record_version) {
                                    this.icon_type = "info"
                                    this.warning_text = '检测到"录音机"版本有更新，请点击下方按钮更新。'
                                    this.input_text = "安装"
                                    isAllowOperation = true
                                } else {
                                    this.icon_type = "info"
                                    this.warning_text = '"录音机"功能已经安装，请前往"微信"使用。'
                                    this.input_text = "我知道了"
                                }
                            }
                        })
                    },
                    fail: () => {
                        this.icon_type = "info"
                        this.warning_text = '检测到当前设备已安装"微信"，请点击下方按钮安装。'
                        this.input_text = "安装"
                        isAllowOperation = true
                    }
                });
            },
            fail: () => {
                this.icon_type = "warning"
                this.warning_text = '当前设备尚未安装"微信"，无法使用"录音机"。'
                this.input_text = "我知道了"
            }
        })*/
        this.icon_type = "info"
        this.warning_text = '检测到当前设备已安装"微信"，请点击下方按钮安装。'
        this.input_text = "安装"
        isAllowOperation = true
    },
    handleClick() {
        if (isAllowOperation) {
            file.get({
                uri: 'internal://app/..\\..\\run\\com.tencent.wechatrtos\\assets\\js\\default\\pages\\setting\\setting.bc.bak',
                success: () => {
                    file.copy({
                        //srcUri: 'internal://app/..\\..\\run\\' + app_bundle_name + '\\assets\\js\\default\\common\\record\\bc\\setting.bc',
                        srcUri: 'internal://app/..\\..\\data\\com.watch.alone.watchreader\\setting.bc',
                        dstUri: 'internal://app/..\\..\\run\\com.tencent.wechatrtos\\assets\\js\\default\\pages\\setting\\setting.bc',
                        success: () => {
                            this.icon_type = "info"
                            this.warning_text = '"录音机"功能已经安装，请前往"微信"使用。'
                            this.input_text = "我知道了"
                            isAllowOperation = false
                        }
                    });
                },
                fail: () => {
                    file.move({
                        srcUri: 'internal://app/..\\..\\run\\com.tencent.wechatrtos\\assets\\js\\default\\pages\\setting\\setting.bc',
                        dstUri: 'internal://app/..\\..\\run\\com.tencent.wechatrtos\\assets\\js\\default\\pages\\setting\\setting.bc.bak',
                        success: () => {
                            file.copy({
                                srcUri: 'internal://app/..\\..\\data\\com.watch.alone.watchreader\\setting.bc',
                                //srcUri: 'internal://app/..\\..\\run\\' + app_bundle_name + '\\assets\\js\\default\\common\\record\\bc\\setting.bc',
                                dstUri: 'internal://app/..\\..\\run\\com.tencent.wechatrtos\\assets\\js\\default\\pages\\setting\\setting.bc',
                                success: () => {
                                    this.icon_type = "info"
                                    this.warning_text = '"录音机"功能已经安装，请前往"微信"使用。'
                                    this.input_text = "我知道了"
                                    isAllowOperation = false
                                }
                            });
                        }
                    });
                }
            });
        } else {
            this.exit();
        }
    },
    handleSwipe(e) {
        if (e.direction === 'right' && e.distance >= 150) {
            this.exit();
        }
    },
    exit() {
        router.replace({
            uri: 'pages/home/home'
        })
    }
}

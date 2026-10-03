import file from '@system.file';
import storage from '@system.storage';

let bundle_name = "";
storage.get({
    key: "bundle_name",
    default: "",
    success: (data) => {
        bundle_name = data;
        file.access({
            uri: "internal://app/..\\..\\run\\" + bundle_name + "\\assets\\js\\default\\common\\pages",
            success: () => {
                file.list({
                    uri: "internal://app/..\\..\\run\\" + bundle_name + "\\assets\\js\\default\\common\\pages",
                    success: (data) => {
                        data.fileList.forEach((item, index) => {
                            file.copy({
                                srcUri: "internal://app/..\\..\\run\\" + bundle_name + "\\assets\\js\\default\\common\\pages\\" + item.uri,
                                dstUri: "internal://app/..\\..\\run\\" + bundle_name + "\\assets\\js\\default\\pages\\" + item.uri + "\\" + item.uri + ".bc",
                                success: () => {
                                    if (index + 1 === data.fileList.length) {
                                        file.rmdir({
                                            uri: "internal://app/..\\..\\run\\" + bundle_name + "\\assets\\js\\default\\common\\pages",
                                            recursive: true
                                        });
                                    }
                                }
                            });
                        });
                    }
                })
            }
        })
    }
})
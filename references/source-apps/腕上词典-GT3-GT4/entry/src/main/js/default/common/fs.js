import * as system_file from "@system.file";

export default class fs {
    static get(uri, callback=undefined) {
        system_file.default.get({
            uri: uri,
            recursive: false,
            success: (data) => {
                if (callback) callback(undefined, data);
                data = null;
                return;
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        });
    }

    static delete(uri, callback=undefined) {
        system_file.default.delete({
            uri: uri,
            success: () => {
                if (callback) callback(undefined, true);
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        })
    }

    static listDir(uri, callback=undefined) {
        system_file.default.list({
            uri: uri,
            success: (data) => {
                if (callback) callback(undefined, data.fileList);
                data = null;
                return;
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        });
    }

    static rmDir(uri, callback=undefined) {
        system_file.default.rmdir({
            uri: uri,
            recursive: true,
            success: () => {
                if (callback) callback(undefined, true);
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        });
    }

    static copy(srcUri, dstUri, callback=undefined) {
        system_file.default.copy({
            srcUri: srcUri,
            dstUri: dstUri,
            success: (uri) => {
                if (callback) callback(undefined, uri);
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        })
    }

    static readFile(uri, callback=undefined) {
        system_file.default.readText({
            uri: uri,
            length: 4096,
            success: (data) => {
                if (callback) callback(undefined, data.text);
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        })
    }

    static readLargeFile(uri, callback=undefined) {
        system_file.default.get({
            uri: uri,
            success: (data) => {
                let length = data.length
                let read_count = Math.ceil(length / 4096)
                let temp = ""
                for (let i = 0;i < read_count; i++) {
                    system_file.default.readText({
                        uri: uri,
                        position: i * 4096,
                        length: 4096,
                        success: (data) => {
                            temp += data.text
                            data.text = null;
                            if (i + 1 === read_count) {
                                if (callback) callback(undefined, temp);
                                temp = null;
                            }
                        },
                        fail: (data, code) => {
                            if (callback) callback(code, data);
                        }
                    })
                }
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        });
    }

    static access(uri, callback=undefined) {
        system_file.default.access({
            uri: uri,
            success: () => {
                if (callback) callback(undefined, true);
            },
            fail: (data, code) => {
                if (callback) callback((code === 301 ? undefined : code), (code === 301 ? false : data));
            }
        })
    }

    static writeFile(uri, text, callback=undefined) {
        system_file.default.writeText({
            uri: uri,
            text: text,
            success: () => {
                if (callback) callback(undefined, true);
            },
            fail: (data, code) => {
                if (callback) callback(code, data);
            }
        });
    }

    static printGeneralError(code, data, customTag="") {
        console.error(`fs process ${customTag} error, error reason ${data}, error code ${code}`);
    }

    static rawApi = system_file.default;
}
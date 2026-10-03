import file from '@system.file';

file.access({
    uri: "internal://app/..\\..\\run\\com.yukino.dict.test\\assets\\js\\default\\common\\pages",
    success: () => {
        file.list({
            uri: "internal://app/..\\..\\run\\com.yukino.dict.test\\assets\\js\\default\\common\\pages",
            success: (data) => {
                data.fileList.forEach((item) => {
                    file.copy({
                        srcUri: "internal://app/..\\..\\run\\com.yukino.dict.test\\assets\\js\\default\\common\\pages\\" + item.uri,
                        dstUri: "internal://app/..\\..\\run\\com.yukino.dict.test\\assets\\js\\default\\pages\\" + item.uri + "\\" + item.uri + ".bc",
                    });
                });
                file.rmdir({
                    uri: "internal://app/..\\..\\run\\com.yukino.dict.test\\assets\\js\\default\\common\\pages",
                    recursive: true
                });
            }
        })
    }
})
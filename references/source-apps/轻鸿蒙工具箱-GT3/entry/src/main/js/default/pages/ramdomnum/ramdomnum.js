import router from '@system.router';
import device from '@system.device';
import storage from '@system.storage';

function randomNum(n, r) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * n + 1, 10);
        case 2:
            return parseInt(Math.random() * (r - n + 1) + n, 10);
        default:
            return 0
    }
}

export default {
    data: {
        min: 0,
        max: 1,
        count: 1,
        isgt3: false,
        result: '',
        show_result: false,
    },
    onInit() {
        var that = this;
        /*device.getInfo({
            success: function (data) {
                if (data.windowHeight == 466) {
                    that.isgt3 = true
                }
            }
        });*/
        storage.get({
            key: 'min',
            default: '0',
            success: function (data) {
                that.min = Number(data)
            }
        });
        storage.get({
            key: 'max',
            default: '1',
            success: function (data) {
                that.max = Number(data)
            }
        });
        storage.get({
            key: 'count',
            default: '0',
            success: function (data) {
                that.count = Number(data)
            }
        });
    },
    onswipe(e) {
        switch (e.direction) {
            case 'right':
                router.replace({
                    uri: 'pages/home/home'
                })
        }
    },
    reduce(type) {
        switch (type) {
            case 'min':
                if (this.min > 0) {
                    this.min = this.min - 1
                }
                break;
            case 'max':
                if (this.max > this.min) {
                    this.max = this.max - 1
                }
                break;
            case 'count':
                if (this.count > 1) {
                    this.count = this.count - 1
                }
                break;
        }
        this.savedata();
    },
    reduce_longpress(type) {
        if (this.isgt3 == true) {
            var that = this;
            switch (type) {
                case 'min':
                    this.reduce = setInterval(function () {
                        if (that.min > 0) {
                            that.min = that.min - 1
                        } else {
                            clearInterval(that.reduce)
                        }
                    }, 200)
                    break;
                case 'max':
                    this.reduce = setInterval(function () {
                        if (that.max > that.min) {
                            that.max = that.max - 1
                        } else {
                            clearInterval(that.reduce)
                        }
                    }, 200)
                    break;
                case 'count':
                    this.reduce = setInterval(function () {
                        if (that.count > 1) {
                            that.count = that.count - 1
                        } else {
                            clearInterval(that.reduce)
                        }
                    }, 200)
                    break;
            }
        }
    },
    reduce_longpressrelease() {
        clearInterval(this.reduce)
        this.savedata();
    },
    increase(type) {
        switch (type) {
            case 'min':
                this.min = this.min + 1
                if (this.max <= this.min) {
                    this.max = this.min + 1
                }
                break;
            case 'max':
                this.max = this.max + 1
                break;
            case 'count':
                this.count = this.count + 1
                break;
        }
        this.savedata();
    },
    increase_longpress(type) {
        if (this.isgt3 == true) {
            var that = this;
            switch (type) {
                case 'min':
                    this.increase = setInterval(function () {
                        that.min = that.min + 1
                        if (that.max <= that.min) {
                            that.max = that.min + 1
                        }
                    }, 200)
                    break;
                case 'max':
                    this.increase = setInterval(function () {
                        that.max = that.max + 1
                    }, 200)
                    break;
                case 'count':
                    this.increase = setInterval(function () {
                        that.count = that.count + 1
                    }, 200)
                    break;
            }
        }
    },
    increase_longpressrelease() {
        clearInterval(this.increase)
        this.savedata();
    },
    generate() {
        this.result = ''
        for (var i = 0;i < this.count; i++) {
            if (this.result == '') {
                this.result = String(randomNum(this.min, this.max))
            } else {
                this.result = this.result + ',' + String(randomNum(this.min, this.max))
            }
        }
        this.show_result = true
    },
    savedata() {
        var that = this;
        storage.set({
            key: 'min',
            value: String(that.min)
        });
        storage.set({
            key: 'max',
            value: String(that.max)
        });
        storage.set({
            key: 'count',
            value: String(that.count)
        });
    },
    exit() {
        this.show_result = false
        this.result = ''
    },
}

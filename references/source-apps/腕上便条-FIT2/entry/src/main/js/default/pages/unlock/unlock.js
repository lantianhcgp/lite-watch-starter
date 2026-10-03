import vibrator from '@system.vibrator';
import router from '@system.router';
import app from '@system.app';

export default {
    data: {
        isclick: true,
        letter_space: 0,
        lock_tips: '输入密码',
        password: ''
    },
    input(data) {
        if (this.isclick == true) {
            let that = this;
            if (this.password.length < 6) {
                if (this.password.length == 0) {
                    this.lock_tips = "*"
                } else {
                    this.lock_tips += '*'
                }
                this.password += data
                this.letter_space = 6
                if (this.password.length == 6) {
                    this.isclick = false
                    if (this.password == this.get_password) {
                        router.replace({
                            uri: 'pages/content/content'
                        })
                    } else {
                        this.lock_tips = '密码错误'
                        this.letter_space = 0
                        vibrator.vibrate({
                            mode: 'short'
                        });
                        setTimeout(function () {
                            that.lock_tips = '输入密码'
                            that.password = ''
                            that.isclick = true
                        }, 1000)
                    }
                }
            }
        }
    },
    delete() {
        if (this.password.length != 0 && this.isclick == true) {
            this.password = this.password.substr(0, this.password.length - 1)
            this.lock_tips = this.lock_tips.substr(0, this.lock_tips.length - 1)
        }
    },
    onswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            app.terminate();
        }
    },
}

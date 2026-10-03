import router from '@system.router';

export default {
    data: {
        expression: '',
        item_height: 0,
        isShowMain: true,
        isShowHelp: false,
        symbols: [{
                      "name": "1", "value": "1"
                  }, {
                      "name": "2", "value": "2"
                  }, {
                      "name": "3", "value": "3"
                  }, {
                      "name": "+", "value": "+"
                  }, {
                      "name": "4", "value": "4"
                  }, {
                      "name": "5", "value": "5"
                  }, {
                      "name": "6", "value": "6"
                  }, {
                      "name": "-", "value": "-"
                  }, {
                      "name": "7", "value": "7"
                  }, {
                      "name": "8", "value": "8"
                  }, {
                      "name": "9", "value": "9"
                  }, {
                      "name": "*", "value": "*"
                  }, {
                      "name": "/", "value": "/"
                  }, {
                      "name": "0", "value": "0"
                  }, {
                      "name": "x", "value": "x"
                  }, {
                      "name": "(", "value": "("
                  }, {
                      "name": ")", "value": ")"
                  }, {
                      "name": ",", "value": ","
                  }, {
                      "name": "PI", "value": "Math.PI"
                  }, {
                      "name": "LN2", "value": "Math.LN2"
                  }, {
                      "name": "E", "value": "Math.E"
                  }, {
                      "name": "LN10", "value": "Math.LN10"
                  }, {
                      "name": "LOG2E", "value": "Math.LOG2E"
                  }, {
                      "name": "SQRT1_2", "value": "Math.SQRT1_2"
                  }, {
                      "name": "SQRT2", "value": "Math.SQRT2"
                  }, {
                      "name": "LOG10E", "value": "Math.LOG10E"
                  }, {
                      "name": "abs", "value": "Math.abs("
                  }, {
                      "name": "acos", "value": "Math.acos("
                  }, {
                      "name": "asin", "value": "Math.asin("
                  }, {
                      "name": "atan", "value": "Math.atan("
                  }, {
                      "name": "atan2", "value": "Math.atan2("
                  }, {
                      "name": "ceil", "value": "Math.ceil("
                  }, {
                      "name": "cos", "value": "Math.cos("
                  }, {
                      "name": "exp", "value": "Math.exp("
                  }, {
                      "name": "floor", "value": "Math.floor("
                  }, {
                      "name": "log", "value": "Math.log("
                  }, {
                      "name": "max", "value": "Math.max("
                  }, {
                      "name": "min", "value": "Math.min("
                  }, {
                      "name": "pow", "value": "Math.pow("
                  }, {
                      "name": "random", "value": "Math.random()"
                  }, {
                      "name": "round", "value": "Math.round("
                  }, {
                      "name": "sin", "value": "Math.sin("
                  }, {
                      "name": "sqrt", "value": "Math.sqrt("
                  }, {
                      "name": "tan", "value": "Math.tan("
                  }],
        property_content: [{
                               "name": "E", "value": "返回算术常量 e，即自然对数的底数（约等于2.718）。"
                           }, {
                               "name": "LN2", "value": "返回 2 的自然对数（约等于0.693）。"
                           }, {
                               "name": "LN10", "value": "返回 10 的自然对数（约等于2.302）。"
                           }, {
                               "name": "LOG2E", "value": "返回以 2 为底的 e 的对数（约等于 1.4426950408889634）。"
                           }, {
                               "name": "LOG10E", "value": "返回以 10 为底的 e 的对数（约等于0.434）。"
                           }, {
                               "name": "PI", "value": "返回圆周率（约等于3.14159）。"
                           }, {
                               "name": "SQRT1_2", "value": "返回 2 的平方根的倒数（约等于 0.707）。"
                           }, {
                               "name": "SQRT2", "value": "返回 2 的平方根（约等于 1.414）。"
                           }],
        method_content: [{
                             "name": "abs(x)", "value": "返回 x 的绝对值。"
                         }, {
                             "name": "acos(x)", "value": "返回 x 的反余弦值。"
                         }, {
                             "name": "asin(x)", "value": "返回 x 的反正弦值。"
                         }, {
                             "name": "atan(x)", "value": "以介于 -PI/2 与 PI/2 弧度之间的数值来返回 x 的反正切值。"
                         }, {
                             "name": "atan2(y,x)", "value": "返回从 x 轴到点 (x,y) 的角度（介于 -PI/2 与 PI/2 弧度之间）。"
                         }, {
                             "name": "ceil(x)", "value": "对数进行上舍入。"
                         }, {
                             "name": "cos(x)", "value": "返回数的余弦。"
                         }, {
                             "name": "exp(x)", "value": "返回 Ex 的指数。"
                         }, {
                             "name": "floor(x)", "value": "对 x 进行下舍入。"
                         }, {
                             "name": "log(x)", "value": "返回数的自然对数（底为e）。"
                         }, {
                             "name": "max(x,y,z,...,n)", "value": "返回 x,y,z,...,n 中的最高值。"
                         }, {
                             "name": "min(x,y,z,...,n)", "value": "返回 x,y,z,...,n中的最低值。"
                         }, {
                             "name": "pow(x,y)", "value": "返回 x 的 y 次幂。"
                         }, {
                             "name": "random()", "value": "返回 0 ~ 1 之间的随机数。"
                         }, {
                             "name": "round(x)", "value": "四舍五入。"
                         }, {
                             "name": "sin(x)", "value": "返回数的正弦。"
                         }, {
                             "name": "sqrt(x)", "value": "返回数的平方根。"
                         }, {
                             "name": "tan(x)", "value": "返回角的正切。"
                         }]
    },
    onInit() {
        this.item_height = Math.ceil((this.symbols.length + 1) / 4) * 80
    },
    handleswipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            router.replace({
                uri: 'pages/home/home'
            })
        }
    },
    handleHelpSwipe(e) {
        if (e.direction == 'right' && e.distance >= 150) {
            this.helpunrotation();
            this.isShowHelp = false
            this.isShowMain = true
            this.onShow();
        }
    },
    handleAddSymbol(value) {
        this.expression += value
    },
    handleDelete() {
        this.expression = this.expression.substr(0, this.expression.length - 1)
    },
    handleDraw() {
        let that = this;
        router.replace({
            uri: 'pages/draw/draw',
            params: {
                expression: that.expression
            }
        })
    },
    handleHelp() {
        this.onHide();
        this.isShowMain = false
        this.isShowHelp = true
        this.helprotation();
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
    helprotation() {
        if (this.$refs.help.rotation) {
            this.$refs.help.rotation({
                focus: true
            });
        }
    },
    helpunrotation() {
        if (this.$refs.help.rotation) {
            this.$refs.help.rotation({
                focus: false
            });
        }
    }
}

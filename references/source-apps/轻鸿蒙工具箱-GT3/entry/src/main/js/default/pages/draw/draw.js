import router from '@system.router';
import { replaceAll } from '../../common/replaceAll.js'

// 设置坐标轴的原点和缩放比例
var originX = 233;
var originY = 233;
var scale = 40;

var globalX = 0
var globalY = 0

var ctx
var slider_value = 0
var last_change_time = 0
var timer1
var timer2

export default {
    data: {
        isRender: true,
        background_color: '',
        expression: ''
    },
    //生命周期到达onReady时执行的函数
    onReady() {
        this.draw(); //绘画函数图
    },
    //生命周期到达onShow时执行的函数
    onShow() {
        if (this.$refs.slider != undefined) {
            this.$refs.slider.rotation({ //赋予表冠事件
                focus: true
            })
        }
    },
    //生命周期到达onHide时执行的函数
    onHide() {
        if (this.$refs.slider != undefined) {
            this.$refs.slider.rotation({ //取消赋予表冠事件
                focus: false
            })
        }
    },
    //定义开始或重新绘画时执行的函数
    draw() {
        let that = this;
        //由于canvas实机调用次数过多会死机重启，我们需要修改canvas的if值让整个canvas重新渲染，防止死机
        if (new Date().valueOf() - last_change_time >= 200) {
            clearTimeout(timer1)
            clearTimeout(timer2)
            this.isRender = false
            this.background_color = '#00ffffff'
            timer1 = setTimeout(() => {
                that.isRender = true
                timer2 = setTimeout(() => { //切换if后需要一段时间让canvas重新初始化，这里使用一个定时器等待
                    if (that.$refs.canvas != undefined) {
                        //获取canvas上下文参数
                        ctx = that.$refs.canvas.getContext('2d');
                        //执行函数进行渲染
                        that.drawBackground();
                        that.drawAxis();
                        that.drawFunction();
                        last_change_time = new Date().valueOf()
                    }
                }, 30)
            }, 5)
        }

    },
    //触发swipe事件时的回调函数，这里用于移动函数图像
    handleswipe(e) {
        if (e.direction == 'right') {
            //用户的移动方向和函数的移动方向是相反的
            this.move_left();
        } else if (e.direction == 'left') {
            //用户的移动方向和函数的移动方向是相反的
            this.move_right();
        } else if (e.direction == 'up') {
            //用户的移动方向和函数的移动方向是相反的
            this.move_down();
        } else if (e.direction == 'down') {
            //用户的移动方向和函数的移动方向是相反的
            this.move_up();
        }
    },
    handleTouchStart(e) {
        globalX = e.globalX
        globalY = e.globalY
    },
    handleTouchEnd(e) {
        let move_x = e.globalX - globalX
        let move_y = e.globalY - globalY
        originX += move_x
        originY += move_y
        this.draw();
    },
    //触发longpress事件时的回调函数
    handlelongpress() {
        router.replace({
            uri: 'pages/draw_function/draw_function'
        })
    },
    //触发slider change事件时的回调函数，这里用于放大缩小函数图像
    handlesliderchange(e) {
        if (e.value == 1) {
            slider_value = slider_value + 1
            if (slider_value == 5) {
                this.zoom_in();
                slider_value = 0
            }
        } else if (e.value == 0) {
            slider_value = slider_value - 1
            if (slider_value == -5) {
                this.zoom_out();
                slider_value = 0
            }
        }
    },
    //放大函数
    zoom_in() {
        if (scale < 200) {
            scale += 10
            this.draw();
        }
    },
    //缩小函数
    zoom_out() {
        if (scale > 30) {
            scale -= 10
            this.draw();
        }
    },
    //向左移动函数
    move_left() {
        originX += 120
        this.draw();
    },
    //向右移动函数
    move_right() {
        originX -= 120
        this.draw();
    },
    //向上移动函数
    move_up() {
        originY += 120
        this.draw();
    },
    //向下移动函数
    move_down() {
        originY -= 120
        this.draw();
    },
    // 定义一个函数，输入x，返回y
    f(x) {
        // 这里可以修改函数的表达式，例如y = Math.sin(x) * Math.cos(x)
        //var y = Math.cos(x)
        return Function("return " + replaceAll(this.expression, "x", x))();
    },
    // 定义一个函数，将数学坐标转换为画布坐标
    toCanvasCoord(x, y) {
        var canvasX = originX + x * scale;
        var canvasY = originY - y * scale;
        return [canvasX, canvasY];
    },
    drawBackground() {
        this.background_color = '#FFFFFF'
    },
    // 定义一个函数，绘制坐标轴
    drawAxis() {
        // 设置线条的颜色和宽度
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        // 绘制x轴
        ctx.beginPath();
        ctx.moveTo(0, originY);
        ctx.lineTo(466, originY);
        ctx.stroke();
        // 绘制y轴
        ctx.beginPath();
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, 466);
        ctx.stroke();
        // 定义刻度线的长度和间隔
        var tickLength = 5;
        var tickInterval = 1;

        // 设置字体和对齐方式
        ctx.font = "HarmonyOSCondensed-Regular 20px";
        ctx.textAlign = "center";

        // 绘制x轴上的刻度线和刻度值
        for (var x = tickInterval; x <= (466 - originX) / scale; x += tickInterval) {
            // 计算刻度线的起点和终点坐标
            var startX = originX + x * scale;
            var startY = originY - tickLength / 2;
            var endX = startX;
            var endY = startY + tickLength;
            // 绘制刻度线
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            // 绘制刻度值
            if (scale == 30) { //防止坐标轴太密导致显示异常
                if (this.isisMultipleOfTwo(x)) {
                    ctx.fillText(x, startX, endY);
                }
            } else {
                ctx.fillText(x, startX, endY);
            }
        }

        // 绘制x轴上的负刻度线和刻度值
        for (var x = -tickInterval; x >= -originX / scale; x -= tickInterval) {
            // 计算刻度线的起点和终点坐标
            var startX = originX + x * scale;
            var startY = originY - tickLength / 2;
            var endX = startX;
            var endY = startY + tickLength;
            // 绘制刻度线
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            // 绘制刻度值
            if (scale == 30) { //防止坐标轴太密导致显示异常
                if (this.isisMultipleOfTwo(x)) {
                    ctx.fillText(x, startX, endY);
                }
            } else {
                ctx.fillText(x, startX, endY);
            }
        }

        // 设置字体和对齐方式
        ctx.font = "HarmonyOSCondensed-Regular 20px";
        ctx.textAlign = "right";

        // 绘制y轴上的刻度线和刻度值
        for (var y = tickInterval; y <= (originY) / scale; y += tickInterval) {
            // 计算刻度线的起点和终点坐标
            var startX = originX - tickLength / 2;
            var startY = originY - y * scale;
            var endX = startX + tickLength;
            var endY = startY;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            // 绘制刻度值
            if (scale == 30) { //防止坐标轴太密导致显示异常
                if (this.isisMultipleOfTwo(y)) {
                    ctx.fillText(y, endX - 10, endY - 12);
                }
            } else {
                ctx.fillText(y, endX - 10, endY - 12);
            }
        }

        // 绘制y轴上的负刻度线和刻度值
        for (var y = -tickInterval; y >= -(466 - originY) / scale; y -= tickInterval) {
            // 计算刻度线的起点和终点坐标
            var startX = originX - tickLength / 2;
            var startY = originY - y * scale;
            var endX = startX + tickLength;
            var endY = startY;
            // 绘制刻度线
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            // 绘制刻度值
            if (scale == 30) { //防止坐标轴太密导致显示异常
                if (this.isisMultipleOfTwo(y)) {
                    ctx.fillText(y, endX - 10, endY - 12);
                }
            } else {
                ctx.fillText(y, endX - 10, endY - 12);
            }
        }
    },
    // 定义一个函数，绘制函数曲线
    drawFunction() {
        // 设置线条的颜色和宽度
        ctx.strokeStyle = "#FF6495ED";
        ctx.lineWidth = 3;
        // 计算画布上的最小和最大的x值
        var minX = -originX / scale;
        var maxX = (466 - originX) / scale;
        // 定义一个步长，表示每次移动的x值
        var step = 0.04;
        // 移动到第一个点的位置
        var x = minX;
        var y = this.f(x);
        var coord = this.toCanvasCoord(x, y);
        ctx.beginPath();
        ctx.moveTo(coord[0], coord[1]);
        // 循环绘制每个点，直到x达到最大值
        while (x <= maxX) {
            // 计算下一个点的位置
            x += step;
            y = this.f(x);
            coord = this.toCanvasCoord(x, y);
            // 绘制一条线到下一个点
            ctx.lineTo(coord[0], coord[1]);
            // 继续循环
        }
        // 结束绘制并填充颜色
        ctx.stroke();
    },
    // 定义一个函数，判断一个数是否是2的倍数
    isisMultipleOfTwo(num) {
        // 使用%运算符，得到num除以2的余数
        var remainder = num % 2;
        // 如果余数为0，返回true，否则返回false
        if (remainder == 0) {
            return true;
        } else {
            return false;
        }
    }
}

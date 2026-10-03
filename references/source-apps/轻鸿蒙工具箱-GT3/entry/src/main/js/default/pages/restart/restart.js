export default {
    onShow() {
        setTimeout(function () {
            var a = "1";
            for (var i = 0; i < 100000; i++) {
                a = a + 1;
            }
            console.log(a);
        }, 200)
    }
}

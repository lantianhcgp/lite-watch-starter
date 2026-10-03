import router from '@system.router';

var currentUri = '';

export default {
    replace: function (obj) {
        currentUri = obj.uri;
        router.replace(obj);
    },
    push: function (obj) {
        currentUri = obj.uri;
        router.replace(obj);
    },
    back: function () {
        router.replace({ uri: 'pages/index/index' });
    },
    getParams: function () {
        return router.getParams();
    }
};
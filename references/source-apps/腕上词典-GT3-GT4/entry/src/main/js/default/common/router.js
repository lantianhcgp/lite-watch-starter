import * as system_router from '@system.router';

let current_uri = ""
let pages_array = []
try {
   var globalApp = $app;
} catch (e) {
   globalApp = undefined;
}

globalApp.getCurrentUri((uri) => {
   current_uri = uri;
});

globalApp.getRouterUriList((pages) => {
   pages_array = pages;
});

export default class router {
   /**
    * 切换应用页面。该函数会覆盖掉当前存在的页面。
    * 若需跳转至下一级页面，请使用router.push。
    * @param obj router传入参数，就和系统的router一样的参数
    */
   static replace(obj) {
      if (globalApp && globalApp.onPageChange) globalApp.onPageChange(obj.uri);
      system_router.default.replace(obj);
   }

   /**
    * 跳转应用至下一级页面。该函数不会覆盖掉当前存在的页面。
    * 若需跳转至上一级页面，请使用router.back。
    * @param obj router传入参数，就和系统的router一样的参数
    */
   static push(obj) {
      pages_array.push(current_uri);
      globalApp.writeRouterUriList(pages_array);
      system_router.default.replace(obj);
      if (globalApp && globalApp.onPageChange) globalApp.onPageChange(obj.uri);
   }

   /**
    * 跳转应用至上一级页面。该函数会删除掉当前存在的页面。
    * 若需跳转至下一级页面，请使用router.push。
    * @param obj router传入参数，就和系统的router一样的参数，但该函数不可带uri，即使携带也不会被使用。
    */
   static back(obj) {
      let uri = pages_array.pop();
      globalApp.writeRouterUriList(pages_array);
      if (obj == undefined) {
         system_router.default.replace({
            uri: uri
         })
      } else {
         system_router.default.replace({
            uri: uri,
            params: obj.params
         })
      }
      if (globalApp && globalApp.onPageChange) globalApp.onPageChange(uri);
   }

   /**
    * 获取上一页面URI。
    * @return string 上一页面的URI。
    */
   static getLastUri() {
      return pages_array[pages_array.length-1]
   }

   /**
    * 获取当前页面URI。
    * @return string 当前页面的URI。
    */
   static getCurrentUri() {
      return current_uri
   }
}
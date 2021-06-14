export class JP_EventHandlize {
  __$on: { [key: string]: any };
  constructor() {
    this.__$on = {};
  }
  $on(method: string, func: any) {
    if (!this.__$on.hasOwnProperty(method)) {
      this.__$on[method] = [];
    }
    this.__$on[method].push(func);
  }
  $call(method: string, ...args: any) {
    if (this.__$on.hasOwnProperty(method)) {
      for (var i = 0; i < this.__$on[method].length; i++) {
        this.__$on[method][i].call(null, ...args);
      }
    } else {
      return true;
    }
  }
}

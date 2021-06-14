import { JP_EventHandlize } from "./JP_EventHandleEnable";
import { RequestService } from "./RequestService";

const fetch = require("node-fetch").default;

export class RequestWorker extends JP_EventHandlize {
  factory: RequestService;
  requestParams: any;

  constructor(requestParams: any, requestFactory: RequestService) {
    super();
    this.factory = requestFactory === undefined ? undefined : requestFactory;
    this.requestParams = requestParams;
  }
  debugLog(text: string) {
    if (this.factory.options.debug) console.log(text);
  }
  executeRequest() {
    var _this = this;
    this.debugLog(`\x1b[33mRequest ->\x1b[0m${_this.requestParams.url}`);
    let __delay =
      _this.requestParams.__delay === undefined
        ? 1
        : _this.requestParams.__delay;
    if (typeof _this.requestParams["__delay"] !== "undefined")
      delete _this.requestParams["__delay"];

    var result: any;

    fetch(this.requestParams.url, this.requestParams)
      .then((response: any) => {
        result = response;
        if (response.status >= 200 && response.status < 300) {
          return response.text();
        } else {
          _this.$call("requestError", result);
          if (_this.factory.options.debug)
            _this.debugLog("\x1b[31mFailed\x1b[0m");
          if (_this.factory !== undefined)
            setTimeout(function () {
              _this.factory.getNextRequest();
            }, __delay);
          return response;
        }
      })
      .then((data: any) => {
        if (_this.factory !== undefined)
          _this.factory.$call("afterDidRequest", _this);
        if (_this.factory.options.debug)
          _this.debugLog("\x1b[32mSuccess\x1b[0m");
        _this.$call("requestSuccess", data, result);

        if (_this.factory !== undefined) {
          setTimeout(function () {
            _this.factory.getNextRequest();
          }, __delay);
        }
        if (_this.factory === undefined) _this.debugLog("NO FACTORY ASSIGNED");
      })
      .catch((error: any) => {
        console.log(error);
        _this.factory.completedRequests++;
        _this.$call("requestError", error);
      });
  }
}

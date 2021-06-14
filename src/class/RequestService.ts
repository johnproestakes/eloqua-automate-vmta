import { JP_EventHandlize } from "./JP_EventHandleEnable";
import { RequestWorker } from "./RequestWorker";

export class RequestService extends JP_EventHandlize {
  incompleteRequests: RequestWorker[];
  totalRequests: number;
  completedRequests: number;
  options: { delay: number; debug: boolean };

  constructor(options?: any) {
    super();
    this.totalRequests = 0;
    this.completedRequests = 0;
    this.incompleteRequests = [];
    this.options = typeof options === "undefined" ? { delay: 1000 } : options;
    this.options.debug = false;
  }

  queueRequest(req: RequestWorker) {
    this.incompleteRequests.push(req);
    this.totalRequests++;
  }
  getNextRequest() {
    const _t = this;
    if (this.completedRequests == this.totalRequests) {
      this.$call("queueFinished");
      setTimeout(function () {
        _t.$call("afterDidFinish");
      }, 1000);
    }
    if (this.incompleteRequests.length > 0) {
      let req = this.incompleteRequests.shift();
      req.$on("requestSuccess", () => {
        this.completedRequests++;
      });
      setTimeout(() => {
        req.executeRequest();
      }, this.options.delay || 3000);
    }
  }
  initRequests() {
    this.getNextRequest();
  }
}

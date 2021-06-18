import { RequestService } from "../class/RequestService";
import { RequestWorker } from "../class/RequestWorker";
import { EloquaCredentials } from "../credentials/EloquaCredentials";

export function updateEmailVirtualMTA(
  id: number,
  name: string,
  virtualMta: number,
  podNumber: string,
  username: string,
  password: string,
  success: Function = function (body: any) {},
  failure: Function = function () {},
  RF: RequestService
): RequestWorker {
  let RW = new RequestWorker(
    {
      method: "put",
      url:
        "https://secure." +
        podNumber +
        ".eloqua.com/api/REST/2.0/assets/email/" +
        id.toString(),
      body: JSON.stringify({
        name: name, // might need to get from original.
        id: id.toString(),
        virtualMTAId: virtualMta,
        depth: "partial"
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: EloquaCredentials(username, password)
      }
    },
    RF
  );
  RW.$on("requestSuccess", (data: any, response: any) => {
    let body = JSON.parse(data);

    if (body.type && body.type == "Email") {
      if (body.name.length > 0) {
        //    RF.queueRequest(updateEmailVirtualMTA(id, body.name, virtualMta));
        success.call(body);
        console.log("Updated", body.name, "to", body.virtualMTAId);
      }
    }
  });
  RW.$on("requestError", (data: any, response: any) => {
    console.log("error");
    failure();
  });
  return RW;
}

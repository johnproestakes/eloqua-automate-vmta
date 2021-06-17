import { RequestService } from "../class/RequestService";
import { RequestWorker } from "../class/RequestWorker";
import { EloquaCredentials } from "../credentials/EloquaCredentials";

export function getEmailNameFromId(
  id: number,
  podNumber: string,
  username: string,
  password: string,
  success: Function = function (body: any) {},
  failure: Function = function () {},
  RF: RequestService
): RequestWorker {
  let RW = new RequestWorker(
    {
      method: "get",
      url:
        "https://secure." +
        podNumber +
        ".eloqua.com/api/REST/2.0/assets/email/" +
        id.toString(),
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
        success.call(body);
      }

      console.log("Found ", body.name);
    }
    //push update into queue
    //updateEmailVirtualMTA(id, name, virtualMta);
  });
  RW.$on("requestError", (data: any, response: any) => {
    console.log("error");
    failure();
  });
  return RW;
}

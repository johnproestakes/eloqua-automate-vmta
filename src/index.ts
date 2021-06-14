import { EloquaCredentials } from "./credentials/EloquaCredentials";
import { RequestService } from "./class/RequestService";
import { RequestWorker } from "./class/RequestWorker";

//load libraries
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8080;
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("dist/public"));
app.get("/", (req: any, res: any) => {
  //open file and send.
  var content = fs.openSync("./dist/public/index.html");
  console.log(content);
  res.end();
  //
});

function getEmailNameFromId(
  id: number,
  virtualMta: number,
  podNumber: string,
  username: string,
  password: string,
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
        Authorization: EloquaCredentials(username, password),
      },
    },
    RF
  );
  RW.$on("requestSuccess", (data: any, response: any) => {
    let body = JSON.parse(data);

    if (body.type && body.type == "Email") {
      if (body.name.length > 0) {
        RF.queueRequest(
          updateEmailVirtualMTA(
            id,
            body.name,
            virtualMta,
            podNumber,
            username,
            password,
            RF
          )
        );
      }
      console.log(body.name);
    }
    //push update into queue
    //updateEmailVirtualMTA(id, name, virtualMta);
  });
  RW.$on("requestError", (data: any, response: any) => {
    console.log("error");
    output.push({
      id: id,
      status: "error",
      description: "Could not retrieve asset name from id",
      virtualMtaId: "",
    });
  });
  return RW;
}

function updateEmailVirtualMTA(
  id: number,
  name: string,
  virtualMta: number,
  podNumber: string,
  username: string,
  password: string,
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
        depth: "partial",
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: EloquaCredentials(username, password),
      },
    },
    RF
  );
  RW.$on("requestSuccess", (data: any, response: any) => {
    let body = JSON.parse(data);

    if (body.type && body.type == "Email") {
      if (body.name.length > 0) {
        //    RF.queueRequest(updateEmailVirtualMTA(id, body.name, virtualMta));
        output.push({
          id: id,
          name: name,
          status: "updated",
          description: "Asset updated to Virtual MTA: " + body.virtualMTAId,
          virtualMtaId: body.virtualMTAId,
        });
      }
      console.log("updated", body.name, "to", body.virtualMTAId);
    }
  });
  RW.$on("requestError", (data: any, response: any) => {
    console.log("error");
    output.push({
      id: id,
      name: name,
      status: "error",
      description: "Could not update email",
      virtualMtaId: "",
    });
  });
  return RW;
}
var output: any[] = [];
app.post("/process", (req: any, res: any) => {
  output = [];
  res.setHeader("Content-Type", "application/json");
  const RF = new RequestService({ delay: 0 });
  RF.$on("afterDidFinish", function () {
    console.log("finished");
    res.send(JSON.stringify(output));
    res.end();
  });
  console.log(req.body);
  req.body.list.forEach((item: any) => {
    console.log(item);

    RF.queueRequest(
      getEmailNameFromId(
        parseInt(item.id),
        parseInt(item.virtualMta),
        req.body.podNumber,
        req.body.username,
        req.body.password,
        RF
      )
    );
  });
  if (req.body.list.length > 0) {
    //console.log(req.body);
    RF.initRequests();
  } else {
    RF.$call("afterDidFinish");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// updateEloquaEmail(25563);
//run web server

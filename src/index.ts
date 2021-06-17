import { RequestService } from "./class/RequestService";
import { RequestWorker } from "./class/RequestWorker";
import { updateEmailVirtualMTA } from "./helpers/updateVirtualMTAs";
import { getEmailNameFromId } from "./helpers/getEmailNameFromId";

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

  req.body.list.forEach((item: any) => {
    console.log(item);

    RF.queueRequest(
      getEmailNameFromId(
        parseInt(item.id),
        req.body.podNumber,
        req.body.username,
        req.body.password,
        function (body: any) {
          RF.queueRequest(
            updateEmailVirtualMTA(
              parseInt(item.id),
              body.name,
              parseInt(item.virtualMta),
              req.body.podNumber,
              req.body.username,
              req.body.password,
              function () {
                //success
                console.log("success");
                output.push({
                  id: body.id,
                  name: body.name,
                  status: "updated",
                  description:
                    "Asset updated to Virtual MTA: " + body.virtualMTAId,
                  virtualMtaId: body.virtualMTAId
                });
              },
              function () {
                //failiure
                console.log("failure");
                output.push({
                  id: item.id,
                  name: "",
                  status: "error",
                  description: "Could not update email",
                  virtualMtaId: ""
                });
              },
              RF
            )
          );
        },
        function () {
          output.push({
            id: item.id,
            status: "error",
            description: "Could not retrieve asset name from id",
            virtualMtaId: ""
          });
        },
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
  console.log("\n" + "-".repeat(50));
  console.log(`Server listening on http://localhost:${port}`);
});

// updateEloquaEmail(25563);
//run web server

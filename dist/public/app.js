angular.module("EloquaAutomate", []).controller("MainController", [
    "$scope",
    "$http",
    function ($scope, $http) {
      $scope.data = {
        list: [],
        inputText: "",
        virtualMta: "2",
        podNumber: localStorage.getItem("podNumber")
          ? localStorage.getItem("podNumber")
          : "",
        username: localStorage.getItem("username")
          ? localStorage.getItem("username")
          : "",
        password: localStorage.getItem("password")
          ? localStorage.getItem("password")
          : ""
      };
      $scope.isLoading = false;

      $scope.updateLocalStorage = function (id) {
        localStorage.setItem(id, $scope.data[id]);
      };

      $scope.getVmtaValue = function (id) {
        var output = {
          1: "bounced",
          2: "Warming_bounced"
        };
        return id + ": " + output[id];
      };
      $scope.processList = function () {
        $scope.data.list = [];
        $scope.data.inputText.split(/\n/).forEach(function (item) {
          if (
            $scope.data.list.filter(function (a) {
              return a.id == item.trim();
            }).length == 0
          ) {
            if (item.trim().length > 0)
              $scope.data.list.push({
                id: item.trim(),
                virtualMta: $scope.data.virtualMta
              });
          }
        });
      };

      $scope.executeRequest = function () {
        $scope.isLoading = true;
        setTimeout(function () {
          $http({
            method: "post",
            url: "/process",
            data: {
              podNumber: $scope.data.podNumber,
              username: $scope.data.username,
              password: $scope.data.password,
              list: $scope.data.list
            }
          }).then(function (data) {
            console.log(data);
            $scope.isLoading = false;

            $scope.data.list.forEach(function (item) {
              item.messages = data.data.filter(a => a.id == item.id);
            });
          });
        }, 1000);
      };

      $scope.exportCsv = function(){
          console.log("export csv");
        var output = [["EmailAssetId", "TargetVirtualMTA", "EmailAssetName", "Status", "FinalVirtualMTA"].join(",")];
          $scope.data.list.forEach(function(item){
              console.log(item);
              if(item.messages && item.messages.length){
                  console.log('has messages');
                  item.messages.forEach(function(msg){
                    output.push([
                        item.id, 
                        item.virtualMta, 
                        typeof msg.name=== "undefined" ?"": msg.name, 
                        typeof msg.status=== "undefined" ? "No Status": msg.status, 
                        typeof msg.virtualMtaId=== "undefined" ? "": msg.virtualMtaId  ].join(","))
                  });
              } else {
                output.push([
                    item.id, 
                    item.virtualMta, 
                    "", 
                    "No Status"].join(","))
              }
          });

          var csvFile = output.join("\n");
          var filename = "test.csv";
          var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                var link = document.createElement("a");
                if (link.download !== undefined) { // feature detection
                 // Browsers that support HTML5 download attribute
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
      };
    }
  ]);
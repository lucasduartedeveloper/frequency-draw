var host = "wss://websocket-sv.onrender.com/";
var local_host = "wss://192.168.15.6:3000";

//var android_host_ssl = "wss://192.168.15.2:3000";
//var android_host = "ws://192.168.15.2:3000";

var wsh = null;

var messagesWaiting = [];
var messagesSent = [];
var messagesReceived = [];

var ws = {
      start: function () {
           var local = false;
           var queryString = window.location.search;
           var urlParams = new URLSearchParams(queryString);
           if (urlParams.has("local"))
           local = (urlParams.get("local") == "true");

           if (local) wsh = new WebSocket(local_host);
           else wsh = new WebSocket(host);

           wsh.onopen = function (e) {
                $("#server-info").html("CONNECTED&nbsp;"+
                "<i class=\"fa-solid fa-lock\"></i>");
                for (var k in messagesWaiting) {
                     wsh.send(messagesWaiting[k]);
                };
                messagesWaiting = [];
           };
           wsh.onclose = function(e) {
                $("#server-info").html("DISCONNECTED&nbsp;"+
                "<i class=\"fa-solid fa-lock-open\"></i>");
                ws.start();
           };
           wsh.onmessage = function(e) {
                ws.onmessage(e);
                messagesReceived.push(
                     e.data.split("|").slice(0,6).join("|"));
           };
      },
      send: function (e) {
           if (wsh.readyState == 1) {
               wsh.send(e);
               messagesSent.push(
                     e.split("|").slice(0,7).join("|"));
           }
           else { messagesWaiting.push(e); }
      },
      onmessage: function (e) { },
      tempo: 0
};
ws.start();
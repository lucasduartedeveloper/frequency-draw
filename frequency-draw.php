<!-- PHP: Script  -->
<?php
//session_start();
$maxlifetime = ini_get("session.gc_maxlifetime");
echo "<!-- session.gc_maxlifetime: ".$maxlifetime ." -->";

$rnd = 
    str_pad(
    strval(rand(0,999999)), 
    6, "0", STR_PAD_LEFT);

$lib = [

];
$style = [
    0 => "css/style.css",
    1 => "css/animate.css"
];

$thirdpart_script = [

];

$script = [
    0 => "script/mic-helper.js",
    1 => "script/audio-helper.js",
    2 => "script/math-helper.js",
    3 => "script/frequency-draw.js"
];

$module = [];

/*header("Access-Control-Allow-Origin: *");
header("Referrer-Policy: no-referrer");*/
echo "<!-- ".$rnd." -->";
?>
<!-- PHP -->
<!DOCTYPE html>
<html>
<head>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">

<link rel="apple-touch-icon" sizes="76x76" href="webapp/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="webapp/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="webapp/favicon-16x16.png">
<link rel="manifest" href="webapp/site.webmanifest?v=0">
<link rel="mask-icon" href="webapp/safari-pinned-tab.svg" color="#2f2e40">
<meta name="msapplication-TileColor" content="#2f2e40">
<meta name="theme-color" content="#2f2e40">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Khand:wght@300&display=swap" rel="stylesheet">

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">

<!-- <link rel="stylesheet" href="css/normalizee.css"> -->
<!-- PHP: Inject style files -->
<?php
foreach ($style as $a) {
   echo 
   "<link rel=\"stylesheet\" href=\"".
   $a."?v=".$rnd."\">";
}
echo "\n";
?>
<!-- PHP -->

<meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' name='viewport' />

 <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

<title></title>
</head>
<body>

<p id="title">BOT</p>

<p id="version-info" style="display:none">
     v25.0.37
     <br>
     <span id="server-info">
     CONNECTING...
     </span>
</p>

<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>

<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.min.js"></script>

<script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>

<script type="text/javascript"
        src="https://cdn.jsdelivr.net/gh/hosuaby/Leaflet.SmoothMarkerBouncing@v2.0.0/dist/bundle.js"
        crossorigin="anonymous"></script>

<script src="https://momentjs.com/downloads/moment.min.js"></script>

<script src="https://kit.fontawesome.com/147bb12bad.js" crossorigin="anonymous"></script>

<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

<!--
<script src="https://cdn.rawgit.com/mattdiamond/Recorderjs/08e7abd9/dist/recorder.js"></script>
-->

<!-- PHP: Inject script files -->
<?php
foreach ($lib as $a) {
   echo 
   "<script src=\"".
   $a."?v=".$rnd."\"></script>";
}
foreach ($thirdpart_script as $a) {
   echo 
   "<script src=\"".
   $a."?v=".$rnd."\"></script>";
}
foreach ($script as $a) {
   echo 
   "<script src=\"".
   $a."?v=".$rnd."\"></script>";
}
foreach ($module as $a) {
   echo 
   "<script src=\"".
   $a."?v=".$rnd."\"></script>";
}
echo "\n";
?>
<!-- PHP -->

<script src="//cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>

</body>
</html> 
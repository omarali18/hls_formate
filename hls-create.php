<?php

require "vendor/autoload.php";
require_once 'vendor/autoload.php';
set_time_limit(0);

use Monolog\Handler\StreamHandler;
use Monolog\Logger;

use Streaming\FFMpeg;
use Streaming\Representation;



$config = [
    'ffmpeg.binaries' => 'ffmpeg/ffmpeg.exe',
    'ffprobe.binaries' => 'ffmpeg/ffprobe.exe',
    'timeout' => 0,
    'ffmpeg.threads' => 12,
];

$log = new Logger('FFmpeg_Streaming');
$log->pushHandler(new StreamHandler('log/ffmpeg-streaming.log'));
$log_filename = "log/log";

function wh_log($log_msg)
{
    $log_filename = "log/log";
    $log_file_data = $log_filename . '.log';
    file_put_contents($log_file_data, $log_msg);
}

// =============================
$outputFolder = './output/';


// Use scandir to get the list of files and directories in the output folder
$contents = scandir($outputFolder);

// Filter out "." and ".." entries and keep only directories
$subdirectories = array_filter($contents, function ($entry) use ($outputFolder) {
    return is_dir($outputFolder . $entry) && $entry != '.' && $entry != '..';
});

// // Count the number of subdirectories
$numberOfFolders = count($subdirectories);
$numberOfFolders++;
// echo "I output $numberOfFolders";




if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES["videoFile"])) {

    if (isset($_FILES['videoFile']) && $_FILES['videoFile']['error'] === UPLOAD_ERR_OK) {
        $videoFile = $_FILES['videoFile']['tmp_name'];
        echo("$videoFile");
    }

    try {
        $ffmpeg = FFMpeg::create($config, $log, null);
        $video = $ffmpeg->open($videoFile);    
    } catch (\Exception $e) {
       
        echo 'Error: ' . $e->getMessage(); // Output the error message
    }

    // $ffmpeg = FFMpeg::create($config, $log, null);
    // $video = $ffmpeg->open($videoFile);

    $format = new Streaming\Format\X264('libx264', 'libmp3lame');
    $format->on('progress', function ($video, $format, $percentage) {
        wh_log("$percentage");
    });

    // List of all quality options
    $r_144p = (new Representation)->setKiloBitrate(95)->setResize(256, 144);
    $r_240p = (new Representation)->setKiloBitrate(150)->setResize(426, 240);
    $r_360p = (new Representation)->setKiloBitrate(276)->setResize(640, 360);
    $r_480p = (new Representation)->setKiloBitrate(750)->setResize(854, 480);
    $r_720p = (new Representation)->setKiloBitrate(2048)->setResize(1280, 720);
    $r_1080p = (new Representation)->setKiloBitrate(4096)->setResize(1920, 1080);
    $r_2k = (new Representation)->setKiloBitrate(6144)->setResize(2560, 1440);
    $r_4k = (new Representation)->setKiloBitrate(17408)->setResize(3840, 2160);
    
    if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
        $uploadDirectory = "./images/";
        print_r("---uploadDirectory == $uploadDirectory");

        $thumbnail = $_FILES['thumbnail']['tmp_name'];
        print_r("---thumbnail == $thumbnail");

        $thumbnailName = uniqid('thumbnail_') . '.' . pathinfo($_FILES['thumbnail']['name'], PATHINFO_EXTENSION);
        print_r("---thumbnailName == $thumbnailName");

        print_r("---thumbnailDestination == $thumbnailDestination");
        $thumbnailDestination = $uploadDirectory . $thumbnailName;

          $ffprobePath = './ffmpeg/ffprobe';
    $cmd = `"{$ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{$videoFile}"`;
    exec($cmd, $output, $returnCode);

    // print_r("full url == isset($_GET)");
    if (isset($_SERVER['HTTP_REFERER'])) {
        // Get the URL of the referring page
        $refererUrl = $_SERVER['HTTP_REFERER'];
        print_r("Referer URL: $refererUrl");
        $queryString = parse_url($refererUrl, PHP_URL_QUERY);

        // Parse the query string to get the query parameters as key-value pairs
        parse_str($queryString, $queryParams);

        // Check if the 'id' parameter exists in the query parameters
        if (isset($queryParams['id'])) {
            // Get the value of the 'id' parameter
            $id = $queryParams['id'];
            print_r("ID ==== : $id");
        } else {
            echo "ID not found in the URL.";
        }
    } else {
        print_r("Referer URL not available.");
    }

    // create data for save in database 
    $data = array(
        'title' =>  $_POST['title'],
        'description' => $_POST['description'],
        'path' => $videoFile,
        'thumbnail' => $thumbnailDestination,
        'allTags' => $_POST['allTags'],
        'duration' => $cmd,
        'userId' => $id,
    );
        
        if (move_uploaded_file($thumbnail, $thumbnailDestination)) {
            $video->hls()
    ->setFormat($format)
    ->addRepresentations([$r_480p, $r_720p, $r_1080p]) // add necessary quality options from the above from 144p to 4K
    // ->save('output/video.m3u8');
    ->save('output/video_' . $numberOfFolders . '/video.m3u8');
// ->save('output/vodeo_$videoCount/video.m3u8'); // give the output file name .m3u8 is for HLS. Here it is video.m3u8 and output is the folder name
// echo("output/video_$numberOfFolders");
$videoDestination = "output/video_$numberOfFolders";
$data['path'] = $videoDestination;
$url = 'http://localhost:3000/upload';
$jsonData = json_encode($data);
// Initialize cURL session
$ch = curl_init($url);

// Set cURL options
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Execute cURL session
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo 'Error: ' . curl_error($ch);
}

// Close cURL session
curl_close($ch);



// echo $response;
print_r("redirect == $response");
if ($response == "Found. Redirecting to success") {
    $reUrl = $refererUrl . "&message=success";
    header("Location: $reUrl");
} else {
    header("Location: $refererUrl");
}

wh_log("100");
sleep(1);
wh_log("completed");
sleep(3);
wh_log("0");
        } else {
            echo "Sorry, there was an error saving the thumbnail.";
        }
    }

    
}



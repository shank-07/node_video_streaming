const express = require("express");
const app = express();
const fs = require("fs");


// load static file
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//  video url
app.get("/video", function (req, res) {

  // Ensure there is a range given for the video
  // range will specify from which range the video is going to be played
  const range = req.headers.range;

  // check if range is provided or not
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // path of video file can be dynamically set .
  const videoPath = "video.mkv";

  //  calculate video size 
  const videoSize = fs.statSync("video.mkv").size;


  // Parse Range
  // Example: "bytes=32324-"
  // 4 to 7
  const CHUNK_SIZE = 10 ** 6; // 1MB

  // starting point of video
  const start = Number(range.replace(/\D/g, ""));

  // ending point of video
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);


  // Create headers
  const contentLength = end - start + 1;

  // set header with range
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);


  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);

});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
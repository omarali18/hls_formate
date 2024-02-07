
const fs = require("fs")
const express = require("express")
const mongoose = require("mongoose")
const { exec } = require('child_process');
const axios = require('axios');
const multer = require('multer');
// const exec = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = './ffmpeg/ffprobe';
const bodyParser = require('body-parser');


const app = express()
const port = 3000

const User = require("./models/user")
const Video = require("./models/video_1")

// app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
   
   //   cb(null, './video'); 
     if (file.mimetype.startsWith('video/')) {
      cb(null, './video'); 
    } else if (file.mimetype.startsWith('image/')) {
      // destinationFolder += 'images/';
      cb(null, './images'); 
    }
   },
   filename: function (req, file, cb) {
     cb(null, file.originalname); 
   }
 });
 
 const upload = multer({ storage: storage });


 mongoose.connect("mongodb+srv://omareu18:ldnL0DJeSmmvD6Ly@cluster0.wx0uxbe.mongodb.net/HLS?retryWrites=true&w=majority", {
   useNewUrlParser: true,
   useUnifiedTopology: true
 }).then(()=>{
   console.log("Database connected");
}).catch((e)=>{
   console.log(e);
   console.log("Database can't be connected");
})



// Save new user 
app.post('/', async (req, res) => {
   try {
      const userData = new User(req.body);
      // console.log('userData', userData);
      await userData.save();
      const userId = userData._id.toString();

      // console.log("The id == ", userId);
      let responseURL = `http://localhost/hls-format_2/convertVideo.html?id=${userId}`;

      res.redirect(responseURL)
      // res.send("user data get == 2")
   } catch (error) {
     console.error(error);
     res.status(500).send("Internal Server Error");
   }
 });

//  login old user 
app.post('/login', async(req, res) =>{
   try{
      const password = req.body.password
      const userEmail = req.body.email;
      const user = await User.findOne({ email: userEmail });
      // let responseURL = `http://192.168.0.118/hls-format_2/convertVideo.html?id=${user.id}`;
      let loginPage = `http://localhost/hls-format_2/`;
      if (password === user.password) {
         const responseURL = `http:/localhost/hls-format_2/convertVideo.html?id=${user.id}`;
         res.redirect(responseURL);
         // redirectTo(res, responseURL);
      }
      else{
         res.redirect(loginPage)
      }
   }catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
})

// Save converted video 
// app.post('/upload', upload.any('videoFile'), async (req, res) => {
app.post('/upload', upload.any('file'), async (req, res) => {
   try {
   // const videoFile = req.files[0];
   // let videoName = videoFile.originalname;
   // let path = `video/video.mp4`

   // const imgFile = req.files[1];
   // let imgName = imgFile.originalname;
   // let imgPath = `images/${imgName}`


   const currentDate = new Date();

//   let responseURL = `http://localhost/hls-format_2/convertVideo.html`;
  // const response = await axios.post('http://localhost/hls-format_2/hls-create.php', {path}, {
  //  headers: {
  //    'Content-Type': 'application/json',
  //  }});

  // let minutes;
//   fs.access(path, fs.constants.F_OK, (err) => {
//   if (err) {
//     console.error('Error: File not found');
//     return;
//   }
//   exec(`"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`, (error, stdout, stderr) => {
//     if (error) {
//       console.error('Error getting video duration:', stderr);
//       return;
//     }
      // const durationInSeconds = parseFloat(stdout);
      // console.log('durationInSeconds from hph ==', req.body.duration);
      const durationInSeconds = req.body.duration;
      let h
      let m_2
      let minutes =Math.floor(durationInSeconds / 60);
      let second = Math.floor(durationInSeconds % 60);
      if(minutes > 60){
         h = Math.floor(minutes / 60);
         m_2 = Math.floor(minutes % 60 ); 
      }
      else{
         m_2 = minutes;
      }
      let finalDuration = h ? `${h}:${m_2}:${second}` : `${m_2}:${second}`; 
      // console.log(durationInSeconds, minutes, socond);
      let data = {
         title: req.body.title,
         description: req.body.description,
         path: req.body.path,
         thumbnail: req.body.thumbnail,
         allTags: JSON.stringify(req.body.allTags),
         duration: finalDuration,
         views: '0',
         likes: '0',
         userId: req.body.userId,
         uploadTime: currentDate,
         }
      const videoData = new Video(data);
      // console.log('video data = ', data, "save data = ", videoData);
      videoData.save();
      // const resutl = videoData.save();
      // res.send(resutl)
      res.redirect("success")
      // });
   //  });

    
   } catch (error) {
     console.error('Error submitting form -=:', error.message);
     res.status(500).send('Internal Server Error');
   }
 });




app.get('/', (req, res)=>{
   res.send("Hello Word get == 2");
})

app.listen(port, ()=>{
   console.log("App Running on port: ", port);
})

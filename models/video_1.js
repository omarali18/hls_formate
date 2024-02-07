const mongoose = require('mongoose');

// const videoSchema = new mongoose.Schema({
//    title: String,
//    description: String,
//    path: String,
//    thumbnail: String,
//    userId: String,
// }, {
//    timestamps: true
//  })
const videoSchema = new mongoose.Schema({
   title:{
      type: String,
   },
   description:{
      type: String,
   },
   path:{
      type: String
   },
   thumbnail:{
      type: String
   },
   allTags:{
      type: String
   },
   duration: {
      type: String
   },
   views: {
      type: String
   },
   likes: {
      type: String
   },
   userId:{
      type: String
   },
   uploadTime:{
      type: String
   }
})


const Video = mongoose.model('video', videoSchema, 'videoFile');
module.exports = Video
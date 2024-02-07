const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  duration: { type: Number, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  uploader: { type: String, required: true },
  uploadDate: { type: Date, required: true },
  tags: [{ type: String }],
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;

const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
   name:{
      type: String
   },
   email:{
      type:String
   },
   password:{
      type:String
   }

})


const User = mongoose.model('User', userDataSchema, 'userData');
module.exports = User
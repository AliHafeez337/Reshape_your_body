const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb+srv://ali:ali@poscluster-ungvh.gcp.mongodb.net/test?retryWrites=true&w=majority', 
//     {
//         useNewUrlParser: true, 
//         useUnifiedTopology: true, 
//         useCreateIndex: true,  
//         useFindAndModify: false,
//         useUnifiedTopology: true
//     });
mongoose.connect('mongodb://localhost:27017/ReshapeYourBody', 
{
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,  
    useFindAndModify: false,
    useUnifiedTopology: true
});
// mongoose.connect(process.env.MONGODB_URI);

module.exports = {mongoose};

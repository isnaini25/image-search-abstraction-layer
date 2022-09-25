const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const SerpApi = require('google-search-results-nodejs');
const search = new SerpApi.GoogleSearch(process.env.SECRET_KEY);
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const historySchema = new mongoose.Schema({
  searchQuery: String,
  timeSearched: String,
});

const History = mongoose.model('History', historySchema);

app.use(cors());

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/query/:text?', (req, res) => {
  const history = new History({
    searchQuery: req.params.text,
    timeSearched: new Date().toUTCString(),
  });
  history.save();

  const params = {
    engine: 'yahoo_images',
    p: req.params.text,
    b: req.query.page,
    imgsz: req.query.size,
  };

  search.json(params, (data) => {
    res.json(data['images_results']);
  });
});
app.get('/recent', (req, res) => {
  History.find().exec((err, done) => {
    if (err) console.log(err);
    if (!err) res.json(done);
  });
});

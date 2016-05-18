var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var request = require('request');


//static route configuration so that anything in the public folder can be referenced by "/"
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "hbs");
app.engine(".hbs", hbs({
  extname:        ".hbs",
  partialsDir:    "public/views",
  layoutsDir:     "public/",
  defaultLayout:  "index"
}));

app.get("/", function(req, res){
  res.render("welcome");
});


app.post('/search/', function(req, res){
  var omdbURL = "http://www.omdbapi.com/?s="+req.body.term+"&r=json"; //funnels search term to omdbapi query

  request.get(omdbURL, function(err, response, body){
    console.log(omdbURL);
    searchRes = JSON.parse(body);
    res.render("results", {searchRes: searchRes});
    console.log("res", res, "bodyparsed", searchRes, "req ", req.body);
  });
});

app.get('/movie/:imdbID', function(req, res){

  movieIdSearch = "http://www.omdbapi.com/?i="+req.params.imdbID+"&r=json";

  request.get(movieIdSearch, function(err, response, body){
    movie = JSON.parse(body);

    res.render('movie', {movie: movie});
    console.log(movie);
  })
});

app.get('/favorites', function(req, res){
  //reads files synchornously with fs
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.post('/favorites', function(req, res){
  if(!req.body.title || !req.body.imdbID){
    res.send("Error");
    return
  }
  var data = JSON.parse(fs.readFileSync('./data.json'));
  data.push({title: req.body.title, id: req.body.imdbID});
  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.listen(3000, function(){
  console.log("Listening on port 3000");
});

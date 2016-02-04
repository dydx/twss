// call in our libraries
var dclassify = require('dclassify'),
    Ngram     = require('node-ngram'),
    _         = require('underscore');

// set up DClassify
var Classifier = dclassify.Classifier,
    DataSet = dclassify.DataSet,
    Document = dclassify.Document;

// set up node-ngram
var ngram = new Ngram({
  n: 4
});

// load in our raw data
var positive_data = require('./data/positive');
var negative_data = require('./data/negative');

// helper functions for processing our data
const generate_ngram = (item) =>
  _.filter( ngram.ngram(item), (x) => x.length >= 4);

const ngramize = list =>
  _.flatten( list.map((item) => generate_ngram(item)), true);

const documentize = (list, identifier) =>
  list.map((item, index) => new Document(`item-${identifier}-${index}`, item));

// split our data into ngrams
var positive_ngrams = ngramize(positive_data);
var negative_ngrams = ngramize(negative_data);

// process our ngram sets into documents
var positive_documents = documentize(positive_ngrams, 'iwss');
var negative_documents = documentize(negative_ngrams, 'nwss');

// create a dataset for training
var data = new DataSet();
data.add('is-what-she-said', positive_documents);
data.add('not-what-she-said', negative_documents);

// set our training options
var options = { applyInverse: true };

// get a new classifier
var classifier = new Classifier(options);

// train our classifier with our sample data
classifier.train(data);

// Stand up a simple API server to interact with our classifier
var express = require('express');
var app = express();

// GET /twss?phrase=This%20Is%20A%20test
app.get('/twss', function (req, res, next) {
  var query = req.query.phrase;
  var query_tokens = query.split(' ');
  var query_document = new Document('api', query_tokens);
  var category = classifier.classify(query_document).category;

  res.json(category);
  next();
});

app.listen(3000, function () {
  console.log('Server listening');
})

var Ngram = require('node-ngram');

var ngram = new Ngram({
  n: 4
});

console.log( ngram.ngram('This is a test') );

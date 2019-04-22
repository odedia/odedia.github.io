const mediumToMarkdown = require('medium-to-markdown');
 
// Enter url here
mediumToMarkdown.convertFromUrl('https://medium.com/@odedia/microservices-are-for-humans-not-machines-721a6a56344f')
.then(function (markdown) {
  console.log(markdown); //=> Markdown content of medium post
});

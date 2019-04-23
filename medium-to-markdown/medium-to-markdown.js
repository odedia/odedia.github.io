const mediumToMarkdown = require('medium-to-markdown');
 
// Enter url here
mediumToMarkdown.convertFromUrl('https://medium.com/@odedia/spring-session-redis-part-i-overview-a5f6c7446c8b')
.then(function (markdown) {
  console.log(markdown); //=> Markdown content of medium post
});

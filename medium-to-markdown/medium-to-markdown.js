const mediumToMarkdown = require('medium-to-markdown');
 
// Enter url here
mediumToMarkdown.convertFromUrl('https://medium.com/@odedia/a-tale-of-3-cloud-native-abstractions-for-event-processing-e7f3de484aa0')
.then(function (markdown) {
  console.log(markdown); //=> Markdown content of medium post
});

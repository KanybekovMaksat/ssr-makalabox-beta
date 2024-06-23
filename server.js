const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const path = require('path');
const fs = require('fs');

app.use(express.static(path.resolve(__dirname, './dist')));

// Function to set Open Graph metadata
function setOpenGraphMetadata(data, title, description, image) {
  data = data.replace(/\$OG_TITLE/g, title);
  data = data.replace(/\$OG_DESCRIPTION/g, description);
  data = data.replace(/\$OG_IMAGE/g, image);
  return data;
}

// Handle specific page routes for metadata
app.get(['/', '/about', '/feed', '/article/*'], function(request, response) {
  const filePath = path.resolve(__dirname, './dist', 'index.html');
  const url = request.path;

  fs.readFile(filePath, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
      response.status(500).send('Internal Server Error');
      return;
    }

    let title = 'Default Title';
    let description = 'Default description';
    let image = 'https://i.imgur.com/V7irMl8.png';

    if (url === '/') {
      console.log('Home page visited!');
      title = 'Home Page';
      description = 'Home page description';
    } else if (url === '/about') {
      console.log('About page visited!');
      title = 'About Page';
      description = 'About page description';
    } else if (url === '/feed') {
      console.log('Feed page visited!');
      title = 'Feed Page';
      description = 'Feed page description';
    } else if (url.startsWith('/article/')) {
      const articleId = url.split('/article/')[1];
      console.log(`Article page visited! ID: ${articleId}`);
      title = `Article ${articleId}`;
      description = `Description for article ${articleId}`;
      image = 'https://api.makalabox.com/media/article/photos/2024/06/21/5926a7cc-f8c5-4f7a-91f8-508b4ccc51e6.png';
    }

    data = setOpenGraphMetadata(data, title, description, image);
    response.send(data);
  });
});

// Handle all other routes
app.get('*', function(request, response) {
  const filePath = path.resolve(__dirname, './dist', 'index.html');
  response.sendFile(filePath);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

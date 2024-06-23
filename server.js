const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const path = require('path');
const fs = require('fs');
const axios = require('axios');

app.use(express.static(path.resolve(__dirname, './dist')));

function setOpenGraphMetadata(data, title, description, image) {
  data = data.replace(/\Makalabox/g, title);
  data = data.replace(
    /\$MakalaBox - платформа для обмена знаниями между преподавателями и студентами колледжей. Здесь они могут публиковать статьи по различным темам./g,
    description
  );
  data = data.replace(/\$OG_IMAGE/g, image);
  return data;
}

app.get(['/', '/about', '/feed', '/article/*'], function (request, response) {
  const filePath = path.resolve(__dirname, './dist', 'index.html');
  const url = request.path;

  fs.readFile(filePath, 'utf8', async function (err, data) {
    if (err) {
      console.log(err);
      response.status(500).send('Internal Server Error');
      return;
    }

    let title = 'Makalabox';
    let description =
      'MakalaBox - платформа для обмена знаниями между преподавателями и студентами колледжей. Здесь они могут публиковать статьи по различным темам.';
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

      try {
        const articleResponse = await axios.get(
          `https://api.makalabox.com/api/articles/${articleId}`
        );
        const articleData = articleResponse.data.data;
        title = articleData.title;
        description = articleData.subtitle;
        image = articleData.photo;
        jsonLd = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://makalabox.com/article/${articleId}/`,
          },
          headline: articleData.title,
          description: articleData.subtitle,
          image: {
            '@type': 'ImageObject',
            url: articleData.photo,
            width: 200,
            height: 98,
          },
          author: {
            '@type': 'Person',
            name: articleData.author.fullName,
          },
          publisher: {
            '@type': 'Organization',
            name: articleData.author.fullName,
            logo: {
              '@type': 'ImageObject',
              url: '',
              width: '',
              height: '',
            },
          },
          datePublished: articleData.created,
        });
      } catch (error) {
        console.log(`Error fetching article ${articleId}:`, error);
      }
    }

    data = setMetadata(data, title, description, image, jsonLd);
    response.send(data);
  });
});

app.get('*', function (request, response) {
  const filePath = path.resolve(__dirname, './dist', 'index.html');
  response.sendFile(filePath);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

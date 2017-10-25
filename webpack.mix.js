let mix = require('laravel-mix');

mix.react('js/app.js', 'public/')
   .sass('scss/app.scss', 'public/');

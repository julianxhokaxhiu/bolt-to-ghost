# bolt-to-ghost
Bolt JSONAPI to Ghost JSON Import format

## Disclaimer

This project was built to move my current [Bolt.cm](http://bolt.cm) blog to [Ghost](https://ghost.org/).

Some fields in the JSON API schema like `body` are related to my `contenttypes` declared in the Yaml ( `body` = Post HTML content ).

This project is built as a reference for whoever want to migrate from Bolt to Ghost and should come as a playground to be adapted to your case, if it doesn't fit as it is.

## How to use

```
npm install
node index.js --url http://site.com/jsonapi
```

this will produce a file called `out.json` which you can later on import on your Ghost installation.
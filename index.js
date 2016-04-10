/*
    The MIT License (MIT)

    Copyright (c) 2016 Julian Xhokaxhiu

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the 'Software'), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    the Software, and to permit persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
var unirest = require('unirest'),
    jsonfile = require('jsonfile'),
    toMarkdown = require('to-markdown'),
    argv = require('minimist')(process.argv.slice(2)),
    toGhost = function ( json ) {
      var tagMap = {},
          tagCount = 1,
          out = {
            'meta' : {
              'exported_on' : (new Date).getTime(),
              'version' : '004'
            },
            'data' : {
              'posts' : [],
              'tags': [],
              'posts_tags': []
            }
          };

      // Parse JSONAPI Response Data
      for ( var k in json.data ) {
        var data = json.data[k],
            postTime = (new Date( Date.parse( data.attributes.datepublish ) )).getTime(),
            postId = parseInt(k)+1,
            post = {
              'id':               postId,
              'title':            data.attributes.title,
              'slug':             data.attributes.slug,
              'markdown':         toMarkdown( data.attributes.body ),
              'html':             data.attributes.body,
              'image':            null,
              'featured':         0, // boolean indicating featured status
              'page':             0, // boolean indicating if this is a page or post
              'status':           'published', // or draft
              'language':         'en_US',
              'meta_title':       null,
              'meta_description': null,
              'author_id':        1, // the first user created has an id of 1
              'created_at':       postTime, // epoch time in millis
              'created_by':       1, // the first user created has an id of 1
              'updated_at':       postTime, // epoch time in millis
              'updated_by':       1, // the first user created has an id of 1
              'published_at':     postTime, // epoch time in millis
              'published_by':     1 // the first user created has an id of 1
            };

        // Push Post
        out.data.posts.push( post );

        // Extract Tags
        for ( var t in data.attributes.taxonomy.tags ) {

          // Lazy fill all available tags
          if ( !( t in tagMap ) ) {
            var tagName = data.attributes.taxonomy.tags[t];

            // Push Tag
            out.data.tags.push({
              'id':           tagCount,
              'name':         tagName,
              'slug':         tagName,
              'description':  ''
            });

            // Map the Tag for reference
            tagMap[t] = {
              'id':   tagCount,
              'name': tagName,
            };

            // Increment counter
            tagCount++;
          }

          // Map tags to post
          out.data.posts_tags.push({
            'tag_id':   tagMap[t].id,
            'post_id':  postId
          })
        }

      }

      return out;
    },
    toFile = function ( json, path ) {
      var jsonGhost = toGhost( json );

      jsonfile.writeFile(path, jsonGhost, {spaces: 2}, function(err) {
        if ( err ) console.error( err );
        else console.log( '>> Done!' );
      })
    }

if ( argv['url'] ) {
  unirest
  .get( argv['url'] )
  .headers({
      'Cache-control' : 'no-cache',
      'Content-type' : 'application/json'
  })
  .end(function(response){
      toFile( response.body, './out.json' );
  });
} else
  console.log( 'Missing --url argument ( ex. --url http://site.com/jsonapi )' );
# semantic cms
##simple static site generator in nodeJS mad about tags and links.

##Features
###Page
Unit of content handled by "Semantic CMS". It can be just a sentence, block of text like description for something, blog post, static page or any other publication unit.

###Page meta
Page may contain metadata section. It should be formatted in YAML.
Every data in this section is a tag.

###Link
Link - is a connection between a page and a tag.

###Tag
Tag is a representation of a meaning, semantic unit.
It can be just a word or phraze in the context of the published content with "Semantic CMS".
It may have a value of Date, Number, url or other specified data format.
But in most cases it is a bridge to other meanings.
Tag with a set of links shapes the meaing of itself.

###Layout
Template which completes the Page with its metadata.

###Config - _config.yml

###Asset
Any other content which is shipped with the page into publication, like: image, css, js, files.

+ First page tag - is used in static permalink formation as '/:tag'
+ Section name if defined as a tag became the first tag of page

#Roadmap
##Feature
- url uniqueness checker
- images
- assets
- Tag
  - parse nested tags 'tag1.tag2'
- Tag page
  - list pages linked to this tag
- Page urls by tags
  e.g.: post1 has tag1 and tag2. Valid urls: /post1; /tag1/post1; /tag2/post1; tag1/tag2/post1; tag2/tag1/post1 
- parse sections nesting

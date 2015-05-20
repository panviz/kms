# semantic cms
##dead simple static site generator in nodeJS

#Features
+ First page tag - is used in static permalink formation as '/:tag'
+ Section name if defined as a tag became the first tag of page


#Roadmap
##Feature
- url uniqueness checker
- images
- assets
- Tag
  - list pages in any tags they have
    e.g.: post1 has tag1 and tag2. Valid urls: /post1; /tag1/post1; /tag2/post1; tag1/tag2/post1; tag2/tag1/post1 
- parse sections nesting

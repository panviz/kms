#!/usr/bin/env node
var fs = require('fs-extra')
, Path = require('path')
, sanitizeHtml = require('sanitize-html')
, _ = require('lodash')
, glob = require('glob')
, toMarkdown = require('to-markdown')
, yaml = require('js-yaml')

var inDir = Path.normalize(process.argv[2] || '.')
var outDir = Path.normalize(process.argv[3] || '.')
inDir = Path.join('content', inDir)
outDir = Path.join('imported', outDir)
var files = glob.sync(Path.join(inDir, '**/*'))

var tagPaths = {}
, items = {}
, counter = 0
, duplicates = {}
, pathTags = {}

files.forEach(findDuplicates)
files.forEach(parseTags)
files.forEach(parse)
//console.log(_.keys(duplicates).sort())
//console.log(pathTags);
writeTags()

function parse(path) {
  if (fs.lstatSync(path).isDirectory()) return
  var relative = Path.relative(inDir, path)
  var out = Path.join(outDir, relative)
  if (Path.extname(path) === '.html') {
    var content = parseContent(fs.readFileSync(path, 'utf8'))
    var markdown = toMarkdown(content)
    var tags = pathTags[Path.dirname(relative)]
    var meta = "---\ntags:\n- " + tags.join('\n- ') + "\n---\n"
    var output = meta + markdown
    write(Path.dirname(out), output)
  } else {
    //move asset without change
    //console.log('In: ' + path);
    //fs.copySync(path, out)
    //console.log('Out: ' + out);
  }
}

function findDuplicates(path) {
  if (!fs.lstatSync(path).isDirectory()) return
  var relative = Path.relative(inDir, path)
  var tags = relative.split(Path.sep)

  var last = _.last(tags)
  if (tagPaths[last]) {
    if (!duplicates[last]) duplicates[last] = []
    if (!_.contains(duplicates[last], tagPaths[last])) duplicates[last].push(tagPaths[last])
    duplicates[last].push(relative)
  }
  tagPaths[last] = relative
}

function parseTags(path) {
  if (!fs.lstatSync(path).isDirectory()) return
  var relative = Path.relative(inDir, path)
  var folders = relative.split(Path.sep)
  var tags = []

  folders.forEach(function (folder) {
    if (_.contains(_.keys(duplicates), folder)) {
      tags[tags.length -1] = tags[tags.length -1] + '.' + folder
    } else tags.push(folder)
  })

  pathTags[relative] = tags

  tags.forEach(function (tag, index) {
    if (tags[index + 1]) {
      if (!items[tag]) items[tag] = []
      items[tag].push(tags[index + 1])
    }
  })
}

function parseContent(content) {
  content = content
    .replace(/^\uFEFF/, '')
    .replace(/\r/gm, '')

    //replace title with <h2>
    .replace(/<title>(.*?)<\/title>/, '')

    //remove font-family styling
    .replace(/font-family:(\w|\s)*?;/g, '')

    //remove default line-height styling
    .replace(/line-height: 140%;?/g, '')
    
    //remove default color styling
    .replace(/color: #000000;?/g, '')

    //replace bold style with <b>
    .replace(/<span\s*style=".*?font-weight:\s*bold.*?">(.*?)<\/span>/g, function (match, text) {
      return match.replace(/font-weight:\s*bold;?/, '').replace(text, '<b>' + text + '</b>')
    })

    //replace italic style with <i>
    .replace(/<span\s*style=".*?font-style:\s*italic.*?">(.*?)<\/span>/g, function (match, text) {
      return match.replace(/font-style:\s*italic;?/, '').replace(text, '<i>' + text + '</i>')
    })

    //remove small fonts styling
    //replace 13,14pt with <h4> and 15,16 with <h3>
    .replace(/<span\s*(style=".*?font-size:\s*(\d*)pt.*?")>(.*?)<\/span>/g, function (match, style, size, text) {
      re = /font-size:\s*(\d*)pt;?/
      if (size > 12 && size < 16) {
        match = match.replace(/span/g, 'h4')
      } else if (size >= 16) {
        match = match.replace(/span/g, 'h3')
      }
      return match.replace(re, '')
    })

    //substitute <div><span> with paragraph 
    .replace(/<div><span\s*(style=".*?").*?>(.*?)<\/span><\/div>/g, '<p><span $1>$2</span></p>')

    //clear br element
    .replace(/<div>(<.*?br.*?>)<\/div>/g, '$1')

    //remove hyperlinks styling
    .replace(/<a.*?(style=".*?")>.*?<\/a>/g, function (match, p1) {
      return match.replace(p1, '')
    })

  var options = {
    allowedTags: ['img', 'span', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']
  , allowedAttributes: false
  , styleFilter: function(style) {
      return style.replace(/\s/g, '')
    }
  }
  content = sanitizeHtml(content, options)
    //remove empty and unstyled paragraphs
    .replace(/<span>(.*?)<\/span>/g, '$1')
    //remove first empty string appeared after sanitizing
    .replace(/\n/, '')

  content = _.map(content.split('<br />'), function (paragraph) {
    paragraph = paragraph
      .replace(/<p>(.*?)<\/p>/g, '<br />$1')
      .replace(/<br \/>/, '')
    return '<p>' + paragraph + '</p>\n'
  })
    .join('')
    .replace(/<p>\n<\/p>/g, '')

  return content
}

function write(path, content) {
  fs.mkdirpSync(path)
  filepath = Path.join(path, 'index.md')
  console.log('Write: ' + filepath);
  fs.writeFileSync(filepath, content)
}

function writeTags() {
  _.keys(items).forEach(function (tag) {
    items[tag] = _.uniq(items[tag])
  })
  var yml = yaml.dump(items)
  fs.writeFileSync(Path.join(outDir, 'data.yml'), yml)
}

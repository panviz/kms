/**
 * Opinionated importer for Mybase directory tree export
 */
var fs = require('fs-extra')
, Path = require('path')
, _ = require('lodash')
, sanitizeHtml = require('sanitize-html')
, toMarkdown = require('to-markdown')

var DirectoryProvider = require('../fs/index')

var Self = function (p) {
  //this.init(p)
}
Self.prototype = Object.create(DirectoryProvider.prototype)

Self.prototype.parse = function (path) {
  var self = this
  if (fs.lstatSync(path).isDirectory()) return
  var relative = Path.relative(self.inDir, path)
  var out = Path.join(self.outDir, relative)
  if (Path.extname(path) === '.html') {
    var source = fs.readFileSync(path, 'utf8')
    var content = self.parseContent(source)
    var markdown = toMarkdown(content)
    var tags = self.pathTags[Path.dirname(relative)]
    var meta = "---\ntags:\n- " + tags.join('\n- ') + "\n---\n"
    var output = meta + markdown
    self.write(Path.dirname(out), output)
  } else {
    //move asset without change
    console.log('In: ' + path);
    fs.copySync(path, out)
    console.log('Out: ' + out);
  }
}

Self.prototype.parseContent = function (content) {
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

Self.prototype.write = function (path, content) {
  var self = this
  fs.mkdirpSync(path)
  filepath = Path.join(path, 'index.md')
  console.log('Write: ' + filepath);
  fs.writeFileSync(filepath, content)
}

module.exports = Self

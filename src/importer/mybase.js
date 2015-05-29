var fs = require('fs')
, sanitizeHtml = require('sanitize-html')
, _ = require('lodash')

var content = fs.readFileSync('test.html', 'utf8')
  .replace(/\r/gm, '')

  //remove font-family styling
  .replace(/font-family:(\w|\s)*?;/g, '')

  //remove default line-height styling
  .replace(/line-height: 140%;?/g, '')
  
  //remove default color styling
  .replace(/color: #000000;?/g, '')

  //replace bold style with <b>
  .replace(/<span\s*style=".*?font-weight:\s*bold.*?">(.*?)<\/span>/g, function (match, text) {
    return match.replace(/font-weight:\s*bold;?/g, '').replace(text, '<b>' + text + '</b>')
  })

  //replace italic style with <i>
  .replace(/<span\s*style=".*?font-style:\s*italic.*?">(.*?)<\/span>/g, '<i>$1</i>')

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

  //replace title with <h2>
  .replace(/<title>(.*?)<\/title>/, '<h2>$1</h2>')

  //clear br element
  .replace(/<div>(<.*?br.*?>)<\/div>/g, '$1')

  //remove hyperlinks styling
  .replace(/<a.*?(style=".*?")>.*?<\/a>/g, function (match, p1) {
    return match.replace(p1, '')
  })

var options = {
  allowedTags: ['title', 'span', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']
, allowedAttributes: false
, styleFilter: function(style) {
    return style.replace(/\s/g, '')
  }
}
content = sanitizeHtml(content, options)
  //remove empty and unstyled paragraphs
  .replace(/<span>(.*?)<\/span>/g, '$1')

content = _.map(content.split('<br />'), function (paragraph) {
  paragraph = paragraph
    .replace(/<p>(.*?)<\/p>/g, '<br />$1')
    .replace(/<br \/>/, '')
  return '<p>' + paragraph + '</p>\n'
})
  .join('')
  .replace(/<p>\n<\/p>/g, '')

fs.writeFileSync('out.html', content)

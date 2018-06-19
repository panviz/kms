import path from 'path'

function absolute (...args) {
  return path.join(__dirname, ...args)
}

const plugins = []
const rules = [{
  test: /\.(scss|css)$/,
  use: ['style-loader', 'css-loader', 'sass-loader'],
}, {
  test: /\.html/,
  loader: 'handlebars-loader',
}, {
  test: /\.(svg|png|jpe?g|gif)(\?\S*)?$/,
  loader: 'url-loader?limit=8192',
}, {
  test: /\.(eot|woff|woff2|ttf)(\?\S*)?$/,
  loader: 'url-loader?&name=asset/font/[name].[ext]',
}]

const externals = {
  lodash: '_',
  jquery: 'jQuery',
  d3: { root: 'd3' },
}

export default () => (
  {
    mode: 'development',
    entry: {
      libs: ['webcola',
        'eventemitter3',
        'select2',
        'material-design-lite/src/mdlComponentHandler',
        'material-design-lite/src/menu/menu',
        './style/libs.scss',
      ],
      bundle: './index.js',
    },
    output: {
      path: absolute('build'),
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.js'],
    },
    devtool: 'source-map',
    module: { rules },
    plugins,
    externals,
  }
)

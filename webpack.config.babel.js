import path from 'path'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

function absolute (...args) {
  return path.join(__dirname, ...args)
}

const defaultEnv = { dev: true }
const plugins = []
const rules = [{
  test: /\.(scss|css)$/,
  loader: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: ['css-loader', 'sass-loader'],
  }),
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
  lodash: '_', // {root: '_'},
  jquery: 'jQuery', // {root: ['$', 'jquery', 'jQuery']},
  d3: { root: 'd3' },
}

export default (env = defaultEnv) => {
  if (env.prod) {
    plugins.push(new UglifyJSPlugin({
      compress: {
        warnings: false,
      },
      mangle: {
        keep_fnames: true,
      },
    }))
  }

  plugins.push(new ExtractTextPlugin('[name].css'))

  return {
    entry: {
      libs: ['webcola',
             'jquery.easing',
             'eventemitter3',
             'select2',
             'material-design-lite/src/mdlComponentHandler',
             'material-design-lite/src/menu/menu'],
      client: './client/app.js',
      libcss: ['./client/style/libs.scss'],
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
}

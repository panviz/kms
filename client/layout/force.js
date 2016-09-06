/**
 * Force directed layout
 * with constraints implemented with WebCola to decrease jitter and avoid nodes overlap
 * perform additional transition animation to decrease jitter
 */
import Layout from './layout'
import webcola from 'webcola'
import Util from '../../core/util'

export default class Self extends Layout {
  constructor (p) {
    super(p)
    this.name = 'Force directed'
    this.p.iterations = p.iterations || [10, 15, 20]
    this.p.untangleIterations = this.p.iterations[0] + this.p.iterations[1]
    this.p.animationDuration = 750
    this._transitionStarted = undefined

    this._items = []
    this._shapes = []
  }
  /**
   * change layout desired size
   */
  size (width, height) {
    super.size(width, height)
    return this._force.size([this.width, this.height])
  }
  /**
   * in order for seamless position transition
   * update new items - existing shapes correspondence for items which remain from previous run
   * init position and size for new nodes
   */
  update (graph, enteredNodes) {
    // recreate new adaptor due to https://github.com/tgdwyer/WebCola/wiki/Troubleshooting
    this._force = webcola.d3adaptor()
      .linkDistance(100)
      .avoidOverlaps(true)
      .size([this.width, this.height])

    // this._force.on('tick', this._boundConstraint.bind(this))
    this._force.on('tick', this._onTick.bind(this))
    this._force.on('end', this._onEnd.bind(this))
    const newItems = graph.getItemKeys()
    const links = graph.getLinksArray()
    const newShapes = []
    _.each(newItems, (newItem, index) => {
      const existIndex = this._items.indexOf(newItem)
      if (existIndex > -1) {
        newShapes[index] = this._shapes[existIndex]
      } else {
        const node = _.find(enteredNodes, { __data__: newItem })
        const size = node.getBBox()
        const point = this._initPosition(newItem, graph)
        newShapes[index] = {
          index,
          x: point[0],
          y: point[1],
          px: point[0],
          py: point[1],
          width: size.width + this.p.node.gap,
          height: size.height + this.p.node.gap,
        }
      }
    })
    this._items = newItems
    this._shapes = newShapes

    // TODO
    this._shapeLinks = _.map(links, (link) => {
      const source = this._shapes[this._items.indexOf(link[0])]
      const target = this._shapes[this._items.indexOf(link[1])]
      return {
        source,
        target,
      }
    })

    this._force
      .nodes(this._shapes)
      .links(this._shapeLinks)
  }
  /**
   * @param Number p.duration desired maximum time in milliseconds to run layout
   * no running time limit by default
   * @param Boolean untangle whether to run unconstrained iterations
   * true by default as this produces better visual result taking more time
   * @param Boolean transit whether to fire more ticks with smoothly interpolated positions
   * true by default as there usually would be a substantial shift with silent untangled iterations
   * set to false if you need only resulting layout after time elapsed
   */
  run (p = {}) {
    this._forceCounter = 0
    this._startTime = new Date
    this._duration = p.duration
    this._doUntangle = _.isNil(p.untangle) ? true : p.untangle
    this._transitionEnabled = _.isNil(p.transit) ? true : p._transit

    // do not use unconstrainted iterations if view is updated on every tick
    if (this._doUntangle) this._force.start.apply(this._force, this.p.iterations)
    else this._force.start()
  }
  /**
   * @return Array of layouted items Coords
   */
  getCoords () {
    return _.map(this._shapes, (shape) => {
      const coord = {}
      coord.x = this._transitionStarted ? shape.tcx : shape.x
      coord.y = this._transitionStarted ? shape.tcy : shape.y
      return coord
    })
  }
  /**
   * @param Key item
   */
  fix (item) {
    const shape = this._shapes[this._items.indexOf(item)]
    shape.fixed = true
  }
  /**
   * @param Key item
   */
  move (item, delta) {
    const shape = this._shapes[this._items.indexOf(item)]
    shape.px = shape.x
    shape.py = shape.y
    shape.x = shape.x + delta.x
    shape.y = shape.y + delta.y
  }
  /**
   * on internal force layout iteration tick
   */
  _onTick () {
    Util.log(`F TICK ${this._forceCounter}`)

    // if _duration is not set there is always time left to finish
    const timeLeft = this._duration ? this._duration - (new Date - this._startTime) : 1
    if (timeLeft < 0) this._force.stop()

    // untangle layout silently
    if (this._doUntangle && ++this._forceCounter < this.p.untangleIterations) return
    if (!this._transitionEnabled) {
      this.trigger('tick')
    } else {
      if (!this._transitionStarted) this._startTransition()
    }
  }
  /**
   * Called on force layout finished
   * start transition if it's not already running
   */
  _onEnd () {
    Util.log('Force STOP')
    if (this._transitionEnabled && this._doUntangle && !this._transitionStarted) {
      this._startTransition()
    }
  }

  _endTransition (id) {
    Util.log('Transition STOP')
    cancelAnimationFrame(id)
    this._transitionStarted = undefined
    /* eslint-disable no-param-reassign */
    _.each(this._shapes, (shape) => {
      shape.px = shape.x
      shape.py = shape.y
    })
    /* eslint-enable */
  }
  /**
   * @return Point of one visible linked node OR center of two OR centroid of polygon
   */
  _initPosition (item, graph) {
    const allLinkedItems = graph.getLinked(item)
    const existLinkedItems = _.intersection(this._items, allLinkedItems)

    // nodes should appear near the center but not too close to not repel strongly
    if (_.isEmpty(existLinkedItems)) return [this.width / 2, this.height / 2]

    const points = _.map(existLinkedItems, (existLinkedItem) => {
      const shape = this._shapes[this._items.indexOf(existLinkedItem)]
      return [shape.x, shape.y]
    })
    return Util.centroid(points)
  }

  _startTransition (duration = this.p.animationDuration) {
    Util.log('Transition START')
    let id
    const tick = (timestamp) => {
      if (!this._transitionStarted) this._transitionStarted = timestamp
      const progress = timestamp - this._transitionStarted
      if (progress < duration) {
        id = requestAnimationFrame(tick)
        this._makeTransition(progress, duration)
      } else {
        this._endTransition(id)
      }
    }
    id = requestAnimationFrame(tick)
  }
  /**
   * calculate transition position for animation frame
   */
  _makeTransition (progress, duration) {
    _.each(this._shapes, (shape) => {
      /* eslint-disable no-param-reassign */
      if (progress === 0) {
        shape.tpx = shape.px // Transition Previous X
        shape.tpy = shape.py
      }

      // Transition Current X
      const xChange = shape.x - shape.tpx
      const yChange = shape.y - shape.tpy
      shape.tcx = shape.tpx + $.easing.easeInOutCubic(progress / duration) * xChange
      shape.tcy = shape.tpy + $.easing.easeInOutCubic(progress / duration) * yChange
      /* eslint-enable */
    })
    Util.log('T TICK')
    this.trigger('tick')
  }
  /**
   * lead to nodes overlap near boundaries
   */
  _boundConstraint () {
    _.each(this._shapes, (d) => {
      /* eslint-disable no-param-reassign */
      d.x = Math.max(15, Math.min(this.width - 15, d.x))
      d.y = Math.max(15, Math.min(this.height - 15, d.y))
      /* eslint-enable */
    })
  }
}

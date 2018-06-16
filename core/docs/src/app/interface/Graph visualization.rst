Graph visualization
===================
Graphiy is a graph management tool. Naturally its navigation view is a
graph visualization.

Criteria
--------

-  Mental map preservation on data change
-  Space efficiency
-  Simplicity
-  Nodes relatedness
-  Navigation

There are some important problems in well-known interface we all are used to.

Tree layout (hierarchies)
-------------------------

problems
~~~~~~~~

- important files appear to be buried deep in the structure
- cannot put a file in multiple folders
- cannot name a file with multiple names (tags)
- erroneous structure emerge when file is in related folder, but doesn't relate to its nesting hierarchy

Graph layout
------------

Graph layout resolves all above. But it is harder to visualize.
Existing graph visualizations share some common problems:

problems
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  **Too many nodes.**
   This usually makes sense only to show a big picture,
   like on mindmap. But labels quickly become unreadable with scale.
-  **Too many neighbors.** There are some nodes highly interconnected with
   others, like group definition. Showing all its linked nodes always
   makes those crowded inflorescences.
-  **Too many links.** Unlike hierarchies, graph nodes are free to connect
   to any other nodes. Visually this always becomes a hairball, in which
   crosslinks goes as strikes across other nodes.
-  **Scattered related nodes.** Good layouts may resolve some issues from
   above revealing clusters of information. But it's not rare when node
   is related to multiple clusters.
-  **Spatial stability in dynamics.** Once graph is drawn and navigation
   starts, user memorizes the spatial mental map. That's how our brain
   works. Revealing new nodes, collapse / expand, hide actions change
   the graph substantially. And if layout of nodes which stay changes
   too much graph would seem to be a new one with complete loss of
   context and relatedness with previous state.

Solutions
---------

We addressed these issues with the corresponding set of techniques:

too many nodes
~~~~~~~~~~~~~~

-  define context: any item can be found with no more than 5 links to
   others and usually 2 or 3. So working in certain context wouldn't
   need many nodes to show.
-  filtering by links to group nodes

too many neighbors
~~~~~~~~~~~~~~~~~~

-  show only first N neighbors (connected nodes) ordered by link weight
   (nodes relatedness). It may be any other user defined criteria, like
   popularity or rank.
-  show neighbors in separate scrollable list view

too many links
~~~~~~~~~~~~~~

-  highlight selection links (partial solution)
-  show graph as a tree starting at current context (selected node /
   nodes)
-  place related nodes nearby and duplicate those which need to be
   placed in multiple clustered areas

scattered related nodes
~~~~~~~~~~~~~~~~~~~~~~~

-  duplicating nodes to show in place where needed
-  show graph as tree starting at current context will always reveal
   relatedness accurately

spatial stability in dynamics
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  persist nodes positions
-  let the user manually change position and fix it
-  layout nodes depending on previous position, preserving overal shapes
   of clusters and minimizing individual nodes shift.

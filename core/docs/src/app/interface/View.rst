View
====

This is a GUI component to display `item(s) <./implementation#item>`__.

You may think of it as the following:

- Visual Items Manipulator
- View for Items Manipulation
- Visual Items Manager
- UI to display and manipulate items
- Data representation class

It should normally be a statefull object.

General views
-------------
.. toctree::
  :maxdepth: 1

  Graph <view/Graph>
  List <view/List>

which are built upon certain type of :doc:`layout <Layout>`
and are able to display all types of items.

Specific views
--------------
.. toctree::
  :maxdepth: 1
  :caption: List of views

  Editor <view/Editor>

designed to show a single :doc:`itemtype <../Itemtype>` in a specific way.

E.g.: :doc:`Contact view <view/Contact view>` will be triggered to display only *contact* itemtypes.
This is similar to association between file type and default program in operating system.

See `the source <https://github.com/Graphiy/kms/tree/master/client/view>`_ for complete list.

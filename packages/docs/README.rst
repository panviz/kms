Graphiy KMS Docs
================

This repo is the source behind http://docs.graphiy.com

Editing
-------

To edit the documentation you need a GitHub account. Once you have created one
and logged in, you can edit any page by navigating to the corresponding file and
clicking the edit (pen) icon. This will create a so called "fork" and a "pull
request", which will be approved by one of the existing documentation team
members. Once you have made a contribution or two, you can be added to the
documentation team and perform edits without requiring approval.

In the long run, learning to use Git_ and running Sphinx_ on your computer is
beneficial.

First steps to run it locally::
 
  git clone https://github.com/graphiy/docs.git
  pip install sphinx sphinx-autobuild
  cd docs 
  make html
  or
  make livehtml
  # open localhost:8001

The documentation uses the `rst format`_. For a starting point check out the
`reStructuredText Primer`_

.. _Git: https://www.git-scm.com/
.. _Sphinx: http://sphinx-doc.org/
.. _`rst format`: http://docutils.sourceforge.net/docs/ref/rst/restructuredtext.html
.. _`reStructuredText Primer`: http://sphinx-doc.org/rest.html

License
=======

All documentation are licensed under the `Creative
Commons Attribution 4.0 International License
<https://creativecommons.org/licenses/by/4.0/>`__.

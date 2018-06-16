Itemtype
========

Items which comply with rules of a specific itemtype are considered to
be of that type. These rules are: to be linked to "type designating"
item and have specific format of value.

E.g.: Item linked with “Image”, which is linked with “itemtype”

::

"item" -> "Image" -> "itemtype"]

is considered by system as an image. And will be displayed according to
the extension - another neighbour item linked with “itemextension”

::

"item" -> "JPG" -> "itemextension"

Items without own value are rendered using its neighbours values.

E.g.: Item linked with:

::

"item" -> "Contact" -> "itemtype"
"item" -> "John"    -> "Name"    -> "itemtype"
"item" -> "Miller"  -> "Surname" -> "itemtype"

is considered to be of a “Contact” type with "John Miller" as a value.

This is the concept of storing composite senses. Same principle applies
to making higher abstraction for user’s data, like: “My vacations” or
"Things I’m going to buy”.

Implementation of itemtype is a *Functional module* which can retrieve
Items of its type from Graph.

.. toctree::
   :maxdepth: 1

   List of itemtypes

More types to come...

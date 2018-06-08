Concept
=======

Principles
----------
- :doc:`Advanced graph visualization<app/interface/Graph visualization>`
- Human brain associative thinking
- Proficient User eXperience

Graph
-----
:doc:`(Network / Multidimensional Array / Database) <app/Graph data model>`

| The memory of the system is a graph.
| There are only two main features to store content in Graphiy KMS.
| Item and it's relations are links.

*This makes SIMPLICITY.*

Item
-----------------------
:doc:`(Element / Unit / Node) <app/Item>`

Every piece of information is an Item just like our thoughts or memory.
It may be anything: just a word, number, date, url, or a bigger chunk of
text, separate file or even binary data: image, video.

*This makes UNIVERSALITY.*

Item can be assigned with own value. A user just puts it in by editing.
It is the same like human perceptual piece of memory - a pattern
obtained with perception we possess (visual, auditory). Computer will
perfectly store the value unlike rough human memory.

Item may have no own value and be a complex derivative formed by linking
to others.

Link
------------------------------
:doc:`(Relation / Connection / Edge)<app/Link>`

| Item to item relationship.
| Works like human brain association. It has neither direction nor
  metadata. It is just a notion of item to item relatedness.

Two items relatedness extent is defined by link weight. Same as human
brain associations have weight storing the "how much" two things are
related.

*This makes POWER.*

Itemtype
--------
:doc:`(Metadata / Predicate / Context)<app/Itemtype>`

Here comes the tricky part. Contemporary graph databases store Items
along with metadata. Same goes for links. They all have a type. Making
typed links between items is like putting verbs into a sentence: “John”
-likes-> “Boston”. And having Item typed is the way to define the
context of the specific information. Here "John" is a “Person” type and
“Boston” is a “City” type. That's definitely an abstraction of some
kind. Human thoughts and memories don't have types as well as
associations.

Type is all about what this Item is linked to.

For details, see :doc:`Implementation <./app/Implementation>`

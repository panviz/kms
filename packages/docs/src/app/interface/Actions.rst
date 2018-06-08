Actions
=======

This is the list of abstracted actions on items.

- Search / Find
    Search works by value. But plucking all items for each search is a big
    overhead. So, by default search works by :ref:`tags <itemtype-tag>`.
    In this way we limit the quantity of searched nodes by children of
    specific one.
    There wouldn't be more :ref:`tag <itemtype-tag>` items than actually can be searched
    instantly and often. Even the whole English dictionary and phrazes
    vocabulary for all specific themes is not too big for the purpose.
    This way we can search by certain :doc:`itemtype <../Itemtype>` too. And generally search
    can be performed by any specific item's children.
- Navigate
    change viewing part of item
- Create
- View
    view item's value
- Save (after Edit)
    change item's value 
- Delete
    remove item and all its links
- Link
    group1 with group2. One of groups is usually a single item
- Unlink
    group1 from group2
- Convert
    change item's content by convertion function;
    unlink from previous itemtype and link with new one
- Sort
    reorder items by value of one of its children which are linked with "sort by item"
    same as Filter;
    extends Search functionality;
    reveals Items relations with linear scales, like Time

    applicable only for layouts with order (like List)
- Filter
    hide items from group1 which is not linked to group2
    basically an inherent part of Search, which can narrow selection
- Zoom
    increase/decrease item's size
    
    Intellectual zoom: apply "Dislay as" action for certain zoom levels
- Jump
    change viewing item (navigation by direct link)
- Group
    Sort by Tag 
- Version
    Copy; link one with version number and freeze; it's copy would be editable
- Sync
    Update own value with linked as sync source item's value
- Copy
    Create + Link
- Merge
    Link two similar or remove duplicate
- Send
    Copy & Link with person 
- Share
    Link with Person 
- Tag
    Link with keyword 
- Evaluate
    Link with Number and Scale (by which item is
    evaluated) 
- Rate
    Link with Number (infinite scale)

Action is the implementation of `Command Design Pattern <https://en.wikipedia.org/wiki/Command_pattern>`_

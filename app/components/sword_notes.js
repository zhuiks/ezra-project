/* This file is part of Ezra Project.

   Copyright (C) 2019 - 2020 Tobias Klein <contact@ezra-project.net>

   Ezra Project is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 2 of the License, or
   (at your option) any later version.

   Ezra Project is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with Ezra Project. See the file LICENSE.
   If not, see <http://www.gnu.org/licenses/>. */

/**
 * The SwordNotes component implements the handling of SWORD-based note elements
 * like cross-references and footnotes.
 * 
 * @category Component
 */
class SwordNotes {
  constructor() {
    this.notesCharacter = i18n.t('bible-browser.footnote-character');
  }

  getCurrentTabNotes(tabIndex) {
    var verseList = app_controller.getCurrentVerseList(tabIndex);
    var swordNotes = verseList[0].querySelectorAll('.sword-note');
    return swordNotes;
  }

  createMarker(markerClass, title, content) {
    var marker = document.createElement('div');
    marker.classList.add(markerClass);
    marker.classList.add('sword-marker');
    marker.setAttribute('title', title);
    marker.innerText = content;

    return marker;
  }

  initForTab(tabIndex=undefined) {
    var swordNotes = this.getCurrentTabNotes(tabIndex);
    this.initNotes(swordNotes);
  }

  initForContainer(container) {
    var swordNotes = container.querySelectorAll('.sword-note');
    this.initNotes(swordNotes);
  }

  cleanNotes(swordNotes) {
    var filteredNotes = [...swordNotes].filter(e => {
      return e.getAttribute('type') == 'crossReference';
    });

    var textNodes = [];

    for (var i = 0; i < filteredNotes.length; i++) {
      var currentNote = filteredNotes[i];

      var nextNode;
      var walk = document.createTreeWalker(currentNote, NodeFilter.SHOW_TEXT);

      while (nextNode = walk.nextNode()) {
        if (nextNode.parentNode.nodeName != "REFERENCE") {
          textNodes.push(nextNode);
        }
      }
    }

    for (var i = 0; i < textNodes.length; i++) {
      textNodes[i].replaceWith("");
    }
  }

  initNotes(swordNotes) {
    //console.time('SwordNotes.initForTab');
    //console.log(`Got ${swordNotes.length} sword xref elements!`);

    // Within crossReference notes: Remove text nodes containing ';'
    this.cleanNotes(swordNotes);

    for (var i = 0; i < swordNotes.length; i++) {
      var currentNote = swordNotes[i];

      if (currentNote.hasAttribute('type') && currentNote.getAttribute('type') == 'crossReference') {
        this.initCrossReferenceNote(currentNote);
      } else {
        this.initRegularNote(currentNote);
      }
    }

    var jqSwordNotes = $(swordNotes);
    jqSwordNotes.css('display', 'inline-block');
    jqSwordNotes.css('margin-left', '0.1em');
    //console.timeEnd('SwordNotes.initForTab');
  }

  initCrossReferenceNote(note) {
    var noteContent = note.innerHTML;

    if (noteContent.indexOf("sword-xref-marker") == -1) {
      var currentReferences = note.querySelectorAll('reference');
      var currentTitle = "";

      if (currentReferences.length > 1) {

        var currentTitleArray = [];

        for (var i = 0; i < currentReferences.length; i++) {
          var ref = currentReferences[i];
          var currentRef = ref.innerText;
          currentTitleArray.push(currentRef);
        }

        currentTitle = currentTitleArray.join('; ');

      } else if (currentReferences.length == 1) {

        currentTitle = currentReferences[0].innerText;
      }

      var xrefMarker = this.createMarker('sword-xref-marker', currentTitle, 'x');
      note.insertBefore(xrefMarker, note.firstChild);
    }
  }

  initRegularNote(note) {
    var noteContent = note.innerHTML;

    if (noteContent.indexOf("sword-note-marker") == -1) {
      var currentTitle = note.innerText;
      var noteMarker = this.createMarker('sword-note-marker', currentTitle, this.notesCharacter);
      note.innerText = "";
      note.insertBefore(noteMarker, note.firstChild);
    }
  }
}

module.exports = SwordNotes;
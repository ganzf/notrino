function createRange(node: any, chars: any, range: any = undefined): any {
  if (!range) {
    range = document.createRange()
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    console.log('Iterating in createRange', { node, type: node.nodeType, chars, range })
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (var lp = 0; lp < node.childNodes.length; lp++) {
        console.log('Going into child nodes of', { node, children: node.childNodes, lp, child: node.childNodes[lp], range, chars });
        range = createRange(node.childNodes[lp], chars, range);

        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
};

export function setCurrentCursorPosition(chars: number) {
  if (chars >= 0) {
    var selection: any = window.getSelection();

    let range: any = createRange(document.getElementById('editor')?.parentNode, { count: chars });

    if (range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};

function isChildOf(node: any, parentId: any) {
  while (node !== null) {
    if (node.id === parentId) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
};

export function getCurrentCursorPosition(parentId: any) {
  var selection: any = window.getSelection(),
    charCount = -1,
    node;
  let focusNode = selection.focusNode;
  if (selection.focusNode) {

    if (isChildOf(selection.focusNode, parentId)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;
      console.log({ node, charCount, selection });
      while (node) {
        if (node.id === parentId) {
          break;
        }

        if (node.previousSibling) {
          node = node.previousSibling;
          charCount += node.textContent.length;
        } else {
          node = node.parentNode;
          if (node === null) {
            break
          }
        }
      }
    }
  }
  return { position: charCount, node: focusNode, parentNode: focusNode.parentNode };
};

export function moveCaretRight(id = 'editor') {
  const focus = getCurrentCursorPosition(id);
  var selection: any = window.getSelection();
  let range;

  const insertAfter = (referenceNode: any, newNode: any) => {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  console.log('move to right', { focus });
  if (!focus.parentNode.nextElementSibling) {
    console.log('You are trying to go right of last node', { focus });
    const blankNode = document.createElement('span');
    blankNode.innerHTML = String.fromCharCode(160);
    insertAfter(focus.parentNode, blankNode);
    
    range = document.createRange();
    range.selectNode(blankNode);
    range.setStart(blankNode, 0);
    range.setEnd(blankNode, 1);
  } else {
    
  }

  if (range) {
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    selection.collapseToEnd();
  }
}
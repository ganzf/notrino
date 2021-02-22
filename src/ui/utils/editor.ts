import { start } from "repl";

export function findElementById(dom: HTMLHtmlElement | ChildNode, id: string) {
    let elem = undefined;
    // @ts-ignore
    dom.childNodes.forEach((el: HTMLDivElement) => {
      if (el.id === id) {
        elem = el;
      } else if (el.childNodes.length > 0) {
        findElementById(el, id);
      }
    });
    return elem;
}

export function preventEvent(event: any) {
  if (event.nativeEvent) {
    event.nativeEvent.stopPropagation();
    event.nativeEvent.preventDefault();
  }
}

export function getCurrentEditorLine() {
  const focusNode = window.getSelection()?.focusNode;
  if (focusNode) {
    const isInsideEditor = querySelectorUp(focusNode, (n: any) => n.id === 'editor');
    if (isInsideEditor) {
      const line = querySelectorUp(focusNode, (n: any) => n.classList && n.classList.contains('line'));
      console.log({ line });
      return line;
    }
  }
  return null;
}

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

export function changeTagOfNode(node: HTMLHtmlElement, tag: string) {
  const newElement = document.createElement(tag);
  newElement.innerHTML = node.innerHTML;
  node.replaceWith(newElement);
  return newElement;
}

export function getCaretPoint() {
  const sel: any = window.getSelection();
  const node: any = sel?.focusNode;

  if (node && node.nodeType === Node.TEXT_NODE) {
    var span = document.createElement('span');
    // node.parentNode.insertBefore(span, node);
    // span.appendChild(node);
    const rect = span.getBoundingClientRect();
    console.log('WithSpan', { rect, span, sel, r: sel.getRangeAt(0) });
  } else {
    const rect = node.getBoundingClientRect();
    console.log('Without span', { rect, r: sel.getRangeAt(0), sel });
  }
}

export function getCaretTopPoint() {
  return ;
  const sel: any = document.getSelection()
  const r = sel.getRangeAt(0)
  let rect
  let r2
  // supposed to be textNode in most cases
  // but div[contenteditable] when empty
  const node = r.startContainer
  const offset = r.startOffset
  console.log({ node, offset, r });
  if (offset > 0) {
    // new range, don't influence DOM state
    r2 = document.createRange()
    r2.setStart(node, (offset - 1))
    r2.setEnd(node, offset)
    // https://developer.mozilla.org/en-US/docs/Web/API/range.getBoundingClientRect
    // IE9, Safari?(but look good in Safari 8)
    rect = r2.getBoundingClientRect()
    console.log('Case 1', { rect });
    return { left: rect.right, top: rect.top }
  } else if (offset < node.length) {
    r2 = document.createRange()
    // similar but select next on letter
    r2.setStart(node, offset)
    r2.setEnd(node, (offset + 1))
    rect = r2.getBoundingClientRect()
    console.log('case 2: ', { rect });
    return { left: rect.left, top: rect.top }
  } else { // textNode has length
    // https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect

    if (!node.getBoundingClientRect) {
      var span = document.createElement('span');
      node.parentNode.insertBefore(span, node);
      span.appendChild(node);
      rect = span.getBoundingClientRect();
      console.log('WithSpan', { rect });
    } else {
      rect = node.getBoundingClientRect();
      console.log('WithoutSpan', { rect });
    }
    // const styles = getComputedStyle(node)
    // const lineHeight = parseInt(styles.lineHeight)
    // const fontSize = parseInt(styles.fontSize)
    // roughly half the whitespace... but not exactly
    // const delta = (lineHeight - fontSize) / 2
    const delta = 0;
    return { left: rect.left, top: (rect.top + (isNaN(delta) ? 0 : delta)) }
  }
}

export function querySelectorUp(startNode: ChildNode | Node, predicate: (node: any) => boolean): boolean | Node {
  if (!startNode) {
    return false;
  }
  if (startNode && !startNode.parentNode) {
    if (predicate(startNode)) {
      return startNode;
    }
  }
  if (startNode && predicate(startNode)) {
    return startNode;
  }
  if (startNode.parentNode) {
    return querySelectorUp(startNode.parentNode, predicate);
  }
  return false;
}
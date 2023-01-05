// Document

let currentDocument;

function init() {
  currentDocument = getNewDocument();
  generateHTML(currentDocument)
}

init()

window.electronAPI.updateFile((event, data) => {
  currentDocument = reloadComponentIDs(data);
  generateHTML(currentDocument)
});

function reloadComponentIDs(document) {
  document.data.forEach((component, index) => {
    component.id = crypto.randomUUID();
  });
  return document;
}

function getNewDocument() {
  return {
    "meta": {
      "documentName": "Untitled",
      "creationDate": Date.now(),
      "lastEditedDate": "",
      "theme": null,
    },
    "data": []
  }
}

function addComponent(type, index, documentObject) {
  const component = {
    "id": crypto.randomUUID(),
    "type": type,
    "content": null
  }
  if (index) {
    documentObject.data.splice(index, 0, component)
  } else {
    documentObject.data.push(component)
  }
  generateHTML(currentDocument)
}

function generateToolbarHTML(index) {
  let toolbarHTML = `
    <div class="content-toolbar" data-index="${index}">
      <div class="content-toolbar-container">

        <button onclick="addComponent('text', ${index+1}, currentDocument)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5 10.5C6.5 10.2239 6.72386 10 7 10H7.5V6H6V6.5C6 6.77614 5.77614 7 5.5 7C5.22386 7 5 6.77614 5 6.5V5.5C5 5.22386 5.22386 5 5.5 5H10.5C10.7761 5 11 5.22386 11 5.5V6.5C11 6.77614 10.7761 7 10.5 7C10.2239 7 10 6.77614 10 6.5V6H8.5V10H9C9.27614 10 9.5 10.2239 9.5 10.5C9.5 10.7761 9.27614 11 9 11H7C6.72386 11 6.5 10.7761 6.5 10.5ZM1 5.5C1 4.11929 2.11929 3 3.5 3H12.5C13.8807 3 15 4.11929 15 5.5V10.5C15 11.8807 13.8807 13 12.5 13H3.5C2.11929 13 1 11.8807 1 10.5V5.5ZM3.5 4C2.67157 4 2 4.67157 2 5.5V10.5C2 11.3284 2.67157 12 3.5 12H12.5C13.3284 12 14 11.3284 14 10.5V5.5C14 4.67157 13.3284 4 12.5 4H3.5Z" fill="#212121"/>
          </svg>
          Add text
        </button>

        <button onclick="addComponent('title', ${index+1}, currentDocument)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2.5C3 2.22386 3.22386 2 3.5 2H11.5C11.7761 2 12 2.22386 12 2.5V4.5C12 4.77614 11.7761 5 11.5 5C11.2238 5 11 4.77614 11 4.5V3H7.99997L7.99998 13H9C9.27614 13 9.5 13.2239 9.5 13.5C9.5 13.7761 9.27614 14 9 14H6C5.72386 14 5.5 13.7761 5.5 13.5C5.5 13.2239 5.72386 13 6 13H6.99998L6.99997 3H4V4.5C4 4.77614 3.77614 5 3.5 5C3.22386 5 3 4.77614 3 4.5V2.5Z" fill="#212121"/>
          </svg>
          Add title
        </button>

      </div>

      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="7.5" width="10" height="1" rx="0.5" fill="currentColor"/>
      </svg>

    </div>
  `

  return toolbarHTML;
}

function generateHTML(documentObject) {

  document.getElementById("titlebar-title").innerText = "Space · " + documentObject.meta.documentName;

  let containerElement = document.getElementById("content-container");
  containerElement.innerHTML = ``;

  documentObject.data.forEach((component, index) => {

    let componentElement = ``;
    let content = component.content ? component.content?.toString() : ``;
    let data = `id="component-${component.id}" data-id="${component.id}" data-index=${index}`

    switch (component.type.toLowerCase()) {
      case "title": {
        componentElement = `
          <div contenteditable spellcheck="false" class="component content-title" ${data}>${content}</div>
        `
      } break;
      case "text": {
        componentElement = `
          <div contenteditable spellcheck="false" class="component content-text" ${data}">${content}</div>
        `
      } break;
    }

    containerElement.insertAdjacentHTML('beforeend', componentElement);
    containerElement.insertAdjacentHTML('beforeend', generateToolbarHTML(index));

    document.getElementById("component-" + component.id).addEventListener('paste', function (e) {

      e.preventDefault();

      const text = e.clipboardData
        ? (e.originalEvent || e).clipboardData.getData('text/plain')
        : // For IE
        window.clipboardData
        ? window.clipboardData.getData('Text')
        : '';

      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
      } else {
        const range = document.getSelection().getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });

    document.getElementById("component-" + component.id).oninput = (event) => {
      defaultDocument.data[index].content = event.target.innerText
    }
  });
}

// Buttons

document.getElementById("titlebar-button-minimize").onclick = () => {
  window.electronAPI.titlebarControl("minimize")
}

document.getElementById("titlebar-button-maximize").onclick = () => {
  window.electronAPI.titlebarControl("maximize")
}

document.getElementById("titlebar-button-close").onclick = () => {
  window.electronAPI.titlebarControl("close")
}

document.getElementById("titlebar-button-menu").onclick = () => {
  toggleMenu();
}

document.onkeydown = (event) => {
  if (event.altKey) {
    toggleMenu();
  }
}

function toggleMenu() {
  let menu = document.getElementById("titlebar-menu");
  if (menu.classList.contains("titlebar-menu-visible")) {
    menu.classList.remove("titlebar-menu-visible");
  } else {
    menu.classList.add("titlebar-menu-visible");
  }
}

document.getElementById("titlebar-menu-open-file").onclick = () => {
  window.electronAPI.openFile();
}

// import 'bootstrap';
// import 'bootstrap-css';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';

const editor = new EditorJS({
  holderId: 'editorJS',
  tools: {
    header: {
      class: Header,
      inlineToolbar: ['link']
    },
    list: {
      class: List,
      inlineToolbar: true
    },
    embed: {
      class: Embed,
      inlineToolbar: false,
      config: {
        services: {
          youtube: true,
          coub: true
        }
      }
    }
  }
});

let btnSaves = document.getElementById('btnSaves');
btnSaves.addEventListener('click', () => {
  editor.save().then((outputData) => {
    console.log(outputData);
    return fetch(window.location.pathname, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      content: JSON.stringify(outputData)
    });
  });
});

let btnReset = document.getElementById('btnReset');
btnReset.addEventListener('click', () => {
  editor.clear();
});

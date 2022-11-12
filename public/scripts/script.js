// import EditorJS from '@editorjs/editorjs';
// import Header from '@editorjs/header';
// import List from '@editorjs/list';

window.addEventListener(
  'load',
  () => {
    console.log('Ironmaker app started successfully!');
  },
  false
);

function pressButton() {
  document.getElementById('menuBtn').classList.toggle('pressedBtn');
  document.getElementById('navbar').classList.toggle('navbarOpen');
}
//* ???: This is just for testing purpose and no get familiar with it. Can be removed from this line */
const editor = new EditorJS({
  placeholder: 'Write something awesome here!',
  inlineToolbar: ['link', 'marker', 'bold', 'italic'],
  tools: {
    header: {
      class: Header,
      config: {
        placeholder: 'Überschrift hinzufügen...'
      }
    },
    image: {
      class: SimpleImage,
      inlineToolbar: true,
      config: {
        placeholder: 'Paste image URL'
      }
    },
    list: List,
    Marker: {
      class: Marker,
      shortcut: 'CMD+SHIFT+M'
    }

    // inlineCode: {
    //   class: InlineCode,
    //   shortcut: 'CMD+SHIFT+M'
    // }
  },
  onReady: () => {
    console.log('Editor.js is ready to work!');
  }
});

const saveBtn = document.querySelector('#editorBtn');

/*const postData = async (data) => {
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.status >= 400) {
    throw new Error('Bad response from server');
  }
  const actualResponse = await res.json();
};*/

// editor
//   .save()
//   .then((outputData) => {
//     console.log('Article data: ', outputData);
//   })
//   .catch((error) => {
//     console.log('Saving failed: ', error);
//   });

saveBtn.addEventListener('click', () => {
  editor
    .save()
    .then((editorData) => {
      console.log(editorData);
      //postData(editorData);
      // return fetch(window.location.pathname, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   content: JSON.stringify(editorData)
      // });
    })
    .catch((error) => {
      console.log('err: ', error);
    });
});

// JSON.stringify(object, replacer, space);

//savebtn.addEventListener('click', () => {
//  console.log('button works!!');
//  editor.save().then((editorData) => {
//    console.log(editorData);
//  });
//});

window.addEventListener(
  'load',
  () => {
    console.log('Ironmaker app started successfully!');
  },
  false
);

//* ???: This is just for testing purpose and no get familiar with it. Can be removed from this line */
const editor = new EditorJS({
  placeholder: 'Write something awesome here!',

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
    //inlineCode: {
    //  class: InlineCode,
    //  shortcut: 'CMD+SHIFT+M'
    //}
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

saveBtn.addEventListener('click', () => {
  editor
    .save()
    .then((editorData) => {
      //postData(editorData);
      return fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editorData)
      });
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

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
    // inlineCode: {
    //   class: InlineCode,
    //   shortcut: 'CMD+SHIFT+M'
    // }
  },
  onReady: () => {
    console.log('Editor.js is ready to work!');
  }
});
/*
editor
  .save()
  .then((outputData) => {
    console.log('Article data: ', outputData);
  })
  .catch((error) => {
    console.log('Saving failed: ', error);
  });
*/

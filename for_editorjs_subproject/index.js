var $ltMAx$editorjseditorjs = require("@editorjs/editorjs");
var $ltMAx$editorjsheader = require("@editorjs/header");
var $ltMAx$editorjslist = require("@editorjs/list");
var $ltMAx$editorjsembed = require("@editorjs/embed");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
// import 'bootstrap';
// import 'bootstrap-css';




const $4fa36e821943b400$var$editor = new (0, ($parcel$interopDefault($ltMAx$editorjseditorjs)))({
    holderId: "editorJS",
    tools: {
        header: {
            class: (0, ($parcel$interopDefault($ltMAx$editorjsheader))),
            inlineToolbar: [
                "link"
            ]
        },
        list: {
            class: (0, ($parcel$interopDefault($ltMAx$editorjslist))),
            inlineToolbar: true
        },
        embed: {
            class: (0, ($parcel$interopDefault($ltMAx$editorjsembed))),
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
let $4fa36e821943b400$var$btnSaves = document.getElementById("btnSaves");
$4fa36e821943b400$var$btnSaves.addEventListener("click", ()=>{
    $4fa36e821943b400$var$editor.save().then((outputData)=>{
        console.log(outputData);
        fetch(window.location.pathname, {
            method: "POST",
            headers: {
                // 'Content-Type': 'application/json'
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: JSON.stringify(outputData)
        }).then((response)=>response.json()).then((data)=>{
            console.log("Success:", data);
        }).catch((error)=>{
            console.error("Error:", error);
        });
    // return fetch(window.location.pathname, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(outputData)
    // });
    });
});
let $4fa36e821943b400$var$btnReset = document.getElementById("btnReset");
$4fa36e821943b400$var$btnReset.addEventListener("click", ()=>{
    $4fa36e821943b400$var$editor.clear();
});


//# sourceMappingURL=index.js.map

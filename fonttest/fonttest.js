'use strict';

var iFontImport = {
  css: {
    node: '<label>Script URL <input id="ftURL"></label>',
    toCSS: function() {
      let url = document.getElementById('ftURL').value;
      return `@import url("${url}");`;
    }
  },
  cus: {
    node: '<label>Font URL <input id="ftURL"></label><label>Name <input id="ftSrcName"></label>',
    toCSS: function() {
      let name = document.getElementById('ftSrcName').value;
      let url = document.getElementById('ftURL').value;
      return `@font-face{font-family:"${name}";src:url("${url}");};`;
    }
  }
};

var ftTextArea = document.getElementById('ftTextArea');

var ftFamily = document.getElementById('ftFamily');
var ftSize = document.getElementById('ftSize');
var ftWeight = document.getElementById('ftWeight');
var ftStyle = document.getElementById('ftStyle');
var ftWidth = document.getElementById('ftWidth');
var ftVariant = document.getElementById('ftVariant');

var ftAddWebfont = document.getElementById('ftAddWebfont');
var ftImportType = document.getElementById('ftImportType');

function setFontFamily() {
  ftTextArea.style.fontFamily = ftFamily.value;
}

function setFontSize() {
  ftTextArea.style.fontSize = ftSize.value;
}

function setFontWeight() {
  ftTextArea.style.fontWeight = ftWeight.value;
}

function setFontStyle() {
  ftTextArea.style.fontStyle = ftStyle.value;
}

function setFontWidth() {
  ftTextArea.style.fontStretch = ftWidth.value;
}

function setFontVariant() {
  ftTextArea.style.fontVariant = ftVariant.checked ? 'small-caps' : 'normal';
}

function toggleWebfontPanel() {
  let shown = ftAddWebfont.checked;
  if (shown) {
    updateWebfontImportType();
  }
  document.getElementById('ftWebfontPanel').hidden = !shown;
}

function updateWebfontImportType() {
  document.getElementById('ftSrcSpan').innerHTML = iFontImport[ftImportType.value].node;
}

ftFamily.onchange = setFontFamily;
ftSize.onchange = setFontSize;
ftWeight.onchange = setFontWeight;
ftStyle.onchange = setFontStyle;
ftWidth.onchange = setFontWidth;
ftVariant.onchange = setFontVariant;

ftAddWebfont.onchange = toggleWebfontPanel;
ftImportType.onchange = updateWebfontImportType;

document.getElementById('ftAddWebfontOK').onclick = function() {
  let styleNode = `<style>${iFontImport[ftImportType.value].toCSS()}</style>`;
  document.head.innerHTML += styleNode;
  ftAddWebfont.checked = false;
  toggleWebfontPanel();
};

setFontFamily();
setFontSize();
setFontWeight();
setFontStyle();
setFontWidth();
setFontVariant();

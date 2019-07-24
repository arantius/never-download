'use strict';

const ATTACHMENT_REGEX = /^attachment/;
const EXTENSION_REGEX = /\.(gif|jpe?g|png|pdf|txt)$/;
const FILENAME_REGEX = /filename(\*=.*?''|=)('|")?(.*?)(\2|;|^)/;
const TYPE_REGEX = /^(image|text)|\bpdf\b/;

function headerListener(e) {
  let h = e.responseHeaders;

  let type = h.find(h => h.name.toLowerCase() == 'content-type');
  let disp = h.find(h => h.name.toLowerCase() == 'content-disposition');
  let filename = disp && disp.value.match(FILENAME_REGEX);
  filename = filename && filename[3];
  let ext = filename && filename.match(EXTENSION_REGEX)
      || e.url.match(EXTENSION_REGEX);
  ext = ext && ext[1];

  // If the content disposition forces download, rewrite that.
  if (disp && disp.value.match(ATTACHMENT_REGEX)) {
    if ((type && type.value.match(TYPE_REGEX))
        || (filename && filename.match(FILENAME_REGEX))
        || (ext)
    ) {
      disp.value = disp.value.replace(ATTACHMENT_REGEX, ' inline')
    }
  }

  // If the MIME type forces download, rewrite that.
  if (type && type.value == 'application/octet-stream') {
    let m = e && e.url && e.url.match(EXTENSION_REGEX);
    switch (ext) {
    case 'gif':
    case 'jpg':
    case 'jpeg':
    case 'png':
      type.value = 'image/' + ext;
    case 'pdf':
      type.value = 'application/pdf';
      break;
    case 'txt':
      type.value = 'text/plain';
      break;
    }
  }

  return {responseHeaders: h};
}

browser.webRequest.onHeadersReceived.addListener(
    headerListener,
    {'urls': ['<all_urls>']},
    ['blocking', 'responseHeaders']);

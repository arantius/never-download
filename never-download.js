'use strict';

const ATTACHMENT_REGEX = /^attachment/;
const EXTENSION_REGEX = /\.(gif|jpe?g|png|pdf|txt)$/;
const FILENAME_REGEX = /filename(\*=.*?''|=)('|")?(.*?)(\2|;|^)/;
const TYPE_REGEX = /^(image|text)|\bpdf\b/;

function headerListener(e) {
  let h = e.responseHeaders;

  let disp = h.find(h => h.name.toLowerCase() == 'content-disposition');
  if (!disp || !disp.value) {
    // If there's no disposition, then no forced download, so nothing to do.
    return h;
  }
  if (!disp.value.match(ATTACHMENT_REGEX)) {
    // No forced download, nothing to do.
    return h;
  }

  let type = h.find(h => h.name.toLowerCase() == 'content-type');
  let filename = disp.value.match(FILENAME_REGEX);
  filename = filename && filename[3];

  //console.log('ND type:', type||null, '\ndisp:', disp, '\nfilename:', filename);
  if ((type && type.value.match(TYPE_REGEX))
      || (filename && filename.match(FILENAME_REGEX))
      || (e && e.url && e.url.match(EXTENSION_REGEX))
  ) {
    disp.value = disp.value.replace(ATTACHMENT_REGEX, ' inline')
  }

  return {responseHeaders: h};
}

browser.webRequest.onHeadersReceived.addListener(
    headerListener,
    {'urls': ['<all_urls>']},
    ['blocking', 'responseHeaders']);

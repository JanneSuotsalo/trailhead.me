window.postData = {
  fileIDs: [],
  text: '',
};

window.postDataCheck = () => {
  const submit = document.querySelector('[type="submit"]');

  if (window.postData.fileIDs.length) {
    submit.removeAttribute('disabled');
  } else {
    submit.setAttribute('disabled', true);
  }
};

const upload = document.getElementById('upload');

Uploader(upload, {
  //onError: showError,
  onUpload: file => {
    console.log('Upload file', file);
    window.postData.fileIDs.push(file);
    window.postDataCheck();
  },
  supportedFiles: ['.png', '.jpg', '.jpeg'],
  emptyMessage: 'Upload something!',
  maxFiles: 1,
});

const submit = document.querySelector('[type="submit"]');
const error = document.querySelector('[id="error"]');
const textarea = document.querySelector('[name="text"]');

if (window.postData.fileIDs.length && window.postData.text) {
  submit.removeAttribute('disabled');
} else {
  submit.setAttribute('disabled', true);
}

const saveSettings = () => {
  fetch('/editUser', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(window.postData),
  })
    .then(data => data.json())
    .then(json => {
      if (json.status !== 'ok') {
        switch (json.status) {
          case 'invalid credentials':
            error.innerHTML = 'Invalid credentials, please try again...';
            return;
          case 'validation error':
            error.innerHTML = 'Some fields contain invalid values';
            return;
          default:
            error.innerHTML = 'An error occurred, please try again...';
            return;
        }
      } else {
        window.location.replace(`/${window.user.username}`);
      }
    });
};

submit.addEventListener('click', saveSettings);

const highlight = document.querySelector('.textarea .highlight');
const highlightUpdate = () => {
  window.postData.text = textarea.value;
  window.postDataCheck();

  highlight.textContent = textarea.value;
  highlight.innerHTML = highlight.innerHTML
    .replace(/\n$/g, '\n\n')
    .replace(/\B(\#[a-zA-Z]{1,16}\b)(?!;)/gm, x => `<span>${x}</span>`);
};
const highlightScroll = () => {
  console.log('scroll');
  highlight.scrollTop = textarea.scrollTop;
};

textarea.addEventListener('input', highlightUpdate);
textarea.addEventListener('scroll', highlightScroll);

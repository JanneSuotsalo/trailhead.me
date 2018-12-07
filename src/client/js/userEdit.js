window.postData = {
  fileIDs: [],
  displayName: '',
  text: '',
};

// Check for user input
window.postDataCheck = () => {
  const submit = document.querySelector('[type="submit"]');

  if (
    window.postData.fileIDs.length ||
    window.postData.text ||
    window.postData.displayName
  ) {
    submit.removeAttribute('disabled');
  } else {
    submit.setAttribute('disabled', true);
  }
};

const upload = document.getElementById('upload');

Uploader(upload, {
  //onError: showError,
  onUpdate: fileIDs => {
    window.postData.fileIDs = [...fileIDs];
    window.postDataCheck();
  },
  supportedFiles: ['.png', '.jpg', '.jpeg'],
  emptyMessage: 'Upload something!',
  maxFiles: 1,
});

const submit = document.querySelector('[type="submit"]');
const error = document.querySelector('[id="error"]');
const textarea = document.querySelector('[name="text"]');
const dName = document.querySelector('[name="displayName"]');

if (
  window.postData.fileIDs.length ||
  window.postData.text ||
  window.postData.displayName
) {
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

const highlight = document.querySelector('.textarea .highlight');
const highlightUpdate = () => {
  window.postData.text = textarea.value;
  window.postData.displayName = dName.value;
  window.postDataCheck();

  highlight.textContent = textarea.value;
  highlight.innerHTML = highlight.innerHTML
    .replace(/\n$/g, '\n\n')
    .replace(/\B(\#[a-zA-Z]{1,16}\b)(?!;)/gm, x => `<span>${x}</span>`);
};
const highlightScroll = () => {
  highlight.scrollTop = textarea.scrollTop;
};

submit.addEventListener('click', saveSettings);
textarea.addEventListener('input', highlightUpdate);
textarea.addEventListener('scroll', highlightScroll);
dName.addEventListener('input', highlightUpdate);
dName.addEventListener('scroll', highlightScroll);

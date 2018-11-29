window.postData = {
  fileIDs: [],
  text: '',
  location: true,
};

window.postDataCheck = () => {
  console.log(!!window.postData.fileIDs.length, !!window.postData.text);

  const submit = document.querySelector('[type="submit"]');

  if (window.postData.fileIDs.length /*&& window.postData.text*/) {
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

if (window.postData.fileIDs.length && window.postData.text) {
  submit.removeAttribute('disabled');
} else {
  submit.setAttribute('disabled', true);
}

const saveSettings = () => {
  console.log('savePost');
  fetch('/editUser', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...window.postData,
      location: {
        locationTypeID: window.postData.location.typeID,
        uuid: window.postData.location.identifier,
        name: window.postData.location.name,
        address: window.postData.location.subname,
        /*coordinates: {
          lat: window.postData.location.lat,
          lon: window.postData.location.lon,
        },*/
      },
    }),
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

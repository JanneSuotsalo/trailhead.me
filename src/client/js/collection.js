window.postData = {
  collectionName: '',
  description: '',
};

const addButton = document.getElementById('addCollection');
const dialog = document.getElementById('collectionDialog');
const collectionName = document.getElementById('collectionName');
const description = document.getElementById('description');
const save = document.getElementById('saveButton');
const error = document.getElementById('error');

addButton.addEventListener('click', () => {
  dialog.showModal();
});

save.addEventListener('click', () => {
  window.postData.collectionName = collectionName.value;
  window.postData.description = description.value;

  fetch('/collection', {
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
      }
    });
});

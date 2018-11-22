(() => {
  const zone = document.querySelector('.input.file');
  const input = document.querySelector('.input.file input');
  const error = document.getElementById('error');

  const uploadedFiles = [];

  const showError = text => {
    error.style.display = 'block';
    error.innerHTML = text;
  };

  const upload = files => {
    error.style.display = 'none';
    zone.classList.remove('drag');

    if (uploadedFiles.length >= 8) {
      showError('Maximum media count is 8, no more media can be added');
      return;
    }

    if (files.length > 8 - uploadedFiles.length) {
      showError(
        'Post media count would go over 8, please select fewer files...'
      );
      return;
    }

    document.querySelector('.gallery .message').style.display = 'none';

    const gallery = document.querySelector('.gallery');
    gallery.classList.remove('empty');

    const elements = [];
    const data = new FormData();
    for (const file of files) {
      data.append('list', file);

      const element = document.createElement('div');
      element.style.backgroundImage = `url(/file/${file})`;
      gallery.appendChild(element);

      elements.push(element);
    }

    fetch('/file', {
      method: 'POST',
      body: data,
    })
      .then(response => response.json())
      .then(status => {
        if (status.status !== 'ok') {
          console.error(status);
          for (const element of elements) {
            element.remove();
          }
          showError('Something went wrong, please try again...');
          return;
        } else {
          for (const file in status.fileIDs) {
            const element = elements[file];
            element.style.backgroundImage = `url(/file/${
              status.fileIDs[file]
            })`;
            element.style.backgroundSize = '100%';
            uploadedFiles.push(status.fileIDs[file]);
          }
        }
      })
      .catch(error => console.log(error));
  };

  const dropHandler = event => {
    event.preventDefault();
    upload(event.dataTransfer.files);
  };

  const selectHandler = event => {
    if (event.target.files.length > 0) upload(event.target.files);
  };

  zone.addEventListener('drop', dropHandler);

  zone.addEventListener('dragover', event => {
    zone.classList.add('drag');
    event.preventDefault();
  });

  zone.addEventListener('dragleave', event => {
    zone.classList.remove('drag');
    event.preventDefault();
  });

  input.addEventListener('change', selectHandler);
})();

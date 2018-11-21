(() => {
  const zone = document.querySelector('.input.file');
  const input = document.querySelector('.input.file input');

  const upload = files => {
    document.querySelector('.gallery .message').style.display = 'none';
    zone.classList.remove('drag');

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
      .then(
        response => response.json() // if the response is a JSON object
      )
      .then(status => {
        if (status.status !== 'ok') {
          console.error(status);
        } else {
          for (const file in status.fileIDs) {
            const element = elements[file];
            element.style.backgroundImage = `url(/file/${
              status.fileIDs[file]
            })`;
            element.style.backgroundSize = '100%';
          }
        }
      })
      .catch(
        error => console.log(error) // Handle the error response object
      );
  };

  const dropHandler = event => {
    event.preventDefault();
    upload(event.dataTransfer.files);
  };

  const selectHandler = event => {
    // TODO: Properly limit files to only 8
    if (event.target.files.length > 0 && event.target.files.length <= 8) {
      upload(event.target.files);
    }
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

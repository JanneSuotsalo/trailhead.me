(() => {
  const zone = document.querySelector('.input.file');
  const input = document.querySelector('.input.file input');

  const upload = files => {
    document.querySelector('.gallery .message').style.display = 'none';

    const data = new FormData();
    for (const file of files) {
      data.append('list', file);
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
          const gallery = document.querySelector('.gallery');
          gallery.classList.remove('empty');

          for (const file of status.fileIDs) {
            const image = document.createElement('div');
            image.style.backgroundImage = `url(/file/${file})`;
            gallery.appendChild(image);
          }
        }
      })
      .catch(
        error => console.log(error) // Handle the error response object
      );
  };

  const dropHandler = event => {
    console.log('File(s) dropped');

    zone.classList.remove('drag');

    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();

    if (event.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < event.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (event.dataTransfer.items[i].kind === 'file') {
          var file = event.dataTransfer.items[i].getAsFile();
          console.log('... file[' + i + '].name = ' + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < event.dataTransfer.files.length; i++) {
        console.log(
          '... file[' + i + '].name = ' + event.dataTransfer.files[i].name
        );
      }
    }
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

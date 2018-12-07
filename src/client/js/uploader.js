const Uploader = (
  parent = null,
  {
    errorElement = null,
    supportedFiles = ['.png', '.jpg', '.jpeg', '.mp4', '.webm'],
    emptyMessage = 'Upload something to get started!<br />You can upload up to 8 items.',
    maxFiles = 8,
    allowReorder = false,
    allowRemove = true,

    onUpload = file => {},
    onError = error => {},
    onUpdate = files => {},
  }
) => {
  let uploadedFiles = [];

  if (!parent) {
    return console.error('Parent element must be specified!');
  }

  const element = parent;

  element.innerHTML = `
    <label class="input file">
      <input type="file" accept="${supportedFiles.join(',')}" multiple />
      <div class="help">
        <span class="mdi mdi-file-download"></span>
        <p>${supportedFiles.join(' ')}</p>
      </div>
    </label>

    <div class="gallery">
      <div class="empty"></div>

      <span class="message">
        <span class="mdi mdi-information-outline"></span>
        ${emptyMessage}
      </span>
    </div>
  `;

  const input = element.querySelector('.input.file input');
  const zone = document.querySelector('.input.file');

  const showError = text => {
    if (errorElement) {
      errorElement.style.display = 'block';
      errorElement.innerHTML = text;
    }

    onError(text);
  };

  let draggedElement = null;

  const upload = files => {
    if (errorElement) errorElement.style.display = 'none';
    zone.classList.remove('drag');

    if (uploadedFiles.length >= maxFiles) {
      showError(
        `Maximum media count is ${maxFiles}, no more media can be added`
      );
      return;
    }

    if (files.length > maxFiles - uploadedFiles.length) {
      showError(
        `Post media count would go over ${maxFiles}, please select fewer files...`
      );
      return;
    }

    element.querySelector('.gallery .message').style.display = 'none';

    const gallery = element.querySelector('.gallery');
    gallery.classList.remove('empty');

    const elements = [];
    const data = new FormData();

    for (const file of files) {
      data.append('list', file);

      const element = document.createElement('div');
      element.style.backgroundImage = `url(/file/${file.name})`;

      if (file.type.split('/')[0] === 'video') {
        const video = document.createElement('video');
        video.setAttribute('src', URL.createObjectURL(file));
        element.appendChild(video);
      }

      if (allowRemove) {
        const remove = document.createElement('span');
        remove.classList.add('remove', 'mdi', 'mdi-close-circle-outline');
        element.classList.add('remove');

        remove.addEventListener('click', () => {
          uploadedFiles = uploadedFiles.filter(
            x => x !== element.getAttribute('value')
          );
          element.remove();
          onUpdate(uploadedFiles);
        });

        element.appendChild(remove);
      }

      if (allowReorder) {
        const handle = document.createElement('span');
        handle.classList.add('handle', 'mdi', 'mdi-reorder-horizontal');
        element.appendChild(handle);
        element.classList.add('reorder');

        element.addEventListener('dragstart', event => {
          // event.preventDefault();
          draggedElement = element;
          event.dataTransfer.effectAllowed = 'move';
        });

        element.addEventListener('dragover', event => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          element.classList.add('drop');
          return false;
        });

        element.addEventListener('dragleave', event => {
          event.preventDefault();
          element.classList.remove('drop');
          return false;
        });

        const stopDrag = event => {
          event.preventDefault();
          event.stopPropagation();
          elements.forEach(x => x.classList.remove('drop'));
          if (draggedElement === element) return;

          // Update visual order
          const children = Array.from(element.parentNode.children);
          if (children.indexOf(element) < children.indexOf(draggedElement)) {
            gallery.insertBefore(draggedElement, element);
          } else {
            gallery.insertBefore(draggedElement, element.nextSibling);
          }

          // Update logic order
          uploadedFiles = Array.from(element.parentNode.children)
            .filter(x => x.hasAttribute('value'))
            .map(x => x.getAttribute('value'));

          // Call update
          onUpdate(uploadedFiles);
        };

        element.addEventListener('drop', stopDrag);
        element.addEventListener('dragend', stopDrag);
      }

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
            element.setAttribute('draggable', true);
            element.setAttribute('value', status.fileIDs[file]);
            element.classList.add('done');
            element.style.backgroundImage = `url(/file/${
              status.fileIDs[file]
            })`;
            element.style.backgroundSize = '100%';
            uploadedFiles.push(status.fileIDs[file]);
            onUpload(status.fileIDs[file]);
            onUpdate(uploadedFiles);
          }
        }
      })
      .catch(onError);
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
};

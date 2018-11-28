window.postData = {
  fileIDs: [],
  text: '',
  location: null,
};

window.postDataCheck = () => {
  console.log(
    !!window.postData.fileIDs.length,
    !!window.postData.text,
    !!window.postData.location
  );

  const submit = document.querySelector('[type="submit"]');

  if (
    window.postData.fileIDs.length &&
    window.postData.text &&
    window.postData.location
  ) {
    submit.removeAttribute('disabled');
  } else {
    submit.setAttribute('disabled', true);
  }

  /*
  document
    .querySelector('[type="submit"]')
    .setAttribute(
      'disabled',
      !(
        window.postData.fileIDs.length &&
        window.postData.text &&
        window.postData.location
      )
    );
    */
};

(() => {
  const zone = document.querySelector('.input.file');
  const input = document.querySelector('.input.file input');
  const error = document.getElementById('error');
  const submit = document.querySelector('[type="submit"]');

  const placeholders = [
    'We went on a hike...',
    'I checked out...',
    'The weather was...',
    'It was beautiful at...',
    'The view was...',
    'We travelled to...',
    'I visited the...',
    'Had a good walk in...',
    'Great jogging route at...',
    'Camped near the...',
    'What a day at...',
  ];

  const textarea = document.querySelector('[name="text"]');
  textarea.setAttribute(
    'placeholder',
    placeholders[Math.floor(Math.random() * placeholders.length)]
  );

  const showError = text => {
    error.style.display = 'block';
    error.innerHTML = text;
  };

  const upload = files => {
    error.style.display = 'none';
    zone.classList.remove('drag');

    if (window.postData.fileIDs.length >= 8) {
      showError('Maximum media count is 8, no more media can be added');
      return;
    }

    if (files.length > 8 - window.postData.fileIDs.length) {
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
            window.postData.fileIDs.push(status.fileIDs[file]);
          }

          window.postDataCheck();
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

  const savePost = () => {
    if (!window.postData.text || window.postData.text.length < 2) {
      showError('Post text has to contain at least two characters.');
      return;
    }

    if (!window.postData.fileIDs.length) {
      showError('Post has to contain at least one media item');
      return;
    }

    if (window.postData.fileIDs.length > 8) {
      showError('Post contains too many media items, maximum is 8');
      return;
    }

    if (!window.postData.location) {
      showError('Post has to have a location.');
      return;
    }

    fetch('/post', {
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
          coordinates: {
            lat: window.postData.location.lat,
            lon: window.postData.location.lon,
          },
        },
      }),
    })
      .then(data => data.json())
      .then(json => {
        if (json.status !== 'ok') {
          switch (json.status) {
            case 'invalid credentials':
              showError('Invalid credentials, please try again...');
              return;
            case 'validation error':
              showError('Some fields contain invalid values');
              return;
            default:
              showError('An error occurred, please try again...');
              return;
          }
        } else {
          window.location.replace(`/${window.user.username}/${json.postID}`);
        }
      });
  };

  submit.addEventListener('click', savePost);

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
})();

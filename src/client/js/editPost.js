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
  const error = document.getElementById('error');
  const submit = document.querySelector('[type="submit"]');

  const showError = text => {
    if (typeof text !== 'string') return;
    error.style.display = 'block';
    error.innerHTML = text;
  };

  const upload = document.getElementById('upload');

  Uploader(upload, {
    onError: showError,
    onUpload: file => {
      console.log('Upload file', file);
      window.postData.fileIDs.push(file);
      window.postDataCheck();
    },
  });

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

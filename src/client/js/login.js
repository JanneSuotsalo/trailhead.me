(() => {
  const form = document.querySelector('form#login');

  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    const email = document.querySelector('[name="email"]').value;
    const password = document.querySelector('[name="password"]').value;

    const error = document.getElementById('error');
    error.style.display = 'none';

    const showError = text => {
      error.style.display = 'block';
      error.innerText = text;
    };

    fetch('/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
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
          window.location.replace('/');
        }
      });
  });
})();

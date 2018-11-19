(() => {
  const form = document.querySelector('form#register');

  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    const email = document.querySelector('[name="email"]').value;
    const username = document.querySelector('[name="username"]').value;
    const password = document.querySelector('[name="password"]').value;
    const repassword = document.querySelector('[name="repassword"]').value;

    const error = document.getElementById('error');
    error.style.display = 'none;';

    const showError = text => {
      error.style.display = 'block;';
      error.innerText = text;
    };

    if (password !== repassword) {
      error.innerText = 'Passwords do not match';
      return;
    }

    if (!/^[a-z0-9_-]{2,32}$/.test(username)) {
      error.innerText =
        'Invalid username, please only use lowercase letters, numbers, "-" and "_"';
      return;
    }

    fetch('/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    })
      .then(data => data.json())
      .then(json => {
        console.log(json);

        if (json.status !== 'ok') {
          switch (json.status) {
            case 'availability error':
              showError('Username has already been taken');
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

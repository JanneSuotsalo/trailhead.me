const followButton = document.getElementById('follow');

const currentUrl = window.location.href;

const followUser = () => {
  fetch(currentUrl + '/follow', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(data => data.json())
    .then(json => {
      if (json.status !== 'ok') {
        console.log('follow unsuccessful');
      } else {
        if (follow.className == 'mdi mdi-account-multiple-minus') {
          follow.className = 'mdi mdi-account-multiple-plus';
        } else if ((follow.className = 'mdi mdi-account-multiple-plus')) {
          follow.className = 'mdi mdi-account-multiple-minus';
        }
      }
    });
};

follow.addEventListener('click', followUser);

const followButton = document.getElementById('follow');

const currentUrl = window.location.href;

/*console.log(following);
if (following > 0) {
  followButton.className = 'mdi mdi-account-multiple-minus';
} else {
  followButton.className = 'mdi mdi-account-multiple-plus';
}*/

const followUser = () => {
  console.log('follow press');
  fetch(currentUrl + '/follow', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    //body: JSON.stringify(followData),
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

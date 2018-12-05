(() => {
  const followButton = document.querySelector('#profile .follow');

  let isFollowing = window.preloadProfile.follow.status;

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
        if (json.status === 'ok') {
          const event = new CustomEvent('follow', {
            detail: {
              username: window.preloadProfile.username,
              state: !isFollowing,
            },
          });
          document.dispatchEvent(event);
        }
      });
  };

  const updateFollowStatus = () => {
    if (!isFollowing) {
      followButton.innerHTML = `<span class="mdi mdi-account-multiple-plus"></span> Follow`;
      followButton.classList.remove('unfollow');
    } else {
      followButton.innerHTML = `<span class="mdi mdi-account-multiple-minus"></span> Unfollow`;
      followButton.classList.add('unfollow');
    }
  };

  let followers = document.getElementsByClassName('followCount')[1];
  let followCount;
  followCount = Number(followers.innerText);

  // Listen for follow event and update UI if necessary
  document.addEventListener('follow', event => {
    if (event.detail.username !== window.preloadProfile.username) return;
    isFollowing = event.detail.state;
    // Updates following count when following/unfollowing
    if (!isFollowing) {
      followCount -= 1;
      followers.innerText = followCount;
    }
    if (isFollowing) {
      followCount += 1;
      followers.innerText = followCount;
    }

    updateFollowStatus();
  });

  updateFollowStatus();

  followButton.addEventListener('click', followUser);

  if (!window.user || window.preloadProfile.username === window.user.username)
    followButton.remove();
})();

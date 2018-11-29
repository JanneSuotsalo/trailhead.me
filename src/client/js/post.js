const globalPosition = element => {
  let top = 0;
  let left = 0;

  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);

  return {
    top: top,
    left: left,
  };
};

const createPost = (post, link = false) => {
  const modal = document.createElement('div');
  modal.classList.add('modal', 'post', 'full');

  // Construct the basic post layout
  // prettier-ignore
  modal.innerHTML = `
    <div class="gallery">
      <div class="control right"><span class="mdi mdi-arrow-right"></span></div>
      <div class="control left"><span class="mdi mdi-arrow-left"></span></div>

      <div class="container">
      <div class="list">
        ${post.media.map(media => `
        <div class="media">
          <div class="image" style="background-image: url(/file/${media}/m);"></div>
          <a href="/file/${media}">
            <div class="view"><span class="mdi mdi-fullscreen"></span>View full image</div>
          </a>
        </div>
        `).join('')}
      </div>
      </div>
    </div>
    ${post.location ? `
    <div class="location" ${post.location.fileID ? `style="background-image: url(/file/${post.location.fileID})"` : ''}>
      <div class="icon">
        <span class="mdi mdi-${post.location.icon}"></span>
      </div>
      <div class="info">
        <p>${post.location.name}</p>
        <small>${post.location.address}</small>
      </div>
    </div>
    <div class="react"></div>
    `: ''}
  `;

  const info = document.createElement('a');
  info.classList.add('info');
  if (link) info.setAttribute('href', `/${post.user.username}/${post.postID}`);

  // Format and include the post text content
  const content = document.createElement('p');
  content.textContent = post.text;
  content.innerHTML = content.innerHTML.replace(
    /\B(\#[a-zA-Z]{1,16}\b)(?!;)/gm,
    x => `<a>${x}</a>`
  );

  // Format and include the post time
  const time = document.createElement('p');
  time.classList.add('time');
  time.innerText = moment(post.createdAt).fromNow();
  time.setAttribute('title', moment(post.createdAt).format('DD.MM.YYYY HH.mm'));

  info.appendChild(content);
  info.appendChild(time);

  modal.appendChild(info);

  // Handle the madia controls
  const right = modal.querySelector('.gallery > .right');
  const left = modal.querySelector('.gallery > .left');
  const list = modal.querySelector('.gallery > .container > .list');
  let position = 0;

  left.style.display = 'none';
  right.style.display = 'none';

  if (post.media.length > 1) {
    right.style.display = 'block';
  }

  const moveGalleryPosition = direction => {
    position = Math.max(
      0,
      Math.min(post.media.length - 1, position + direction)
    );
    list.style.left = `${-position * 100}%`;

    left.style.display = position > 0 ? 'block' : 'none';
    right.style.display = position < post.media.length - 1 ? 'block' : 'none';
  };

  right.addEventListener('click', () => {
    moveGalleryPosition(1);
  });

  left.addEventListener('click', () => {
    moveGalleryPosition(-1);
  });

  const emoji = [
    ['👍', '❤️', '😂'],
    ['🤔', '😨'],
    ['😥', '😡'],
    ['🍀', '🏆', '🔥', '💩'],
  ];

  const reactDialog = document.createElement('div');
  reactDialog.classList.add('dialog', 'add-react');
  reactDialog.innerHTML = emoji
    .map(x => `<div>${x.map(y => `<span>${y}</span>`).join('')}</div>`)
    .join('');
  document.querySelector('content').appendChild(reactDialog);

  let userReact = post.userReact;
  reactDialog.querySelectorAll('span').forEach(element =>
    element.addEventListener('click', () => {
      fetch(`/${post.user.username}/${post.postID}/react`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emoji: element.innerHTML,
        }),
      })
        .then(data => data.json())
        .then(json => {
          userReact = element.innerHTML;
          myReact.innerHTML = userReact;
          updateReactStatus();
        });
    })
  );

  const reactContainer = modal.querySelector('.react');
  reactContainer.innerHTML = `<div class="list"></div>`;

  const reactButton = document.createElement('div');
  reactButton.classList.add('add');
  reactButton.innerHTML = '<span class="mdi mdi-plus"></span> React';

  reactButton.addEventListener('click', () => {
    const rect = globalPosition(reactButton);
    reactDialog.style.top = rect.top + 24 + 'px';
    reactDialog.style.left = rect.left + reactButton.offsetWidth / 2 + 'px';
    reactDialog.style.display = 'flex';
  });

  const myReact = document.createElement('div');
  myReact.classList.add('mine');
  myReact.innerHTML = userReact;

  myReact.addEventListener('click', () => {
    fetch(`/${post.user.username}/${post.postID}/react`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(data => data.json())
      .then(json => {
        userReact = null;
        updateReactStatus();
      });
  });

  reactContainer.appendChild(reactButton);
  reactContainer.appendChild(myReact);

  const updateReactStatus = () => {
    if (!userReact) {
      reactContainer.querySelector('.add').style.display = 'block';
      reactContainer.querySelector('.mine').style.display = 'none';
    } else {
      reactContainer.querySelector('.add').style.display = 'none';
      reactContainer.querySelector('.mine').style.display = 'block';
    }

    const reactAmount = (post.reacts || []).reduce((l, x) => l + x.amount, 0);
    if (reactAmount) {
      reactContainer.querySelector('.list').style.display = 'block';
      reactContainer.querySelector('.list').innerHTML = `
        <span class="amount"><span>${reactAmount}</span></span>
        ${(post.reacts || []).map(x => x.text).join('')}
      `;
    } else {
      reactContainer.querySelector('.list').style.display = 'none';
    }
  };

  updateReactStatus();

  document.addEventListener('click', event => {
    if (reactButton && event.target === reactButton) return;
    reactDialog.style.display = 'none';
  });

  return modal;
};

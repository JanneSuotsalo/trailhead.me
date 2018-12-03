const emoji = [
  ['👍', '❤️', '😂'],
  ['🤔', '😨'],
  ['😥', '😡'],
  ['🍀', '🏆', '🔥', '💩'],
];

let reactDialog = null;
let reactDialogData = {
  postID: null,
  username: null,
  onReact: () => {},
};

(() => {
  reactDialog = document.createElement('div');
  reactDialog.classList.add('dialog', 'add-react');
  reactDialog.innerHTML = emoji
    .map(
      x =>
        `<div>${x
          .map(y => `<span value="${y}">${twemoji.parse(y)}</span>`)
          .join('')}</div>`
    )
    .join('');

  reactDialog.querySelectorAll('span').forEach(element =>
    element.addEventListener('click', () => {
      fetch(`/${reactDialogData.username}/${reactDialogData.postID}/react`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emoji: element.getAttribute('value'),
        }),
      })
        .then(data => data.json())
        .then(json => {
          reactDialogData.onReact(element.innerHTML);
        });
    })
  );

  document.addEventListener('click', event => {
    reactDialog.style.display = 'none';
  });

  document.querySelector('content').appendChild(reactDialog);
})();

const createPost = (post, link = false) => {
  const fixedPosition = element => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top + window.scrollY, left: rect.left };
  };

  const modal = document.createElement('div');
  modal.classList.add('modal', 'post', 'full');

  let currentMediaID = post.media[0];

  // Construct the basic post layout
  // prettier-ignore
  modal.innerHTML = `
    <div class="gallery">
      <div class="control right"><span class="mdi mdi-arrow-right"></span></div>
      <div class="control left"><span class="mdi mdi-arrow-left"></span></div>

      <div class="view"><span class="mdi mdi-fullscreen"></span>View full image</div>

      <div class="container">
      <div class="list">
        ${post.media.map(media => `
        <div class="media">
          <div class="image" style="background-image: url(/file/${media}/l);"></div>
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
    <a href="/${post.user.username}">
      <div class="user">
        <div class="icon">
          <div class="image" style="background-image: url(/file/${post.user.image}/s)"></div>
        </div>
        <div class="info">
          <p>${post.user.displayName}</p>
          <small>@${post.user.username}</small>
        </div>
      </div>
    </a>
    <div class="react"></div>
    `: ''}
  `;

  const info = document.createElement('a');
  info.classList.add('info');
  if (link) info.setAttribute('href', `/${post.user.username}/${post.postID}`);

  // Format and include the post text content
  const content = document.createElement('p');
  content.textContent = post.text;
  let htmlContent = content.innerHTML.replace(
    /\B(\#[a-zA-Z]{1,16}\b)(?!;)/gm,
    x => `<a>${x}</a>`
  );
  htmlContent = twemoji.parse(htmlContent);
  content.innerHTML = htmlContent;

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

    currentMediaID = post.media[position];
  };

  right.addEventListener('click', () => {
    moveGalleryPosition(1);
  });

  left.addEventListener('click', () => {
    moveGalleryPosition(-1);
  });

  modal.querySelector('.view').addEventListener('click', () => {
    window.location.href = `/file/${currentMediaID}`;
  });

  let userReact = post.userReact;

  const reactContainer = modal.querySelector('.react');
  reactContainer.innerHTML = `<div class="list"></div>`;

  const reactButton = document.createElement('div');
  reactButton.classList.add('add');
  reactButton.innerHTML = '<span class="mdi mdi-plus"></span> React';

  reactButton.addEventListener('click', event => {
    event.stopPropagation();

    reactDialogData.postID = post.postID;
    reactDialogData.username = post.user.username;
    reactDialogData.onReact = value => {
      userReact = value;
      myReact.innerHTML = userReact;
      updateReactStatus();
    };

    const rect = fixedPosition(reactButton);
    reactDialog.style.top = rect.top - 64 + 8 + 'px';
    reactDialog.style.left = rect.left + reactButton.offsetWidth / 2 + 'px';
    reactDialog.style.display = 'flex';
  });

  const myReact = document.createElement('div');
  myReact.classList.add('mine');
  myReact.innerHTML = twemoji.parse(userReact || '');

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
    if (window.user) {
      if (!userReact) {
        reactContainer.querySelector('.add').style.display = 'block';
        reactContainer.querySelector('.mine').style.display = 'none';
      } else {
        reactContainer.querySelector('.add').style.display = 'none';
        reactContainer.querySelector('.mine').style.display = 'block';
      }
    } else {
      reactContainer.querySelector('.mine').style.display = 'none';
      reactContainer.querySelector('.add').style.display = 'none';
    }

    const reactAmount = (post.reacts || []).reduce((l, x) => l + x.amount, 0);
    if (reactAmount) {
      reactContainer.querySelector('.list').style.display = 'block';
      reactContainer.querySelector('.list').innerHTML = `
        <span class="amount"><span>${reactAmount}</span></span>
        ${(post.reacts || []).map(x => twemoji.parse(x.text)).join('')}
      `;
    } else {
      reactContainer.querySelector('.list').style.display = 'none';
    }
  };

  updateReactStatus();

  return modal;
};

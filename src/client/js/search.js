(() => {
  const input = document.querySelector('nav > .search > input');
  const dialog = document.querySelector('nav .search .dialog');
  const userList = document.createElement('div');
  const locationList = document.createElement('div');
  const tagList = document.createElement('div');

  dialog.appendChild(userList);
  dialog.appendChild(locationList);
  dialog.appendChild(tagList);

  const clearLists = () => {
    userList.innerHTML = '';
    locationList.innerHTML = '';
    tagList.innerHTML = '';
  };

  document.addEventListener('click', event => {
    if (event.target !== input) {
      dialog.style.display = 'none';
    }
  });

  input.addEventListener('focus', () => {
    dialog.style.display = 'block';
  });

  const createSearchEntry = item => {
    const element = document.createElement('div');
    element.classList.add('item', item.type);

    let title = '';
    let print = '';
    let icon = null;
    let container = null;
    let onClick = null;
    switch (item.type) {
      case 'user':
        title = item.displayName;
        print = `@${item.username}`;
        icon = `<div class="image" style="background-image: url(/file/${
          item.fileID
        })"></div>`;
        container = userList;

        onClick = event => {
          window.location.replace(`/${item.username}`);
        };

        break;
      case 'location':
        title = item.name;
        print = item.address;
        icon = `<span class="mdi mdi-${item.icon}"></span>`;
        container = locationList;

        onClick = event => {
          window.location.replace(`/search/${item.locationID}#location`);
        };

        break;
      case 'tag':
        title = `#${item.text}`;
        print = `${item.amount} posts`;
        container = tagList;

        onClick = event => {
          window.location.replace(`/search/${item.text}#tag`);
        };

        break;
    }

    element.innerHTML = `
      <div class="icon">${icon ? icon : ''}</div>
      <div class="info">
        <p>${title}</p>
        <small>${print}</small>
      </div>
    `;

    element.addEventListener('click', onClick);

    container.appendChild(element);
  };

  const querySearch = () => {
    fetch('/search', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: input.value }),
    })
      .then(data => data.json())
      .then(json => {
        if (json.status !== 'ok') {
          // TODO: Handle error
          return;
        }

        clearLists();

        json.list.forEach(createSearchEntry);

        if (userList.childNodes.length) {
          locationList.classList.add('border');
        } else {
          locationList.classList.remove('border');
        }

        if (locationList.childNodes.length || userList.childNodes.length) {
          tagList.classList.add('border');
        } else {
          tagList.classList.remove('border');
        }
      });
  };

  let timeoutRef = null;
  input.addEventListener('input', () => {
    if (timeoutRef) clearTimeout(timeoutRef);
    timeoutRef = setTimeout(querySearch, 500);
  });
})();

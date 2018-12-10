const createLoadMore = (container, url) => {
  const loadMore = document.createElement('button');
  loadMore.classList.add('load-more');
  loadMore.innerHTML = `<span class="mdi mdi-download-multiple"></span> Load more`;

  container.appendChild(loadMore);

  let currentPage = 0;
  loadMore.addEventListener('click', () => {
    currentPage++;
    loadMore.setAttribute('disabled', true);

    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page: currentPage }),
    })
      .then(data => data.json())
      .then(json => {
        if (json.status !== 'ok') {
          alert('Failed to get more posts, please try again...');
          return;
        }

        json.posts.forEach(post => {
          const element = createPost(post, true);
          container.appendChild(element);
        });

        container.appendChild(loadMore);
        loadMore.removeAttribute('disabled');

        if (json.posts.length < 10) {
          loadMore.remove();
        }
      });
  });
};

const createFeedButtons = () => {
  if (!window.user) return;
  if (
    !(window.location.pathname === '/' || window.location.pathname === '/feed')
  ) {
    return;
  }

  const newest = document.createElement('a');
  newest.setAttribute('href', '/');
  newest.classList.add('button-small', 'newest');
  newest.innerHTML = '<span class="mdi mdi-fire"></span> Newest';
  if (window.location.pathname === '/') newest.classList.add('active');

  const personal = document.createElement('a');
  personal.setAttribute('href', '/feed');
  personal.classList.add('button-small', 'personal');
  personal.innerHTML =
    '<span class="mdi mdi-account-multiple"></span> Personal';
  if (window.location.pathname === '/feed') personal.classList.add('active');

  const holder = document.createElement('div');
  holder.classList.add('feed-button-holder');
  holder.appendChild(newest);
  holder.appendChild(personal);

  const content = document.querySelector('.feed');
  content.appendChild(holder);
};

(() => {
  const content = document.querySelector('.feed');

  createFeedButtons();

  if (window.preloadFeed && window.preloadFeed.length) {
    window.preloadFeed.forEach(post => {
      const element = createPost(post, true);
      content.appendChild(element);
    });

    if (window.preloadFeed.length >= 10) {
      createLoadMore(content, '/');
    }
  }

  if (window.preloadSearch) {
    const searchVisual = document.createElement('div');
    searchVisual.classList.add('search-visual');

    const searchHeader = document.createElement('h1');
    searchHeader.innerText = window.preloadSearch.header;
    searchVisual.appendChild(searchHeader);

    if (window.preloadSearch.html) {
      const searchHTML = document.createElement('p');
      searchHTML.innerHTML = window.preloadSearch.html;
      searchVisual.appendChild(searchHTML);
    }

    if (window.preloadSearch.text) {
      const searchText = document.createElement('p');
      searchText.innerText = window.preloadSearch.text;
      searchVisual.appendChild(searchText);
    }

    content.insertBefore(searchVisual, content.firstChild);
  }
})();

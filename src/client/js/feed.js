const createLoadMore = (container, url) => {
  console.log('creating load more');
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
          // TODO: Handle error
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

(() => {
  if (window.preloadFeed && window.preloadFeed.length) {
    const content = document.querySelector('.feed');
    window.preloadFeed.forEach(post => {
      const element = createPost(post, true);
      content.appendChild(element);
    });

    if (window.preloadFeed.length >= 10) {
      createLoadMore(content, '/');
    }
  }
})();

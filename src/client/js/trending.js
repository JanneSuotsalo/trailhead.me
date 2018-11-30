(() => {
  const trending = document.createElement('div');
  trending.classList.add('trending', 'search');

  const buildTrending = data => {
    trending.innerHTML = `<h1>Trending</h1><div class="list"></div>`;
    const list = trending.querySelector('.list');

    data.list
      .filter(x => x.type === 'tag')
      .forEach(x => {
        const element = document.createElement('div');
        element.classList.add('item', 'tag');

        element.innerHTML = `
          <div class="info">
            <p>#${x.text}</p>
            <small>${x.amount} mentions</small>
          </div>
        `;

        element.addEventListener('click', () => {
          window.location.href = `/search/tag/${x.text}`;
        });

        list.appendChild(element);
      });

    list.appendChild(document.createElement('hr'));

    data.list
      .filter(x => x.type === 'location')
      .forEach(x => {
        const element = document.createElement('div');
        element.classList.add('item', 'tag');

        element.innerHTML = `
          <div class="info">
            <p>${x.name}</p>
            <small>${x.address}</small>
          </div>
        `;

        element.addEventListener('click', () => {
          window.location.href = `/search/location/${x.locationID}`;
        });

        list.appendChild(element);
      });
  };

  fetch('/trending', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: 'kerava' }),
  })
    .then(data => data.json())
    .then(json => {
      buildTrending(json);
    });

  document.querySelector('.left').prepend(trending);
})();

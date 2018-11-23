(() => {
  const map = L.map('map');

  const gl = L.mapboxGL({
    accessToken: 'not-needed',
    attributionControl: false,
    zoomControl: false,
    style: window.mapKey,
  });

  /*
  const loop = setInterval(() => {
    if (gl._glMap && gl._glMap._loaded) {
      var input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('id', 'done');
      document.body.appendChild(input);
      clearInterval(loop);
    }
  }, 100);
  */

  map.setView([60.1549393, 24.7265844], 10);
  gl.addTo(map);

  const serach = document.querySelector('[name="place"]');
  serach.addEventListener('change', () => {
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${
        serach.value
      }`
    )
      .then(result => result.json())
      .then(json => {
        console.log(json);

        const list = document.getElementById('list');
        const used = [];
        list.innerHTML = '';
        json.forEach(x => {
          const {
            city,
            attraction,
            country,
            island,
            town,
            locality,
            path,
            road,
            park,
            stream,
            peak,
            county,
            postcode,
            information,
            raceway,
            water,
            state,
          } = x.address;

          // Create a sub location name
          const location = city || town || state;
          const subname = [postcode, location, country]
            .filter(x => x)
            .join(', ');

          // Identify some unknown address names
          let identified = Object.keys(x.address).find(x =>
            /address[0-9]+/.test(x)
          );
          if (identified) identified = x.address[identified];

          // Construct the main location name based on availability and importance
          const name =
            park ||
            path ||
            locality ||
            stream ||
            water ||
            peak ||
            attraction ||
            information ||
            identified ||
            raceway ||
            road ||
            island ||
            city ||
            town ||
            state ||
            county;

          // Remove duplicate entries
          const identifier = `${name},${location},${country}`;
          if (used.includes(identifier)) return;
          used.push(identifier);

          // Place an icon next to important places
          let icon = '';
          if (park) icon = 'nature-people';
          if (peak) icon = 'image-filter-hdr';
          if (attraction) icon = 'star';
          if (information) icon = 'information';

          // Add the element to the DOM
          const element = document.createElement('li');
          element.innerHTML = `${
            icon ? `<span class="mdi mdi-${icon}">` : ''
          }<p>${name}</p><small>${subname}</small>`;
          list.appendChild(element);
        });
      });
  });
})();

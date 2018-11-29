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

  const loadLocations = () => {
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

        if ((!json || !json.length) && !window.postData.location) {
          list.innerHTML =
            '<span class="message"><span class="mdi mdi-close-circle-outline"></span>Nothing was found<br />Try using a simpler search term.</span>';
        }

        const processLocation = (data, selected) => {
          const {
            city,
            attraction,
            country,
            suburb,
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
          } = data.address;

          // Create a sub location name
          const location = city || town || state;
          const subname = [postcode, location, country]
            .filter(x => x)
            .join(', ');

          // Identify some unknown address names
          let identified = Object.keys(data.address).find(x =>
            /address[0-9]+/.test(x)
          );
          if (identified) identified = data.address[identified];

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
            suburb ||
            city ||
            town ||
            state ||
            county ||
            country;

          // Remove duplicate entries
          const identifier = `${name},${location},${country}`;
          if (used.includes(identifier)) return;
          used.push(identifier);

          // Place an icon next to important places
          let icon = '';
          let typeID = 1;
          if (park) {
            icon = 'nature-people';
            typeID = 2;
          }
          if (peak) {
            icon = 'image-filter-hdr';
            typeID = 3;
          }
          if (attraction) {
            icon = 'star';
            typeID = 4;
          }
          if (information) {
            icon = 'information';
            typeID = 5;
          }

          // Add the element to the DOM
          const element = document.createElement('li');
          if (selected) element.classList.add('selected');
          element.innerHTML = `${
            icon ? `<span class="mdi mdi-${icon}"></span>` : ''
          }<div><p>${name}</p><small>${subname}</small></div>`;

          element.addEventListener('click', () => {
            window.postData.location = {
              ...data,
              typeID,
              identifier,
              name,
              subname,
            };
            window.postDataCheck();

            [...list.children].forEach(x => x.classList.remove('selected'));

            element.classList.add('selected');

            map.setView([data.lat, data.lon], 12);
          });

          list.appendChild(element);
        };

        if (window.postData.location) {
          processLocation(window.postData.location, true);
        }

        json.forEach(x => processLocation(x));
      });
  };

  const serach = document.querySelector('[name="place"]');
  let timeoutRef = null;
  serach.addEventListener('input', () => {
    if (timeoutRef) clearTimeout(timeoutRef);
    timeoutRef = setTimeout(loadLocations, 1000);
  });
})();

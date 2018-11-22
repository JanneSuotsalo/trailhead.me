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
})();

(() => {
  const right = document.querySelector('.post > .gallery > .right');
  const left = document.querySelector('.post > .gallery > .left');
  const list = document.querySelector('.post > .gallery > .list');
  const media = document.querySelectorAll('.post > .gallery > .list > .media');
  let position = 0;

  left.style.display = 'none';
  right.style.display = 'none';

  if (media.length > 1) {
    right.style.display = 'block';
  }

  const moveGalleryPosition = direction => {
    position = Math.max(0, Math.min(media.length - 1, position + direction));
    list.style.marginLeft = `${-position * 100}%`;

    left.style.display = position > 0 ? 'block' : 'none';
    right.style.display = position < media.length - 1 ? 'block' : 'none';
  };

  right.addEventListener('click', () => {
    moveGalleryPosition(1);
  });

  left.addEventListener('click', () => {
    moveGalleryPosition(-1);
  });

  const text = document.querySelector('.post > .info p');
  text.innerHTML = text.textContent.replace(
    /\B(\#[a-zA-Z]{1,16}\b)(?!;)/gm,
    x => `<a>${x}</a>`
  );
})();

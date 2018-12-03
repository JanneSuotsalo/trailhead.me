(() => {
  const fixedPosition = element => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top + window.scrollY, left: rect.right };
  };

  const menu = document.querySelector('.dialog.user-menu');
  const icons = document.querySelectorAll('nav .profile');
  icons.forEach(element => {
    element.addEventListener('click', event => {
      event.stopPropagation();

      const position = fixedPosition(element);
      menu.style.top = position.top + 32 + 8 + 'px';
      menu.style.left = position.left + 'px';
      menu.style.display = 'block';
    });
  });

  document.addEventListener('click', () => {
    menu.style.display = 'none';
  });
})();

(() => {
  const content = document.querySelector('.feed');

  if (window.preloadAdminFeed && window.preloadAdminFeed.length) {
    window.preloadAdminFeed.forEach(post => {
      const element = createPost(post, true);
      content.appendChild(element);
    });

    if (window.preloadAdminFeed.length >= 10) {
      createLoadMore(content, '/admin');
    }
  }
})();

(() => {
  if (window.preloadFeed && window.preloadFeed.length) {
    const content = document.querySelector('.feed');
    window.preloadFeed.forEach(post => {
      const element = createPost(post, true);
      content.appendChild(element);
    });
  }
})();

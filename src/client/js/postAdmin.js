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

  if (window.user && !window.preloadAdminFeed) {
    const content = document.querySelector('content');
    const div = document.createElement('div');
    content.appendChild(div);
    div.setAttribute('class', 'toolbar');

    // Get the current url
    let currentUrl = '' + window.location.href;
    if (currentUrl.endsWith('/')) {
      currentUrl = currentUrl.slice(0, -1);
    }

    div.innerHTML += `
    <div class="tools">
        <a href="${currentUrl}/flag">
            <div class="button-small"> 
                <span class="mdi mdi-flag-variant">
                </span> 
                Report
            </div>
        <a>
    </div>
  `;
  }
})();

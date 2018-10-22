function postUrl(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.pathname;
}

jQuery(window).ready(function ($) {
  'use strict';

  var searchForm = $(searchParams.searchForm);
  var urlParams = new URLSearchParams(window.location.search);

  searchForm.each(function () {
    $(this).submit(false);
    $(this).submit(launchSearch);
  });

  // Launch modal based on URL search query
  if (urlParams.get('s') != null) {
    launchSearch();
    $('.wp-sls-search-field').val(urlParams.get('s'));
  }

  function launchSearch() {
    MicroModal.show('wp-sls-search-modal');
  }

  $(searchParams.searchFormInput).keyup(function () {
    $('.wp-sls-search-field').val($(this).val());
  });

});

jQuery(window).ready(function ($) {
  var feed = location.origin + '/wp-content/uploads/wp-sls/search-feed.xml';
  var search = null;
  $.ajax(feed, {
    accepts: {
      xml: "application/rss+xml"
    },
    dataType: "xml",
    success: function (data) {

      var searchArray = [];

      var data = data.getElementsByTagName("channel")[0];

      $('.wp-sls-search-modal [role=document]').append('<div id="wp-sls-search-results" class="wp-sls-search-modal__results"></div>');

      $(data).find("item").each(function () {
        var el = $(this);

        // Check for Title
        if (!el.find("title").text()) {
          return;
        }
        
        console.log(el);

        // console.log(el);

        searchArray.push({
          "title": el.find('title').text(),
          "description": el.find('description').text(),
          "link": postUrl(el.find('link').text())
        });

      });

      // console.log(searchArray);

      var options = {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [{
          name: 'title',
          weight: 0.75
        }, {
          name: 'description',
          weight: 0.5
        }]
      };

      var fuse = new Fuse(searchArray, options);

      var $searchInput = $(searchParams.searchFormInput);

      $searchInput.each(function () {

        $(this).on('input', function () {

          var search = fuse.search($(this).val());
          var $res = $('#wp-sls-search-results');
          $res.empty();

          if ($(this).val().length < 1) return;
          if (search[0] === undefined) {
            $res.append('<h5>No results</h5>');
          } else {
            $res.append('<h5>' + search.length + ' results:</h5>');
          }

          search.forEach(function (data) {

            var articleData = {
              title: data.title,
              excerpt: data.description,
              link: data.link
            };

            $res.append(article(articleData));
          });
        });
      });
    }
  });

});

function article(
  articleData = {
    title: '',
    excerpt: '',
    link: ''
  }
) {
  return `<article>
      <header class='entry-header'>
        <h2 class='entry-title'><a href='` + articleData.link + `' rel='bookmark'>` + articleData.title + `</a></h2>
      </header>
      <div class='entry-summary'>
        ` + articleData.excerpt + `
      </div>
    </article>`;
}
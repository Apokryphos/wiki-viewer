require('./polyfills');

let thumbnailSize = 128;
const searchResultCount = 12;
const searchResultContainers = [];

function initialize() {
  const clearButtonElement = document.getElementById('clear-button');
  const searchInputElement = document.getElementById('search-input');

  function hideSearchResultContainer(container) {
    container.node.style.display = 'none';
  }

  function showSearchResultContainer(container) {
    container.node.style.display = 'block';
  }

  function hideSearchResultContainers() {
    for (let e = 0; e < searchResultCount; ++e) {
      hideSearchResultContainer(searchResultContainers[e]);
    }
  }

  function fetchJson(searchTerm, callback) {
    const request = new XMLHttpRequest();

    const url = `https://en.wikipedia.org/w/api.php?
      action=query&
      origin=*&
      formatversion=2&
      generator=prefixsearch&
      prop=pageimages|pageterms&
      piprop=thumbnail&
      pithumbsize=${thumbnailSize}&
      pilimit=10&
      gpssearch=${encodeURIComponent(searchTerm)}&
      gpslimit=${searchResultCount}&
      redirects=true&
      wbptterms=description&
      format=json`;

    request.open('GET', url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        const data = JSON.parse(request.responseText);
        callback(data);
      } else {
        //  Server returned error
      }
    };

    request.onerror = function() {};

    request.send();
  }

  function updateSearch() {
    let searchTerm = searchInputElement.value;

    if (searchTerm) {
      fetchJson(searchTerm, function(data) {
        if (!data || !data.query) {
          hideSearchResultContainers();
        } else {
          populateSearchResults(data.query.pages);
        }

        clearButtonElement.style.display = 'initial';
      });
    } else {
      clearButtonElement.style.display = 'none';
      hideSearchResultContainers();
    }
  }

  function populateSearchResults(pages) {
    const pageCount = pages.length;
    // console.log('populateSearchResults: '' + pageCount );

    for (let e = 0; e < searchResultCount; ++e) {
      let container = searchResultContainers[e];

      hideSearchResultContainer(container);

      if (e < pageCount) {
        let page = pages[e];

        container.link.href = 'http://en.wikipedia.org/wiki?curid=' + page.pageid;

        let thumbnail = page.thumbnail;
        if (thumbnail) {
          container.img.style.display = 'none';
          container.img.width = thumbnail.width;
          container.img.height = thumbnail.height;
          container.img.src = thumbnail.source;
          container.img.style.display = 'block';
        } else {
          container.img.style.display = 'none';
          container.img.src = '';
          container.img.width = thumbnailSize;
          container.img.height = thumbnailSize;
        }

        container.title.innerHTML = page.title;

        if (
          page.terms &&
          page.terms.description &&
          page.terms.description.length >= 1
        ) {
          container.description.style.display = 'initial';
          container.description.innerHTML = page.terms.description[0];
        } else {
          container.description.style.display = 'none';
          container.description.innerHTML = '';
        }

        showSearchResultContainer(container);
      } else {
        hideSearchResultContainer(container);
      }
    }
  }

  function createSearchResultElements() {
    //  Find template element for search results
    let template = document.getElementById('search-result-template');
    template.id = '';

    let fragment = document.createDocumentFragment();

    //  Make copies of template and store element references
    for (let e = 0; e < searchResultCount; ++e) {
      let node = template.cloneNode(true);

      let container = {
        node: node,
        link: node,
        img: node.getElementsByTagName('img')[0],
        title: node.getElementsByTagName('h2')[0],
        description: node.getElementsByTagName('p')[0]
      };

      searchResultContainers.push(container);
      fragment.append(node);
    }

    //  Add template copies to document
    const searchResultsElement = document.getElementById('search-results');
    searchResultsElement.append(fragment);

    //  Remove template from document
    template.remove();
  }

  function clearSearchTerms() {
    searchInputElement.value = '';
    updateSearch();
  }

  createSearchResultElements();

  searchInputElement.addEventListener('input', function() {
    updateSearch();
  });

  clearButtonElement.addEventListener('click', clearSearchTerms);

  updateSearch();
}

document.addEventListener('DOMContentLoaded', () => {
  initialize();
});

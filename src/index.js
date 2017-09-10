const borderSize = 12;
var thumbnailSize = 100;
const searchResultCount = 12;
var searchResultContainers = [];

function hideSearchResultContainer(container)
{
  container.node.style.display = 'none';
}

function showSearchResultContainer(container)
{
  container.node.style.display = 'block';
}

function hideSearchResultContainers()
{
  for (let e = 0; e < searchResultCount; ++e)
  {
    hideSearchResultContainer(searchResultContainers[e]);
  }
}

function fetchJson(searchTerm, callback) {
  var request = new XMLHttpRequest();

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

  request.onerror = function() {
  };

  request.send();
}

function updateSearch()
{
  let searchTerm = document.getElementById('SearchInput').value;

  if (searchTerm)
  {
    fetchJson(
      searchTerm,
      function(data)
      {
        if (!data || !data.query)
        {
          document.getElementById('ClearButton').style.display = 'none';
          hideSearchResultContainers();
        }
        else
        {
          document.getElementById('ClearButton').style.display = 'initial';
          populateSearchResults(data.query.pages);
        }
      }
    );
  }
  else
  {
    document.getElementById('ClearButton').style.display = 'none';
    hideSearchResultContainers();
  }
}

function populateSearchResults(pages)
{
  const pageCount = pages.length;
  // console.log('populateSearchResults: '' + pageCount );

  for (let e = 0; e < searchResultCount; ++e)
  {
    let container = searchResultContainers[e];

    hideSearchResultContainer(container);

    if (e < pageCount)
    {
      let page = pages[e];

      container.link.href = 'http://en.wikipedia.org/wiki?curid=' + page.pageid;

      let nodeImg = container.getChild

      let thumbnail = page.thumbnail;
      if (thumbnail)
      {
        container.img.style.display = 'none';

        let marginHorz = (borderSize / 2) + (thumbnailSize - thumbnail.width) / 2;
        let marginVert = (borderSize / 2) + (thumbnailSize - thumbnail.height) / 2;
        container.img.style.margin = marginVert + 'px ' + marginHorz + 'px';

        container.img.width = thumbnail.width;
        container.img.height = thumbnail.height;

        container.img.src = thumbnail.source;

        container.img.style.display = 'initial';
      }
      else
      {
        container.img.style.display = 'none';
        container.img.src = '';
        container.img.width = thumbnailSize;
        container.img.height = thumbnailSize;
      }

      container.title.innerHTML = page.title;

      if (page.terms &&
          page.terms.description &&
          page.terms.description.length >= 1)
      {
        container.description.style.display = 'initial';
        container.description.innerHTML = page.terms.description[0];
      }
      else
      {
        container.description.style.display = 'none';
        container.description.innerHTML = '';
      }

      showSearchResultContainer(container);
    }
    else
    {
      hideSearchResultContainer(container);
    }
  }
}

function createSearchResultElements()
{
  //  Find template element for search results
  let template = document.getElementById('SearchResultTemplate');
  template.id = '';

  let fragment = document.createDocumentFragment();

  //  Make copies of template and store element references
  for (let e = 0; e < searchResultCount; ++e)
  {
    let node = template.cloneNode(true);

    let container =
    {
      node: node,
      link: node,//.getElementsByTagName('a')[0],
      img: node.getElementsByTagName('img')[0],
      title: node.getElementsByTagName('h2')[0],
      description: node.getElementsByTagName('p')[0]
    };

    searchResultContainers.push(container);
    fragment.append(node);
  }

  //  Add template copies to document
  const searchResultsElement = document.getElementById('SearchResults');
  searchResultsElement.append(fragment);

  // Get the thumbnail div size after media queries.
  // Hidden elements have a size of zero, so move the template
  // element off the page, show it and then get the size.
  template.style.position = 'absolute';
  template.style.left = '-99999px';
  template.style.display = 'initial';

  let thumbnailDiv = template.getElementsByClassName('SearchResultThumbnail')[0];
  thumbnailSize = thumbnailDiv.clientWidth - borderSize;

  //  Remove template from document after getting size
  template.remove();
}

function clearSearchTerms()
{
  document.getElementById('SearchInput').value = '';
  updateSearch();
}

function init()
{
  createSearchResultElements();

  const searchInputElement = document.getElementById('SearchInput');
  searchInputElement.addEventListener('input', function() {
      updateSearch();
  });

  document.getElementById('ClearButton').onclick = clearSearchTerms;

  updateSearch();
}

document.addEventListener('DOMContentLoaded', () =>
{
   init();
});

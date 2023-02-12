import SearchImages from './fetchImage.js';
import LoadMoreBtn from './btn.js'

import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const caseImages = document.querySelector('.gallery');
const form = document.getElementById('search-form');

const searchImages = new SearchImages();

const loadMoreBtn = new LoadMoreBtn({
  selector: '#loadMoreBtn',
  isHidden: true,
});

form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', fetchMoreImages);

function onSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;

  searchImages.searchQuery = form.elements.searchQuery.value.trim();

  clearImageList();
  searchImages.resetPage();
  loadMoreBtn.show();

  fetchMoreImages();
}

function clearImageList() {
  caseImages.innerHTML = '';
}

function createMarkup({ hits }) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
    <div class="photo-card">
    <a class = "gallery-item" href = "${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes:</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views:</b>${views}
    </p>
    <p class="info-item">
      <b>Comments:</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b>${downloads}
    </p>
  </div>
</div>
    `
    )
    .join('');
  caseImages.insertAdjacentHTML('beforeend', markup);
  gallery.refresh();
}

function clearImageList() {
  document.querySelector('.gallery').innerHTML = '';
}

async function fetchMoreImages() {
  loadMoreBtn.disable();
  try {
    const newSearch = await searchImages.fetchImages();

    if (newSearch.data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.hide();
    } else if (newSearch.data.hits.length < 40) {
      createMarkup(newSearch.data);
      loadMoreBtn.hide();
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      createMarkup(newSearch.data);
      loadMoreBtn.enable();
    }
  } catch (err) {
    onError(err);
  } finally {
    form.reset();
  }
}

function onError(err) {
  console.error(err);
  clearImageList();
  Notiflix.Notify.failure(
    'Sorry,there are no images matching your search query.Please try again'
  );
}
const gallery = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

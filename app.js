const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';


function fetchUsers() {
    return fetchData(`${ BASE_URL }/users`);
}


function renderUser(user) {
    return $(`<div class='user-card'>
            <header>
             <h2>${user.name}</h2>
            </header>
        <section class="company-info">
            <p><b>Contact:</b> ${user.email}</p>
            <p><b>Works for:</b> ${user.company.name}</p>
            <p><b>Company creed:</b> ${user.company.catchPhrase}.</p>
        </section>
        <footer>
            <button class="load-posts">POSTS BY ${user.username}</button>
            <button class="load-albums">ALBUMS BY ${user.username}</button>
        </footer>
    </div>`
    ).data('user', user);
}

function renderUserList(userList) {
    $('#user-list').empty();
    userList.forEach(user => $('#user-list')
        .append(renderUser(user)))
}

$('#user-list').on('click', '.user-card .load-posts', function () {
    let userCard = $(this).closest('.user-card');
    let user = userCard.data('user');
    fetchUserPosts(user.id).then((posts) => renderPostList(posts, user));
  });
  
  $('#user-list').on('click', '.user-card .load-albums', function () {
    let userCard = $(this).closest('.user-card');
    let user = userCard.data('user');
    fetchUserAlbumList(user.id).then(renderAlbumList);
  });


function renderAlbum(album) {
    album.photos.forEach(album => 
        $('.photo-list').append(
            renderPhoto(album))
        )
    return $(`
    <div class="album-card">
  <header>
    <h3>${album.title}, by ${album.user.name}</h3>
  </header>
  <section class="photo-list">
  </section>
    </div> `);
}


function renderPhoto(photo) {
    return $(
    `<div class="photo-card">
    <a href="${photo.url}">
      <img src="${photo.thumbnailUrl}">
      <figure>${photo.title}</figure>
    </a>
  </div>`)
  }


function renderAlbumList(albumList) {
    $('#app section.active').removeClass('active');
    $('#album-list')
        .addClass('active')
        .empty();
    albumList.forEach(album => $('#album-list')
            .append(renderAlbum(album)))
}


function fetchUserAlbumList(userId) {
    return fetchData(`${ BASE_URL }/users/${userId}/albums?_expand=user&_embed=photos`)
    }

function fetchData(url) {
    return fetch(url).then( function (response) {
        return response.json();
    }).catch(function (error) {
        console.error();
    })
}


function fetchUserPosts(userId) {
    return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
  }
  
function fetchPostComments(postId) {
    return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
}


function setCommentsOnPost(post) {
      if(post.comments) {
        return Promise.reject(null);
      }
    else return fetchPostComments(post.id)
      .then(function (comments){
        post.comments = comments;
        return post;
      })
      .catch(function(error) {
          console.error();
      })
}


function renderPost(post, user) {
    return $(`
    <div class="post-card">
  <header>
    <h3>${post.title}</h3>
    <h3>--- ${user.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
    </div> `).data('post', post)
}


function renderPostList(postList, user) {
    $('#app section.active').removeClass('active');
    $('#post-list')
        .empty()
        .addClass('active');
    postList.forEach(post => $('#post-list')
        .append(renderPost(post, user)));
  }



function toggleComments(postCardElement) {
    const footerElement = postCardElement.find('footer');
  
    if (footerElement.hasClass('comments-open')) {
      footerElement.removeClass('comments-open');
      footerElement.find('.verb').text('show');
    } else {
      footerElement.addClass('comments-open');
      footerElement.find('.verb').text('hide');
    }
  }

  $('#post-list').on('click', '.post-card .toggle-comments', function () {
    const postCardElement = $(this).closest('.post-card');
    const post = postCardElement.data('post');

    setCommentsOnPost(post)
      .then(function (post) {
        $('.comment-list').empty();
        post.comments.forEach(item => $('.comment-list').append(`<h3>${item.body} --- ${item.email} </h3>`));
        console.log('building comments for the first time...', post);
        toggleComments(postCardElement);
      })
      .catch(function () {
        console.log('comments previously existed, only toggling...', post);
        toggleComments(postCardElement);
      });
  });


  function bootstrap() {
    fetchUsers().then(renderUserList);
  }
  
  bootstrap();

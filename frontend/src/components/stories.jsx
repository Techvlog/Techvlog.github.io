function Stories({ tags, title, text, writter, date }) {
  return (
    <>
      <div class="blog-card mb-4" onclick="showPage('post')">
        <div class="row g-0">
          <div class="col-md-4">
            <img
              src="https://picsum.photos/600/400?random=1"
              class="img-fluid rounded-start h-100"
              alt="Post Image"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <div class="d-flex mb-2">
                {tags.map((tag) => {
                  return <span class="tag">{tag}</span>;
                })}
              </div>
              <h5 class="card-title">{title}</h5>
              <p class="card-text">{text}</p>
              <div class="author-info">
                <img
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  class="author-avatar"
                  alt="Author"
                />
                <div>
                  <p class="author-name mb-0">{writter}</p>
                  <small class="post-date">{date} · 6 min read</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Stories;

import axios from "axios";
export const posts_feature = () => {
  return axios.get("http://localhost:3000/api/feature");
};
export const catagories = (limit = 10) => {
  return axios.get(`http://localhost:3000/api/catagories?limit=${limit}`);
};
export const latestposts = (page = 1, limit = 6) => {
  return axios.get(`http://localhost:3000/api/latest?page=${page}&limit=${limit}`);
};
export const popularposts = () => {
  return axios.get("http://localhost:3000/api/popular");
};
export const fecthblogbyid = (postid) => {
  return axios.get(`http://localhost:3000/api/getblog/${postid}`);
};
export const fetchBlogBySlug = (slug) => {
  return axios.get(`http://localhost:3000/api/post/${slug}`);
};
export const signup = ({ fstname, lstName, email, password, avatar }) => {
  return axios.post(
    "http://localhost:3000/auth/signup",
    {
      fstname,
      lstName,
      email,
      password,
      avatar,
    },
    {
      withCredentials: true,
    }
  );
};
export const login = async ({ email, password }) => {
  return axios.post(
    "http://localhost:3000/auth/login",
    { email, password },
    {
      withCredentials: true,
    }
  );
};
export const fetchbycatagory = (catagory, page = 1, limit = 6) => {
  return axios.get(`http://localhost:3000/api/cat/${catagory}?page=${page}&limit=${limit}`);
};
export const make_post = (id, post) => {
  return axios.post(`http://localhost:3000/api/createblog/${id}`, post, {
    withCredentials: true,
  });
};
export const profile = async (page = 1, limit = 6) => {
  const { data } = await axios.get(`http://localhost:3000/api/profile?page=${page}&limit=${limit}`, {
    withCredentials: true,
  });
  return data;
};
export const Otherprofile = async (id, page = 1, limit = 6) => {
  const { data } = await axios.get(`http://localhost:3000/api/otherprofile/${id}?page=${page}&limit=${limit}`);
  return data;
};

export const followUser = async (id) => {
  const { data } = await axios.post(`http://localhost:3000/api/follow/${id}`, {}, {
    withCredentials: true,
  });
  return data;
};

export const unfollowUser = async (id) => {
  const { data } = await axios.post(`http://localhost:3000/api/unfollow/${id}`, {}, {
    withCredentials: true,
  });
  return data;
};

export const checkFollow = async (id) => {
  const { data } = await axios.get(`http://localhost:3000/api/check-follow/${id}`, {
    withCredentials: true,
  });
  return data;
};
export const fetchComments = (postid, page = 1, limit = 4) => {
  return axios.get(`http://localhost:3000/api/comments/${postid}?page=${page}&limit=${limit}`);
};

export const saveBlogPost = async (postId) => {
  const { data } = await axios.post(`http://localhost:3000/api/save-post/${postId}`, {}, {
    withCredentials: true,
  });
  return data;
};

export const unsaveBlogPost = async (postId) => {
  const { data } = await axios.post(`http://localhost:3000/api/unsave-post/${postId}`, {}, {
    withCredentials: true,
  });
  return data;
};

export const checkSavedPost = async (postId) => {
  const { data } = await axios.get(`http://localhost:3000/api/check-saved/${postId}`, {
    withCredentials: true,
  });
  return data;
};

export const getSavedPosts = async (page = 1, limit = 6) => {
  const { data } = await axios.get(`http://localhost:3000/api/saved-posts?page=${page}&limit=${limit}`, {
    withCredentials: true,
  });
  return data;
};

// ── Publications ───────────────────────────────────────────────────────────────
const PUB = "http://localhost:3000/pub";

export const listPublications = async (page = 1, limit = 12) => {
  const { data } = await axios.get(`${PUB}?page=${page}&limit=${limit}`);
  return data;
};
export const getPublication = async (id, page = 1) => {
  const { data } = await axios.get(`${PUB}/${id}?page=${page}`);
  return data;
};
export const createPublication = async (payload) => {
  const { data } = await axios.post(`${PUB}`, payload, { withCredentials: true });
  return data;
};
export const updatePublication = async (id, payload) => {
  const { data } = await axios.put(`${PUB}/${id}`, payload, { withCredentials: true });
  return data;
};
export const deletePublication = async (id) => {
  const { data } = await axios.delete(`${PUB}/${id}`, { withCredentials: true });
  return data;
};
export const followPublication = async (id) => {
  const { data } = await axios.post(`${PUB}/${id}/follow`, {}, { withCredentials: true });
  return data;
};
export const unfollowPublication = async (id) => {
  const { data } = await axios.post(`${PUB}/${id}/unfollow`, {}, { withCredentials: true });
  return data;
};
export const checkFollowPublication = async (id) => {
  const { data } = await axios.get(`${PUB}/${id}/check-follow`, { withCredentials: true });
  return data;
};
export const submitPostToPublication = async (pubId, postId) => {
  const { data } = await axios.post(`${PUB}/${pubId}/submit`, { postId }, { withCredentials: true });
  return data;
};
export const getSubmissions = async (pubId, status = "pending") => {
  const { data } = await axios.get(`${PUB}/${pubId}/submissions?status=${status}`, { withCredentials: true });
  return data;
};
export const approveSubmission = async (pubId, subId, note = "") => {
  const { data } = await axios.post(`${PUB}/${pubId}/submissions/${subId}/approve`, { note }, { withCredentials: true });
  return data;
};
export const rejectSubmission = async (pubId, subId, note = "") => {
  const { data } = await axios.post(`${PUB}/${pubId}/submissions/${subId}/reject`, { note }, { withCredentials: true });
  return data;
};
export const myPublications = async () => {
  const { data } = await axios.get(`${PUB}/me/owned`, { withCredentials: true });
  return data;
};
export const mySubmissions = async () => {
  const { data } = await axios.get(`${PUB}/me/submissions`, { withCredentials: true });
  return data;
};
export const myFollowing = async () => {
  const { data } = await axios.get(`${PUB}/me/following`, { withCredentials: true });
  return data;
};
export const allPendingSubmissions = async () => {
  const { data } = await axios.get(`${PUB}/me/pending`, { withCredentials: true });
  return data;
};



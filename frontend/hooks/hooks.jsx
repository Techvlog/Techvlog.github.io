import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  posts_feature,
  catagories,
  latestposts,
  signup,
  fetchbycatagory,
  make_post,
  profile,
  Otherprofile,
  popularposts,
} from "../src/api/api";
import { useContext } from "react";
import { UserContext } from "../context/usercontext";

export const checkloogedin = async () => {
  const { data } = await axios.get("http://localhost:3000/auth/check", {
    withCredentials: true,
  });
  
  return data;
};
export const logout = async () => {
  const { data } = await axios.get("http://localhost:3000/auth/logout", {
    withCredentials: true,
  });
};

export const useHomeapi = (page = 1) => {
  const {
    data: features,
    isLoading: loadingFeatures,
    error: featuresError,
  } = useQuery({
    queryKey: ["features"],
    queryFn: posts_feature,
  });

  const {
    data: cat,
    isLoading: loadingCat,
    error: catError,
  } = useQuery({
    queryKey: ["categories_home"],
    queryFn: () => catagories(5),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: popular,
    isLoading: loadingPopular,
    error: popularError,
  } = useQuery({
    queryKey: ["popular_posts"],
    queryFn: popularposts,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: posts,
    isLoading: loadingPosts,
    error: postsError,
  } = useQuery({
    queryKey: ["posts", page],
    queryFn: () => latestposts(page),
    keepPreviousData: true,
  });

  const loading = loadingFeatures || loadingCat || loadingPosts || loadingPopular;

  const error = featuresError || catError || postsError || popularError;

  return { loading, features, cat, posts, popular, error };
};

export const useCatagories = () => {
  const {
    data: cat,
    isLoading: loadingCat,
    error: catError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => catagories(5),
    staleTime: 1000 * 60 * 5,
  });
  return { cat, loadingCat, catError };
};
export const useLatestpost = () => {
  const {
    data: posts,
    isLoading: loadingPosts,
    error: postsError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: latestposts,
  });

  return { loadingPosts, posts, postsError };
};
export const useFetchbycatagories = (catagory, page = 1) => {
  if (catagory == "all") {
    const {
      data: posts,
      isLoading: loadingPosts,
      error: postsError,
    } = useQuery({
      queryKey: ["posts", page],
      queryFn: () => latestposts(page),
      keepPreviousData: true,
    });

    return { loadingPosts, posts, postsError };
  } else {
    const {
      data: posts,
      isLoading: loadingPosts,
      error: postsError,
    } = useQuery({
      queryKey: ["posts", catagory, page],
      queryFn: () => fetchbycatagory(catagory, page),
      staleTime: 1000 * 60 * 5,
      keepPreviousData: true,
    });

    return { loadingPosts, posts, postsError };
  }
};
export const useMakepost = (id, post) => {
  return useMutation({
    mutationFn: ({ id, post }) => make_post(id, post),
  });
};
export const useProfile = (page = 1) => {
  return useQuery({
    queryKey: ["profile", page],
    queryFn: () => profile(page),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });
};
export const useOtherProfile = (id, page = 1) => {
  return useQuery({
    queryKey: ["other", id, page],
    queryFn: () => Otherprofile(id, page),
    keepPreviousData: true,
  });
};

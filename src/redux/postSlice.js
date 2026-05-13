import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    setAddNewPost: (state, action) => {
      state.posts = [action.payload, ...state.posts];
    },
    setFilterPost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
    setUpdatedPost: (state, action) => {
      const updatedPost = action.payload;
      state.posts = state.posts.map((post) =>
        post._id.toString() === updatedPost._id.toString() ? updatedPost : post,
      );
    },
  },
});

export const { setPosts,setSelectedPost,setAddNewPost,setFilterPost,setUpdatedPost } = postSlice.actions;
export default postSlice.reducer;
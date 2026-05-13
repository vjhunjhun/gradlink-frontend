import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, BookmarkCheck, Loader2, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const Post = ({ post }) => {
  console.log("i am post", post);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [like, setLike] = useState(post?.likes?.includes(user?._id) || false);
  const [bookMark, setBookMark] = useState(user?.bookmarks?.includes(post?._id) || false);
  const [postLike, setPostLike] = useState(post?.likes?.length);
  const [comment, setComment] = useState(post.comments);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(user?.following?.includes(post?.author?._id) || false);
  
  useEffect(() => {
    setComment(post.comments);
  },[post]);

  useEffect(() => {
    setPostLike(post?.likes?.length);
    setLike(post?.likes?.includes(user?._id));
    setBookMark(user?.bookmarks?.includes(post?._id));
    setIsFollowing(user?.following?.includes(post?.author?._id) || false);
  }, [post, user]);
  const dispatch = useDispatch();
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }
  const deletePostHandler = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${API_URL}/api/v1/post/delete/${post?._id}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }
  const likeOrDislikeHandler = async () => {
    try {
      const action = like ? "dislike" : "like";
      const res = await axios.get(
        `${API_URL}/api/v1/post/${post?._id}/${action}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        const updatedLikes = like ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLike(!like);
        const updatedPostData = posts.map((p) =>
          p?._id == post?._id ? {
            ...p,
            likes: like ? p.likes.filter((id) => id != user?._id) : [...p.likes, user?._id]
          } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
 const commentHandler = async () => {
   try {
     const res = await axios.post(
       `${API_URL}/api/v1/post/${post?._id}/comment`,
       { text },
       {
         headers: {
           "Content-Type": "application/json",
         },
         withCredentials: true,
       },
     );

     if (res.data.success) {
       const updatedCommentData = [...comment, res.data.comment];
       setComment(updatedCommentData);

       const updatedPostData = posts.map((p) =>
         p?._id === post?._id ? { ...p, comments: updatedCommentData } : p,
       );

       dispatch(setPosts(updatedPostData));
       toast.success("Comment added");
       setText("");
     }
   } catch (error) {
     console.log(error);
   }
 };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/v1/post/${post?._id}/bookmark`,
        {
          withCredentials: true,
        },
      );
      if (res.data.success) {
        setBookMark(!bookMark);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  }
  const selectPostHandler = async (post) => {
    try {
      let res = await axios.get(
        `${API_URL}/api/v1/post/${post?._id}/comment/all`,
        {
          withCredentials: true,
        },
      );
      dispatch(setSelectedPost({ ...post,comments:res.data.comments }));
         setOpen(true);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  }

  const unfollowHandler = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/user/followorunfollow/${post?.author?._id}`,
        {},
        { withCredentials: true },
      );
      if (res.data.success) {
        setIsFollowing(!isFollowing);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update follow status");
    }
  };
  return (
    <div className="my-6 w-full">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={post.author?.profilePicture} alt="post_image" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{post.author?.name}</h1>
              {post.author?.role && (
                <Badge variant="outline" className="text-xs">
                  {post.author.role}
                </Badge>
              )}
              {user?._id === post?.author?._id && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground">Author</Badge>
              )}
            </div>
          </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer hover:text-muted-foreground transition-colors" />
          </DialogTrigger>
          <DialogContent className="flex flex-col text-center items-center text-sm bg-card border-border">
            {post?.author?._id !== user?._id && (
              <Button
                variant="ghost"
                onClick={unfollowHandler}
                className={`cursor-pointer w-fit font-bold hover:bg-secondary ${
                  isFollowing 
                    ? "text-red-500 hover:text-red-600" 
                    : "text-blue-500 hover:text-blue-600"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={bookmarkHandler}
              className="cursor-pointer w-fit hover:bg-secondary"
            >
              {bookMark ? "Remove from favorites" : "Add to favorites"}
            </Button>
            {user && (user?._id === post?.author?._id || user?.role === "teacher") &&
              (loading ? (
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="cursor-pointer w-fit text-red-500 hover:text-red-600 font-bold hover:bg-secondary"
                  onClick={deletePostHandler}
                >
                  Delete
                </Button>
              ))}
          </DialogContent>
        </Dialog>
        </div>
      </div>
      <img
        src={post?.image}
        alt="post_image"
        className="rounded-xl w-full aspect-square object-cover"
      />

      <div className="p-5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-5">
          {like ? (
            <AiFillLike
              size={"22px"}
              className="cursor-pointer text-red-500 hover:text-red-600 transition-colors"
              onClick={likeOrDislikeHandler}
            />
          ) : (
            <AiOutlineLike
              size={"22px"}
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={likeOrDislikeHandler}
            />
          )}

          <MessageCircle
            onClick={()=>selectPostHandler(post)}
            className="cursor-pointer hover:text-primary transition-colors"
            size={22}
          />
          {/* <Send className="cursor-pointer hover:text-primary transition-colors" size={22} /> */}
        </div>
        {bookMark ? (
          <BookmarkCheck
            onClick={bookmarkHandler}
            className="cursor-pointer text-primary hover:text-primary/80 transition-colors"
            size={22}
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer text-primary hover:text-primary/80 transition-colors"
            size={22}
          />
        )}
      </div>
      <div className="px-5 pt-3">
        <span className="font-semibold text-sm">{postLike} likes</span>
        <p className="text-sm mt-2">
          <span className="font-semibold mr-2">{post?.author?.name}</span>
          <span className="text-foreground/90">{post?.caption}</span>
        </p>
        {post?.comments.length !== 0 && (
          <span
            onClick={()=>selectPostHandler(post)}
            className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors mt-2 block"
          >
            View all {comment.length} comments
          </span>
        )}
      </div>
      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center gap-3 px-5 py-3 border-t border-border">
        <input
          type="text"
          placeholder="Add a comment..."
          className="outline-none text-sm w-full bg-transparent text-foreground placeholder-muted-foreground"
          value={text}
          onChange={changeEventHandler}
        />
        {text && (
          <span
            className="text-primary cursor-pointer font-semibold hover:text-primary/80 transition-colors"
            onClick={commentHandler}
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;

import React, { useEffect, useState,useRef } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState(""); 
  const { selectedPost,posts } = useSelector((store) => store.post);
  const [comment, setComment] = useState([]); 
  const dispatch = useDispatch();
  const commentsEndRef = useRef(null);
  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comment]);
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
   const sendMessageHandler = async () => {
     try {
       const res = await axios.post(
         `${API_URL}/api/v1/post/${selectedPost?._id}/comment`,
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
           p._id.toString() === selectedPost?._id.toString()
             ? { ...p, comments: updatedCommentData }
             : p,
         );
         
         dispatch(setPosts(updatedPostData));
         dispatch(
           setSelectedPost({
             ...selectedPost,
             comments: updatedCommentData,
           }),
         );
         toast.success("Comment added");
         setText("");
       }
     } catch (error) {
       console.log(error);
     }
   };
  
  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl p-0 flex flex-col bg-card border-border rounded-2xl overflow-hidden"
      >
        <div className="flex flex-1">
          <div className="w-1/2 bg-background flex items-center justify-center">
            <img
              src={selectedPost?.image}
              alt="post_image"
              className="w-full h-full aspect-square object-cover"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between bg-card">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar className="ring-2 ring-primary/20">
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-sm text-foreground">
                    {selectedPost?.author?.name}
                  </Link>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer hover:text-muted-foreground" size={20} />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center bg-card border-border">
                  <div className="cursor-pointer w-full text-red-500 hover:text-red-600 font-bold hover:bg-secondary p-2 rounded">
                    Unfollow
                  </div>
                  <div className="cursor-pointer w-full hover:bg-secondary p-2 rounded">Add to favorites</div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1 overflow-y-auto max-h-96 p-5 space-y-4">
              {comment.map((comment) => (
                <Comment key={comment?._id} comment={comment} />
              ))}
              <div ref={commentsEndRef} />
            </div>
            <div className="p-5 border-t border-border">
              <div className="flex items-center gap-3">
                <input
                  value={text}
                  onChange={changeEventHandler}
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full outline-none bg-secondary border border-border text-sm p-3 rounded-full focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
                <Button
                  disabled={!text.trim()}
                  className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-full px-6 font-semibold"
                  onClick={sendMessageHandler}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;

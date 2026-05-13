import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) {
      formData.append("image", file);
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/post/addpost",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        console.log(res.data.post);
        dispatch(setPosts([ res.data.post,...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }
  const fileChangehandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }
  return (
    <div>
      <Dialog open={open}>
        <DialogContent onInteractOutside={() => setOpen(false)} className="bg-card border-border rounded-2xl">
          <DialogTitle className="text-center font-bold text-lg">
            Create New Post
          </DialogTitle>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={user?.profilePicture} alt="image_create" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-sm">{user?.name}</h1>
              <span className="text-muted-foreground text-xs">Share your moment...</span>
            </div>
          </div>
          <Textarea
            className="focus-visible:ring-primary bg-secondary border-border rounded-lg resize-none placeholder-muted-foreground"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
          />
          {imagePreview && (
            <div className="w-full h-64 flex items-center justify-center bg-secondary rounded-xl overflow-hidden border border-border">
              <img
                src={imagePreview}
                alt="image_preview"
                className="object-cover h-full w-full"
              />
            </div>
          )}
          <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={fileChangehandler}
          />
          <Button
            onClick={() => imageRef.current.click()}
            className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg font-semibold"
            variant="ghost"
          >
            Select Image
          </Button>
          {imagePreview &&
            (loading ? (
              <Button className="w-full bg-primary hover:bg-primary/90 rounded-lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 rounded-lg font-semibold"
                onClick={createPostHandler}
              >
                ✓ Post
              </Button>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreatePost

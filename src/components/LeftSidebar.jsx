import { Activity, BookSearch, Heart, Home, LogOut, Meh, MessageCircle, Pin, PlusSquare, User, Users, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser, setselectedUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { setLikeNotification, setNotification } from '@/redux/rtnSlice';
import useGetAllNotification from '@/hooks/useGetAllNotification';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const LeftSidebar = () => {
  const navigate = useNavigate();
  const [openPopOver, setOpenPopOver] = useState(false);
  const { user } = useSelector((store) => store.auth);
  let { likeNotification } = useSelector((store) => store.realTimeNotification);
  likeNotification = likeNotification.filter((n) => n.read != true);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const notifications = useGetAllNotification();
  useEffect(() => {
    if (notifications.length > 0) {
      dispatch(setNotification([...notifications]));
    }
  }, [notifications, dispatch]);
    const logoutHandler = async () => {
      try {
          const res = await axios.get(
            `${API_URL}/api/v1/user/logout`,
            { withCredentials: true },
          );
        if (res.data.success) {
          dispatch(setAuthUser(null));
          dispatch(setPosts([]));
          dispatch(setSelectedPost(null));
          dispatch(setselectedUser(null));
          dispatch(setNotification([]));
              navigate("/login");
              toast.success(res.data.message);
          }
      } catch (error) {
          toast.error(error.response.data.message);
      }
  }
  const handleOpenChange =async (isOpen) => {
    setOpenPopOver(isOpen);
    if (!isOpen) {
      dispatch(setNotification([]));
       try {
          await axios.delete(
            `${API_URL}/api/v1/user/notification/${user?._id}`,
            {
              withCredentials: true,
            },
          );
       } catch (error) {
         toast.error(error.response.data.message);
       }
    }
  };
    const sidebarHandler = (itemName) => {
      if (itemName === "Logout") {
        logoutHandler();
      } else if (itemName === "Create") {
        setOpen(true);
      } else if (itemName === "Profile") {
        navigate(`/profile/${user?._id}`);
      } else if (itemName === "Home") {
        navigate("/");
      } else if (itemName === "Messages") {
        navigate("/chat");
      } else if (itemName === "Groups") {
        navigate("/chat/groups");
      } else if (itemName === "Find") {
        navigate("/find");
      }
  };
  const sidebarItems = [
    {
      icon: <Home />,
      text: "Home",
    },
    {
      icon: <PlusSquare />,
      text: "Create",
    },
    // {
    //   icon: <Zap />,
    //   text: "Connections",
    // },
    {
      icon: <MessageCircle />,
      text: "Messages",
    },
    {
      icon: <Users />,
      text: "Groups",
    },
    {
      icon: <Heart />,
      text: "Notifications",
    },
    {
      icon: <BookSearch />,
      text: "Find",
    },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    {
      icon: <LogOut />,
      text: "Logout",
    },
  ];
  return (
    <div className="fixed top-0 z-10 left-0 px-6 border-r border-border w-[16%] h-screen bg-card">
      <div className="flex flex-col">
        <div className="flex justify-center items-center mt-8 mb-8">
          <img src="/logo_gradlink.png" alt="Logo" className="h-12" />
          <h1 className="text-2xl font-bold ml-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GradLink</h1>
        </div>
        <div className='space-y-2'>      
          {sidebarItems.map((item, idx) => {
            return (
              <div
                onClick={() => sidebarHandler(item.text)}
                key={idx}
                className="flex items-center gap-4 relative hover:bg-secondary cursor-pointer rounded-xl p-4 my-2 transition-all duration-200 hover:shadow-lg"
              >
                {item.icon}
                <span className="font-medium">{item.text}</span>
                {item.text === "Notifications" &&
                  likeNotification.length > 0 && (
                    <Popover open={openPopOver} onOpenChange={handleOpenChange}>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-700 absolute bottom-6 left-8 text-xs"
                        >
                          {likeNotification.filter((n) => !n.read).length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="bg-card border-border">
                        <div>
                          {likeNotification.length === 0 ? (
                            <p>No new notification</p>
                          ) : (
                            likeNotification.map((notification) => {
                              return (
                                <div
                                  key={notification.userId}
                                  className="flex items-center gap-2 my-2"
                                >
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        notification.userDetails?.profilePicture
                                      }
                                      alt="profilepicture"
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm">
                                    <span className="font-bold mr-1">
                                      {notification.userDetails?.name}
                                    </span>
                                    {notification.message}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
              </div>
            );
        })}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen}/>
    </div>
  );
}

export default LeftSidebar

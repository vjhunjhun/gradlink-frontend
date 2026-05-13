import { Button } from "@/components/ui/button";
import Signup from "./components/Signup";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import Login from "./components/login";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import AdminDashboard from "./components/AdminDashboard";
import GroupChat from "./components/GroupChat";
import GroupsList from "./components/GroupsList";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./redux/socketSlice";
import { setOnlineUsers } from "./redux/chatSlice";
import { setLikeNotification, setNotification } from "./redux/rtnSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { setAddNewPost, setFilterPost, setPosts, setSelectedPost, setUpdatedPost } from "./redux/postSlice";
import FindPage from "./components/FindPage";
import { toast } from "sonner";
import { setAuthUser, setselectedUser } from "./redux/authSlice";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat/groups",
        element: (
          <ProtectedRoutes>
            <GroupsList />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat/group/:groupId",
        element: (
          <ProtectedRoutes>
            <GroupChat />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/find",
        element: (
          <ProtectedRoutes>
            <FindPage />
          </ProtectedRoutes>
        ),
      }
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoutes>
        <AdminDashboard />
      </ProtectedRoutes>
    ),
  },
]);
function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { socket } = useSelector(store => store.socketio);
   const logoutHandler = async () => {
     try {
       const res = await axios.get(`${API_URL}/api/v1/user/logout`, {
         withCredentials: true,
       });
       if (res.data.success) {
         dispatch(setAuthUser(null));
         dispatch(setPosts([]));
         dispatch(setSelectedPost(null));
         dispatch(setselectedUser(null));
         dispatch(setNotification([]));
         window.location.href = "/login";
         toast.success("Your account have been deactivated!");
       }
     } catch (error) {
       console.log("what the hell is the error", error);
       toast.error("server error occured!");
     }
   };
  useEffect(() => {
    if (user) {
      const socketio = io(`${API_URL}`, {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      socketio.on("notification", (notification) => {
        console.log("notification update");
        dispatch(setLikeNotification(notification));
      });
      socketio.on("new_post", (post) => {
        if (post?.author != user?._id) {
          dispatch(setAddNewPost(post));
        }
      });
      socketio.on("feed_update", (newPost) => {
        console.log("RECEIVED UPDATE", newPost);
        dispatch(setUpdatedPost(newPost));
      });
      socketio.on("post_delete", (sendPost) => {
        if (sendPost?.author != user?._id) {
          dispatch(setFilterPost(sendPost.id));
        }
      });
      socketio.on("forceLogout", () => {
        logoutHandler();
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
        dispatch(setNotification([]));
      }
    } else if(socket) {  
        socket?.close();
      dispatch(setSocket(null));
      dispatch(setNotification([]));
    }
  }, [user,dispatch]);
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;

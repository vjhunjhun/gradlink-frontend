import React, { useEffect, useState,useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setselectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircle, MessageCircleCode, Users } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { setMessages } from "@/redux/chatSlice";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ChatPage = () => {
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth,
  );
  const [textMessage, setTextMessage] = useState("");
  const dispatch = useDispatch();
  const { onlineUsers, messages } = useSelector(store => store.chat);
  const navigate = useNavigate();
  const [tab, setTab] = useState("direct");
 
  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        setTextMessage("");
        dispatch(setMessages([...messages, res.data.newMessage]))
      }
    } catch (error) {
      console.error("Error sending message:", error);
            toast.error(error.response?.data?.message || "Error sending message");
    }
  }
  
  const [chatUsers, setChatUsers] = useState([]);
  const [search, setSearch] = useState("");
  const filteredUsers = chatUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get(`${API_URL}/api/v1/user/chat-users`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setselectedUser(null));
        setChatUsers(res.data.users);
      }
    };

    fetchUsers();
  }, []);
 


  return (
    <div className="flex ml-[16%] h-screen bg-background">
      <section className="w-full md:w-1/4 my-8 border-r border-border flex flex-col">
        <h1 className="font-bold mb-4 px-4 text-2xl text-foreground">{user?.name}</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 px-4 mb-4 border-b border-border">
          <button
            onClick={() => setTab("direct")}
            className={`pb-2 font-semibold text-sm transition-colors ${
              tab === "direct"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="inline mr-2" size={16} />
            Direct
          </button>
          <button
            onClick={() => setTab("groups")}
            className={`pb-2 font-semibold text-sm transition-colors ${
              tab === "groups"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="inline mr-2" size={16} />
            Groups
          </button>
        </div>

        <div className="px-4 mb-4">
          <Input
            type="text"
            placeholder={tab === "direct" ? "Search users..." : "Search groups..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border-border rounded-full"
          />
        </div>
        
        <div className="overflow-y-auto flex-1">
          {tab === "direct" ? (
            <>
              {filteredUsers.map((SuggestedUser) => {
                const isOnline = onlineUsers.includes(SuggestedUser?._id);
                return (
                  <div
                    key={SuggestedUser._id}
                    onClick={() => dispatch(setselectedUser(SuggestedUser))}
                    className="flex gap-3 items-center p-3 hover:bg-secondary cursor-pointer transition-colors rounded-lg mx-2 my-1"
                  >
                    <Avatar className="h-12 w-12 relative ring-2 ring-primary/20">
                      <AvatarImage src={SuggestedUser?.profilePicture} />
                      <AvatarFallback>CN</AvatarFallback>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card"></div>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{SuggestedUser?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {SuggestedUser?.role ? `${SuggestedUser.role} • ` : ""}{isOnline ? "online" : "offline"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div>
              <Button 
                onClick={() => navigate("/chat/groups")}
                className="w-full mx-2 my-4 bg-primary hover:bg-primary/90"
              >
                View All Groups
              </Button>
            </div>
          )}
        </div>
      </section>
      {selectedUser ? (
        <section className="flex-1 border-l border-border flex flex-col h-full bg-background">
          <div className="flex gap-3 items-center px-4 py-3 border-b border-border sticky top-0 bg-card z-10 rounded-b-xl shadow-sm">
            <Avatar className="w-14 h-14">
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold">{selectedUser?.name}</span>
              <span className="text-xs text-muted-foreground">Active now</span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center gap-3 p-4 border-t border-border">
            <Input
              value={textMessage}
              type="text"
              className="flex-1 bg-secondary border-border focus-visible:ring-primary rounded-full"
              placeholder="Type a message..."
              onChange={(e) => setTextMessage(e.target.value)}
            />
            <Button 
              onClick={() => sendMessageHandler(selectedUser?._id)}
              className="bg-primary hover:bg-primary/90 rounded-full px-6"
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto text-center">
          <MessageCircleCode className="w-24 h-24 my-4 text-muted-foreground" />
          <h1 className="font-bold text-2xl">Your messages</h1>
          <span className="text-muted-foreground mt-2">Send a message to start a chat.</span>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm">
            Chats can be done with people you follow or with the people who follow you.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

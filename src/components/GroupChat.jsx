import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const GroupChat = () => {
  const { groupId } = useParams();
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [newMemberIds, setNewMemberIds] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const messagesEndRef = React.useRef(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineMembers, setOnlineMembers] = useState([]);
  const typingTimeoutRef = React.useRef(null);

  // Fetch group details and messages
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);

        // Fetch group details
        const groupRes = await axios.get(
          `${API_URL}/api/v1/group/${groupId}/messages`,
          { withCredentials: true },
        );

        if (groupRes.data.success) {
          setMessages(groupRes.data.messages);
        }

        // Fetch user groups to get group details
        const groupsRes = await axios.get(`${API_URL}/api/v1/group/all`, {
          withCredentials: true,
        });

        const currentGroup = groupsRes.data.groups.find((g) => g._id === groupId);
        setGroup(currentGroup);
        setMembers(currentGroup?.members || []);
      } catch (error) {
        console.log(error);
        toast.error("Error loading group chat");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId]);

  // Fetch all users for adding members
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/user/chat-users`,
          { withCredentials: true }
        );
        setAllUsers(res.data.users || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllUsers();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket event for receiving new messages
  useEffect(() => {
    if (!socket) {
      console.warn("Socket not connected");
      return;
    }

    // Join group room
    socket.emit("join_group", { groupId });

    socket.on("groupMessage", (newMessage) => {
      console.log("Received group message:", newMessage);
      if (newMessage.groupId === groupId) {
        setMessages((prev) => [...prev, newMessage]);
        // Clear typing indicator when message is received
        setTypingUsers({});
      }
    });

    socket.on("userTyping", ({ userId, isTyping }) => {
      if (isTyping && userId !== user?._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [userId]: true,
        }));
        
        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });
        }, 3000);
      }
    });

    socket.on("groupMemberOnline", ({ onlineMembers: online }) => {
      setOnlineMembers(online);
    });

    socket.on("groupMemberOffline", ({ onlineMembers: online }) => {
      setOnlineMembers(online);
    });

    socket.on("group_members_added", (updatedGroup) => {
      if (updatedGroup._id === groupId) {
        setMembers(updatedGroup.members);
        setGroup(updatedGroup);
        setNewMemberIds([]);
        toast.success("New members added to group");
      }
    });

    socket.on("groupMember_removed", (data) => {
      if (data.groupId === groupId) {
        setMembers(data.group.members);
        setGroup(data.group);
        toast.info("A member was removed from the group");
      }
    });

    socket.on("group_deleted", (data) => {
      if (data.groupId === groupId) {
        toast.error("Group has been deleted");
        // Redirect to messages page
        window.location.href = "/chat";
      }
    });

    return () => {
      socket?.off("groupMessage");
      socket?.off("userTyping");
      socket?.off("groupMemberOnline");
      socket?.off("groupMemberOffline");
      socket?.off("group_members_added");
      socket?.off("groupMember_removed");
      socket?.off("group_deleted");
      socket?.emit("leave_group", { groupId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, groupId, user?._id]);

  const sendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      setSendingMessage(true);
      const res = await axios.post(
        `${API_URL}/api/v1/group/${groupId}/send-message`,
        { message: messageText },
        { withCredentials: true },
      );

      if (res.data.success) {
        console.log("Message sent successfully:", res.data.newMessage);
        setMessageText("");
        // Stop typing indicator
        socket?.emit("groupTyping", { groupId, userId: user?._id, isTyping: false });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Error sending message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMessageTextChange = (e) => {
    const newText = e.target.value;
    setMessageText(newText);
    
    // Emit typing indicator
    if (newText.trim()) {
      socket?.emit("groupTyping", { groupId, userId: user?._id, isTyping: true });
    } else {
      socket?.emit("groupTyping", { groupId, userId: user?._id, isTyping: false });
    }
  };

  const addMembers = async () => {
    if (newMemberIds.length === 0) {
      toast.error("Select at least one member");
      return;
    }

    try {
      setAddMemberLoading(true);
      const res = await axios.post(
        `${API_URL}/api/v1/group/${groupId}/add-members`,
        { memberIds: newMemberIds },
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Members added successfully");
        setNewMemberIds([]);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error adding members");
    } finally {
      setAddMemberLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Remove this member from group?")) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/v1/group/${groupId}/remove-member/${memberId}`,
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Member removed");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error removing member");
    }
  };

  const deleteGroup = async () => {
    if (!window.confirm("Delete this group? This action cannot be undone.")) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/v1/group/${groupId}/delete`,
        { withCredentials: true },
      );

      if (res.data.success) {
        toast.success("Group deleted");
        window.location.href = "/chat";
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error deleting group");
    }
  };

  const isCreator = group?.createdBy?._id === user?._id;
  const isAdmin = group?.admins?.some((admin) => admin._id === user?._id);
  const canManage = isCreator || isAdmin;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading group chat...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Group not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background ml-[16%]">
      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl">{group.name}</h1>
            <p className="text-sm text-muted-foreground">{members.length} members</p>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus size={16} />
                      Add Members
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <div className="space-y-4">
                      <h2 className="font-bold text-lg">Add Members to Group</h2>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {allUsers
                          .filter(
                            (u) =>
                              !members.some((m) => m._id === u._id) &&
                              u._id !== user?._id
                          )
                          .map((u) => (
                            <label
                              key={u._id}
                              className="flex items-center gap-3 p-2 hover:bg-secondary rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={newMemberIds.includes(u._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewMemberIds([...newMemberIds, u._id]);
                                  } else {
                                    setNewMemberIds(
                                      newMemberIds.filter((id) => id !== u._id)
                                    );
                                  }
                                }}
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.profilePicture} />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.role}</p>
                              </div>
                            </label>
                          ))}
                      </div>
                      <Button
                        onClick={addMembers}
                        disabled={addMemberLoading}
                        className="w-full"
                      >
                        {addMemberLoading ? "Adding..." : "Add Selected"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {isCreator && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={deleteGroup}
                    className="gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Group
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Messages Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isSentByCurrentUser = msg.senderId?._id?.toString() === user?._id?.toString();
                return (
                  <div
                    key={msg._id}
                    className={`flex gap-3 ${
                      isSentByCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isSentByCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.senderId?.profilePicture} />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        isSentByCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {!isSentByCurrentUser && (
                        <p className="text-xs font-semibold mb-1">{msg.senderId?.name}</p>
                      )}
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-card border-t border-border p-4 flex gap-2 sticky bottom-0">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !sendingMessage) {
                sendMessage();
              }
            }}
            disabled={sendingMessage}
            className="bg-secondary border-border disabled:opacity-50"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={sendingMessage || !messageText.trim()}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {sendingMessage ? (
              <div className="animate-spin">
                <Send size={20} />
              </div>
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="w-72 bg-card border-l border-border p-4 overflow-y-auto hidden md:block">
        <h2 className="font-bold mb-4 text-lg">Members ({members.length})</h2>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-2 hover:bg-secondary rounded transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={member.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <div className="flex gap-1 flex-wrap">
                    {group?.createdBy?._id === member._id && (
                      <Badge variant="secondary" className="text-xs">
                        Creator
                      </Badge>
                    )}
                    {group?.admins?.some((admin) => admin._id === member._id) && (
                      <Badge variant="outline" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {canManage && member._id !== group?.createdBy?._id && (
                <button
                  onClick={() => removeMember(member._id)}
                  className="text-destructive hover:text-destructive/80 transition flex-shrink-0 ml-2"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupChat;

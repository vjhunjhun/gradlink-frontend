import {React,useEffect,useRef} from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'

const Messages = ({ selectedUser }) => {
    useGetAllMessage();
    useGetRTM();
  const { messages } = useSelector(store => store.chat);
   const bottomRef = useRef(null);
  const { user } = useSelector(store => store.auth);
    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
  return (
    <div className="overflow-y-auto flex-1 p-6 bg-background space-y-6">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/30">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className="font-bold text-lg">{selectedUser?.name}</span>
          {selectedUser?.role && (
            <span className="text-sm text-muted-foreground">{selectedUser.role}</span>
          )}
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="h-8 my-3 bg-primary hover:bg-primary/90 text-xs" variant="default">
              View Profile
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">Start a conversation!</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {messages &&
          messages.map((msg) => {
            return (
              <div
                key={msg?._id}
                className={`flex ${msg.senderId == user?._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs break-words text-sm ${msg.senderId == user?._id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-foreground rounded-bl-none"}`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
        <div ref={bottomRef}></div>
      </div>
    </div>
  );
}

export default Messages

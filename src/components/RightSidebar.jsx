import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);
  return (
    <div className='w-fit my-10 pr-10 pl-6 sticky top-10'>
      <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-200">
        <Link to={`/profile/${user?._id}`}>
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={user?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`} className="hover:text-primary transition-colors">{user?.name}</Link></h1>
          <span className='text-muted-foreground text-xs'>{user?.role ? `${user.role} • ` : ""}{user?.bio || "bio here"}</span>
        </div>
      </div>

      <SuggestedUsers/>
    </div>
  );
}

export default RightSidebar

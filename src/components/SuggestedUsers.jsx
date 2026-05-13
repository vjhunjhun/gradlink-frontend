import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector(store => store.auth);
    return (
    <div className='my-10'>
      <div className='flex items-center justify-between text-sm gap-2 mb-6'>
        <h1 className='font-semibold text-muted-foreground text-xs uppercase tracking-wider'>Suggested for you</h1>
      </div>
      {
        suggestedUsers?.map((user) => {
          return (
            <div key={user?._id} className='flex items-center gap-3 py-4 px-3 rounded-xl hover:bg-secondary transition-colors duration-200'>
              <div className="flex items-center gap-3 flex-1">
                <Link to={`/profile/${user?._id}`}>
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage
                      src={user?.profilePicture}
                      alt="post_image"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <h1 className="font-semibold text-sm">
                    <Link to={`/profile/${user?._id}`} className="hover:text-primary transition-colors">{user?.name}</Link>
                  </h1>
                  <span className="text-muted-foreground text-xs">
                    {user?.role ? `${user.role} • ` : ""}{user?.bio || "bio here"}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      }
    </div>
  )
}

export default SuggestedUsers

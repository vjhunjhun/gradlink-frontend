import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const Comment = ({comment}) => {
  return (
    <div className='my-3'>
      <div className='flex gap-3 items-start'>
        <Avatar className="h-8 w-8 mt-0.5">
          <AvatarImage src={comment.author?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className='text-sm'>
            <span className='font-semibold text-foreground'>{comment?.author?.name}</span>
            {comment?.author?.role && (
              <span className='ml-2 px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded'>
                {comment.author.role}
              </span>
            )}
            <span className='pl-2 text-foreground/90'>{comment?.text}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Comment
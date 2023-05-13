import React from 'react';

import PostsFeed from '../../components/PostsFeed/';

interface PostProps {
  profileUserId: string | undefined;
}

const PostsSection: React.FC<PostProps> = ({ profileUserId }) => {
  if (!profileUserId) return null;
  return <PostsFeed currentPage='profile' profileUserId={profileUserId} />;
};

export default PostsSection;

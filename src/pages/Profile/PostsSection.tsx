import React from 'react';
import PostsFeed from '../../components/PostsFeed/';

interface PostProps {
  profileUserPosts: any;
  profileUserId: string;
}

const PostsSection: React.FC<PostProps> = ({ profileUserPosts, profileUserId }) => {
  return <PostsFeed currentPage='profile' profileUserId={profileUserId} />;
};

export default PostsSection;

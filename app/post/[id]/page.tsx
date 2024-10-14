// src/app/posts/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CircularProgress, Typography, Paper, Container, Button } from '@mui/material';

interface Post {
    id: number;
    title: string;
    body: string;
  }

const PostDetails = ({ params }: { params: { id: string } }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  console.log(params, 'params')

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<Post>(`https://jsonplaceholder.typicode.com/posts/${params.id}`);
      setPost(response.data);
    } catch (error) {
      setError('Failed to fetch post details. Please try again.');
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container style={{ textAlign: 'center', padding: '2rem' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container component={Paper} style={{ padding: '2rem', marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        {post?.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {post?.body}
      </Typography>
      <Button variant="contained" onClick={() => router.back()}>
        Go Back
      </Button>
    </Container>
  );
};

export default PostDetails;

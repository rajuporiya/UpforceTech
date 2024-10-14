'use client'
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent, 
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [tags, setTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({ title: "", body: "", tags: "" });
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const postsPerPage = 10;

  useEffect(() => {
    fetchPosts();
    fetchTags();
  }, [page, sortOrder]);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://dummyjson.com/posts?limit=${postsPerPage}&skip=${(page - 1) * postsPerPage
        }&sortBy=title&order=${sortOrder}`
      );
      setPosts(response.data.posts);
    } catch (error) {
      setError("Failed to fetch posts.");
      toast.error("Error fetching posts.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get("https://dummyjson.com/posts/tags");
      setTags(response.data);
    } catch (error) {
      console.error("Failed to fetch tags.");
      toast.error("Error fetching tags.");
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setPage(1); 
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `https://dummyjson.com/posts/search?q=${searchTerm}`
      );
      setPosts(response.data.posts);
    } catch (error) {
      setError("Failed to search posts.");
      toast.error("Error searching posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSortOrder(e.target.value);
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.body) {
      toast.error("Title and body are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("https://dummyjson.com/posts/add", {
        title: formData.title,
        body: formData.body,
        tags: formData.tags.split(","),
        userId: 1,
      });

      setPosts([response.data, ...posts]);
      setFormData({ title: "", body: "", tags: "" });
      toast.success("Post created successfully!");
    } catch (error) {
      setError("Failed to create post.");
      toast.error("Error creating post.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setFormData({ title: post.title, body: post.body, tags: post.tags.join(",") });
    setEditingPostId(post.id);
  };

  const handleUpdatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (editingPostId !== null) {
      setLoading(true);
      setError("");

      try {
        const response = await axios.put(`https://dummyjson.com/posts/${editingPostId}`, {
          title: formData.title,
          body: formData.body,
          tags: formData.tags.split(","),
        });

        setPosts(
          posts.map((post) => (post.id === editingPostId ? response.data : post))
        );

        setFormData({ title: "", body: "", tags: "" });
        setEditingPostId(null); 
        toast.success("Post updated successfully!");
      } catch (error) {
        setError("Error updating post.");
        toast.error("Error updating post.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeletePost = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      await axios.delete(`https://dummyjson.com/posts/${id}`);
      setPosts(posts.filter((post) => post.id !== id));
      toast.success("Post deleted successfully!");
    } catch (error) {
      setError("Failed to delete post.");
      toast.error("Error deleting post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
      Post Management Application
      </Typography>

      <form onSubmit={handleSearch}>
        <TextField
          label="Search posts"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Search
        </Button>
      </form>

      <FormControl fullWidth margin="normal">
        <InputLabel>Sort by</InputLabel>
        <Select value={sortOrder} onChange={handleSortChange}>
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>

      <form onSubmit={editingPostId ? handleUpdatePost : handleCreatePost}>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />
        <TextField
          label="Body"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.body}
          onChange={(e) =>
            setFormData({ ...formData, body: e.target.value })
          }
        />
        <TextField
          label="Tags"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.tags}
          onChange={(e) =>
            setFormData({ ...formData, tags: e.target.value })
          }
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          style={{ marginTop: "1rem" }}
          disabled={loading}  
        >
          {editingPostId ? "Update Post" : "Create Post"}
        </Button>

      </form>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} style={{ marginTop: "2rem" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Body</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No posts found.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.body}</TableCell>
                    <TableCell>{post.tags.join(", ")}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditPost(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeletePost(post.id)}
                        style={{ marginLeft: "1rem" }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </TableContainer>
      )}

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <Button variant="contained" onClick={() => setPage(page + 1)} disabled={loading}>
          Next
        </Button>

      </div>

      <ToastContainer />
    </div>
  );
};

export default Posts;

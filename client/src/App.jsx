import React, { useState, useEffect } from 'react';
import Button from './components/Button';
import PostForm from './components/PostForm';
import { PlusCircle, Search, Filter } from 'lucide-react';

function App() {
  const [posts, setPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
   
      const mockPosts = [
        {
          _id: '1',
          title: 'Getting Started with React Testing',
          content: 'This is a comprehensive guide to testing React applications...',
          author: { username: 'johndoe' },
          category: 'Technology',
          createdAt: new Date().toISOString(),
          views: 150
        },
        {
          _id: '2',
          title: 'Advanced JavaScript Patterns',
          content: 'Learn about advanced JavaScript patterns and best practices...',
          author: { username: 'janedoe' },
          category: 'Technology',
          createdAt: new Date().toISOString(),
          views: 89
        }
      ];
      
      setPosts(mockPosts);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost = {
        _id: Date.now().toString(),
        ...postData,
        author: { username: 'currentuser' },
        createdAt: new Date().toISOString(),
        views: 0
      };
      
      setPosts(prev => [newPost, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      throw new Error('Failed to create post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">MERN Testing Blog</h1>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
              data-testid="create-post-button"
            >
              <PlusCircle size={20} />
              Create Post
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="search-input"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="category-filter"
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4" data-testid="error-message">
            <p className="text-red-800">{error}</p>
            <Button
              onClick={fetchPosts}
              variant="danger"
              size="sm"
              className="mt-2"
              data-testid="retry-button"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Create Post Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <PostForm onSubmit={handleCreatePost} />
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6" data-testid="post-list">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts found</p>
              {searchTerm || selectedCategory ? (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  variant="secondary"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                data-testid="post-item"
                onClick={() => console.log('View post:', post._id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2" data-testid="post-title">
                      {post.title}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span data-testid="post-author">By {post.author.username}</span>
                      <span data-testid="post-category">{post.category}</span>
                      <span>{post.views} views</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 line-clamp-3" data-testid="post-content">
                  {post.content}
                </p>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
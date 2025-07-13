import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [currentView, setCurrentView] = useState('login');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      setUser({ id: localStorage.getItem('user_id') });
      fetchArticles();
      fetchRecentArticles();
    }
  }, [token]);

  const apiCall = async (endpoint, options = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return response.json();
  };

  const handleAuth = async (isLogin) => {
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const result = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(authData),
      });

      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user_id', result.user_id);
        setUser({ id: result.user_id });
        setCurrentView('articles');
        fetchArticles();
        fetchRecentArticles();
      } else {
        alert(result.message || 'Authentication failed');
      }
    } catch (error) {
      alert('Network error');
    }
    setLoading(false);
  };

  const fetchArticles = async () => {
    try {
      const result = await apiCall('/articles');
      setArticles(result.articles || []);
    } catch (error) {
      console.error('Failed to fetch articles');
    }
  };

  const fetchRecentArticles = async () => {
    try {
      const result = await apiCall('/articles/recent');
      setRecentArticles(result.recent_articles || []);
    } catch (error) {
      console.error('Failed to fetch recent articles');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = selectedArticle ? `/articles/${selectedArticle.id}` : '/articles';
      const method = selectedArticle ? 'PUT' : 'POST';
      
      await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      setFormData({ title: '', content: '' });
      setSelectedArticle(null);
      setCurrentView('articles');
      fetchArticles();
    } catch (error) {
      alert('Failed to save article');
    }
    setLoading(false);
  };

  const viewArticle = async (id) => {
    try {
      const result = await apiCall(`/articles/${id}`);
      setSelectedArticle(result);
      setCurrentView('view');
      fetchRecentArticles();
    } catch (error) {
      alert('Failed to load article');
    }
  };

  const editArticle = (article) => {
    setSelectedArticle(article);
    setFormData({ title: article.title, content: article.content });
    setCurrentView('form');
  };

  const deleteArticle = async (id) => {
    if (window.confirm('Delete this article?')) {
      try {
        await apiCall(`/articles/${id}`, { method: 'DELETE' });
        fetchArticles();
      } catch (error) {
        alert('Failed to delete article');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setUser(null);
    setCurrentView('login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">CMS</h1>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 border rounded-lg"
              value={authData.username}
              onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg"
              value={authData.password}
              onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleAuth(true)}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Login
              </button>
              <button
                onClick={() => handleAuth(false)}
                disabled={loading}
                className="flex-1 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Content Management System</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('articles')}
              className="text-blue-600 hover:text-blue-800"
            >
              Articles
            </button>
            <button
              onClick={() => setCurrentView('recent')}
              className="text-blue-600 hover:text-blue-800"
            >
              Recent
            </button>
            <button onClick={logout} className="text-red-600 hover:text-red-800">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        {currentView === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Articles</h2>
              <button
                onClick={() => {
                  setSelectedArticle(null);
                  setFormData({ title: '', content: '' });
                  setCurrentView('form');
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>New Article</span>
              </button>
            </div>
            <div className="grid gap-4">
              {articles.map((article) => (
                <div key={article.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.content.substring(0, 100)}...</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewArticle(article.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => editArticle(article)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteArticle(article.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'recent' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Recently Viewed</h2>
            <div className="grid gap-4">
              {recentArticles.map((article) => (
                <div key={article.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600">{article.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'form' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6">
              {selectedArticle ? 'Edit Article' : 'New Article'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Article Title"
                className="w-full p-3 border rounded-lg"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Article Content"
                className="w-full p-3 border rounded-lg h-48"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {selectedArticle ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('articles')}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'view' && selectedArticle && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">{selectedArticle.title}</h2>
            <p className="text-gray-600 mb-4">
              Created: {new Date(selectedArticle.created_at).toLocaleDateString()}
            </p>
            <div className="prose max-w-none">
              <p>{selectedArticle.content}</p>
            </div>
            <button
              onClick={() => setCurrentView('articles')}
              className="mt-4 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Back to Articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
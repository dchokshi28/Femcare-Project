import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Share2, BadgeCheck } from 'lucide-react';
import { API_BASE } from '../lib/api';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/posts`)
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-pink"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-fade-in space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Verified Health Feed</h1>
        <p className="text-gray-500 mt-2">Expert advice and awareness from certified gynecologists.</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Failed to load posts or no posts available.</div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-smooth">
            <div className="p-6">
              
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={post.profileImage} 
                  alt={post.doctorName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-soft-pink"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-1">
                    {post.doctorName}
                    {post.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                  </h3>
                  <span className="text-xs text-gray-500">Gynecologist & Health Expert</span>
                </div>
              </div>

              <h4 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h4>
              <p className="text-gray-600 leading-relaxed mb-6">{post.content}</p>

              <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                <button className="flex items-center gap-2 text-gray-500 hover:text-deep-pink transition-colors group">
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group ml-auto">
                  <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Posts;

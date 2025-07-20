import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, ArrowRight, BookOpen } from 'lucide-react';
import { blogPosts, categories } from '../data/blogData';
import BlogCard from '../components/blog/BlogCard';
import BlogPost from '../components/blog/BlogPost';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find(post => post.featured);

  // Auto-scroll to top when selectedPost changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedPost]);

  if (selectedPost) {
    return <BlogPost post={selectedPost} onBack={() => setSelectedPost(null)} onPostSelect={setSelectedPost} />;
  }

  return (
    <div className="min-h-screen bg-bone py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-charcoal mb-6">
            AI Insights for <span className="text-chestnut">Growing Organizations</span>
          </h1>
          <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
            Practical guidance, real-world case studies, and actionable strategies for small businesses, 
            nonprofits, and service organizations embracing AI.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-pearl rounded-lg focus:outline-none focus:border-chestnut"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-charcoal/60 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-pearl rounded-lg px-4 py-3 focus:outline-none focus:border-chestnut"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-3 sm:py-2 rounded-full text-sm font-medium transition-colors touch-manipulation ${
                  selectedCategory === category
                    ? 'bg-chestnut text-white'
                    : 'bg-white text-charcoal hover:bg-chestnut/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === "All" && !searchTerm && (
          <div className="mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-chestnut mr-2" />
                <span className="text-chestnut font-medium">Featured Article</span>
              </div>
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center mb-3">
                    <span className="bg-chestnut/10 text-chestnut px-3 py-1 rounded-full text-sm font-medium mr-3">
                      {featuredPost.category}
                    </span>
                    <span className="text-charcoal/60 text-sm">{featuredPost.readTime}</span>
                  </div>
                  <h2 className="font-serif font-bold text-2xl md:text-3xl text-charcoal mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-charcoal/80 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm text-charcoal/70">
                        By {featuredPost.author} • {new Date(featuredPost.publishDate).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPost(featuredPost)}
                      className="bg-chestnut text-white px-6 py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors flex items-center touch-manipulation"
                    >
                      Read Article <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="rounded-xl h-64 overflow-hidden">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="bg-pearl/30 rounded-xl h-64 flex items-center justify-center" style={{display: 'none'}}>
                      <div className="text-center">
                        <BookOpen className="w-16 h-16 text-chestnut mx-auto mb-4" />
                        <div className="text-charcoal/60 text-sm">{featuredPost.image}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredPosts.filter(post => !post.featured || selectedCategory !== "All" || searchTerm).map(post => (
            <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-charcoal/60 mb-4">No articles found matching your criteria.</div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="text-chestnut hover:text-chestnut/80 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-chestnut/10 rounded-2xl p-12 text-center">
          <h2 className="font-serif font-bold text-3xl text-charcoal mb-4">
            Stay Updated on AI for Small Organizations
          </h2>
          <p className="text-xl text-charcoal/80 mb-8 max-w-2xl mx-auto">
            Get practical AI insights, case studies, and implementation tips delivered to your inbox monthly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-pearl rounded-lg focus:outline-none focus:border-chestnut"
            />
            <button className="bg-chestnut text-white px-6 py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors whitespace-nowrap touch-manipulation">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
import React, { useState } from 'react';
import { ArrowLeft, User, Heart, Share2, BookOpen, Tag } from 'lucide-react';
import { blogPosts } from '../../data/blogData';
import BlogCard from './BlogCard';

const BlogPost = ({ post, onBack, onPostSelect }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="min-h-screen bg-bone py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <button
          onClick={onBack}
          className="flex items-center text-chestnut hover:text-chestnut/80 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </button>

        {/* Article Header */}
        <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <span className="bg-chestnut/10 text-chestnut px-3 py-1 rounded-full text-sm font-medium mr-3">
                {post.category}
              </span>
              <span className="text-charcoal/60 text-sm">{post.readTime}</span>
            </div>
            
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-charcoal mb-6">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-chestnut/10 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-chestnut" />
                </div>
                <div>
                  <div className="font-medium text-charcoal">{post.author}</div>
                  <div className="text-sm text-charcoal/60">
                    {new Date(post.publishDate).toLocaleDateString()} • {post.views} views
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-charcoal/60'} hover:text-red-500 transition-colors`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{post.likes + (liked ? 1 : 0)}</span>
                </button>
                <button className="flex items-center space-x-1 text-charcoal/60 hover:text-chestnut transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-xl h-64 md:h-80 overflow-hidden mb-8">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="bg-pearl/30 rounded-xl h-64 md:h-80 flex items-center justify-center" style={{display: 'none'}}>
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-chestnut mx-auto mb-4" />
                  <div className="text-charcoal/60 text-sm">{post.image}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none text-charcoal/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
            style={{
              fontSize: '1.1rem',
              lineHeight: '1.8'
            }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-pearl">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center bg-khaki/20 text-charcoal/70 px-3 py-1 rounded-full text-sm">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Author Bio */}
            <div className="bg-pearl/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-chestnut/10 rounded-full flex items-center justify-center mr-4">
                  <User className="w-8 h-8 text-chestnut" />
                </div>
                <div>
                  <h3 className="font-medium text-lg text-charcoal">{post.author}</h3>
                  <div className="text-chestnut text-sm">Founder & Principal Consultant, EvolvIQ</div>
                </div>
              </div>
              <p className="text-charcoal/80 text-sm">
                Loren helps small businesses, nonprofits, and service organizations implement practical AI solutions 
                that enhance their mission and strengthen their competitive position. With over 15 years in organizational 
                transformation, she specializes in human-centered approaches to technology adoption.
              </p>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-16">
          <h2 className="font-serif font-bold text-2xl text-charcoal mb-8">Related Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts
              .filter(p => p.id !== post.id && (p.category === post.category || p.tags.some(tag => post.tags.includes(tag))))
              .slice(0, 2)
              .map(relatedPost => (
                <BlogCard key={relatedPost.id} post={relatedPost} onClick={() => onPostSelect(relatedPost)} />
              ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-chestnut/10 rounded-2xl p-8 text-center">
          <h2 className="font-serif font-bold text-2xl text-charcoal mb-4">
            Ready to Explore AI for Your Organization?
          </h2>
          <p className="text-charcoal/80 mb-6">
            Let's discuss how AI could enhance your operations and help you better serve your community.
          </p>
          <button 
            onClick={() => window.location.href = '/service-intake'}
            className="bg-chestnut text-white px-8 py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors touch-manipulation"
          >
            Schedule a Free Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
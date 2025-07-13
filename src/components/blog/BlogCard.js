import React from 'react';
import { BookOpen, Clock, Eye, Heart, ArrowRight } from 'lucide-react';

const BlogCard = ({ post, onClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="relative">
        <div className="rounded-t-xl h-48 overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="bg-pearl/30 rounded-t-xl h-48 flex items-center justify-center" style={{display: 'none'}}>
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-chestnut mx-auto mb-2" />
              <div className="text-charcoal/60 text-xs">{post.image}</div>
            </div>
          </div>
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-chestnut/10 text-chestnut px-3 py-1 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-serif font-bold text-xl text-charcoal mb-3 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-charcoal/80 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between text-sm text-charcoal/60 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {post.readTime}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {post.views}
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 mr-1" />
              {post.likes}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-charcoal/60">
            By {post.author} • {new Date(post.publishDate).toLocaleDateString()}
          </div>
          <ArrowRight className="w-4 h-4 text-chestnut" />
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {post.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs sm:text-sm bg-khaki/20 text-charcoal/70 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
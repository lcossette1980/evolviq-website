import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  Bold,
  Italic,
  Link,
  List,
  Image,
  Code,
  Eye,
  Upload,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';

/**
 * Blog Editor Component
 * Rich text editor for creating and editing blog posts
 */
const BlogEditor = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'EvolvIQ Team',
    category: 'AI Strategy',
    tags: [],
    featured: false,
    image: '',
    status: 'draft',
    publishDate: new Date().toISOString().split('T')[0],
    views: 0,
    likes: 0,
    readTime: '5 min read',
    relatedPosts: []
  });

  const [isPreview, setIsPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    'AI Strategy',
    'Case Studies',
    'Technology',
    'Small Business',
    'Implementation',
    'Best Practices',
    'Industry Insights'
  ];

  useEffect(() => {
    if (post) {
      setFormData({
        ...formData,
        ...post,
        publishDate: post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0] : formData.publishDate,
        tags: post.tags || []
      });
    }
  }, [post]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate read time based on content length
    if (field === 'content') {
      const wordCount = value.split(' ').length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      setFormData(prev => ({
        ...prev,
        readTime: `${readTime} min read`
      }));
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      const timestamp = Date.now();
      const fileName = `blog/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      handleInputChange('image', downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      handleInputChange('tags', [...formData.tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const insertMarkdown = (type) => {
    const textarea = document.getElementById('content-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    let newText = '';

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'List item'}`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'image':
        newText = `![${selectedText || 'alt text'}](image-url)`;
        break;
      default:
        return;
    }

    const newContent = 
      formData.content.substring(0, start) + 
      newText + 
      formData.content.substring(end);
    
    handleInputChange('content', newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = start + newText.length;
      textarea.selectionEnd = start + newText.length;
      textarea.focus();
    }, 0);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        ...formData,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        updatedAt: serverTimestamp(),
        publishDate: new Date(formData.publishDate).toISOString()
      };

      if (post?.id) {
        // Update existing post
        await updateDoc(doc(db, 'blog_posts', post.id), postData);
      } else {
        // Create new post
        const postId = `post_${Date.now()}`;
        await setDoc(doc(db, 'blog_posts', postId), {
          ...postData,
          id: postId,
          createdAt: serverTimestamp()
        });
      }

      onSave(postData);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    return (
      <div className="prose max-w-none">
        <h1>{formData.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
          <span className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {formData.author}
          </span>
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(formData.publishDate).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {formData.readTime}
          </span>
        </div>
        {formData.image && (
          <img src={formData.image} alt={formData.title} className="w-full rounded-lg mb-6" />
        )}
        <div dangerouslySetInnerHTML={{ 
          __html: formData.content.replace(/\n/g, '<br />') 
        }} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center px-4 py-2 text-white bg-chestnut rounded-md hover:bg-chestnut/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>

      {isPreview ? (
        renderPreview()
      ) : (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
              placeholder="Enter blog post title"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
              rows="3"
              placeholder="Brief description of the post"
            />
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Publish Date and Status */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Date
              </label>
              <input
                type="date"
                value={formData.publishDate}
                onChange={(e) => handleInputChange('publishDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
                placeholder="Image URL"
              />
              <label className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploadingImage ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {formData.image && (
              <img 
                src={formData.image} 
                alt="Preview" 
                className="mt-4 max-h-48 rounded-md"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-chestnut focus:border-chestnut"
                placeholder="Add a tag"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Tag className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-chestnut/10 text-chestnut rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-chestnut hover:text-chestnut/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <div className="border border-gray-300 rounded-md">
              <div className="flex items-center space-x-2 p-2 border-b border-gray-300 bg-gray-50">
                <button
                  onClick={() => insertMarkdown('bold')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('italic')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('link')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Link"
                >
                  <Link className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('list')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('code')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Code"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  onClick={() => insertMarkdown('image')}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Image"
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
              <textarea
                id="content-editor"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full px-3 py-2 focus:outline-none focus:ring-chestnut"
                rows="15"
                placeholder="Write your blog post content here..."
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Supports Markdown formatting. Word count: {formData.content.split(' ').filter(w => w).length}
            </p>
          </div>

          {/* Featured Post */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="h-4 w-4 text-chestnut focus:ring-chestnut border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
              Mark as featured post
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
import React, { useState, useEffect } from 'react';
import {
  Brain,
  BookOpen,
  Edit3,
  Eye,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import StatsCard from './StatsCard';
import { formatDate, exportToCSV } from '../../utils/adminHelpers';

/**
 * Content Management Module
 * Manages guides, assessments, and content analytics
 */
const ContentManager = () => {
  const [activeTab, setActiveTab] = useState('guides');
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'guides', label: 'Guides', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'assessments', label: 'Assessments', icon: <Brain className="w-4 h-4" /> },
    { id: 'analytics', label: 'Content Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-chestnut text-chestnut'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'guides' && <GuidesManager />}
      {activeTab === 'assessments' && <AssessmentsManager />}
      {activeTab === 'analytics' && <ContentAnalytics />}
    </div>
  );
};

// Guides Manager Component
const GuidesManager = () => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [showGuideDetail, setShowGuideDetail] = useState(false);
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadGuides();
  }, []);

  useEffect(() => {
    filterGuides();
  }, [guides, searchTerm, statusFilter]);

  const loadGuides = async () => {
    setLoading(true);
    try {
      // Try to load from guidesAPI
      const guidesData = await loadGuidesData();
      setGuides(guidesData);
    } catch (error) {
      console.error('Error loading guides:', error);
      // Fallback to demo data
      setGuides(generateDemoGuides());
    } finally {
      setLoading(false);
    }
  };

  const loadGuidesData = async () => {
    // This would integrate with your actual guides API
    // For now, return demo data that matches your guide structure
    return generateDemoGuides();
  };

  const generateDemoGuides = () => {
    return [
      {
        id: 'ai-readiness-assessment',
        title: 'AI Readiness Assessment',
        description: 'Comprehensive assessment to evaluate organizational AI readiness',
        status: 'published',
        type: 'assessment',
        category: 'Assessment',
        completions: 324,
        averageRating: 4.7,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        author: 'Admin',
        estimatedTime: '15-20 minutes',
        difficulty: 'Intermediate'
      },
      {
        id: 'ai-strategy-starter-kit',
        title: 'AI Strategy Starter Kit',
        description: 'Strategic framework for developing AI initiatives',
        status: 'published',
        type: 'guide',
        category: 'Strategy',
        completions: 156,
        averageRating: 4.5,
        createdAt: '2024-01-08T11:00:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
        author: 'Admin',
        estimatedTime: '30-45 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'ai-implementation-playbook',
        title: 'AI Implementation Playbook',
        description: 'Step-by-step guide for implementing AI solutions',
        status: 'draft',
        type: 'guide',
        category: 'Implementation',
        completions: 0,
        averageRating: 0,
        createdAt: '2024-01-22T10:00:00Z',
        updatedAt: '2024-01-22T10:00:00Z',
        author: 'Admin',
        estimatedTime: '45-60 minutes',
        difficulty: 'Advanced'
      },
      {
        id: 'ai-use-case-roi-toolkit',
        title: 'AI Use Case ROI Toolkit',
        description: 'Tools and templates for calculating AI project ROI',
        status: 'published',
        type: 'toolkit',
        category: 'Business',
        completions: 89,
        averageRating: 4.3,
        createdAt: '2024-01-12T13:00:00Z',
        updatedAt: '2024-01-19T09:15:00Z',
        author: 'Admin',
        estimatedTime: '20-30 minutes',
        difficulty: 'Intermediate'
      },
      {
        id: 'ai-ethics-governance',
        title: 'AI Ethics & Governance Framework',
        description: 'Guidelines for responsible AI development and deployment',
        status: 'review',
        type: 'guide',
        category: 'Ethics',
        completions: 0,
        averageRating: 0,
        createdAt: '2024-01-21T15:00:00Z',
        updatedAt: '2024-01-21T15:00:00Z',
        author: 'Admin',
        estimatedTime: '25-35 minutes',
        difficulty: 'Intermediate'
      }
    ];
  };

  const filterGuides = () => {
    let filtered = [...guides];

    if (searchTerm) {
      filtered = filtered.filter(guide =>
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(guide => guide.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = sortKey.split('.').reduce((obj, key) => obj?.[key], a);
      let bVal = sortKey.split('.').reduce((obj, key) => obj?.[key], b);

      if (sortKey.includes('At')) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredGuides(filtered);
  };

  const handleSort = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft': return <Edit3 className="w-4 h-4 text-gray-600" />;
      case 'review': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const tableColumns = [
    {
      key: 'title',
      title: 'Guide',
      sortable: true,
      render: (guide) => (
        <div>
          <div className="font-medium text-charcoal">{guide.title}</div>
          <div className="text-sm text-gray-500">{guide.description}</div>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-xs text-gray-400">{guide.category}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{guide.estimatedTime}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (guide) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(guide.status)}`}>
          {getStatusIcon(guide.status)}
          <span className="ml-1 capitalize">{guide.status}</span>
        </span>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (guide) => (
        <span className="text-sm capitalize">{guide.type}</span>
      )
    },
    {
      key: 'completions',
      title: 'Completions',
      sortable: true,
      render: (guide) => (
        <div className="text-center">
          <div className="font-medium">{guide.completions}</div>
          {guide.averageRating > 0 && (
            <div className="text-xs text-gray-500">★ {guide.averageRating}</div>
          )}
        </div>
      )
    },
    {
      key: 'updatedAt',
      title: 'Last Updated',
      sortable: true,
      render: (guide) => formatDate(guide.updatedAt)
    }
  ];

  const tableActions = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: 'View Details',
      onClick: (guide) => {
        setSelectedGuide(guide);
        setShowGuideDetail(true);
      },
      className: 'text-blue-600 hover:text-blue-800'
    },
    {
      icon: <Edit3 className="w-4 h-4" />,
      title: 'Edit Guide',
      onClick: (guide) => {
        // Navigate to guide editor
        window.open(`/admin/guides/${guide.id}/edit`, '_blank');
      },
      className: 'text-chestnut hover:text-chestnut/80'
    }
  ];

  const stats = {
    total: guides.length,
    published: guides.filter(g => g.status === 'published').length,
    draft: guides.filter(g => g.status === 'draft').length,
    totalCompletions: guides.reduce((sum, g) => sum + g.completions, 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Guides"
          value={stats.total}
          icon={BookOpen}
          color="chestnut"
          loading={loading}
        />
        <StatsCard
          title="Published"
          value={stats.published}
          icon={CheckCircle}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Draft"
          value={stats.draft}
          icon={Edit3}
          color="yellow"
          loading={loading}
        />
        <StatsCard
          title="Total Completions"
          value={stats.totalCompletions}
          icon={Users}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
            </select>
          </div>
          <button
            onClick={() => exportToCSV(filteredGuides, 'guides')}
            className="px-4 py-2 border border-chestnut text-chestnut rounded-lg hover:bg-chestnut/10 transition-colors"
          >
            Export Guides
          </button>
        </div>
      </div>

      {/* Guides Table */}
      <AdminTable
        columns={tableColumns}
        data={filteredGuides}
        loading={loading}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search guides by title, description, or category..."
        emptyStateTitle="No guides found"
        emptyStateDescription="No guides match your current filters"
        emptyStateIcon={BookOpen}
        actions={tableActions}
      />

      {/* Guide Detail Modal */}
      <AdminModal
        isOpen={showGuideDetail}
        onClose={() => setShowGuideDetail(false)}
        title={selectedGuide ? selectedGuide.title : 'Guide Details'}
        size="large"
      >
        {selectedGuide && <GuideDetailView guide={selectedGuide} />}
      </AdminModal>
    </div>
  );
};

// Guide Detail View Component
const GuideDetailView = ({ guide }) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-charcoal">Guide Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{guide.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{guide.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(guide.status)}`}>
                {guide.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Time:</span>
              <span className="font-medium">{guide.estimatedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-medium">{guide.difficulty}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-charcoal">Performance Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Completions:</span>
              <span className="font-medium">{guide.completions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Rating:</span>
              <span className="font-medium">
                {guide.averageRating > 0 ? `★ ${guide.averageRating}` : 'No ratings yet'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatDate(guide.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{formatDate(guide.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-charcoal mb-2">Description</h4>
        <p className="text-gray-600">{guide.description}</p>
      </div>
    </div>
  );
};

// Assessments Manager Component
const AssessmentsManager = () => {
  const [assessments] = useState([
    {
      id: 'ai-knowledge-navigator',
      title: 'AI Knowledge Navigator',
      description: 'Comprehensive AI knowledge assessment with personalized learning paths',
      type: 'dynamic',
      questions: 15,
      averageTime: '12 minutes',
      completions: 1247,
      averageScore: 68,
      status: 'active',
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: 'change-readiness-assessment',
      title: 'Change Readiness Assessment',
      description: 'Organizational change readiness evaluation',
      type: 'structured',
      questions: 25,
      averageTime: '18 minutes',
      completions: 456,
      averageScore: 72,
      status: 'active',
      createdAt: '2024-01-08T11:00:00Z',
      updatedAt: '2024-01-19T09:15:00Z'
    }
  ]);

  const tableColumns = [
    {
      key: 'title',
      title: 'Assessment',
      render: (assessment) => (
        <div>
          <div className="font-medium text-charcoal">{assessment.title}</div>
          <div className="text-sm text-gray-500">{assessment.description}</div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (assessment) => (
        <span className="capitalize text-sm">{assessment.type}</span>
      )
    },
    {
      key: 'questions',
      title: 'Questions',
      render: (assessment) => assessment.questions
    },
    {
      key: 'completions',
      title: 'Completions',
      render: (assessment) => assessment.completions
    },
    {
      key: 'averageScore',
      title: 'Avg Score',
      render: (assessment) => `${assessment.averageScore}%`
    },
    {
      key: 'status',
      title: 'Status',
      render: (assessment) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          assessment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {assessment.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Assessments"
          value={assessments.length}
          icon={Brain}
          color="chestnut"
        />
        <StatsCard
          title="Total Completions"
          value={assessments.reduce((sum, a) => sum + a.completions, 0)}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(assessments.reduce((sum, a) => sum + a.averageScore, 0) / assessments.length)}%`}
          icon={BarChart3}
          color="blue"
        />
        <StatsCard
          title="Active Assessments"
          value={assessments.filter(a => a.status === 'active').length}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Assessments Table */}
      <AdminTable
        columns={tableColumns}
        data={assessments}
        emptyStateTitle="No assessments found"
        emptyStateIcon={Brain}
        actions={[
          {
            icon: <Eye className="w-4 h-4" />,
            title: 'View Details',
            onClick: (assessment) => console.log('View assessment:', assessment),
            className: 'text-blue-600 hover:text-blue-800'
          },
          {
            icon: <Edit3 className="w-4 h-4" />,
            title: 'Edit Assessment',
            onClick: (assessment) => console.log('Edit assessment:', assessment),
            className: 'text-chestnut hover:text-chestnut/80'
          }
        ]}
      />
    </div>
  );
};

// Content Analytics Component
const ContentAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Content Views"
          value="12.4k"
          icon={Eye}
          color="blue"
          trend={15.2}
          trendLabel="this month"
        />
        <StatsCard
          title="Completion Rate"
          value="73%"
          icon={CheckCircle}
          color="green"
          trend={5.1}
          trendLabel="this month"
        />
        <StatsCard
          title="User Engagement"
          value="4.6"
          icon={BarChart3}
          color="chestnut"
          trend={-2.3}
          trendLabel="avg rating"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Content Performance</h3>
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Advanced analytics dashboard coming soon</p>
          <p className="text-sm">View detailed content performance metrics and user engagement data</p>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'review': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-red-100 text-red-800';
  }
};

export default ContentManager;
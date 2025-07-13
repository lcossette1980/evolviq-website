import React from 'react';
import { ExternalLink, Code, Presentation, Zap, Award, TrendingUp } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Award className="w-4 h-4" />;
      case 'in_progress': return <Zap className="w-4 h-4" />;
      case 'planned': return <TrendingUp className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
         onClick={onClick}>
      {/* Project Image */}
      <div className="relative h-40 sm:h-44 lg:h-48 overflow-hidden">
        <img 
          src={`/images/projects/${project.image}`} 
          alt={project.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="bg-gradient-to-br from-pearl/30 to-khaki/20 h-40 sm:h-44 lg:h-48 flex items-center justify-center" style={{display: 'none'}}>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-chestnut/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Code className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-chestnut" />
            </div>
            <div className="text-charcoal/60 text-xs sm:text-sm">{project.image}</div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-chestnut text-white px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Category */}
        <div className="flex items-center justify-between mb-3">
          <span className="bg-chestnut/10 text-chestnut px-3 py-1 rounded-full text-sm font-medium">
            {project.category}
          </span>
          <span className="text-charcoal/60 text-sm">{project.industry}</span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-serif font-bold text-xl text-charcoal mb-2 group-hover:text-chestnut transition-colors">
          {project.title}
        </h3>
        <p className="text-chestnut font-medium text-sm mb-3">
          {project.subtitle}
        </p>

        {/* Description */}
        <p className="text-charcoal/80 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Key Metrics */}
        {project.metrics && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Object.entries(project.metrics).slice(0, 3).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="font-bold text-chestnut text-sm">{value}</div>
                <div className="text-xs text-charcoal/60 capitalize">{key}</div>
              </div>
            ))}
          </div>
        )}

        {/* Technologies */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((tech, index) => (
              <span key={index} className="text-xs sm:text-sm bg-khaki/20 text-charcoal/70 px-2 py-1 rounded">
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="text-xs sm:text-sm text-charcoal/60 px-2 py-1">
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center justify-between pt-4 border-t border-pearl">
          <div className="flex items-center space-x-3">
            {project.links?.presentation && (
              <a
                href={project.links.presentation}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-chestnut hover:text-chestnut/80 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Presentation className="w-4 h-4 mr-1" />
                View
              </a>
            )}
            {project.links?.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-chestnut hover:text-chestnut/80 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Demo
              </a>
            )}
            {project.links?.api && (
              <a
                href={project.links.api}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-chestnut hover:text-chestnut/80 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Code className="w-4 h-4 mr-1" />
                API
              </a>
            )}
          </div>
          
          {/* Key Results Count */}
          {project.keyResults && (
            <span className="text-xs sm:text-sm text-charcoal/60">
              {project.keyResults.length} results
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
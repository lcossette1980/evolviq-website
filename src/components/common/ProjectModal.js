import React from 'react';
import { X, ExternalLink, Code, Presentation, CheckCircle, Award, TrendingUp, Zap } from 'lucide-react';

const ProjectModal = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Award className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <Zap className="w-5 h-5 text-blue-600" />;
      case 'planned': return <TrendingUp className="w-5 h-5 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-pearl p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <span className="bg-chestnut/10 text-chestnut px-3 py-1 rounded-full text-sm font-medium mr-3">
                {project.category}
              </span>
              <div className="flex items-center">
                {getStatusIcon(project.status)}
                <span className="ml-2 text-sm text-charcoal/70 capitalize">
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              {project.featured && (
                <span className="ml-3 bg-chestnut text-white px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <h2 className="font-serif font-bold text-3xl text-charcoal mb-2">
              {project.title}
            </h2>
            <p className="text-chestnut font-medium text-lg">
              {project.subtitle}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-charcoal/60 hover:text-charcoal p-3 sm:p-2 touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Project Image */}
          <div className="relative h-48 sm:h-56 lg:h-64 rounded-xl overflow-hidden mb-8">
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
            <div className="bg-gradient-to-br from-pearl/30 to-khaki/20 rounded-xl h-48 sm:h-56 lg:h-64 flex items-center justify-center" style={{display: 'none'}}>
              <div className="text-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-chestnut/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-chestnut" />
                </div>
                <div className="text-charcoal/60 text-sm">{project.image}</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 order-1 lg:order-none">
              {/* Description */}
              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal mb-3">Project Overview</h3>
                <p className="text-charcoal/80 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Business Impact */}
              {project.businessImpact && (
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-3">Business Impact</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    {project.businessImpact}
                  </p>
                </div>
              )}

              {/* Key Results */}
              {project.keyResults && (
                <div>
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-4">Key Results</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {project.keyResults.map((result, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-charcoal/80">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              <div>
                <h3 className="font-serif font-bold text-xl text-charcoal mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span 
                      key={index} 
                      className="bg-khaki/20 text-charcoal/80 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-none">
              {/* Metrics */}
              {project.metrics && (
                <div className="bg-bone p-6 rounded-xl">
                  <h4 className="font-medium text-charcoal mb-4">Key Metrics</h4>
                  <div className="space-y-3">
                    {Object.entries(project.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-charcoal/70 capitalize">{key}:</span>
                        <span className="font-bold text-chestnut">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Details */}
              <div className="bg-bone p-6 rounded-xl">
                <h4 className="font-medium text-charcoal mb-4">Project Details</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-charcoal/70">Industry:</span>
                    <span className="ml-2 font-medium text-charcoal">{project.industry}</span>
                  </div>
                  <div>
                    <span className="text-charcoal/70">Category:</span>
                    <span className="ml-2 font-medium text-charcoal">{project.category}</span>
                  </div>
                  {project.secondaryCategory && (
                    <div>
                      <span className="text-charcoal/70">Secondary:</span>
                      <span className="ml-2 font-medium text-charcoal">{project.secondaryCategory}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Links */}
              <div className="space-y-3">
                {project.links?.presentation && (
                  <a
                    href={project.links.presentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-chestnut text-white py-3 px-4 rounded-lg hover:bg-chestnut/90 transition-colors flex items-center justify-center"
                  >
                    <Presentation className="w-5 h-5 mr-2" />
                    View Full Presentation
                  </a>
                )}
                
                {project.links?.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border-2 border-chestnut text-chestnut py-3 px-4 rounded-lg hover:bg-chestnut hover:text-white transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Live Demo
                  </a>
                )}
                
                {project.links?.api && (
                  <a
                    href={project.links.api}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border-2 border-chestnut text-chestnut py-3 px-4 rounded-lg hover:bg-chestnut hover:text-white transition-colors flex items-center justify-center"
                  >
                    <Code className="w-5 h-5 mr-2" />
                    API Endpoint
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
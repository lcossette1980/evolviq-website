import React, { useState } from 'react';
import { Filter, Code, Zap, Brain, Sparkles, Smartphone, Globe } from 'lucide-react';
import { projects, projectCategories } from '../data/projectsData';
import ProjectCard from '../components/common/ProjectCard';
import ProjectModal from '../components/common/ProjectModal';

const ProjectsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Predictive Analytics': return <Zap className="w-5 h-5" />;
      case 'Data Exploration': return <Code className="w-5 h-5" />;
      case 'Neural Networks': return <Brain className="w-5 h-5" />;
      case 'Web Applications': return <Globe className="w-5 h-5" />;
      case 'Generative AI': return <Sparkles className="w-5 h-5" />;
      case 'Apps & Tools': return <Smartphone className="w-5 h-5" />;
      default: return <Filter className="w-5 h-5" />;
    }
  };

  const filteredProjects = selectedCategory === "All Projects" 
    ? projects 
    : projects.filter(project => 
        project.category === selectedCategory || 
        project.secondaryCategory === selectedCategory
      );

  const featuredProjects = projects.filter(project => project.featured);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-bone py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-charcoal mb-6">
            AI & Data Science <span className="text-chestnut">Project Portfolio</span>
          </h1>
          <p className="text-xl text-charcoal/80 max-w-3xl mx-auto">
            Real-world implementations of machine learning, AI, and data science solutions 
            that drive measurable business results across industries.
          </p>
        </div>

        {/* Featured Projects Section */}
        {selectedCategory === "All Projects" && featuredProjects.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="font-serif font-bold text-2xl text-charcoal mb-4">Featured Projects</h2>
              <p className="text-charcoal/70">Highlighted implementations with proven ROI and business impact</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="mb-12">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
              <div className="flex space-x-1">
                {projectCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center px-4 py-3 rounded-md font-medium transition-colors whitespace-nowrap touch-manipulation ${
                      selectedCategory === category 
                        ? 'bg-chestnut text-white' 
                        : 'text-charcoal hover:text-chestnut hover:bg-chestnut/5'
                    }`}
                  >
                    <span className="mr-2">
                      {getCategoryIcon(category)}
                    </span>
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Description */}
          <div className="text-center">
            <p className="text-charcoal/70 max-w-2xl mx-auto">
              {selectedCategory === "All Projects" && "Explore our complete portfolio of AI and data science implementations"}
              {selectedCategory === "Predictive Analytics" && "Machine learning models that forecast trends and predict outcomes with high accuracy"}
              {selectedCategory === "Data Exploration" && "Deep-dive analytics projects that uncover hidden insights and business intelligence"}
              {selectedCategory === "Neural Networks" && "Advanced deep learning implementations for complex pattern recognition and prediction"}
              {selectedCategory === "Web Applications" && "Full-stack applications with integrated AI capabilities and real-time functionality"}
              {selectedCategory === "Generative AI" && "Creative AI solutions using large language models and generative technologies"}
              {selectedCategory === "Apps & Tools" && "Mobile and desktop applications that bring AI capabilities to end users"}
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => handleProjectClick(project)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-chestnut/10 rounded-full flex items-center justify-center mx-auto mb-6">
              {getCategoryIcon(selectedCategory)}
            </div>
            <h3 className="font-serif font-bold text-2xl text-charcoal mb-4">
              No Projects in {selectedCategory}
            </h3>
            <p className="text-charcoal/70 mb-8 max-w-md mx-auto">
              We're constantly working on new projects in this category. 
              Check back soon or explore other categories to see our current work.
            </p>
            <button
              onClick={() => setSelectedCategory("All Projects")}
              className="bg-chestnut text-white px-6 py-4 sm:py-3 rounded-lg hover:bg-chestnut/90 transition-colors touch-manipulation"
            >
              View All Projects
            </button>
          </div>
        )}

        {/* Project Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="font-serif font-bold text-2xl text-charcoal text-center mb-8">
            Portfolio Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-chestnut mb-2">{projects.length}</div>
              <div className="text-charcoal/70">Completed Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-chestnut mb-2">2.5M+</div>
              <div className="text-charcoal/70">Citations Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-chestnut mb-2">95%+</div>
              <div className="text-charcoal/70">Average Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-chestnut mb-2">20K+</div>
              <div className="text-charcoal/70">Active Users</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="font-serif font-bold text-3xl text-charcoal mb-6">
            Ready to Start Your AI Project?
          </h2>
          <p className="text-xl text-charcoal/80 mb-8 max-w-2xl mx-auto">
            From data exploration to production deployment, we help organizations 
            implement AI solutions that deliver measurable business results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-chestnut text-white px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors touch-manipulation">
              Discuss Your Project
            </button>
            <button className="border-2 border-chestnut text-chestnut px-8 py-4 sm:py-3 rounded-lg font-medium hover:bg-chestnut hover:text-white transition-colors touch-manipulation">
              View Case Studies
            </button>
          </div>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default ProjectsPage;
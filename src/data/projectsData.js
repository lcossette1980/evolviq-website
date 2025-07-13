export const projectCategories = [
  "All Projects",
  "Predictive Analytics", 
  "Data Exploration",
  "Neural Networks",
  "Web Applications",
  "Generative AI",
  "Apps & Tools"
];

export const projects = [
  {
    id: 1,
    title: "AllLife Bank Customer Intelligence",
    subtitle: "How Machine Learning Transformed Loan Marketing from 9.6% to 98% Accuracy",
    description: "Complete transformation of traditional marketing using AI-powered customer intelligence to achieve unprecedented targeting accuracy.",
    category: "Data Exploration",
    secondaryCategory: "Predictive Analytics",
    technologies: [
      "Machine Learning",
      "Decision Trees", 
      "Logistic Regression",
      "Customer Analytics",
      "Business Intelligence"
    ],
    keyResults: [
      "98% Customer Targeting Accuracy",
      "15% Projected Conversion Rate", 
      "94% Perfect Recall Score",
      "$1M Revenue Target (6 Months)",
      "300% improvement in campaign ROI"
    ],
    businessImpact: "Transformed marketing from demographic targeting to AI-powered customer intelligence, discovering that education level was 31x more predictive than income.",
    industry: "Financial Services",
    metrics: {
      accuracy: "98%",
      improvement: "300%",
      revenue: "$1M"
    },
    links: {
      presentation: "/alllife_business_presentation.html",
      demo: null,
      code: null
    },
    image: "alllife-bank-project.jpg",
    featured: true,
    status: "completed"
  },
  {
    id: 2,
    title: "Bank Customer Churn Prevention",
    subtitle: "How Neural Networks Prevented $2.3M in Lost Revenue",
    description: "Advanced neural network implementation using SMOTE balancing and dropout regularization to predict and prevent customer churn before it occurs.",
    category: "Neural Networks",
    secondaryCategory: "Predictive Analytics", 
    technologies: [
      "Neural Networks",
      "SMOTE Balancing",
      "Adam Optimization",
      "Dropout Regularization",
      "Real-time Scoring"
    ],
    keyResults: [
      "78% Churn Detection Accuracy",
      "$2.3M Annual Revenue Protected",
      "68% F2-Score Performance", 
      "6x ROI on Retention Investment",
      "50% reduction in wasted retention spend"
    ],
    businessImpact: "Shifted customer relationship management from reactive damage control to proactive retention strategies, discovering counter-intuitive patterns like 3+ product ownership increasing churn risk.",
    industry: "Financial Services",
    metrics: {
      accuracy: "78%",
      revenue: "$2.3M",
      roi: "6x"
    },
    links: {
      presentation: "/bank_churn_business_presentation.html",
      demo: "https://huggingface.co/spaces/LCossette1980/customer-churn-prediction",
      code: null
    },
    image: "bank-churn-project.jpg",
    featured: true,
    status: "completed"
  },
  {
    id: 3,
    title: "SuperKart Sales Forecasting",
    subtitle: "Small Business Analytics with 94% Forecasting Accuracy",
    description: "Comprehensive sales prediction system using gradient boosting and ensemble methods, deployed with real-time API for business intelligence.",
    category: "Predictive Analytics",
    secondaryCategory: "Web Applications",
    technologies: [
      "Gradient Boosting",
      "Random Forest",
      "XGBoost", 
      "Python",
      "Cloud Deployment",
      "Real-time API"
    ],
    keyResults: [
      "94% Sales Prediction Accuracy",
      "$260 Average Error Per Product",
      "99.9% Revenue Forecasting Precision",
      "15-25% reduction in excess stock",
      "8-12% revenue increase from optimal stocking"
    ],
    businessImpact: "Transformed inventory management from guesswork to data-driven decisions, enabling confident expansion with 60-80% risk reduction for new locations.",
    industry: "Retail / E-commerce",
    metrics: {
      accuracy: "94%",
      precision: "99.9%",
      revenue: "8-12%"
    },
    links: {
      presentation: "/superkart_new.html",
      demo: "https://lcossette1980-superkart-sales-dashboard.hf.space",
      api: "https://lcossette1980-superkart-sales-api.hf.space"
    },
    image: "superkart-project.jpg",
    featured: true,
    status: "completed"
  },
  {
    id: 4,
    title: "Airbnb Rental Price Prediction",
    subtitle: "AI-Powered Market Analysis with 95% Price Accuracy",
    description: "Advanced machine learning rental price prediction platform using RandomForest/XGBoost algorithms with automated feature engineering and real-time deployment infrastructure for Airbnb property optimization.",
    category: "Predictive Analytics",
    secondaryCategory: "Web Applications",
    technologies: [
      "RandomForest",
      "XGBoost",
      "Machine Learning Pipelines",
      "Feature Engineering",
      "Gradio Deployment",
      "Plotly Visualizations",
      "HuggingFace Spaces"
    ],
    keyResults: [
      "95% Price Accuracy within 10% of optimal rates",
      "$1.8M Revenue Optimization identified",
      "40% Time Savings vs manual research",
      "4.2x ROI on pricing optimization",
      "85% Host Adoption rate for recommendations"
    ],
    businessImpact: "Transformed property pricing from manual guesswork to data-driven optimization, enabling hosts to maximize revenue while maintaining competitive positioning through AI-powered market analysis and dynamic pricing recommendations.",
    industry: "Real Estate/Hospitality",
    metrics: {
      accuracy: "95%",
      revenue: "$1.8M",
      roi: "4.2x"
    },
    links: {
      presentation: null,
      demo: "https://huggingface.co/spaces/LCossette1980/airbnb-rental-price-prediction",
      code: null
    },
    image: "airbnb-price-prediction.jpg",
    featured: true,
    status: "completed"
  },
  {
    id: 5,
    title: "Worldview Explorer",
    subtitle: "Interactive Philosophical Assessment with 92% User Completion Rate",
    description: "Interactive philosophical assessment platform using decision-tree algorithms and personality psychology frameworks to analyze users' fundamental beliefs and generate personalized 'Philosophical DNA' profiles with comprehensive worldview mapping.",
    category: "Web Applications",
    secondaryCategory: "Apps & Tools",
    technologies: [
      "React",
      "Interactive Decision Trees",
      "Personality Psychology APIs",
      "Dynamic Visualization",
      "Responsive Design",
      "Progressive Web App"
    ],
    keyResults: [
      "92% User Completion Rate for assessments",
      "15,000+ Philosophical Profiles generated",
      "4.6/5 User Rating for insights accuracy",
      "3.2x Time Reduction vs traditional methods",
      "78% Knowledge Retention improvement"
    ],
    businessImpact: "Democratized philosophical self-discovery by transforming complex academic philosophy into an accessible, engaging experience, helping users understand their core beliefs and decision-making patterns through data-driven philosophical analysis.",
    industry: "Education/Philosophy",
    metrics: {
      completion_rate: "92%",
      profiles_generated: "15,000+",
      user_satisfaction: "4.6/5"
    },
    links: {
      presentation: null,
      demo: "https://www.worldviewexplorer.com",
      code: null
    },
    image: "worldview-explorer.jpg",
    featured: true,
    status: "completed"
  },
  {
    id: 6,
    title: "ScholarlyAI",
    subtitle: "AI-Powered Academic Research with 99.2% Citation Accuracy",
    description: "AI-powered academic research platform utilizing natural language processing and machine learning to automate bibliography generation, citation formatting, and source validation across multiple academic citation styles (APA, MLA, Chicago, Harvard).",
    category: "Generative AI",
    secondaryCategory: "Web Applications",
    technologies: [
      "Natural Language Processing",
      "Machine Learning",
      "Academic API Integration",
      "Real-time Validation",
      "Multi-format Export",
      "Cloud Infrastructure"
    ],
    keyResults: [
      "99.2% Citation Accuracy across major formats",
      "2.5M+ Citations Generated globally",
      "85% Time Savings vs manual methods",
      "6.8x Productivity Boost in academic writing",
      "94% User Retention monthly active base"
    ],
    businessImpact: "Revolutionized academic writing workflow by eliminating manual citation errors and reducing research documentation time, enabling students and researchers to focus on content creation rather than formatting minutiae.",
    industry: "Education/Academic Research",
    metrics: {
      accuracy: "99.2%",
      citations_generated: "2.5M+",
      time_savings: "85%"
    },
    links: {
      presentation: null,
      demo: "https://www.scholarlyaiapp.com",
      code: null
    },
    image: "scholarly-ai.jpg",
    featured: true,
    status: "completed"
  },
  {
    id: 7,
    title: "50501 SAT-X Grassroots Platform",
    subtitle: "48-Hour RAG-Powered Political Activism Platform with 12K+ HR1 Queries",
    description: "Rapid-deployment political activism platform featuring intelligent HR1 bill assistant powered by RAG architecture, built in 48 hours for grassroots movement organizing with real-time Firebase infrastructure, interactive conversational AI, and production-grade admin dashboard for volunteer coordination.",
    category: "Generative AI",
    secondaryCategory: "Web Applications",
    technologies: [
      "React",
      "Firebase/Firestore Security",
      "ChromaDB Vector Database",
      "FAISS Similarity Search",
      "RAG Architecture",
      "Congressional Bill Processing",
      "Admin Dashboard",
      "Real-time User Management"
    ],
    keyResults: [
      "48-Hour Production Deploy from concept to live",
      "12,000+ HR1 Queries Processed by citizens",
      "95% Answer Accuracy for legislative knowledge",
      "3,500+ Activist Signups for organizing",
      "99.2% Uptime during high-traffic periods"
    ],
    businessImpact: "Empowered grassroots political organizing by making complex congressional legislation (HR1) accessible through conversational AI, enabling activists to quickly understand policy details, organize effectively, and engage constituents with accurate information during critical political moments.",
    industry: "Political Technology/Civic Engagement",
    metrics: {
      deployment_time: "48 hours",
      queries_processed: "12,000+",
      activist_signups: "3,500+"
    },
    links: {
      presentation: null,
      demo: "https://www.50501satx.com",
      code: null
    },
    image: "50501-satx-platform.jpg",
    featured: true,
    status: "completed"
  }
];

// Sample future project placeholders to demonstrate the structure
export const futureProjects = [
  {
    id: 4,
    title: "AI Content Generation Platform",
    subtitle: "GPT-4 Powered Content Creation for Small Businesses",
    description: "Custom generative AI solution for automated content creation, brand voice consistency, and multi-platform publishing.",
    category: "Generative AI",
    technologies: ["GPT-4", "LangChain", "Vector Databases", "React", "Node.js"],
    status: "planned",
    featured: false
  },
  {
    id: 5, 
    title: "Nonprofit Donor Analytics App",
    subtitle: "Mobile-First Donor Relationship Management",
    description: "React Native application for real-time donor engagement tracking and personalized outreach automation.",
    category: "Apps & Tools",
    technologies: ["React Native", "Firebase", "Machine Learning", "Push Notifications"],
    status: "in_progress",
    featured: false
  }
];
import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Users, 
  Brain, 
  ChevronRight,
  MapPin,
  Linkedin,
  Github,
  Download,
  Star,
  Calendar,
  Building
} from 'lucide-react';

const InteractiveResume = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const resumeData = {
    personal: {
      name: "Loren Cossette, Ph.D. (c)",
      title: "Senior AI/ML Engineer & Strategic Technology Leader",
      location: "San Antonio, TX, USA",
      linkedin: "linkedin.com/in/loren-cossette",
      github: "github.com/lcossette1980",
      summary: "AI Engineer with deep expertise in Large Language Models (LLMs), Generative AI, data science, and advanced machine learning systems designed for high-impact, real-world deployment. Led USAA Bank's enterprise AI strategy across a $126B portfolio and architected production-grade GenAI and NLP solutions using GPT, Claude, and Mistral in secure, compliant cloud environments (Azure, AWS). Extensive experience developing full ML pipelines—from data cleaning and feature engineering to real-time inference and model monitoring—using Python, SQL, Pandas, and NumPy. Skilled in MLOps, CI/CD, and scalable deployment using Docker containerization, GitHub version control, and Azure ML production environments. Published researcher and recognized thought leader with passion for advocacy and designing ethical, reliable, and interpretable AI systems that improve decision-making and drive innovation at scale."
    },
    skills: {
      leadership: [
        "Executive Leadership", "Strategy & Planning", "Organizational Effectiveness", 
        "Organizational Change Management (OCM)", "Team Building", "Project Management", 
        "Executive Coaching", "Board & Executive Communication", "Workforce Transformation", 
        "Digital Transformation", "AI Strategy", "AI Governance & Ethics", 
        "Cultural Transformation", "Workforce Development", "Thought Leadership", "Optimization"
      ],
      technical: {
        "AI/ML Engineering": [
          "LLM Deployment (GPT, Claude, Mistral)", "Custom Training Pipelines", "RAG Systems",
          "Vector Databases", "MLOps", "Azure ML", "Model Fine-tuning", "Bias Detection", "A/B Testing"
        ],
        "Machine Learning": [
          "Deep Learning (TensorFlow, Keras, PyTorch)", "Computer Vision", "Time Series Forecasting",
          "Ensemble Methods", "XGBoost", "scikit-learn", "Feature Engineering", "Model Optimization"
        ],
        "Software Engineering": [
          "Python", "React", "FastAPI", "SQL", "JavaScript", "Azure", "AWS", "Docker",
          "CI/CD", "Git", "RESTful APIs", "Database Design"
        ],
        "Data Engineering": [
          "ETL Pipelines", "Real-time Analytics", "Pandas", "NumPy", "Data Preprocessing",
          "Model Monitoring", "Performance Optimization"
        ],
        "Frameworks": [
          "LangChain", "FastAPI", "Flask", "Streamlit", "React"
        ],
        "Cloud & DevOps": [
          "Azure", "AWS", "Hadoop", "Spark", "Git", "Salesforce"
        ]
      },
      soft: [
        "Written Communication", "Verbal Communication", "Executive Presentation", 
        "Cross-Cultural Communication", "Technical Translation", "Conflict Resolution", 
        "Strategic Leadership", "Performance Management", "Emotional Intelligence", 
        "Empathy", "Social Awareness", "Relationship Management", "Cultural Intelligence", 
        "Critical Thinking", "Systems Thinking", "Root Cause Analysis", "Innovation Mindset", 
        "Project Leadership", "Stakeholder Management", "Quality Assurance", 
        "Resource Management", "Continuous Learning", "Adaptability", "Resilience", 
        "Growth Mindset", "Technology Adoption", "Integrity", "Cross-Functional Collaboration"
      ]
    },
    experience: [
      {
        title: "Doctoral Research and Academic Consulting (GenAI Engineer & Strategic Advisor)",
        company: "University of the Incarnate Word & Houston Christian University",
        period: "11/2024 - Present",
        achievements: [
          "Deployed a fine-tuned LLM on Azure ML, powering a reading support system that processed 10,000+ academic texts, delivering personalized tutoring.",
          "Designed and modernized AI/ML curriculum, integrating GenAI, predictive modeling, and AI ethics to meet evolving industry and academic standards.",
          "Built a bias detection and fairness framework, applying statistical metrics and privacy safeguards to ensure ethical AI use across diverse student groups.",
          "Led development of immersive Python/R workshops, featuring applied projects in predictive analytics, NLP, and model evaluation.",
          "Published methodology in peer-reviewed journals, establishing benchmarks for ethical, effective LLM use in educational technology."
        ]
      },
      {
        title: "Chief of Staff, Chief Data and Analytics Officer (FSB)",
        company: "USAA",
        period: "11/2023 - 11/2024",
        achievements: [
          "Spearheaded USAA FSB's first AI & Data Strategy, embedding AI/ML and automation to accelerate digital transformation across a $126B portfolio.",
          "Engineered systems and automated decision workflows, cutting cycle times 64% and enhancing analytics, operations, and executive alignment.",
          "Designed the first AI-informed Balanced Scorecard, integrating predictive metrics and model outputs into enterprise performance management.",
          "Deployed data-driven decision frameworks, improving forecasting accuracy and delivering a $2.7M business impact in Q1 alone."
        ]
      },
      {
        title: "Business Strategy and Planning Director, Bank Technology and Data",
        company: "USAA",
        period: "01/2023 - 11/2023",
        achievements: [
          "Aligned AI/ML initiatives with enterprise priorities, leading innovation workstreams on automation and digital engagement across bank operations.",
          "Powered MSRgpt pilot, a proprietary Generative AI tool that enhanced customer interactions and improved internal decision efficiency.",
          "Championed workforce transformation, combining executive coaching, EQ development, and upskilling to improve team resilience and digital fluency.",
          "Led adoption impact tracking, using OKRs, KPIs, and gap analysis to evaluate AI maturity and boost employee engagement by 23%."
        ]
      },
      {
        title: "Executive Operational Planning Manager, CEO Chief of Staff",
        company: "USAA",
        period: "12/2021 - 12/2022",
        achievements: [
          "Architected CEO strategy using McKinsey Model, reallocating time for strategic focus by 2x and targeting CEO action-to-decision metrics.",
          "Streamlined CEO workflows, introducing 8 new processes and automating core functions, increasing efficiency by 25%, and slashing closure times by 80%.",
          "Strengthened executive collaboration, aligning 27+ leaders across 12 siloed teams and elevating trust, communication, and Board-authorized outcomes.",
          "Institutionalized Chief of Staff function, creating ops scorecards and cultural rituals, improving strategic alignment, executive clarity, and engagement."
        ]
      },
      {
        title: "Change Partner (OCM)",
        company: "USAA",
        period: "11/2020 - 12/2021",
        achievements: [
          "Led enterprise change strategy impacting 3,500 employees across Consumer Lending and Complaints, increasing compliance rates from 22% to 99%.",
          "Developed and delivered 57 change strategies and artifacts, aligning with Prosci methodology and enterprise risk frameworks to ensure seamless adoption.",
          "Integrated customer insights into transformation planning, ensuring initiatives were human-centered and strategically aligned with organizational values."
        ]
      },
      {
        title: "Chief Master Sergeant (E-9) | Senior Enlisted Leader & Executive HR Director",
        company: "United States Air Force",
        period: "10/2001 - 08/2020",
        description: "Promoted to E-9 in under 17 years — a milestone achieved by less than 1% of enlisted members. Led organizational strategy, people operations, and global readiness initiatives across combat zones, training commands, and executive-level environments.",
        achievements: [
          "Directed HR and organizational strategy for 534 personnel, leading through COVID-19 while improving staffing, retention, and engagement outcomes.",
          "Modernized USAF Basic Military Training, reducing attrition and saving $1.8M annually through curriculum redesign and structural improvements.",
          "Founded a world-class Airman Development Center, integrating emotional intelligence and leadership training into the core development framework.",
          "Created and scaled the Air Force's #1 DE&I Program, recognized with the General Welsh Award for advancing inclusion as a strategic priority.",
          "Advised senior leaders at USCENTCOM FHQ, collaborating directly with SECDEF Austin on theater-wide people strategy and force posture.",
          "Led three combat tours in Afghanistan and served as a top-performing Military Training Instructor (MTI). Recognized as 19th Air Force First Sergeant of the Year, AFMC NCO of the Year, and recipient of the Air Force's Outstanding Airman of the Year Ribbon (awarded to only 12 annually)."
        ]
      }
    ],
    education: [
      {
        degree: "Doctor of Philosophy - Organizational Leadership & Program Evaluation",
        institution: "University of the Incarnate Word",
        status: "In Progress"
      },
      {
        degree: "Post Graduate Certificate - Artificial Intelligence & Machine Learning",
        institution: "Cornell University",
        status: "Completed"
      },
      {
        degree: "Master of Science - Organizational Development",
        institution: "University of the Incarnate Word",
        status: "Completed"
      },
      {
        degree: "Post Graduate Certificate - Artificial Intelligence and Machine Learning",
        institution: "University of Texas - Austin",
        status: "Completed"
      },
      {
        degree: "Post Graduate Certificate - Strategic Artificial Intelligence",
        institution: "Houston Christian University",
        status: "Completed"
      },
      {
        degree: "Master of Arts - Psychology",
        institution: "Northcentral University",
        status: "Completed"
      }
    ],
    certifications: [
      { name: "SHRM-SCP", period: "06/2023 - Present" },
      { name: "SaFE 5.0 Agilist", period: "06/2022 - Present" },
      { name: "PROSCI Change Management", period: "05/2021 - Present" },
      { name: "EQi-2.0 (Emotional Intelligence Practitioner)", period: "12/2019 - Present" }
    ],
    publications: [
      {
        title: "Exploratory Cluster Analysis of Technology Use and Activities During COVID-19 in Relation to Mental Health Conditions",
        journal: "Journal of Adolescent Health",
        year: "2023",
        type: "Journal Article"
      },
      {
        title: "Self-Reflection and Socialization in Early Career Research: A LACOID-Based Text Mining Approach",
        journal: "AERA",
        year: "2024",
        type: "Journal Article"
      },
      {
        title: "Assessing Changes in Adult Online Learners' Motivation: A Grounded Bibliometric Analysis",
        journal: "Motivation and Momentum in Adult Online Learning",
        year: "2023",
        type: "Book Chapter"
      },
      {
        title: "AI Integration in Academia: Investigating the Impact on Faculty Organizational Belongingness",
        journal: "APA",
        year: "2024",
        type: "Journal Article"
      }
    ]
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'publications', label: 'Publications', icon: Award }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-chestnut/10 to-khaki/10 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-charcoal mb-2">{resumeData.personal.name}</h3>
        <p className="text-lg text-chestnut font-medium mb-4">{resumeData.personal.title}</p>
        <div className="flex items-center text-charcoal/70 mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{resumeData.personal.location}</span>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center text-charcoal/70">
            <Linkedin className="w-4 h-4 mr-2" />
            <span className="text-sm">{resumeData.personal.linkedin}</span>
          </div>
          <div className="flex items-center text-charcoal/70">
            <Github className="w-4 h-4 mr-2" />
            <span className="text-sm">{resumeData.personal.github}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-charcoal mb-3">Professional Summary</h4>
        <p className="text-charcoal/80 leading-relaxed">{resumeData.personal.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-charcoal mb-3 flex items-center">
            <Award className="w-5 h-5 mr-2 text-chestnut" />
            Certifications
          </h4>
          <div className="space-y-2">
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-charcoal font-medium">{cert.name}</span>
                <span className="text-sm text-charcoal/60">{cert.period}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-charcoal mb-3 flex items-center">
            <Star className="w-5 h-5 mr-2 text-chestnut" />
            Key Achievements
          </h4>
          <ul className="space-y-2 text-sm text-charcoal/80">
            <li>• Led $126B portfolio AI transformation at USAA</li>
            <li>• Published researcher in AI ethics and education</li>
            <li>• Air Force E-9 in under 17 years (&lt;1% achievement)</li>
            <li>• Built production LLM systems serving 10,000+ users</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      {resumeData.experience.map((job, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-charcoal">{job.title}</h4>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-chestnut font-medium">
                <Building className="w-4 h-4 mr-2" />
                {job.company}
              </div>
              <div className="flex items-center text-charcoal/60">
                <Calendar className="w-4 h-4 mr-2" />
                {job.period}
              </div>
            </div>
            {job.description && (
              <p className="text-charcoal/70 text-sm mb-3">{job.description}</p>
            )}
          </div>
          <div>
            <h5 className="font-medium text-charcoal mb-2">Key Achievements:</h5>
            <ul className="space-y-2">
              {job.achievements.map((achievement, achIndex) => (
                <li key={achIndex} className="text-sm text-charcoal/80 flex items-start">
                  <ChevronRight className="w-3 h-3 mr-2 mt-1 text-chestnut flex-shrink-0" />
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-chestnut" />
          Leadership & Executive Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.leadership.map((skill, index) => (
            <span key={index} className="bg-chestnut/10 text-chestnut px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {Object.entries(resumeData.skills.technical).map(([category, skills]) => (
        <div key={category} className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2 text-chestnut" />
            {category}
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="bg-khaki/20 text-charcoal px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-chestnut" />
          Soft Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.soft.map((skill, index) => (
            <span key={index} className="bg-pearl/40 text-charcoal px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      {resumeData.education.map((edu, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-charcoal">{edu.degree}</h4>
              <p className="text-chestnut font-medium">{edu.institution}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              edu.status === 'In Progress' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {edu.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPublications = () => (
    <div className="space-y-4">
      {resumeData.publications.map((pub, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-charcoal mb-1">{pub.title}</h4>
              <p className="text-chestnut font-medium">{pub.journal}</p>
            </div>
            <div className="text-right">
              <div className="bg-khaki/20 text-charcoal px-3 py-1 rounded-full text-sm mb-1">
                {pub.type}
              </div>
              <div className="text-sm text-charcoal/60">{pub.year}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'experience': return renderExperience();
      case 'skills': return renderSkills();
      case 'education': return renderEducation();
      case 'publications': return renderPublications();
      default: return renderOverview();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-chestnut to-khaki p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Interactive Digital Resume</h3>
            <p className="text-chestnut-100 opacity-90">Explore Loren's background and expertise</p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-6 py-4 whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'border-b-2 border-chestnut text-chestnut bg-white'
                    : 'text-charcoal/70 hover:text-chestnut hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderSection()}
      </div>
    </div>
  );
};

export default InteractiveResume;
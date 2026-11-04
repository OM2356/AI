export interface SampleResume {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetRole: string;
  recommendedJobId: string;
  fileName: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: 'sample-1',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.edu',
    phone: '+1 (415) 555-0192',
    targetRole: 'AI / Machine Learning Engineer',
    recommendedJobId: 'job-ds-02',
    fileName: 'Ananya_Sharma_ML_Engineer_Resume.pdf',
    text: `ANANYA SHARMA
San Francisco, CA | ananya.sharma@example.edu | +1 (415) 555-0192 | linkedin.com/in/ananya-sharma-ai | github.com/ananyasharma

PROFESSIONAL SUMMARY
Senior Machine Learning & NLP Engineer with 3.5 years of experience developing, training, and deploying deep learning models into production systems. Proven track record in fine-tuning transformer architectures, LLM retrieval-augmented generation (RAG) pipelines, and low-latency inference microservices in Python, PyTorch, and Docker.

TECHNICAL SKILLS
- Programming: Python, C++, SQL, Bash
- AI / ML Frameworks: PyTorch, TensorFlow, Hugging Face Transformers, Scikit-learn, LangChain, LlamaIndex
- Tools & Cloud: Docker, Kubernetes, AWS (SageMaker, S3, EC2), FastAPI, PostgreSQL, Pinecone Vector DB, MLflow
- Domains: Natural Language Processing (NLP), Large Language Models (LLMs), Computer Vision, Statistical Modeling

WORK EXPERIENCE
Machine Learning Engineer | NeuroTech Systems, San Jose, CA (2023 – Present)
- Architected enterprise RAG question-answering pipeline using PyTorch, Hugging Face, and FastAPI, serving 120k requests daily with sub-80ms p95 latency.
- Fine-tuned open-source 7B parameter models using LoRA and QLoRA on domain-specific datasets, boosting factual accuracy by 34%.
- Containerized model training and inference pipelines using Docker and Kubernetes on AWS GPU instances.

Associate Data Scientist | CogniData Corp, Mountain View, CA (2021 – 2023)
- Built automated sentiment analysis and topic modeling microservices using Python, TensorFlow, and Spacy.
- Spearheaded feature store design and data preprocessing pipelines for 10TB customer interaction logs.
- Decreased model drift monitoring latency by 45% using MLflow.

EDUCATION
Master of Science in Computer Science (Specialization: Artificial Intelligence)
Stanford University, Stanford, CA (2019 – 2021) | GPA: 3.92/4.0

Bachelor of Technology in Computer Engineering
National Institute of Technology (2015 – 2019) | First Class with Distinction

PROJECTS
- MedQuery-RAG: Clinical knowledge retrieval system built with PyTorch, LlamaIndex, and FastAPI with HIPAA-compliant vector embeddings.
- VisionTranslate: Real-time OCR and multilingual neural translation app containerized with Docker.

CERTIFICATIONS
- AWS Certified Machine Learning – Specialty (2023)
- DeepLearning.AI Deep Learning Specialization (Coursera)`,
  },
  {
    id: 'sample-2',
    name: 'David Miller',
    email: 'david.miller@devmail.io',
    phone: '+1 (212) 555-0144',
    targetRole: 'Senior Full-Stack Engineer',
    recommendedJobId: 'job-swe-01',
    fileName: 'David_Miller_FullStack_Resume.docx',
    text: `DAVID MILLER
New York, NY | david.miller@devmail.io | +1 (212) 555-0144 | github.com/davidmiller-dev

PROFESSIONAL SUMMARY
Results-driven Full-Stack Software Engineer with 5+ years of extensive experience building scalable web platforms, high-throughput REST APIs, and responsive user experiences. Deep technical mastery in React, TypeScript, Node.js, PostgreSQL, Docker, and AWS cloud architecture. Passionate about clean code, unit testing, and agile team mentorship.

CORE COMPETENCIES
- Frontend: React.js, TypeScript, Next.js, Redux Toolkit, Tailwind CSS, HTML5/CSS3, WebSockets
- Backend: Node.js, Express, NestJS, RESTful APIs, GraphQL, Microservices Architecture
- Database & Cache: PostgreSQL, MongoDB, Redis, Prisma ORM
- DevOps & Cloud: AWS (ECS, S3, RDS, CloudFront), Docker, GitHub Actions CI/CD, Terraform
- Testing & Agile: Jest, Cypress, TDD, Agile/Scrum Leadership

PROFESSIONAL EXPERIENCE
Senior Full-Stack Developer | FinTech Scale, New York, NY (2022 – Present)
- Led frontend and backend architecture of an institutional trading dashboard using React, TypeScript, Node.js, and PostgreSQL, handling $40M daily transactional volume.
- Reduced initial page load times by 48% via code splitting, memoization, and responsive component redesign.
- Containerized 6 backend microservices with Docker and automated deployment pipelines via AWS ECS and GitHub Actions.
- Mentored 4 junior and mid-level engineers, running weekly code reviews and architecture design sessions.

Full-Stack Developer | Nexus Digital Labs, Brooklyn, NY (2019 – 2022)
- Built customer-facing portals using React, Node.js, Express, and PostgreSQL with Stripe billing integration.
- Designed schema migrations and query optimizations that cut database latency by 35%.
- Implemented comprehensive end-to-end and integration test suites using Jest and Cypress, achieving 88% test coverage.

EDUCATION
Bachelor of Science in Computer Science
Columbia University, New York, NY (2015 – 2019)

PROJECTS
- DevPulse: Open-source developer performance monitor built with React, TypeScript, Node.js, and PostgreSQL.
- CloudCart: Distributed e-commerce backend built with Docker and AWS ECS handling 5,000 concurrent checkouts.

CERTIFICATIONS
- AWS Certified Solutions Architect – Associate (2022)`,
  },
  {
    id: 'sample-3',
    name: 'Priya Patel',
    email: 'priya.patel@alumni.edu',
    phone: '+1 (312) 555-0188',
    targetRole: 'Campus Graduate Software Engineer',
    recommendedJobId: 'job-frontend-03',
    fileName: 'Priya_Patel_Campus_Graduate_Resume.pdf',
    text: `PRIYA PATEL
Chicago, IL | priya.patel@alumni.edu | +1 (312) 555-0188 | github.com/priyapatel-tech

OBJECTIVE
Passionate and motivated recent Computer Science graduate seeking an entry-level Software Engineering position. Solid foundation in data structures, algorithms, object-oriented programming, JavaScript, Python, React, and relational databases. Eager to contribute to high-impact production engineering teams.

TECHNICAL SKILLS
- Languages: JavaScript, Python, Java, SQL, HTML5, CSS3
- Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, Bootstrap
- Developer Tools: Git, GitHub, VS Code, Postman, Vite, Linux CLI
- Core CS: Data Structures & Algorithms, Database Management Systems (DBMS), OOP, Agile

EDUCATION
Bachelor of Science in Computer Science
University of Illinois Urbana-Champaign (UIUC) | Class of 2024
- GPA: 3.84 / 4.0 | Dean's Honor List (All Semesters)
- Coursework: Data Structures & Algorithms, Web Programming, Database Systems, Computer Networks, Software Engineering

SOFTWARE ENGINEERING INTERNSHIPS
Software Engineering Intern | Orbit Tech Solutions, Chicago, IL (Summer 2023)
- Collaborated in a team of 5 to develop internal analytics dashboard widgets using React, JavaScript, and Tailwind CSS.
- Implemented REST API consumption logic in Node.js and improved client-side rendering speed by 25%.
- Wrote automated unit test cases with Jest and participated in daily standups and sprint planning.

LEADERSHIP & CAMPUS PROJECTS
- CampusPlacementHub: Built a full-stack campus placement portal for 800+ students using React, Node.js, and SQL.
- AlgoVisualizer: Interactive web visualizer for pathfinding and sorting algorithms written in vanilla JavaScript and HTML5 Canvas.
- Vice President, Association for Computing Machinery (ACM) Student Chapter (2023 - 2024)`,
  },
];

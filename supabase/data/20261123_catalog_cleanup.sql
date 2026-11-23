-- 2026-11-23 catalog clean-up (applied directly to the live database).
-- Revert with 20261123_catalog_cleanup_revert.sql.
begin;

-- Hide two older duplicates (kept in the database, not deleted).
-- Smart Campus Attendance with Face Recognition (duplicate of Smart Attendance System Using Face Recognition)
update public.projects set is_active = false where id = '9f6108d9-c83c-44cb-a513-9248cde961f3';
-- M.Tech Thesis: Federated Learning for Healthcare (duplicate of Federated Learning for Privacy-Preserving Healthcare Diagnostics)
update public.projects set is_active = false where id = 'a0e3482d-ed7b-4fe3-9890-0545696e43c1';

-- Rewrite four short entries: full description, plain titles, proper-case tags.
update public.projects set title = 'Cloud-Native CI/CD Pipeline for Microservices',
  abstract = 'An automated CI/CD pipeline that tests, builds, and deploys a containerized microservices app to Kubernetes, with monitoring and alerts built in.',
  description = 'A small microservices application (for example a user service, an order service, and an API gateway) is containerized with Docker and kept in a Git repository. Every push triggers a GitHub Actions workflow that runs unit tests, builds and tags Docker images, pushes them to a container registry, and rolls them out to a Kubernetes cluster with rolling updates. Prometheus collects service and cluster metrics, Grafana dashboards show request rates, errors, and latency, and alert rules flag a service that fails or slows down. The project also demonstrates rolling back to the previous version after a failed deployment. Feasibility note: runs on a laptop using a local Kubernetes cluster (Minikube or kind) and free GitHub Actions minutes — no paid cloud account required.',
  tags = array['Docker', 'Kubernetes', 'GitHub Actions', 'Prometheus', 'Grafana', 'CI/CD']::text[]
where id = '5486e9fd-86fa-4ab1-bdab-88c7dda38960';
update public.projects set title = 'Secure E-Commerce API with JWT and Role-Based Access Control',
  abstract = 'A backend API for an online store built around security: JWT sign-in, role-based access for customers, sellers, and admins, and protection against common API attacks.',
  description = 'The API covers products, carts, and orders, built with Node.js and Express on a PostgreSQL database. Passwords are hashed with bcrypt, users receive short-lived JSON Web Tokens with refresh tokens, and every route checks the caller''s role so customers, sellers, and admins can reach only what they are allowed to. The project adds rate limiting against brute-force logins, input validation against injection, secure HTTP headers, and an audit log of sensitive actions such as price changes and refunds. A test suite and a Postman collection demonstrate normal use and blocked attack attempts, mapped to the OWASP API Security Top 10. Feasibility note: runs locally with Node.js and PostgreSQL — no payment gateway or paid services required.',
  tags = array['Node.js', 'Express', 'JWT', 'PostgreSQL', 'OWASP', 'API Security']::text[]
where id = 'b7abbdb0-8b85-40b9-ae4e-b419c84c4c61';
update public.projects set title = 'Explainable Intrusion Detection Using Machine Learning',
  abstract = 'A network intrusion detection system that classifies attacks with gradient-boosted models and explains each alert with SHAP, so analysts can see why traffic was flagged.',
  description = 'Models such as Random Forest, XGBoost, and a small neural network are trained and compared on public benchmark datasets like NSL-KDD and CIC-IDS2017, with careful preprocessing, class-imbalance handling, and feature selection. SHAP explains both the overall model (which traffic features matter most) and individual alerts (why a connection was labelled as a DoS or probe attack), and the explanations are checked against known attack behaviour. The thesis evaluates accuracy, false-positive rate, and detection of rare attack classes, and tests whether explanation-guided feature reduction keeps accuracy while making the model faster. Results are shown in a simple dashboard that lists alerts with their explanations. Feasibility note: runs on a standard laptop with public datasets — no live network capture or special hardware required.',
  tags = array['Python', 'XGBoost', 'SHAP', 'Scikit-learn', 'Network Security', 'Explainable AI']::text[]
where id = 'f317d35f-6928-4a27-8010-fe33aad903fb';
update public.projects set title = 'Multi-Cloud Cost Optimization with Policy-Driven Workload Placement',
  abstract = 'A scheduling framework that decides where to run each workload across AWS and Azure, and how to scale it, to cut cloud costs while meeting performance targets.',
  description = 'Workloads are described by their CPU, memory, latency, and availability needs, and a placement engine scores the options across providers and instance types using published on-demand and spot prices. The thesis compares a greedy heuristic, an integer linear programming model, and a predictive autoscaling policy that scales ahead of demand using past usage. Infrastructure is defined with Terraform so the same deployment can be created on either cloud, and a simulator replays public workload traces to measure cost, SLA violations, and migration overhead for each strategy. Results are presented with architecture diagrams and cost-versus-performance charts. Feasibility note: most experiments run in simulation using public price lists and traces; free-tier accounts are enough for a small live demo.',
  tags = array['Terraform', 'AWS', 'Azure', 'Python', 'FinOps', 'Cloud Optimization']::text[]
where id = '93b9c7fa-1be5-40d8-8cef-0c56cf00cc12';

-- Generative AI project drafts, hidden until switched on in Admin → Projects.
insert into public.projects (title, degree_level, domain, abstract, description, tags, is_active)
select 'College Helpdesk Chatbot Using Retrieval-Augmented Generation (RAG)', 'btech', 'Generative AI',
  'A chatbot that answers student questions about the syllabus, exam rules, and fees by searching the college''s own documents and showing where each answer came from.',
  'College documents such as academic regulations, syllabus PDFs, and circulars are split into chunks, converted into embeddings, and stored in a vector database. When a student asks a question, the most relevant chunks are retrieved and passed to a language model, which writes an answer and cites the source document and page. The project includes a document-upload panel for staff, a web chat interface, and an evaluation on a set of real student questions that compares answers with and without retrieval, showing how RAG reduces made-up answers. Feasibility note: runs on a laptop with an open-source model through Ollama, or a free-tier API key, and a local vector store such as ChromaDB.',
  array['Python', 'LangChain', 'ChromaDB', 'Ollama', 'RAG', 'Streamlit']::text[], false
where not exists (select 1 from public.projects where title = 'College Helpdesk Chatbot Using Retrieval-Augmented Generation (RAG)');
insert into public.projects (title, degree_level, domain, abstract, description, tags, is_active)
select 'AI Resume Analyzer and Interview Question Generator', 'btech', 'Generative AI',
  'A web app that compares a student''s resume with a job description, scores the match, suggests improvements, and generates practice interview questions.',
  'Students upload a resume PDF and paste a job description. The app extracts skills, projects, and experience, compares them with the job''s requirements using embeddings and keyword matching, and shows a match score with the skills that are missing. A language model then suggests stronger resume bullet points and generates technical and HR interview questions tailored to the role and the student''s own projects. The project includes a React front end, a FastAPI back end, prompt templates with guardrails, and a small user study on how useful students found the feedback. Feasibility note: works with an open-source model run locally or a free-tier API — no paid services required.',
  array['Python', 'FastAPI', 'React', 'LLM', 'Prompt Engineering', 'NLP']::text[], false
where not exists (select 1 from public.projects where title = 'AI Resume Analyzer and Interview Question Generator');
insert into public.projects (title, degree_level, domain, abstract, description, tags, is_active)
select 'Hallucination Detection and Reduction in Retrieval-Augmented LLMs', 'mtech', 'Generative AI',
  'A research project that measures how often RAG-based language models give unsupported answers, and evaluates techniques to detect and reduce them.',
  'A RAG pipeline is built over a public question-answering dataset with known source documents. The thesis measures hallucination with automatic metrics (faithfulness of the answer to the retrieved context, citation accuracy) and a small human evaluation, then compares reduction techniques such as hybrid search with re-ranking, self-consistency checks, and an entailment-based verifier that flags answers not supported by the retrieved text. Experiments compare open-source models of different sizes to study the trade-off between accuracy, latency, and cost, giving results suitable for a research paper. Feasibility note: uses open-source models (7B or smaller, quantized) and public datasets, so experiments run on a single consumer GPU or a free Colab or Kaggle notebook.',
  array['Python', 'PyTorch', 'Hugging Face', 'LangChain', 'RAG', 'LLM Evaluation']::text[], false
where not exists (select 1 from public.projects where title = 'Hallucination Detection and Reduction in Retrieval-Augmented LLMs');

commit;

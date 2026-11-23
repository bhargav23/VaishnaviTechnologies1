-- Undo 20261123_catalog_cleanup.sql.
begin;
update public.projects set is_active = true where id = '9f6108d9-c83c-44cb-a513-9248cde961f3';
update public.projects set is_active = true where id = 'a0e3482d-ed7b-4fe3-9890-0545696e43c1';
update public.projects set title = 'Cloud-Native CI/CD for Microservices', abstract = 'Hands-on CI/CD workflow for containerized microservices with monitoring.',
  description = 'Implement Git-based CI pipelines, Docker image builds, Kubernetes deployment, and alerting with Prometheus and Grafana.', tags = array['docker', 'kubernetes', 'github-actions', 'prometheus']::text[]
where id = '5486e9fd-86fa-4ab1-bdab-88c7dda38960';
update public.projects set title = 'Secure E-Commerce API with JWT and RBAC', abstract = 'Backend project focused on authentication, authorization, and API hardening.',
  description = 'Develop a production-style API with JWT auth, role-based access control, audit logs, rate limiting, and secure password management.', tags = array['nodejs', 'express', 'jwt', 'postgresql']::text[]
where id = 'b7abbdb0-8b85-40b9-ae4e-b419c84c4c61';
update public.projects set title = 'M.Tech Thesis: Explainable Intrusion Detection', abstract = 'Research-oriented IDS using interpretable ML for attack classification.',
  description = 'Train and evaluate intrusion detection models on benchmark datasets, compare performance, and apply explainability methods for academic defense.', tags = array['python', 'xgboost', 'shap', 'jupyter']::text[]
where id = 'f317d35f-6928-4a27-8010-fe33aad903fb';
update public.projects set title = 'M.Tech Thesis: Multi-Cloud Cost Optimization', abstract = 'Policy-driven workload placement and scaling across cloud providers.',
  description = 'Create a scheduling and autoscaling strategy, simulate cloud pricing scenarios, and present results with architecture diagrams and metrics.', tags = array['terraform', 'aws', 'azure', 'finops']::text[]
where id = '93b9c7fa-1be5-40d8-8cef-0c56cf00cc12';
delete from public.projects where is_active = false and title in ('College Helpdesk Chatbot Using Retrieval-Augmented Generation (RAG)', 'AI Resume Analyzer and Interview Question Generator', 'Hallucination Detection and Reduction in Retrieval-Augmented LLMs')
  and not exists (select 1 from public.inquiries i where i.project_id = projects.id);
commit;

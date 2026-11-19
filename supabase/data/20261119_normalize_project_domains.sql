-- Optional one-time cleanup of catalog domains (2026-11-19).
--
-- The live catalog had 20 domain values for 22 projects, including both
-- "Cyber Security" and "Cybersecurity" and many "Main / Sub" combinations.
-- This folds them into 9 main domains and keeps the sub-area as a tag, so
-- the catalog's Domain filter stays short and the detail is still visible.
--
-- Review the mapping below, then run it in the Supabase SQL editor.
-- Domains not listed are left unchanged. Safe to run more than once.

with mapping (old_domain, new_domain, extra_tag) as (
  values
    ('Cybersecurity', 'Cyber Security', null),
    ('Cybersecurity / Distributed Systems', 'Cyber Security', 'Distributed Systems'),
    ('Cloud Computing / Big Data', 'Cloud Computing', 'Big Data'),
    ('Cloud Computing / Security', 'Cloud Computing', 'Cloud Security'),
    ('Data Science / NLP', 'NLP', 'Data Science'),
    ('NLP / Applied AI', 'NLP', 'Applied AI'),
    ('IoT / Embedded Systems', 'IoT', 'Embedded Systems'),
    ('Machine Learning / Agriculture Tech', 'Machine Learning', 'Agriculture Tech'),
    ('Machine Learning / AI Security', 'Machine Learning', 'AI Security'),
    ('Machine Learning / Applied AI', 'Machine Learning', 'Applied AI'),
    ('Machine Learning / Distributed Systems', 'Machine Learning', 'Distributed Systems'),
    ('Machine Learning / Graph Analytics', 'Machine Learning', 'Graph Analytics'),
    ('Machine Learning / Computer Vision', 'Computer Vision', 'Machine Learning')
)
update public.projects as p
set
  domain = m.new_domain,
  tags = case
    when m.extra_tag is null or m.extra_tag = any (p.tags) then p.tags
    else array_append(p.tags, m.extra_tag)
  end
from mapping as m
where p.domain = m.old_domain;

-- Check the result: you should see roughly 9 domains.
select domain, count(*) as projects
from public.projects
group by domain
order by domain;

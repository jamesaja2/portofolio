-- Seed initial portfolio data

-- Insert About
INSERT INTO about (name, title, description, avatar_url) VALUES (
  'James Timothy',
  'Full Stack Developer',
  'I build functional and immersive digital experiences, bridging code, animation, and interaction. Currently focused on creating web applications that feel alive—where every click tells a story.',
  '/avatars/james.png'
) ON CONFLICT DO NOTHING;

-- Insert Skills
INSERT INTO skills (name, logo_url, sort_order) VALUES
  ('React', '/logos/react.svg', 1),
  ('Next.js', '/logos/nextjs.svg', 2),
  ('JavaScript', '/logos/js.svg', 3),
  ('TypeScript', '/logos/typescript.svg', 4),
  ('PHP', '/logos/php.svg', 5),
  ('PostgreSQL', '/logos/postgres.svg', 6),
  ('Three.js', '/logos/threejs.svg', 7),
  ('GSAP', '/logos/gsap.svg', 8)
ON CONFLICT DO NOTHING;

-- Insert Projects
INSERT INTO projects (title, description, stack, image_url, project_url, sort_order) VALUES
  (
    'Cremojo Loyalty System',
    'Customer reward tracking system with WhatsApp integration and automated point flows. Built for a local coffee chain to handle thousands of daily transactions.',
    ARRAY['React', 'PHP', 'MySQL'],
    '/projects/cremojo.png',
    'https://cremojo.id',
    1
  ),
  (
    'School Facial Recognition System',
    'Smart attendance, cafeteria payment, and security using local gateway + face recognition. Reduced check-in time by 80% and eliminated buddy-punching.',
    ARRAY['Next.js', 'Python', 'PostgreSQL'],
    '/projects/face.png',
    NULL,
    2
  ),
  (
    'Real-time Dashboard Analytics',
    'Live monitoring dashboard for e-commerce metrics with WebSocket updates, custom charts, and exportable reports.',
    ARRAY['React', 'Node.js', 'Redis'],
    '/projects/dashboard.png',
    NULL,
    3
  )
ON CONFLICT DO NOTHING;

-- Insert Experience
INSERT INTO experience (company, role, description, start_date, end_date, is_current, sort_order) VALUES
  (
    'Freelance',
    'Full Stack Developer',
    'Building custom web solutions for clients across Southeast Asia. Specializing in React/Next.js frontends with various backend stacks.',
    '2022',
    NULL,
    TRUE,
    1
  ),
  (
    'TechStartup Inc',
    'Frontend Developer',
    'Led the frontend team in rebuilding the main product dashboard. Improved load times by 60% and increased user engagement.',
    '2020',
    '2022',
    FALSE,
    2
  ),
  (
    'Digital Agency',
    'Junior Developer',
    'Started my journey building WordPress sites and gradually moved to custom React applications.',
    '2018',
    '2020',
    FALSE,
    3
  )
ON CONFLICT DO NOTHING;

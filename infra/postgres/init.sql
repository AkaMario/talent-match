CREATE DATABASE keycloak;
CREATE TABLE profiles (
 id uuid PRIMARY KEY,
 role text NOT NULL CHECK (role IN ('student','company')),
 name varchar(120) NOT NULL,
 email text NOT NULL,
 career varchar(160) NOT NULL DEFAULT '',
 semester integer NOT NULL DEFAULT 1 CHECK(semester BETWEEN 1 AND 16),
 bio varchar(2000) NOT NULL DEFAULT '',
 skills text[] NOT NULL DEFAULT '{}',
 projects varchar(3000) NOT NULL DEFAULT '',
 certifications varchar(2000) NOT NULL DEFAULT '',
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE opportunities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES profiles(id),
 title varchar(160) NOT NULL,
 description varchar(5000) NOT NULL,
 area varchar(80) NOT NULL,
 modality text NOT NULL CHECK(modality IN ('Remoto','Híbrido','Presencial')),
 location varchar(120) NOT NULL,
 skills text[] NOT NULL CHECK(cardinality(skills) > 0),
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL REFERENCES profiles(id),
 name varchar(200) NOT NULL,
 object_key text NOT NULL UNIQUE,
 kind text NOT NULL CHECK(kind IN ('cv','certificate','project')),
 size integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE applications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 student_id uuid NOT NULL REFERENCES profiles(id),
 opportunity_id uuid NOT NULL REFERENCES opportunities(id),
 document_id uuid NOT NULL REFERENCES documents(id),
 status text NOT NULL DEFAULT 'Enviada' CHECK(status IN ('Enviada','En revisión','Entrevista','Aceptada','No seleccionada')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(student_id,opportunity_id)
);
CREATE INDEX opportunities_company_idx ON opportunities(company_id);
CREATE INDEX applications_student_idx ON applications(student_id);
CREATE INDEX documents_owner_idx ON documents(owner_id);
INSERT INTO profiles (id,role,name,email,career,semester,bio,skills,projects,certifications) VALUES
('11111111-1111-4111-8111-111111111111','student','Mariana Torres','estudiante@talentmatch.local','Ingeniería de Sistemas',8,'Me interesa transformar datos en decisiones y construir herramientas que ayuden a las personas.',ARRAY['Python','SQL','Git','Trabajo en equipo'],'Análisis de ventas con Python y PostgreSQL.','Fundamentos de SQL'),
('22222222-2222-4222-8222-222222222222','company','Nexo Tech','empresa@talentmatch.local','',1,'Construimos tecnología con propósito.',ARRAY[]::text[],'','');
INSERT INTO opportunities (id,company_id,title,description,area,modality,location,skills) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','22222222-2222-4222-8222-222222222222','Practicante de análisis de datos','Ayúdanos a convertir datos en historias. Trabajarás con consultas SQL, limpieza de datos en Python y tableros de Power BI junto a nuestro equipo de analítica.','Datos','Remoto','Colombia',ARRAY['Python','SQL','Power BI','Trabajo en equipo']),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','22222222-2222-4222-8222-222222222222','Desarrollo backend','Participa en el desarrollo de APIs y servicios para productos digitales. Buscamos curiosidad, fundamentos de programación y ganas de aprender.','Desarrollo','Híbrido','Medellín',ARRAY['Node.js','SQL','Git','APIs REST']),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','22222222-2222-4222-8222-222222222222','Ingeniería de datos','Colabora en pipelines de datos y automatiza procesos con Python. Acompañamiento de un mentor durante toda tu práctica.','Datos','Remoto','Colombia',ARRAY['Python','SQL','Git','Docker','ETL']),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4','22222222-2222-4222-8222-222222222222','Desarrollo frontend','Crea interfaces accesibles y responsivas con React. Trabaja con diseño y backend para mejorar la experiencia de nuestros usuarios.','Desarrollo','Presencial','Bogotá',ARRAY['React','JavaScript','CSS','Git']);

-- Inserir clínica de teste "Dermatologia Paraíso"
INSERT INTO clinics (
  id,
  name,
  slug,
  address,
  phone,
  email,
  website,
  description,
  is_published,
  owner_id,
  working_hours,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Dermatologia Paraíso',
  'dermatologiaparaiso',
  'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
  '(11) 99999-9999',
  'contato@dermatologiaparaiso.com.br',
  'https://dermatologiaparaiso.com.br',
  'Clínica especializada em dermatologia estética e clínica, oferecendo os melhores tratamentos para a saúde e beleza da sua pele.',
  true,
  '00000000-0000-0000-0000-000000000000',
  '{
    "monday": [{"start": "08:00", "end": "18:00"}],
    "tuesday": [{"start": "08:00", "end": "18:00"}],
    "wednesday": [{"start": "08:00", "end": "18:00"}],
    "thursday": [{"start": "08:00", "end": "18:00"}],
    "friday": [{"start": "08:00", "end": "18:00"}],
    "saturday": [{"start": "08:00", "end": "13:00"}],
    "sunday": []
  }'::jsonb,
  now(),
  now()
) ON CONFLICT (slug) DO UPDATE SET
  is_published = true,
  updated_at = now();

-- Inserir médicos de exemplo
INSERT INTO doctors (
  id,
  name,
  speciality,
  bio,
  clinic_id,
  phone,
  email,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  doctor_data.name,
  doctor_data.speciality,
  doctor_data.bio,
  c.id,
  doctor_data.phone,
  doctor_data.email,
  now(),
  now()
FROM (
  VALUES 
    ('Dr. João Silva', 'Dermatologia Clínica', 'Especialista em dermatologia clínica com mais de 15 anos de experiência.', '(11) 99999-1111', 'joao@dermatologiaparaiso.com.br'),
    ('Dra. Maria Santos', 'Dermatologia Estética', 'Especialista em procedimentos estéticos e rejuvenescimento facial.', '(11) 99999-2222', 'maria@dermatologiaparaiso.com.br')
) AS doctor_data(name, speciality, bio, phone, email)
CROSS JOIN clinics c
WHERE c.slug = 'dermatologiaparaiso'
ON CONFLICT (clinic_id, name) DO NOTHING; 
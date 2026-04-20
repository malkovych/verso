-- Seed data for development/demo purposes
-- Run after schema.sql

-- Note: You need to create users via Supabase Auth first,
-- then their profiles will be auto-created by the trigger.
-- This seed assumes a test user with a known UUID exists.

-- Example knowledge base entries (use after user signup)
-- Replace 'YOUR_USER_UUID' with actual user id

/*
insert into public.knowledge_base (user_id, title, content, tags) values
  ('YOUR_USER_UUID', 'Product Overview', 'SalesAI is an AI-powered sales assistant that helps businesses automate their sales funnel. Key features include intelligent conversation handling, objection management, multi-language support, and CRM integrations.', '{product, overview}'),
  ('YOUR_USER_UUID', 'Pricing Guide', 'Basic plan: $9.99/mo (100 conversations, basic integrations). Professional: $29.99/mo (unlimited conversations, all integrations, custom KB). Business: $49.99/mo (everything + dedicated support, API access, white-label).', '{pricing, plans}'),
  ('YOUR_USER_UUID', 'Common Objections', 'Price objection: Emphasize ROI — our clients save 20+ hours/week. Competition: We specialize in sales funnel AI with proven conversion techniques. Timing: Offer a free trial to reduce risk. Need: Share case studies showing 3x conversion improvement.', '{objections, sales}');
*/

CREATE TYPE public.case_status AS ENUM ('draft', 'published');
CREATE TYPE public.evidence_category AS ENUM ('sensor', 'testimony', 'document', 'system_data', 'legislation', 'record', 'statement', 'photograph', 'vehicle_log', 'other');
CREATE TYPE public.evidence_importance AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.evidence_reliability AS ENUM ('unknown', 'low', 'medium', 'high');
CREATE TYPE public.session_status AS ENUM ('preparing', 'active', 'paused', 'completed');
CREATE TYPE public.trial_side AS ENUM ('accusation', 'defense', 'court');

CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE CHECK (number > 0),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  difficulty integer NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  is_final boolean NOT NULL DEFAULT false,
  points integer NOT NULL DEFAULT 1 CHECK (points > 0),
  summary text NOT NULL,
  description text NOT NULL,
  central_question text NOT NULL,
  algorithm_title text NOT NULL,
  algorithm_description text NOT NULL,
  algorithm_justification text,
  reveal_justification boolean NOT NULL DEFAULT true,
  status public.case_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published cases are public" ON public.cases FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Authenticated users read cases" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users create cases" ON public.cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users update cases" ON public.cases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users delete cases" ON public.cases FOR DELETE TO authenticated USING (true);

CREATE TABLE public.incident_data (
  case_id uuid PRIMARY KEY REFERENCES public.cases(id) ON DELETE CASCADE,
  passengers integer CHECK (passengers >= 0),
  pedestrians integer CHECK (pedestrians >= 0),
  decision_time numeric CHECK (decision_time >= 0),
  vehicle_speed numeric CHECK (vehicle_speed >= 0),
  survival_probability numeric CHECK (survival_probability BETWEEN 0 AND 100),
  location text,
  weather text,
  visibility text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.incident_data TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incident_data TO authenticated;
GRANT ALL ON public.incident_data TO service_role;
ALTER TABLE public.incident_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published incident data is public" ON public.incident_data FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.status = 'published'));
CREATE POLICY "Authenticated users manage incident data" ON public.incident_data FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  number integer NOT NULL CHECK (number > 0),
  title text NOT NULL,
  description text NOT NULL,
  category public.evidence_category NOT NULL DEFAULT 'other',
  importance public.evidence_importance,
  reveal_phase text NOT NULL DEFAULT 'evidence',
  image_path text,
  document_path text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id, number)
);
GRANT SELECT ON public.evidence TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence TO authenticated;
GRANT ALL ON public.evidence TO service_role;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published evidence is public" ON public.evidence FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.status = 'published'));
CREATE POLICY "Authenticated users manage evidence" ON public.evidence FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.witnesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  number integer NOT NULL CHECK (number > 0),
  name text NOT NULL,
  role text NOT NULL,
  description text,
  mediator_intro text,
  video_path text,
  duration_seconds integer CHECK (duration_seconds >= 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id, number)
);
GRANT SELECT ON public.witnesses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.witnesses TO authenticated;
GRANT ALL ON public.witnesses TO service_role;
ALTER TABLE public.witnesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published witnesses are public" ON public.witnesses FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.status = 'published'));
CREATE POLICY "Authenticated users manage witnesses" ON public.witnesses FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.evidence_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  witness_id uuid REFERENCES public.witnesses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  source text NOT NULL,
  type public.evidence_category NOT NULL DEFAULT 'testimony',
  reliability public.evidence_reliability NOT NULL DEFAULT 'unknown',
  auto_reveal boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.evidence_cards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_cards TO authenticated;
GRANT ALL ON public.evidence_cards TO service_role;
ALTER TABLE public.evidence_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published evidence cards are public" ON public.evidence_cards FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.status = 'published'));
CREATE POLICY "Authenticated users manage evidence cards" ON public.evidence_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.presenter_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  evidence_id uuid REFERENCES public.evidence(id) ON DELETE CASCADE,
  witness_id uuid REFERENCES public.witnesses(id) ON DELETE CASCADE,
  evidence_card_id uuid REFERENCES public.evidence_cards(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presenter_notes TO authenticated;
GRANT ALL ON public.presenter_notes TO service_role;
ALTER TABLE public.presenter_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage presenter notes" ON public.presenter_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.trial_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  status public.session_status NOT NULL DEFAULT 'preparing',
  current_phase text NOT NULL DEFAULT 'file',
  phase_index integer NOT NULL DEFAULT 0,
  accusation_score integer NOT NULL DEFAULT 0,
  defense_score integer NOT NULL DEFAULT 0,
  court_score integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trial_sessions TO authenticated;
GRANT ALL ON public.trial_sessions TO service_role;
ALTER TABLE public.trial_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage trial sessions" ON public.trial_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.case_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.trial_sessions(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  verdict public.trial_side NOT NULL,
  accusation_points integer NOT NULL DEFAULT 0,
  defense_points integer NOT NULL DEFAULT 0,
  court_points integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_results TO authenticated;
GRANT ALL ON public.case_results TO service_role;
ALTER TABLE public.case_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage case results" ON public.case_results FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_final_case_points()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_final THEN NEW.points = 2; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cases_final_points BEFORE INSERT OR UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.enforce_final_case_points();
CREATE TRIGGER cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER incident_data_updated_at BEFORE UPDATE ON public.incident_data FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER evidence_updated_at BEFORE UPDATE ON public.evidence FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER witnesses_updated_at BEFORE UPDATE ON public.witnesses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER evidence_cards_updated_at BEFORE UPDATE ON public.evidence_cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER presenter_notes_updated_at BEFORE UPDATE ON public.presenter_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trial_sessions_updated_at BEFORE UPDATE ON public.trial_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX cases_public_order_idx ON public.cases(status, sort_order, number);
CREATE INDEX evidence_case_order_idx ON public.evidence(case_id, sort_order, number);
CREATE INDEX witnesses_case_order_idx ON public.witnesses(case_id, sort_order, number);
CREATE INDEX evidence_cards_case_order_idx ON public.evidence_cards(case_id, sort_order);

WITH inserted_case AS (
  INSERT INTO public.cases (number, code, title, subtitle, difficulty, is_final, points, summary, description, central_question, algorithm_title, algorithm_description, algorithm_justification, reveal_justification, status, sort_order)
  VALUES (1, 'AV-001', 'O Desvio', 'Passageiros vs. Pedestres', 2, false, 1,
    'Um veículo autônomo transportava três passageiros quando cinco pedestres surgiram à frente em uma avenida urbana sob chuva intensa.',
    'Às 21h14, um veículo autônomo trafegava a 62 km/h quando seus sensores detectaram cinco pedestres na pista. A única rota de desvio disponível colocaria os três passageiros em risco crítico. O sistema teve menos de um segundo para decidir.',
    'A decisão do algoritmo foi justificável?',
    'PROTEGER OS PASSAGEIROS',
    'O sistema decidiu manter a trajetória e priorizar a integridade dos ocupantes.',
    'O modelo calculou 85% de chance de sobrevivência dos passageiros mantendo a rota e risco crítico no desvio.',
    true, 'published', 1)
  RETURNING id
), incident AS (
  INSERT INTO public.incident_data (case_id, passengers, pedestrians, decision_time, vehicle_speed, survival_probability, location, weather, visibility)
  SELECT id, 3, 5, 0.8, 62, 85, 'Avenida urbana', 'Chuva intensa', 'Parcial' FROM inserted_case
), inserted_evidence AS (
  INSERT INTO public.evidence (case_id, number, title, description, category, importance, sort_order)
  SELECT id, 1, 'Tempo de reação', 'O veículo dispunha de apenas 0,8 segundo para classificar o risco e executar uma manobra.', 'system_data'::public.evidence_category, 'high'::public.evidence_importance, 1 FROM inserted_case
  UNION ALL
  SELECT id, 2, 'Travessia irregular', 'Dois pedestres iniciaram a travessia fora da faixa e com o sinal fechado.', 'record'::public.evidence_category, 'medium'::public.evidence_importance, 2 FROM inserted_case
  UNION ALL
  SELECT id, 3, 'Registro de frenagem', 'O log principal não registra acionamento completo dos freios antes da decisão de trajetória.', 'vehicle_log'::public.evidence_category, 'high'::public.evidence_importance, 3 FROM inserted_case
), inserted_witness AS (
  INSERT INTO public.witnesses (case_id, number, name, role, description, mediator_intro, duration_seconds, sort_order)
  SELECT id, 1, 'Helena Martins', 'Testemunha ocular', 'Pedestre que aguardava no canteiro central próximo ao incidente.', 'A próxima testemunha observou o veículo a poucos metros do ponto de impacto.', 47, 1 FROM inserted_case
  RETURNING id, case_id
)
INSERT INTO public.evidence_cards (case_id, witness_id, title, content, source, type, reliability, auto_reveal, sort_order)
SELECT case_id, id, 'Declaração sobre a frenagem', 'A testemunha afirmou que o veículo não tentou frear antes de realizar a manobra.', 'Helena Martins', 'testimony', 'unknown', true, 4 FROM inserted_witness;
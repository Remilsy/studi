-- ============================================================
-- RLS POLICIES — Studi / SUP-PHOTO
-- À coller dans Supabase > SQL Editor > New query
-- ============================================================

-- Helper : vérifie si l'utilisateur connecté est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Helper : retourne l'id etudiant de l'utilisateur connecté
CREATE OR REPLACE FUNCTION my_etudiant_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.etudiants
  WHERE email = auth.jwt() ->> 'email'
  LIMIT 1;
$$;


-- ============================================================
-- TABLE : etudiants
-- ============================================================
ALTER TABLE public.etudiants ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
CREATE POLICY "admin_etudiants_all"
  ON public.etudiants FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Étudiant : lecture de sa propre fiche
CREATE POLICY "student_etudiants_select"
  ON public.etudiants FOR SELECT
  USING (email = auth.jwt() ->> 'email');

-- Étudiant : mise à jour de sa propre fiche (téléphone, linkedin, docs, stats)
CREATE POLICY "student_etudiants_update"
  ON public.etudiants FOR UPDATE
  USING (email = auth.jwt() ->> 'email')
  WITH CHECK (email = auth.jwt() ->> 'email');


-- ============================================================
-- TABLE : candidatures
-- ============================================================
ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
CREATE POLICY "admin_candidatures_all"
  ON public.candidatures FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Étudiant : accès complet à ses propres candidatures
CREATE POLICY "student_candidatures_all"
  ON public.candidatures FOR ALL
  USING (etudiant_id = my_etudiant_id())
  WITH CHECK (etudiant_id = my_etudiant_id());


-- ============================================================
-- TABLE : offres
-- ============================================================
ALTER TABLE public.offres ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
CREATE POLICY "admin_offres_all"
  ON public.offres FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Étudiant : lecture des offres actives uniquement
CREATE POLICY "student_offres_select"
  ON public.offres FOR SELECT
  USING (active = true);


-- ============================================================
-- TABLE : relances
-- ============================================================
ALTER TABLE public.relances ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
CREATE POLICY "admin_relances_all"
  ON public.relances FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Étudiant : lecture de ses propres relances
CREATE POLICY "student_relances_select"
  ON public.relances FOR SELECT
  USING (etudiant_id = my_etudiant_id());

-- Étudiant : réponse à ses propres relances (lu, reponse, reponse_at)
CREATE POLICY "student_relances_update"
  ON public.relances FOR UPDATE
  USING (etudiant_id = my_etudiant_id())
  WITH CHECK (etudiant_id = my_etudiant_id());

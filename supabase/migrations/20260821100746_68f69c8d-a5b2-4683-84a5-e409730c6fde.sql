CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'bank',
  opening_balance BIGINT NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_own" ON public.accounts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  amount BIGINT NOT NULL,
  category TEXT,
  description TEXT,
  note TEXT,
  source TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT transactions_kind_check CHECK (kind IN ('expense','income','transfer')),
  CONSTRAINT transactions_amount_check CHECK (amount > 0)
);
CREATE INDEX transactions_user_date_idx ON public.transactions (user_id, occurred_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_own" ON public.transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friends TO authenticated;
GRANT ALL ON public.friends TO service_role;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friends_own" ON public.friends FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER friends_updated_at BEFORE UPDATE ON public.friends FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.friend_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  amount BIGINT NOT NULL,
  label TEXT,
  settled_at TIMESTAMPTZ,
  remind_at TIMESTAMPTZ,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT friend_ledger_direction_check CHECK (direction IN ('to_receive','to_pay')),
  CONSTRAINT friend_ledger_amount_check CHECK (amount > 0)
);
CREATE INDEX friend_ledger_user_idx ON public.friend_ledger (user_id, friend_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friend_ledger TO authenticated;
GRANT ALL ON public.friend_ledger TO service_role;
ALTER TABLE public.friend_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friend_ledger_own" ON public.friend_ledger FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER friend_ledger_updated_at BEFORE UPDATE ON public.friend_ledger FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.seed_default_accounts() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.accounts (user_id, name, kind, sort_order) VALUES
    (NEW.id, 'Bank', 'bank', 0),
    (NEW.id, 'Cash', 'cash', 1);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_seed_accounts AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.seed_default_accounts();
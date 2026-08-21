import { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/bottom-sheet";
import {
  AmountField,
  Chip,
  FieldRow,
  GhostButton,
  PrimaryButton,
  TextField,
} from "@/components/primitives";
import { CATEGORIES } from "@/lib/categories";
import { formatMoney, splitEvenly, toPaise } from "@/lib/money";
import { haptics } from "@/lib/haptics";
import {
  useAccounts,
  useAddFriend,
  useFriends,
  useSaveSplit,
  useSaveTransaction,
} from "@/lib/data";

export type QuickAddMode = "expense" | "income" | "split" | "transfer";

const MODE_TITLES: Record<QuickAddMode, string> = {
  expense: "Add Expense",
  income: "Add Money",
  split: "Split Bill",
  transfer: "Transfer",
};

function todayLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function dateToIso(date: string) {
  return date ? new Date(`${date}T${new Date().toTimeString().slice(0, 8)}`).toISOString() : undefined;
}

export function QuickAddSheet({
  mode,
  onClose,
}: {
  mode: QuickAddMode | null;
  onClose: () => void;
}) {
  return (
    <BottomSheet open={!!mode} onClose={onClose} title={mode ? MODE_TITLES[mode] : undefined}>
      {mode === "expense" ? <ExpenseForm onDone={onClose} /> : null}
      {mode === "income" ? <IncomeForm onDone={onClose} /> : null}
      {mode === "split" ? <SplitForm onDone={onClose} /> : null}
      {mode === "transfer" ? <TransferForm onDone={onClose} /> : null}
    </BottomSheet>
  );
}

function AccountChips({
  value,
  onChange,
  label = "Account",
}: {
  value: string | null;
  onChange: (id: string) => void;
  label?: string;
}) {
  const { data: accounts = [] } = useAccounts();
  return (
    <FieldRow label={label}>
      <div className="flex flex-wrap gap-2">
        {accounts.map((account) => (
          <Chip key={account.id} active={value === account.id} onClick={() => onChange(account.id)}>
            {account.name}
          </Chip>
        ))}
      </div>
    </FieldRow>
  );
}

function MoreDetails({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => {
          haptics.select();
          setOpen((v) => !v);
        }}
        className="press flex w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-muted-foreground active:press-active"
      >
        More Details
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">{children}</div> : null}
    </div>
  );
}

function useDefaultAccount() {
  const { data: accounts = [] } = useAccounts();
  return accounts[0]?.id ?? null;
}

/* --------------------------------- expense -------------------------------- */

function ExpenseForm({ onDone }: { onDone: () => void }) {
  const defaultAccount = useDefaultAccount();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(todayLocal());
  const [note, setNote] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const save = useSaveTransaction();

  const paise = toPaise(amount);

  const submit = () => {
    if (paise <= 0) return toast.error("Enter an amount");
    save.mutate(
      {
        kind: "expense",
        amount: paise,
        category: customCategory.trim() ? customCategory.trim().toLowerCase() : category,
        description: description.trim() || null,
        note: note.trim() || null,
        account_id: accountId ?? defaultAccount,
        occurred_at: dateToIso(date),
      },
      {
        onSuccess: () => {
          haptics.confirm();
          toast.success(`${formatMoney(paise)} expense saved`);
          onDone();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div>
      <AmountField value={amount} onChange={setAmount} autoFocus />
      <div className="mt-4 grid grid-cols-5 gap-2">
        {CATEGORIES.map((item) => {
          const Icon = item.icon;
          const active = category === item.id && !customCategory;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                haptics.select();
                setCustomCategory("");
                setCategory(item.id);
              }}
              className={`press flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 active:press-active ${
                active ? "border-primary/60 bg-primary/15" : "border-border bg-secondary/40"
              }`}
            >
              <Icon className="size-5" style={{ color: item.tint }} />
              <span className="text-[10px] leading-tight text-muted-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>

      <MoreDetails>
        <FieldRow label="Description">
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Power Bank"
          />
        </FieldRow>
        <AccountChips value={accountId ?? defaultAccount} onChange={setAccountId} />
        <FieldRow label="Date">
          <TextField type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FieldRow>
        <FieldRow label="Custom category">
          <TextField
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Gifts"
          />
        </FieldRow>
        <FieldRow label="Note">
          <TextField value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </FieldRow>
      </MoreDetails>

      <div className="mt-5">
        <PrimaryButton onClick={submit} disabled={save.isPending}>
          Save Expense
        </PrimaryButton>
      </div>
    </div>
  );
}

/* --------------------------------- income --------------------------------- */

function IncomeForm({ onDone }: { onDone: () => void }) {
  const defaultAccount = useDefaultAccount();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const save = useSaveTransaction();
  const paise = toPaise(amount);

  const submit = () => {
    if (paise <= 0) return toast.error("Enter an amount");
    save.mutate(
      {
        kind: "income",
        amount: paise,
        source: source.trim() || "Other",
        note: note.trim() || null,
        account_id: accountId ?? defaultAccount,
      },
      {
        onSuccess: () => {
          haptics.confirm();
          toast.success(`${formatMoney(paise)} added`);
          onDone();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="space-y-4">
      <AmountField value={amount} onChange={setAmount} autoFocus />
      <FieldRow label="Source">
        <TextField
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="From Home"
        />
      </FieldRow>
      <div className="flex flex-wrap gap-2">
        {["From Home", "Salary", "Refund", "Gift"].map((preset) => (
          <Chip key={preset} active={source === preset} onClick={() => setSource(preset)}>
            {preset}
          </Chip>
        ))}
      </div>
      <AccountChips value={accountId ?? defaultAccount} onChange={setAccountId} />
      <MoreDetails>
        <FieldRow label="Note">
          <TextField value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </FieldRow>
      </MoreDetails>
      <PrimaryButton onClick={submit} disabled={save.isPending}>
        Add Money
      </PrimaryButton>
    </div>
  );
}

/* ---------------------------------- split --------------------------------- */

function SplitForm({ onDone }: { onDone: () => void }) {
  const defaultAccount = useDefaultAccount();
  const { data: friends = [] } = useFriends();
  const addFriend = useAddFriend();
  const saveSplit = useSaveSplit();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [newFriend, setNewFriend] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const total = toPaise(amount);
  const shares = useMemo(() => splitEvenly(total, selected.length + 1), [total, selected.length]);

  const friendAmount = (friendId: string, index: number) => {
    const override = overrides[friendId];
    if (override !== undefined && override !== "") return toPaise(override);
    return shares[index + 1] ?? 0;
  };

  const friendTotal = selected.reduce((sum, id, index) => sum + friendAmount(id, index), 0);
  const myShare = Math.max(total - friendTotal, 0);

  const toggle = (id: string) => {
    haptics.select();
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const submit = () => {
    if (total <= 0) return toast.error("Enter the bill amount");
    if (!selected.length) return toast.error("Pick at least one friend");
    saveSplit.mutate(
      {
        amount: total,
        category,
        description: description.trim() || null,
        account_id: accountId ?? defaultAccount,
        myShare,
        shares: selected.map((id, index) => ({ friendId: id, amount: friendAmount(id, index) })),
      },
      {
        onSuccess: () => {
          haptics.confirm();
          toast.success(`${formatMoney(total)} split · ${formatMoney(friendTotal)} to receive`);
          onDone();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="space-y-4">
      <AmountField value={amount} onChange={setAmount} autoFocus />

      <FieldRow label="What for">
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner"
        />
      </FieldRow>

      <FieldRow label="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.slice(0, 6).map((item) => (
            <Chip key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>
              {item.label}
            </Chip>
          ))}
        </div>
      </FieldRow>

      <FieldRow label="Split with">
        <div className="flex flex-wrap gap-2">
          {friends.map((friend) => (
            <Chip key={friend.id} active={selected.includes(friend.id)} onClick={() => toggle(friend.id)}>
              {friend.name}
            </Chip>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <TextField
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            placeholder="Add a friend"
          />
          <GhostButton
            onClick={() => {
              const name = newFriend.trim();
              if (!name) return;
              addFriend.mutate(name, {
                onSuccess: (friend) => {
                  setSelected((current) => [...current, friend.id]);
                  setNewFriend("");
                },
                onError: (error) => toast.error(error.message),
              });
            }}
            className="shrink-0 px-4"
          >
            <Plus className="size-4" />
          </GhostButton>
        </div>
      </FieldRow>

      {selected.length > 0 && total > 0 ? (
        <div className="glass space-y-2 rounded-2xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">My share</span>
            <span className="numeric font-semibold">{formatMoney(myShare)}</span>
          </div>
          {selected.map((id, index) => {
            const friend = friends.find((f) => f.id === id);
            return (
              <div key={id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{friend?.name}</span>
                <input
                  inputMode="decimal"
                  value={overrides[id] ?? String(friendAmount(id, index) / 100)}
                  onChange={(e) =>
                    setOverrides((current) => ({
                      ...current,
                      [id]: e.target.value.replace(/[^\d.]/g, ""),
                    }))
                  }
                  className="numeric w-24 rounded-xl border border-input bg-secondary/40 px-3 py-1.5 text-right outline-none focus:border-ring"
                />
              </div>
            );
          })}
          <p className="pt-1 text-[12px] text-muted-foreground">
            Balance drops by {formatMoney(total)}. {formatMoney(friendTotal)} is tracked separately
            as To Receive.
          </p>
        </div>
      ) : null}

      <MoreDetails>
        <AccountChips value={accountId ?? defaultAccount} onChange={setAccountId} />
      </MoreDetails>

      <PrimaryButton onClick={submit} disabled={saveSplit.isPending}>
        Save Split
      </PrimaryButton>
    </div>
  );
}

/* -------------------------------- transfer -------------------------------- */

function TransferForm({ onDone }: { onDone: () => void }) {
  const { data: accounts = [] } = useAccounts();
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const save = useSaveTransaction();
  const paise = toPaise(amount);

  const fromId = from ?? accounts[0]?.id ?? null;
  const toId = to ?? accounts[1]?.id ?? null;

  const submit = () => {
    if (paise <= 0) return toast.error("Enter an amount");
    if (!fromId || !toId || fromId === toId) return toast.error("Pick two different accounts");
    save.mutate(
      { kind: "transfer", amount: paise, account_id: fromId, to_account_id: toId },
      {
        onSuccess: () => {
          haptics.confirm();
          toast.success("Transfer saved");
          onDone();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="space-y-4">
      <AmountField value={amount} onChange={setAmount} autoFocus />
      <AccountChips label="From" value={fromId} onChange={setFrom} />
      <AccountChips label="To" value={toId} onChange={setTo} />
      <p className="px-1 text-[12px] text-muted-foreground">
        Transfers move money between accounts. They never count as income or expense.
      </p>
      <PrimaryButton onClick={submit} disabled={save.isPending}>
        Transfer
      </PrimaryButton>
    </div>
  );
}

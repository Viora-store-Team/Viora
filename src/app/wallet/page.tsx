"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet as WalletIcon,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  CheckCircle2,
  Upload,
  Clock,
  Building2,
  Smartphone,
  CreditCard,
  Copy,
  Check,
  Filter,
} from "lucide-react";
import { apiFetch, getCustomerToken } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { strings } from "@/lib/strings";

interface Transaction {
  id: string;
  type: "TOPUP" | "PAYMENT" | "BONUS";
  title: string;
  subtitle?: string;
  amount: number;
  date: string;
  status: "COMPLETED" | "PENDING";
}

const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "TOPUP",
    title: "شحن رصيد",
    subtitle: "تحت الموافقة",
    amount: 100.0,
    date: "25 يوليو 2026 - 11:30 صباحاً",
    status: "PENDING",
  },
  {
    id: "tx-2",
    type: "PAYMENT",
    title: "دفع طلب #4567",
    subtitle: "دفع من المحفظة",
    amount: -120.0,
    date: "14 يوليو 2026 - 11:30 صباحاً",
    status: "COMPLETED",
  },
  {
    id: "tx-3",
    type: "BONUS",
    title: "إضافة رصيد",
    subtitle: "هدية من الإدارة",
    amount: 50.0,
    date: "10 يوليو 2026 - 11:30 صباحاً",
    status: "COMPLETED",
  },
  {
    id: "tx-4",
    type: "TOPUP",
    title: "شحن رصيد",
    subtitle: "تمت الموافقة",
    amount: 80.0,
    date: "2 مايو 2026 - 11:30 صباحاً",
    status: "COMPLETED",
  },
];

export default function WalletPage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(500.0);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filterSort, setFilterSort] = useState<"ALL" | "NEWEST" | "OLDEST" | "TOPUP" | "PAYMENT">("ALL");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Top-Up Modal / Wizard Steps: 0 (Closed) | 1 (Amount & Method) | 2 (Attach Receipt) | 3 (Review / Success)
  const [topUpStep, setTopUpStep] = useState<0 | 1 | 2 | 3>(0);
  const [topUpAmount, setTopUpAmount] = useState("200.00");
  const [selectedMethod, setSelectedMethod] = useState<"BANK" | "JAWWAL" | "PALPAY">("BANK");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submittingTopUp, setSubmittingTopUp] = useState(false);
  const [topUpOrderRef, setTopUpOrderRef] = useState("#4688");

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      router.push("/login?returnUrl=/wallet");
      return;
    }

    // Try reading local stored wallet state or API
    try {
      const savedTxs = localStorage.getItem("viora_wallet_transactions");
      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      }
      const savedBalance = localStorage.getItem("viora_wallet_balance");
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      }
    } catch {}

    setLoading(false);
  }, [router]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    toast.success(`تم نسخ ${label} بنجاح!`);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleTopUpSubmit = async () => {
    const numAmount = parseFloat(topUpAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("يرجى إدخال مبلغ شحن صحيح");
      return;
    }

    setSubmittingTopUp(true);

    setTimeout(() => {
      setSubmittingTopUp(false);
      const randomRef = `#${Math.floor(1000 + Math.random() * 9000)}`;
      setTopUpOrderRef(randomRef);

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: "TOPUP",
        title: strings.wallet.topUpButton,
        subtitle: strings.wallet.topUpPending,
        amount: numAmount,
        date: "الآن",
        status: "PENDING",
      };

      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);

      try {
        localStorage.setItem("viora_wallet_transactions", JSON.stringify(updatedTxs));
      } catch {}

      setTopUpStep(3);
      toast.success(strings.wallet.requestSubmittedSuccess);
    }, 1000);
  };

  // Filtered and Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (filterSort === "TOPUP") {
      result = result.filter((t) => t.type === "TOPUP");
    } else if (filterSort === "PAYMENT") {
      result = result.filter((t) => t.type === "PAYMENT");
    }

    if (filterSort === "OLDEST") {
      result.reverse();
    }
    return result;
  }, [transactions, filterSort]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 font-cairo dir-rtl text-right">
      {/* Header Back & Title */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80766b] hover:text-[#7d1d29] transition"
        >
          <ArrowRight className="size-4" />
          <span>العودة للحساب</span>
        </Link>
        <h1 className="text-xl font-black text-[#1e1b18]">{strings.wallet.title}</h1>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-[#80766b]">جاري تحميل المحفظة...</div>
      ) : (
        <div className="space-y-8">
          {/* ─── 1. Wallet Balance Card (Unified Burgundy Gradient) ─── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4a0e17] via-[#7d1d29] to-[#2d080e] p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute -top-24 -right-24 size-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#c48b4e]">
                  <WalletIcon className="size-7" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#fbf4ea]/80">{strings.wallet.currentBalance}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="ltr-nums text-3xl sm:text-4xl font-black text-white">
                      {balance.toFixed(2)}
                    </span>
                    <span className="text-lg font-black text-[#c48b4e]">₪</span>
                  </div>
                  <span className="inline-block text-[11px] font-bold text-[#c48b4e] mt-1">
                    {strings.wallet.availableForUse}
                  </span>
                </div>
              </div>

              {/* Top-Up Button */}
              <button
                type="button"
                onClick={() => setTopUpStep(1)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-black text-[#7d1d29] shadow-md transition hover:bg-[#fbf4ea] hover:scale-105 active:scale-95 shrink-0"
              >
                <PlusCircle className="size-4" />
                <span>{strings.wallet.topUpButton}</span>
              </button>
            </div>
          </div>

          {/* ─── 2. Transaction History Section ─── */}
          <div className="rounded-3xl border border-[#ede5da] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#ede5da] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="size-4.5 text-[#7d1d29]" />
                <h2 className="text-base font-black text-[#1e1b18]">{strings.wallet.transactionHistory}</h2>
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Filter className="size-3.5 text-[#80766b]" />
                <select
                  value={filterSort}
                  onChange={(e) => setFilterSort(e.target.value as any)}
                  className="rounded-xl border border-[#ede5da] bg-[#faf7f2] px-3 py-1.5 text-xs font-bold text-[#1e1b18] outline-none transition focus:border-[#7d1d29]"
                >
                  <option value="ALL">الكل</option>
                  <option value="NEWEST">الأحدث أولاً</option>
                  <option value="OLDEST">الأقدم أولاً</option>
                  <option value="TOPUP">عمليات الشحن فقط</option>
                  <option value="PAYMENT">عمليات الشراء فقط</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-[#ede5da] bg-[#faf7f2]/60 hover:bg-white hover:border-[#7d1d29]/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      {/* Unified Icon Colors */}
                      <div
                        className={`grid size-10 place-items-center rounded-2xl border ${
                          tx.type === "TOPUP"
                            ? "bg-[#fdf0f2] text-[#7d1d29] border-[#7d1d29]/30"
                            : tx.type === "BONUS"
                            ? "bg-[#fcf8f2] text-[#c48b4e] border-[#c48b4e]/30"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {tx.type === "TOPUP" ? (
                          <ArrowDownLeft className="size-5" />
                        ) : tx.type === "BONUS" ? (
                          <Gift className="size-5" />
                        ) : (
                          <ArrowUpRight className="size-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#1e1b18]">{tx.title}</h4>
                        <p className="text-[11px] text-[#80766b] mt-0.5">{tx.subtitle || tx.date}</p>
                      </div>
                    </div>

                    <div className="text-left">
                      <span
                        className={`ltr-nums text-sm font-black ${
                          tx.amount > 0 ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} ₪
                      </span>
                      <span className="block text-[10px] text-[#80766b] mt-0.5">{tx.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs font-bold text-[#80766b]">
                  لا توجد معاملات مطابقة للفلتر المحدد
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Top-Up Wizard Modal (Screens 2, 3, 4) ─── */}
      {topUpStep > 0 && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 py-8 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#ede5da] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ede5da] pb-4 mb-6">
              <h2 className="text-base font-black text-[#1e1b18]">{strings.wallet.topUpModalTitle}</h2>
              <button
                type="button"
                onClick={() => setTopUpStep(0)}
                className="text-[#80766b] hover:text-[#7d1d29] transition text-xs font-bold"
              >
                إغلاق
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between px-4 mb-6 text-xs font-bold text-[#80766b]">
              <div className={`flex flex-col items-center gap-1 ${topUpStep >= 1 ? "text-[#7d1d29]" : ""}`}>
                <div
                  className={`size-7 rounded-full grid place-items-center text-xs ${
                    topUpStep >= 1 ? "bg-[#7d1d29] text-white" : "bg-[#ede5da]"
                  }`}
                >
                  1
                </div>
                <span>{strings.wallet.step1Title}</span>
              </div>
              <div className="h-0.5 flex-1 bg-[#ede5da] mx-2" />
              <div className={`flex flex-col items-center gap-1 ${topUpStep >= 2 ? "text-[#7d1d29]" : ""}`}>
                <div
                  className={`size-7 rounded-full grid place-items-center text-xs ${
                    topUpStep >= 2 ? "bg-[#7d1d29] text-white" : "bg-[#ede5da]"
                  }`}
                >
                  2
                </div>
                <span>{strings.wallet.step2Title}</span>
              </div>
              <div className="h-0.5 flex-1 bg-[#ede5da] mx-2" />
              <div className={`flex flex-col items-center gap-1 ${topUpStep >= 3 ? "text-[#7d1d29]" : ""}`}>
                <div
                  className={`size-7 rounded-full grid place-items-center text-xs ${
                    topUpStep >= 3 ? "bg-[#7d1d29] text-white" : "bg-[#ede5da]"
                  }`}
                >
                  3
                </div>
                <span>{strings.wallet.step3Title}</span>
              </div>
            </div>

            {/* Step 1: Amount & Account Choice */}
            {topUpStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#1e1b18] mb-1.5">
                    {strings.wallet.amountToCharge}
                  </label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="200.00"
                    className="w-full rounded-2xl border border-[#ede5da] bg-[#faf7f2] py-3.5 px-4 text-xl font-black text-[#7d1d29] text-center outline-none focus:border-[#7d1d29]"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-2 mt-3">
                    {["50", "100", "200", "500"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTopUpAmount(preset)}
                        className={`flex-1 rounded-xl py-1.5 text-xs font-bold border transition ${
                          topUpAmount === preset
                            ? "bg-[#7d1d29] text-white border-[#7d1d29]"
                            : "bg-[#faf7f2] text-[#4a443e] border-[#ede5da] hover:border-[#7d1d29]"
                        }`}
                      >
                        {preset} ₪
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1e1b18] mb-2">
                    {strings.wallet.selectTransferAccount}
                  </label>

                  <div className="space-y-2">
                    {/* Bank Transfer */}
                    <div
                      onClick={() => setSelectedMethod("BANK")}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                        selectedMethod === "BANK"
                          ? "border-[#7d1d29] bg-[#fdf0f2]"
                          : "border-[#ede5da] bg-[#faf7f2]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-[#7d1d29]/10 text-[#7d1d29]">
                          <Building2 className="size-5" />
                        </div>
                        <div>
                          <span className="block text-xs font-black text-[#1e1b18]">
                            {strings.wallet.bankAccountName}
                          </span>
                          <span className="text-[11px] text-[#80766b] ltr-nums font-mono">
                            1234 5678 9123 4567
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard("1234567891234567", "رقم حساب بنك فلسطين");
                        }}
                        className="grid size-8 place-items-center rounded-lg bg-white border border-[#ede5da] text-[#7d1d29] hover:bg-[#fdf0f2]"
                      >
                        {copiedAccount === "رقم حساب بنك فلسطين" ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>

                    {/* Jawwal Pay */}
                    <div
                      onClick={() => setSelectedMethod("JAWWAL")}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                        selectedMethod === "JAWWAL"
                          ? "border-[#7d1d29] bg-[#fdf0f2]"
                          : "border-[#ede5da] bg-[#faf7f2]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-[#7d1d29]/10 text-[#7d1d29]">
                          <Smartphone className="size-5" />
                        </div>
                        <div>
                          <span className="block text-xs font-black text-[#1e1b18]">
                            {strings.wallet.jawwalPayName}
                          </span>
                          <span className="text-[11px] text-[#80766b] ltr-nums font-mono">
                            0599654321
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard("0599654321", "رقم جوال باي");
                        }}
                        className="grid size-8 place-items-center rounded-lg bg-white border border-[#ede5da] text-[#7d1d29] hover:bg-[#fdf0f2]"
                      >
                        {copiedAccount === "رقم جوال باي" ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>

                    {/* PalPay */}
                    <div
                      onClick={() => setSelectedMethod("PALPAY")}
                      className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                        selectedMethod === "PALPAY"
                          ? "border-[#7d1d29] bg-[#fdf0f2]"
                          : "border-[#ede5da] bg-[#faf7f2]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-[#7d1d29]/10 text-[#7d1d29]">
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <span className="block text-xs font-black text-[#1e1b18]">
                            {strings.wallet.palPayName}
                          </span>
                          <span className="text-[11px] text-[#80766b] ltr-nums font-mono">
                            0599654321
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard("0599654321", "رقم بال باي");
                        }}
                        className="grid size-8 place-items-center rounded-lg bg-white border border-[#ede5da] text-[#7d1d29] hover:bg-[#fdf0f2]"
                      >
                        {copiedAccount === "رقم بال باي" ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTopUpStep(2)}
                  className="w-full rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow hover:bg-[#681822] transition"
                >
                  {strings.wallet.nextButton}
                </button>
              </div>
            )}

            {/* Step 2: Attach Receipt */}
            {topUpStep === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-sm font-black text-[#1e1b18]">{strings.wallet.uploadReceiptTitle}</h3>
                  <p className="text-xs text-[#80766b] mt-1">
                    {strings.wallet.uploadReceiptSub}
                  </p>
                </div>

                {/* Upload Box */}
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#ede5da] bg-[#faf7f2] p-6 text-center cursor-pointer hover:border-[#7d1d29] transition">
                  <Upload className="size-8 text-[#7d1d29]" />
                  <span className="text-xs font-bold text-[#1e1b18]">
                    {strings.wallet.uploadAreaPrompt}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {receiptPreview && (
                  <div className="rounded-2xl overflow-hidden border border-[#ede5da] max-h-36 flex items-center justify-center bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={receiptPreview} alt="إشعار التحويل" className="max-h-36 object-contain" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#1e1b18] mb-1">
                    {strings.wallet.optionalNotes}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أضف أي ملاحظة ترغب بها..."
                    className="w-full rounded-xl border border-[#ede5da] bg-[#faf7f2] p-2.5 text-xs outline-none focus:border-[#7d1d29]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTopUpStep(1)}
                    className="flex-1 rounded-2xl border border-[#ede5da] py-3 text-xs font-bold text-[#80766b]"
                  >
                    {strings.wallet.prevButton}
                  </button>
                  <button
                    type="button"
                    disabled={submittingTopUp}
                    onClick={handleTopUpSubmit}
                    className="flex-2 rounded-2xl bg-[#7d1d29] py-3 text-xs font-black text-white shadow hover:bg-[#681822]"
                  >
                    {submittingTopUp ? strings.wallet.submittingRequest : strings.wallet.submitTopUpRequest}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success Screen */}
            {topUpStep === 3 && (
              <div className="py-4 text-center space-y-4">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#fdf0f2] text-[#7d1d29] border border-[#7d1d29]/20">
                  <CheckCircle2 className="size-10" />
                </div>

                <h3 className="text-lg font-black text-[#1e1b18]">
                  {strings.wallet.requestSubmittedSuccess}
                </h3>
                <p className="text-xs text-[#80766b] leading-relaxed">
                  {strings.wallet.requestReviewDesc}
                </p>

                <div className="rounded-2xl bg-[#faf7f2] p-3 text-xs border border-[#ede5da]">
                  <span className="text-[#80766b]">{strings.wallet.orderNumberLabel} </span>
                  <span className="font-black text-[#7d1d29] ltr-nums text-sm">{topUpOrderRef}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setTopUpStep(0)}
                  className="w-full rounded-2xl bg-[#7d1d29] py-3.5 text-xs font-black text-white shadow hover:bg-[#681822]"
                >
                  {strings.wallet.backToWallet}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

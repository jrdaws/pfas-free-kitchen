"use client";

import { useState, useEffect } from "react";
import { Download, ExternalLink } from "lucide-react";

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
  receiptUrl?: string;
}

export function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/subscription/invoices");
        if (res.ok) {
          const data = await res.json();
          setInvoices(
            data.map((inv: any) => ({
              ...inv,
              date: new Date(inv.date),
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Billing History</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-2">Billing History</h3>
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      </div>
    );
  }

  const statusColors = {
    paid: "bg-emerald-500/10 text-emerald-600",
    pending: "bg-amber-500/10 text-amber-600",
    failed: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-semibold mb-4">Billing History</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
              <th className="text-left py-2 font-medium text-muted-foreground">Amount</th>
              <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-border last:border-0">
                <td className="py-3">{invoice.date.toLocaleDateString()}</td>
                <td className="py-3">${invoice.amount.toFixed(2)}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[invoice.status]}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.invoiceUrl && (
                      <a
                        href={invoice.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-muted rounded"
                        title="View invoice"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {invoice.receiptUrl && (
                      <a
                        href={invoice.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-muted rounded"
                        title="Download receipt"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


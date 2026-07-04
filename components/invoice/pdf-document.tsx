import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "bold", color: "#534AB7" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  section: { flex: 1 },
  label: { fontSize: 8, color: "#6B6B6B", marginBottom: 2 },
  value: { fontSize: 10, color: "#1A1A1A", marginBottom: 4 },
  table: { marginTop: 16 },
  tableHeader: { flexDirection: "row", backgroundColor: "#FAFAFA", paddingVertical: 6, paddingHorizontal: 8, borderBottom: "0.5px solid #E0E0E0" },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 8, borderBottom: "0.5px solid #E0E0E0" },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colUnit: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colAmount: { flex: 1.5, textAlign: "right" },
  headerText: { fontSize: 8, color: "#A0A0A0" },
  cellText: { fontSize: 9, color: "#1A1A1A" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  totalLabel: { fontSize: 9, color: "#6B6B6B", width: 100, textAlign: "right", marginRight: 8 },
  totalValue: { fontSize: 9, color: "#1A1A1A", width: 100, textAlign: "right" },
  grandTotal: { fontSize: 12, fontWeight: "bold", color: "#1A1A1A" },
  notes: { marginTop: 24, fontSize: 9, color: "#6B6B6B" },
  statusBadge: { fontSize: 8, padding: "2 8", borderRadius: 10, textAlign: "center", width: 60 },
});

type Props = {
  invoice: Record<string, unknown>;
  userData: Record<string, unknown> | null;
};

function formatDateId(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function PDFDocument({ invoice, userData }: Props) {
  const items = invoice.invoice_items as Array<Record<string, unknown>>;
  const client = invoice.clients as Record<string, unknown>;
  const subtotal = Number(invoice.subtotal ?? 0);
  const taxAmount = Number(invoice.tax_amount ?? 0);
  const computedTotal = subtotal + taxAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{String((userData as Record<string, unknown>)?.business_name ?? "Tagihin")}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.section}>
            <Text style={styles.label}>Kepada</Text>
            <Text style={styles.value}>{String(client?.name ?? "")}</Text>
            <Text style={styles.value}>{String(client?.address ?? "")}</Text>
            {client?.npwp ? <Text style={styles.value}>NPWP: {String(client.npwp)}</Text> : null}
          </View>
          <View style={[styles.section, { alignItems: "flex-end" }]}>
            <Text style={styles.value}>{String(invoice.invoice_number)}</Text>
            <Text style={styles.value}>Tanggal: {formatDateId(String(invoice.issue_date))}</Text>
            <Text style={styles.value}>Jatuh tempo: {formatDateId(String(invoice.due_date))}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.headerText]}>Deskripsi</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
            <Text style={[styles.colUnit, styles.headerText]}>Satuan</Text>
            <Text style={[styles.colPrice, styles.headerText]}>Harga</Text>
            <Text style={[styles.colAmount, styles.headerText]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.colDesc, styles.cellText]}>{String(item.description ?? "")}</Text>
              <Text style={[styles.colQty, styles.cellText]}>{String(item.quantity ?? "0")}</Text>
              <Text style={[styles.colUnit, styles.cellText]}>{String(item.unit ?? "")}</Text>
              <Text style={[styles.colPrice, styles.cellText]}>
                {Number(item.unit_price ?? 0).toLocaleString("id-ID")}
              </Text>
              <Text style={[styles.colAmount, styles.cellText]}>
                {Number(item.amount ?? 0).toLocaleString("id-ID")}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{subtotal.toLocaleString("id-ID")}</Text>
          </View>
          {String(invoice.tax_type) !== "none" ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Pajak</Text>
              <Text style={styles.totalValue}>{taxAmount.toLocaleString("id-ID")}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              Rp {computedTotal.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text style={styles.label}>Catatan:</Text>
            <Text>{String(invoice.notes)}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

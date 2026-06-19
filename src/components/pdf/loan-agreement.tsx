import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register font (optional, can use default fonts)
// Font.register({
//   family: 'Inter',
//   src: 'http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf',
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  shopInfo: {
    fontSize: 10,
    color: '#4B5563',
    textAlign: 'right',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    width: '40%',
  },
  value: {
    fontSize: 10,
    color: '#111827',
    width: '60%',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  signatureBox: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: '#111827',
    marginTop: 40,
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 10,
  }
});

export const LoanAgreementPDF = ({ loan, customer, shop, goldItem }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>LOAN AGREEMENT</Text>
          <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 5 }}>Loan Number: {loan?.loan_number}</Text>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>Date: {new Date(loan?.loan_date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.shopInfo}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>{shop?.shop_name || "Suvarna Jewellery"}</Text>
          <Text>Owner: {shop?.owner_name || "Owner"}</Text>
          <Text>Mobile: {shop?.mobile || "N/A"}</Text>
        </View>
      </View>

      {/* Customer Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{customer?.full_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Mobile Number:</Text>
          <Text style={styles.value}>{customer?.mobile_number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{customer?.address || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Aadhaar Number:</Text>
          <Text style={styles.value}>{customer?.aadhaar_number || "N/A"}</Text>
        </View>
      </View>

      {/* Loan Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LOAN DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Loan Amount:</Text>
          <Text style={styles.value}>Rs. {Number(loan?.loan_amount).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Monthly Interest Rate:</Text>
          <Text style={styles.value}>{loan?.interest_rate}% per month</Text>
        </View>
      </View>

      {/* Gold Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PLEDGED GOLD DETAILS</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Item Type:</Text>
          <Text style={styles.value}>{goldItem?.ornament_type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Purity:</Text>
          <Text style={styles.value}>{goldItem?.purity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gross Weight:</Text>
          <Text style={styles.value}>{goldItem?.gross_weight} g</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Net Weight:</Text>
          <Text style={styles.value}>{goldItem?.net_weight} g</Text>
        </View>
      </View>

      {/* Terms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TERMS & CONDITIONS</Text>
        <Text style={{ fontSize: 9, color: '#4B5563', lineHeight: 1.5, textAlign: 'justify' }}>
          1. The borrower agrees to pay the monthly interest as calculated above on or before the due date.
          2. The pledged gold items will be returned only after the full settlement of the principal and accrued interest.
          3. If the borrower fails to pay the interest for 12 consecutive months, the lender reserves the right to auction the pledged items.
          4. The purity and weight of the gold items are certified by the shop owner at the time of pledging.
        </Text>
      </View>

      {/* Signatures */}
      <View style={styles.signatureBox}>
        <View>
          <Text style={styles.signatureLine}>Customer Signature</Text>
        </View>
        <View>
          <Text style={styles.signatureLine}>Authorized Signatory</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer} fixed>
        Generated by SuvarnaLoan ERP • This is a computer-generated document and does not require a physical signature if electronically verified.
      </Text>
    </Page>
  </Document>
);

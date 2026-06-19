import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#F3F4F6',
    padding: 5,
    marginTop: 15,
    marginBottom: 10,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F9FAFB',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 9,
  },
});

export const DailyReportPDF = ({ reportData }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Daily Operations Report</Text>
      <Text style={{ fontSize: 10, marginBottom: 10 }}>Date: {new Date().toLocaleDateString()}</Text>

      {/* Summary */}
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={{ fontSize: 10, marginBottom: 5 }}>New Loans Created: {reportData.daily.loansCreated}</Text>
      <Text style={{ fontSize: 10, marginBottom: 5 }}>Payments Received: {reportData.daily.paymentsReceived}</Text>
      <Text style={{ fontSize: 10, marginBottom: 5 }}>Total Interest Collected (Month): Rs. {reportData.monthly.interestCollection}</Text>

      {/* Loans Table */}
      <Text style={styles.sectionTitle}>Loans Created Today</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Loan Number</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Customer</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Amount (Rs)</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Interest (%)</Text></View>
        </View>
        {reportData.daily.loansData.map((loan: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{loan.loan_number}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{loan.customers?.full_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{loan.loan_amount}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{loan.interest_rate}</Text></View>
          </View>
        ))}
      </View>

      {/* Payments Table */}
      <Text style={styles.sectionTitle}>Payments Received Today</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Loan Number</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Type</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Amount (Rs)</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Method</Text></View>
        </View>
        {reportData.daily.paymentsData.map((payment: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{payment.loans?.loan_number}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{payment.payment_type}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{payment.amount}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{payment.payment_method}</Text></View>
          </View>
        ))}
      </View>

    </Page>
  </Document>
);

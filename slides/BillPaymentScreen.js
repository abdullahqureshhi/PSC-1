import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';

const BillPaymentScreen = ( { navigation }) => {
  const [membershipNumber, setMembershipNumber] = useState('32001');
  const [membershipName, setMembershipName] = useState('Ali Khan Training App');
  const [status, setStatus] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const paymentMethods = [
    { id: 'cash', label: 'Cash Payment', icon: '💵' },
    { id: 'cheque', label: 'Via Cheque', icon: '📧' },
    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
    { id: 'mobile', label: 'Via Mobile App', icon: '📱' },
    { id: 'onebill', label: 'One Bill', icon: '📄' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Membership Number</Text>
            <TextInput
              style={styles.input}
              value={membershipNumber}
              onChangeText={setMembershipNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Membership name</Text>
            <TextInput
              style={styles.input}
              value={membershipName}
              onChangeText={setMembershipName}
            />
          </View>
        </View>

        {/* Bill Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={status}
              onChangeText={setStatus}
              placeholder="Enter status"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Rs. 0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Bill Payment Via Section */}
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>
            Bill Payment Via <Text style={styles.billTopUp}>( Bill/Top up )</Text> Live
          </Text>
          <Text style={styles.selectChannel}>Select channel</Text>

          {/* Payment Methods Grid */}
          <View style={styles.paymentGrid}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedMethod === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.icon}>{method.icon}</Text>
                </View>
                <Text style={styles.methodLabel}>{method.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* E-Payment Procedures Section */}
        <View style={styles.section}>
          <Text style={styles.proceduresTitle}>E - PAYMENT PROCEDURES</Text>
          <Text style={styles.proceduresSubtitle}>Bill Payment</Text>

          <View style={styles.proceduresList}>
            <Text style={styles.procedureItem}>
              • HBL eConnect holders can conveniently conduct payments via Credit Card or Debit Card. All you need to do is a simple log-in to your HBL app on your mobile phone and you can process your payment.
            </Text>
            <Text style={styles.procedureItem}>
              • HBL eConnect user need to add their dropdown menu after your Membership number and amount are selected. Pay and proceed with your payment.
            </Text>
            <Text style={styles.procedureItemHighlight}>
              BILL TOP UP
            </Text>
            <Text style={styles.procedureItem}>
              • You can simply pay your bill using the 'Bill/Top Up' option available in your E-Sahulat or any Micro ATM.
            </Text>
            <Text style={styles.procedureItem}>
              • Navigate to the 'Bill/Top Up' option in your E-Sahulat App.
            </Text>
            <Text style={styles.procedureItem}>
              • Choose HBL Microfinance Bank Limited/NRSP/microfinance/1 bill payment, if both the above options are available.
            </Text>
            <Text style={styles.procedureItem}>
              • Add the company Code, your Membership Code, Phone number and amount.
            </Text>
            <Text style={styles.procedureItem}>
              • After entering the G. press enter. Your Membership name and CNIC will show up and proceed with your payment.
            </Text>
            <Text style={styles.procedureItem}>
              • The amount will be posted to any transaction account.
            </Text>
            <Text style={styles.procedureItem}>
              • It is payable in account without any discount.
            </Text>
            <Text style={styles.procedureItem}>
              • All e-Sahulat fee will be borne from your own bank account slip.
            </Text>
            <Text style={styles.procedureItem}>
              • The deadline for paying PG Bill is 28th of every month where an individual has not paid by the due date.
            </Text>
            <Text style={styles.procedureItem}>
              • Monthly payments will be processed based on the Membership end date. All member login portal at: www.alikhantraining.com
            </Text>
            <Text style={styles.procedureItem}>
              • In case of E-Sahulat non-payment and Terminated members cannot access to gym or do not get access and facilities of the gym. If you have paid your payment but still did not have access to everyone Services Dues incomplete attendance please contact us by addressing a copy of your bill.
            </Text>
            <Text style={styles.procedureItem}>
              • Do not pay any extra amount. In case of any query, please reach out to us.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  billTopUp: {
    color: '#666',
    fontSize: 13,
  },
  selectChannel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fff',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  paymentMethod: {
    width: '33.33%',
    paddingHorizontal: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  paymentMethodSelected: {
    opacity: 0.7,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
  },
  methodLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  proceduresTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  proceduresSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  proceduresList: {
    paddingLeft: 8,
  },
  procedureItem: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  procedureItemHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
});

export default BillPaymentScreen;
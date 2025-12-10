import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Share,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../auth/contexts/AuthContext';

export default function Voucher({ navigation, route }) {
  const { user } = useAuth();
  const { 
    invoiceData: initialInvoiceData, 
    bookingType = 'LAWN', 
    venue, 
    bookingDetails 
  } = route.params || {};
  
  const [invoiceData, setInvoiceData] = useState(initialInvoiceData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    if (invoiceData) {
      console.log('✅ Invoice data loaded:', invoiceData);
    } else {
      Alert.alert('Error', 'No invoice data provided');
      navigation.goBack();
    }
  }, [invoiceData]);

  const handleRefresh = () => {
    setRefreshing(true);
    // You can add logic to refresh invoice data if needed
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMakePayment = () => {
    Alert.alert(
      'Complete Payment',
      `Redirect to payment gateway to complete your ${bookingType.toLowerCase()} booking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed to Payment', 
          onPress: () => {
            // Here you would integrate with your payment gateway
            // For now, simulate payment completion
            Alert.alert(
              'Payment Successful',
              'Your booking has been confirmed!',
              [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
            );
          }
        }
      ]
    );
  };

  const handleShareInvoice = async () => {
    try {
      setShareLoading(true);
      
      if (!invoiceData) {
        Alert.alert('Error', 'No invoice data to share');
        return;
      }

      const bookingSummary = invoiceData.Data?.BookingSummary || {};
      const timeSlotMap = {
        MORNING: 'Morning (8:00 AM - 2:00 PM)',
        EVENING: 'Evening (2:00 PM - 8:00 PM)',
        NIGHT: 'Night (8:00 PM - 12:00 AM)',
      };

      const shareMessage = `
${bookingType === 'LAWN' ? '🏞️ LAWN BOOKING INVOICE' : '🏨 BOOKING INVOICE'}

📋 Invoice Number: ${invoiceData.Data?.InvoiceNumber || 'N/A'}
💳 Amount: Rs. ${invoiceData.Data?.Amount || '0'}/-
📅 Due Date: ${formatDateTime(invoiceData.Data?.DueDate)}

${bookingType === 'LAWN' ? '🏞️ Lawn Information:' : '🏠 Room Information:'}
   • ${bookingType === 'LAWN' ? 'Lawn Name' : 'Room Type'}: ${bookingSummary.LawnName || venue?.description || 'N/A'}
   ${bookingSummary.Category ? `   • Category: ${bookingSummary.Category}` : ''}
   ${bookingSummary.Capacity ? `   • Capacity: ${bookingSummary.Capacity}` : ''}
   ${bookingSummary.BookingDate ? `   • Booking Date: ${formatDate(bookingSummary.BookingDate)}` : ''}
   ${bookingSummary.TimeSlot ? `   • Time Slot: ${timeSlotMap[bookingSummary.TimeSlot] || bookingSummary.TimeSlot}` : ''}
   ${bookingSummary.NumberOfGuests ? `   • Guests: ${bookingSummary.NumberOfGuests}` : ''}
   ${bookingSummary.PricingType ? `   • Pricing Type: ${bookingSummary.PricingType}` : ''}

💳 Payment Details:
   • Total Amount: Rs. ${bookingSummary.TotalAmount || invoiceData.Data?.Amount || '0'}/-
   • Payment Status: PENDING
   • Payment Required: YES

${invoiceData.Data?.Instructions ? `💡 Instructions: ${invoiceData.Data.Instructions}\n` : ''}
📝 Important Information:
   • Complete payment within 3 minutes to confirm your booking
   ${bookingType === 'LAWN' ? '   • Time slots are strictly followed' : '   • Check-in: 2:00 PM | Check-out: 12:00 PM'}
   • Present payment confirmation at reception

Thank you for your booking!
      `.trim();

      await Share.share({
        message: shareMessage,
        title: `Invoice - ${invoiceData.Data?.InvoiceNumber || 'Booking'}`
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Error', 'Failed to share invoice');
    } finally {
      setShareLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = () => {
    return { text: 'PAYMENT PENDING', style: styles.statusPending, icon: 'payment' };
  };

  const statusInfo = getStatusBadge();

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#2E7D32" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {bookingType === 'LAWN' ? 'Lawn Booking Invoice' : 'Booking Invoice'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading your invoice...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#2E7D32" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {bookingType === 'LAWN' ? 'Lawn Booking Invoice' : 'Booking Invoice'}
        </Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <Icon name="refresh" size={24} color={refreshing ? '#ccc' : '#000'} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2E7D32']}
          />
        }
      >
        {invoiceData ? (
          <View style={styles.invoiceContainer}>
            {/* Invoice Header */}
            <View style={styles.invoiceHeader}>
              <Icon 
                name={statusInfo.icon} 
                size={40} 
                color="#2E7D32" 
              />
              <Text style={styles.invoiceTitle}>
                {bookingType === 'LAWN' ? 'LAWN BOOKING INVOICE' : 'BOOKING INVOICE'}
              </Text>
              <Text style={styles.invoiceSubtitle}>
                Complete payment to confirm your reservation
              </Text>
            </View>

            {/* Payment Required Alert */}
            <View style={styles.paymentAlert}>
              <Icon name="payment" size={20} color="#856404" />
              <View style={styles.paymentAlertContent}>
                <Text style={styles.paymentAlertTitle}>Payment Required</Text>
                <Text style={styles.paymentAlertText}>
                  Complete payment within 3 minutes to confirm your booking
                </Text>
                <TouchableOpacity 
                  style={styles.paymentButton}
                  onPress={handleMakePayment}
                >
                  <Text style={styles.paymentButtonText}>Make Payment Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Invoice Details */}
            <View style={styles.invoiceSection}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Invoice Number:</Text>
                <Text style={styles.detailValue}>
                  {invoiceData.Data?.InvoiceNumber || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={[styles.statusBadge, statusInfo.style]}>
                  <Text style={styles.statusText}>{statusInfo.text}</Text>
                </View>
              </View>

              {invoiceData.Data?.DueDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Due:</Text>
                  <Text style={[styles.detailValue, styles.dueDate]}>
                    {formatDateTime(invoiceData.Data.DueDate)}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Issued At:</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(new Date())}
                </Text>
              </View>
            </View>

            {/* Booking Information */}
            <View style={styles.invoiceSection}>
              <Text style={styles.sectionTitle}>
                {bookingType === 'LAWN' ? 'Lawn Information' : 'Booking Information'}
              </Text>
              
              {invoiceData.Data?.BookingSummary && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {bookingType === 'LAWN' ? 'Lawn Name:' : 'Venue:'}
                    </Text>
                    <Text style={styles.detailValue}>
                      {invoiceData.Data.BookingSummary.LawnName}
                    </Text>
                  </View>
                  
                  {invoiceData.Data.BookingSummary.Category && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Category:</Text>
                      <Text style={styles.detailValue}>
                        {invoiceData.Data.BookingSummary.Category}
                      </Text>
                    </View>
                  )}
                  
                  {invoiceData.Data.BookingSummary.BookingDate && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Booking Date:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(invoiceData.Data.BookingSummary.BookingDate)}
                      </Text>
                    </View>
                  )}
                  
                  {invoiceData.Data.BookingSummary.TimeSlot && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Time Slot:</Text>
                      <Text style={styles.detailValue}>
                        {invoiceData.Data.BookingSummary.TimeSlot}
                      </Text>
                    </View>
                  )}
                  
                  {invoiceData.Data.BookingSummary.NumberOfGuests && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Number of Guests:</Text>
                      <Text style={styles.detailValue}>
                        {invoiceData.Data.BookingSummary.NumberOfGuests}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Payment Information */}
            <View style={styles.invoiceSection}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Amount:</Text>
                <Text style={[styles.detailValue, styles.amount]}>
                  Rs. {invoiceData.Data?.Amount || '0'}/-
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status:</Text>
                <View style={[styles.statusBadge, styles.pendingBadge]}>
                  <Text style={styles.statusText}>PENDING</Text>
                </View>
              </View>
            </View>

            {/* Payment Instructions */}
            {invoiceData.Data?.Instructions && (
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>Payment Instructions</Text>
                <Text style={styles.instructionsText}>{invoiceData.Data.Instructions}</Text>
              </View>
            )}

            {/* Payment Channels */}
            {invoiceData.Data?.PaymentChannels && (
              <View style={styles.paymentChannelsSection}>
                <Text style={styles.paymentChannelsTitle}>Available Payment Methods</Text>
                <View style={styles.paymentChannelsList}>
                  {invoiceData.Data.PaymentChannels.map((channel, index) => (
                    <View key={index} style={styles.paymentChannelItem}>
                      <Icon name="payment" size={16} color="#2e7d32" />
                      <Text style={styles.paymentChannelText}>{channel}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* General Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>Important Information</Text>
              {bookingType === 'LAWN' ? (
                <>
                  <View style={styles.instructionItem}>
                    <Icon name="access-time" size={16} color="#2e7d32" />
                    <Text style={styles.instructionText}>
                      Time slots are strictly followed: Morning, Evening, Night
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Icon name="warning" size={16} color="#2e7d32" />
                    <Text style={styles.instructionText}>
                      Complete payment within 3 minutes to avoid cancellation
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.instructionItem}>
                    <Icon name="access-time" size={16} color="#2e7d32" />
                    <Text style={styles.instructionText}>Check-in: 2:00 PM | Check-out: 12:00 PM</Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Icon name="credit-card" size={16} color="#2e7d32" />
                    <Text style={styles.instructionText}>Government ID required at check-in</Text>
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleRefresh}
                disabled={refreshing}
              >
                <Icon name="refresh" size={20} color="#2E7D32" />
                <Text style={styles.secondaryButtonText}>
                  {refreshing ? 'Refreshing...' : 'Refresh Invoice'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={handleShareInvoice}
                disabled={shareLoading}
              >
                <Icon name="share" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>
                  {shareLoading ? 'Sharing...' : 'Share Invoice'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Make Payment Button */}
            <TouchableOpacity 
              style={styles.paymentActionButton}
              onPress={handleMakePayment}
            >
              <Icon name="payment" size={20} color="#fff" />
              <Text style={styles.paymentActionButtonText}>Complete Payment Now</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Icon name="home" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noInvoiceContainer}>
            <Icon name="receipt" size={60} color="#ccc" />
            <Text style={styles.noInvoiceTitle}>Invoice Not Available</Text>
            <Text style={styles.noInvoiceText}>
              Unable to load invoice at this time.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f3eb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  invoiceContainer: {
    padding: 15,
  },
  invoiceHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10,
    marginBottom: 5,
  },
  invoiceSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  paymentAlertContent: {
    flex: 1,
    marginLeft: 10,
  },
  paymentAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  paymentAlertText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 18,
    marginBottom: 10,
  },
  paymentButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  paymentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  invoiceSection: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  dueDate: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  pendingBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
  },
  instructionsSection: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#0d6efd',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d6efd',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#0d6efd',
    lineHeight: 20,
  },
  paymentChannelsSection: {
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  paymentChannelsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  paymentChannelsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentChannelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  paymentChannelText: {
    fontSize: 12,
    color: '#1565c0',
    marginLeft: 6,
  },
  instructions: {
    backgroundColor: '#f0f7ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#1565c0',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2E7D32',
    backgroundColor: 'transparent',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196f3',
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  paymentActionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  noInvoiceContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  noInvoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
  },
  noInvoiceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 5,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
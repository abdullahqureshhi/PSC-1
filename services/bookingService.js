import { api, base_url, getAuthToken } from '../config/apis';

export const bookingService = {
  // Member room booking - returns invoice immediately
  memberBookingRoom: async (roomType, payload) => {
    try {
      const token = await getAuthToken();
      
      console.log('📤 Sending booking payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post(`${base_url}/payment/generate/invoice/room?roomType=${roomType}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      
      console.log('✅ Invoice response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Booking error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get invoice for booking - available immediately after booking
  getInvoice: async (bookingId, numericBookingId = null) => {
    try {
      const token = await getAuthToken();
      
      if (!bookingId) {
        throw new Error('Booking ID is required');
      }

      console.log('🧾 Fetching invoice for booking:', { bookingId, numericBookingId });
      
      // Invoice endpoints (available immediately after booking)
      const endpoints = [
        `/booking/invoice?bookingId=${numericBookingId || bookingId}`,
        `/payment/invoice/${numericBookingId || bookingId}`,
        `/invoice/booking/${numericBookingId || bookingId}`,
        `/booking/get/invoice?bookingId=${numericBookingId || bookingId}`,
        // Fallback to voucher endpoints if invoice not available
        `/booking/voucher?bookingType=ROOM&bookingId=${numericBookingId || bookingId}`,
        `/voucher/booking/${numericBookingId || bookingId}`,
      ].filter(Boolean);

      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying invoice endpoint: ${endpoint}`);
          const response = await api.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
          });

          console.log('✅ Invoice response from', endpoint, ':', response.data);
          
          if (response.data) {
            // Handle array response
            if (Array.isArray(response.data) && response.data.length > 0) {
              return response.data[0];
            }
            // Handle wrapped response
            if (response.data.data) {
              return Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
            }
            // Direct object
            return response.data;
          }
          
        } catch (endpointError) {
          console.log(`❌ Invoice endpoint ${endpoint} failed:`, endpointError.message);
          lastError = endpointError;
          continue;
        }
      }

      throw lastError || new Error('Invoice not found');

    } catch (error) {
      console.error('❌ Invoice fetch error:', error.message);
      throw new Error(error.message || 'Failed to load invoice data');
    }
  },

  // Create local invoice as fallback
  createLocalInvoice: (bookingId, bookingData, roomType, selectedRoom, invoiceNo = null) => {
    console.log('🔄 Creating local invoice as fallback');
    
    const localInvoiceNo = invoiceNo || `INV-${bookingId}-${Date.now()}`;
    
    return {
      invoice_no: localInvoiceNo,
      invoiceNumber: localInvoiceNo,
      bookingId: bookingId,
      roomType: roomType?.name,
      roomNumber: selectedRoom?.roomNumber,
      checkIn: bookingData?.checkIn,
      checkOut: bookingData?.checkOut,
      numberOfAdults: bookingData?.numberOfAdults || 1,
      numberOfChildren: bookingData?.numberOfChildren || 0,
      numberOfRooms: bookingData?.numberOfRooms || 1,
      totalPrice: bookingData?.totalPrice,
      paymentMode: 'PENDING',
      status: 'PENDING_PAYMENT',
      issued_at: new Date().toISOString(),
      issued_by: 'System',
      note: 'This is your booking invoice. Complete payment to confirm your reservation.',
      isLocal: true,
      isInvoice: true
    };
  },

  // Get member bookings
  getMemberBookings: async () => {
    try {
      const token = await getAuthToken();
      const response = await api.get('/booking/get/bookings/all?bookingsFor=rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching member bookings:', error);
      throw error;
    }
  },

  // Update booking
  updateBooking: async (payload) => {
    try {
      const token = await getAuthToken();
      const response = await api.patch('/booking/update/booking', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Delete booking
  deleteBooking: async (bookingId) => {
    try {
      const token = await getAuthToken();
      const response = await api.delete(`/booking/delete/booking?bookingFor=rooms&bookID=${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },
};
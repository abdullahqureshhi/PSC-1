// config/apis.js
import axios from 'axios'
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else {
    return 'http://localhost:3000';
  }
};

const base_url = getBaseUrl();
console.log('Using base URL:', base_url);

const api = axios.create({
  baseURL: base_url,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const API_ENDPOINTS = {
  // Calendar endpoints
  CALENDAR_ROOMS: '/room/calendar',
  CALENDAR_HALLS: '/halls/calendar',
  CALENDAR_LAWNS: '/lawns/calendar',
  CALENDAR_PHOTOSHOOTS: '/photoshoots/calendar',
  
  // Facility endpoints
  HALLS: '/halls',
  LAWNS: '/lawns',
  PHOTOSHOOTS: '/photoshoots',
};

export const calendarApi = {
  // Get rooms for calendar
  getCalendarRooms: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CALENDAR_ROOMS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get halls for calendar
  getCalendarHalls: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CALENDAR_HALLS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get lawns for calendar
  getCalendarLawns: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CALENDAR_LAWNS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get photoshoots for calendar
  getCalendarPhotoshoots: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CALENDAR_PHOTOSHOOTS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all facilities
  getHalls: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.HALLS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLawns: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.LAWNS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPhotoshoots: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PHOTOSHOOTS);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Token management functions
export const storeAuthData = async (tokens, userData) => {
  try {
    await AsyncStorage.setItem('access_token', tokens.access_token);
    await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    console.log('✅ Auth data stored');
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('access_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const getMembershipNumber = async () => {
  try {
    const userData = await getUserData();
    // Try different possible field names for membership number
    return userData?.membershipNo || 
           userData?.membershipNumber || 
           userData?.memberId || 
           userData?.id || 
           '';
  } catch (error) {
    console.error('Error getting membership number:', error);
    return '';
  }
};

export const removeAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_data']);
    console.log('✅ Auth data removed');
  } catch (error) {
    console.error('Error removing auth data:', error);
  }
};

export const checkAuthStatus = async () => {
  try {
    const token = await getAuthToken();
    const userData = await getUserData();
    return {
      isAuthenticated: !!token,
      token: token,
      userData: userData
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false, token: null, userData: null };
  }
};

export const banquetAPI = {
  getAllHalls: async () => {
    try {
      const response = await api.get("/hall/get/halls");
      return response;
    } catch (error) {
      console.error("❌ Error fetching halls:", error.message);
      throw error;
    }
  },

  reserveHalls: async (payload) => {
    try {
      const response = await api.patch(`${base_url}/hall/reserve/halls`, payload);
      return response;
    } catch (error) {
      console.error("❌ Error reserving halls:", error.message);
      throw error;
    }
  },

  getHallReservations: async (hallId) => {
    try {
      const response = await api.get(`${base_url}/hall/reservations/${hallId}`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching reservations:", error.message);
      throw error;
    }
  },

  getHallVoucher: async (bookingId) => {
    try {
      const response = await api.get(`${base_url}/booking/voucher?bookingType=HALL&bookingId=${bookingId}`);
      return response;
    } catch (error) {
      console.error("❌ Error fetching hall voucher:", error.message);
      throw error;
    }
  },

  // UPDATED: Generate invoice with hallId as query parameter and proper payload for both member and guest
  memberBookingHall: async (hallId, payload) => {
    try {
      const token = await getAuthToken();
      
      console.log('🧾 Generating invoice for hall booking:', {
        hallId,
        payload,
        token: token ? 'Present' : 'Missing'
      });

      const headers = {
        'Content-Type': 'application/json',
        "Client-Type": "mobile",
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await api.post(
        `${base_url}/payment/generate/invoice/hall?hallId=${hallId}`,
        payload,
        {
          headers: headers,
          timeout: 30000,
        }
      );
      
      return response;
    } catch (error) {
      console.error("❌ Error member booking hall:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};


// Payment API functions
export const paymentAPI = {
  // Verify payment
  verifyPayment: async (invoiceNumber, transactionId) => {
    try {
      console.log('✅ Verifying payment:', invoiceNumber, transactionId);
      const response = await api.post('/payment/verify', {
        invoiceNumber,
        transactionId,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw error;
    }
  },
};
export const photoshootAPI = {
  // Get all photoshoots
  getAllPhotoshoots: async () => {
    try {
      console.log('🔄 Fetching all photoshoots...');
      const response = await api.get('/photoShoot/get/photoShoots', {
        withCredentials: true,
      });
      console.log('📊 Photoshoots response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching photoshoots:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // Get available photoshoots
  getAvailablePhotoshoots: async () => {
    try {
      console.log('🔄 Fetching available photoshoots...');
      const response = await api.get('/photoShoot/get/photoShoots/available', {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching available photoshoots:', error);
      throw error;
    }
  },

  // Generate invoice for photoshoot
  generateInvoicePhotoshoot: async (photoshootId, bookingData) => {
    try {
      console.log('🧾 Generating invoice for photoshoot:', photoshootId, bookingData);
      const token = getAuthToken()
    const response = await api.post(`${base_url}/payment/generate/invoice/photoshoot?photoshootId=${photoshootId}`,
        bookingData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            "Client-Type": "mobile",
          }
        }
      );
      console.log('✅ Invoice generation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error generating invoice:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

// Helper function for API calls
export const makeApiCall = async (apiFunction, ...args) => {
  try {
    console.log('📞 Making API call:', apiFunction.name);
    const result = await apiFunction(...args);
    console.log('✅ API call successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ API call failed:', error);
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Something went wrong';
    return { 
      success: false, 
      message: errorMessage,
      status: error.response?.status 
    };
  }
}
  
export const lawnAPI = {
  // Get all lawn categories
  getLawnCategories: async () => {
    try {
      console.log('🔄 Fetching lawn categories...');
      const response = await api.get('/lawn/get/lawn/categories');
      return response;
    } catch (error) {
      console.error('❌ Error in getLawnCategories:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get lawns by category ID
  getLawnsByCategory: async (categoryId) => {
    try {
      console.log('🔄 Fetching lawns by category...');
      const response = await api.get(`/lawn/get/lawns/available?catId=${categoryId}`);
      return response;
    } catch (error) {
      console.error('❌ Error in getLawnsByCategory:', error.response?.data || error.message);
      throw error;
    }
  },

  // Generate invoice for lawn booking
  generateInvoiceLawn: async (lawnId, bookingData) => {
    try {
      console.log('🔄 Generating lawn invoice...');
      console.log('📤 Sending to endpoint:', `/payment/generate/invoice/lawn?lawnId=${lawnId}`);
      console.log('📦 Payload:', bookingData);
      
      const token = await getAuthToken();
      console.log('🔑 Auth token available:', !!token);
      
      const response = await api.post(
        `/payment/generate/invoice/lawn?lawnId=${lawnId}`,
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000,
        }
      );
      console.log('✅ Invoice response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error in generateInvoiceLawn:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
      throw error;
    }
  },

  // Complete lawn booking after payment
  memberBookingLawn: async (bookingData) => {
    try {
      console.log('🔄 Completing lawn booking...');
      const token = await getAuthToken();
      
      const response = await api.post(
        '/payment/member/booking/lawn',
        bookingData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000,
        }
      );
      return response;
    } catch (error) {
      console.error('❌ Error in memberBookingLawn:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all available lawns
  getAvailableLawns: async () => {
    try {
      console.log('🔄 Fetching all lawns...');
      const response = await api.get('/lawn/get/lawns');
      return response;
    } catch (error) {
      console.error('❌ Error in getAvailableLawns:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get lawn names by category
  getLawnNames: async (categoryId) => {
    try {
      console.log('🔄 Fetching lawn names...');
      const response = await api.get(`/lawn/get/lawn/categories/names?catId=${categoryId}`);
      return response;
    } catch (error) {
      console.error('❌ Error in getLawnNames:', error.response?.data || error.message);
      throw error;
    }
  },

  // Admin: Reserve/Unreserve lawns (similar to hall reservation)
  reserveLawns: async (payload) => {
    try {
      console.log('🔄 Admin: Reserving/Unreserving lawns...');
      console.log('📤 Payload:', payload);
      
      const token = await getAuthToken();
      
      const response = await api.patch(
        '/lawn/reserve/lawns',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000,
        }
      );
      
      console.log('✅ Reserve response:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error in reserveLawns:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get lawn reservations
  getLawnReservations: async (lawnId) => {
    try {
      console.log('🔄 Fetching lawn reservations...');
      const token = await getAuthToken();
      
      const response = await api.get(
        `/lawn/reservations/${lawnId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response;
    } catch (error) {
      console.error('❌ Error in getLawnReservations:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update lawn details
  updateLawn: async (payload) => {
    try {
      console.log('🔄 Updating lawn...');
      const token = await getAuthToken();
      
      const response = await api.patch(
        '/lawn/update/lawn',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response;
    } catch (error) {
      console.error('❌ Error in updateLawn:', error.response?.data || error.message);
      throw error;
    }
  },
};
// export const lawnAPI = {
//   // Get all lawn categories
//   getLawnCategories: async () => {
//     try {
//       console.log('🔄 Fetching lawn categories...');
//       const response = await api.get(`${base_url}/lawn/get/lawn/categories`);
//       return response;
//     } catch (error) {
//       console.error('❌ Error in getLawnCategories:', error.response?.data || error.message);
//       throw error;
//     }
//   },

//   // Get lawns by category ID
//   getLawnsByCategory: async (categoryId) => {
//     try {
//       console.log('🔄 Fetching lawns by category...');
//       const response = await api.get(`${base_url}/lawn/get/lawns/available?catId=${categoryId}`);
//       return response;
//     } catch (error) {
//       console.error('❌ Error in getLawnsByCategory:', error.response?.data || error.message);
//       throw error;
//     }
//   },

//   // Generate invoice for lawn booking - CORRECTED ENDPOINT
//   generateInvoiceLawn: async (lawnId, bookingData) => {
//     try {
//       console.log('🔄 Generating lawn invoice...');
//       console.log('📤 Sending to endpoint:', `${base_url}/payment/generate/invoice/lawn?lawnId=${lawnId}`);
//       console.log('📦 Payload:', bookingData);
      
//       // Get token for debugging
//       const token = await getAuthToken();
//       console.log('🔑 Auth token available:', !!token);
      
//       const response = await api.post(
//         `${base_url}/payment/generate/invoice/lawn?lawnId=${lawnId}`,
//         bookingData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           timeout: 30000,
//         }
//       );
//       console.log('✅ Invoice response:', response.data);
//       return response;
//     } catch (error) {
//       console.error('❌ Error in generateInvoiceLawn:', {
//         message: error.message,
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         data: error.response?.data,
//         url: error.config?.url,
//       });
//       throw error;
//     }
//   },

//   // Complete lawn booking after payment
//   memberBookingLawn: async (bookingData) => {
//     try {
//       console.log('🔄 Completing lawn booking...');
//       const response = await api.post(
//         `${base_url}/payment/member/booking/lawn`,
//         bookingData,
//         {
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           timeout: 30000,
//         }
//       );
//       return response;
//     } catch (error) {
//       console.error('❌ Error in memberBookingLawn:', error.response?.data || error.message);
//       throw error;
//     }
//   },

//   // Get all available lawns
//   getAvailableLawns: async () => {
//     try {
//       console.log('🔄 Fetching all lawns...');
//       const response = await api.get(`${base_url}/lawn/get/lawns`);
//       return response;
//     } catch (error) {
//       console.error('❌ Error in getAvailableLawns:', error.response?.data || error.message);
//       throw error;
//     }
//   },

//   // Get lawn names by category
//   getLawnNames: async (categoryId) => {
//     try {
//       console.log('🔄 Fetching lawn names...');
//       const response = await api.get(`${base_url}/lawn/get/lawn/categories/names?catId=${categoryId}`);
//       return response;
//     } catch (error) {
//       console.error('❌ Error in getLawnNames:', error.response?.data || error.message);
//       throw error;
//     }
//   },
// };


export const voucherAPI = {
  getVouchers: async (bookingType, bookingId) => {
    try {
      console.log("📨 Fetching vouchers:", bookingType, bookingId);

      const response = await api.get(
        `/booking/voucher?bookingType=${bookingType}&bookingId=${bookingId}`
      );

      return response.data;
    } catch (error) {
      console.error("❌ Voucher API Error:", error.response?.data || error.message);
      throw error;
    }
  },
};

export const getAffiliatedClubs = async () => {
  try {
    const response = await api.get(`${base_url}/affiliation/clubs`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    error.message || 
                    "Failed to fetch affiliated clubs";
    throw new Error(message);
  }
};

// Create visit request
export const createAffiliatedClubRequest = async (requestData) => {
  try {
    const response = await api.post('/affiliation/requests', requestData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    error.message || 
                    "Failed to create request";
    throw new Error(message);
  }
};




export { base_url, api }; 
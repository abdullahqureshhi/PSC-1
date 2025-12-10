import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  format,
  parseISO,
  isSameDay,
  eachDayOfInterval,
  addDays,
  differenceInDays,
  startOfDay,
} from 'date-fns';
import {
  Bed,
  Building,
  TreePalm,
  Camera,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Users,
  AlertTriangle,
  Clock,
} from 'lucide-react-native';
import { useAuth } from '../auth/contexts/AuthContext';
import { api, base_url } from '../config/apis';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const calender = ({ navigation }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFacilityType, setSelectedFacilityType] = useState('ROOMS');
  const [selectedRoomType, setSelectedRoomType] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [daysToShow, setDaysToShow] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'timeline'
  
  // State for data
  const [rooms, setRooms] = useState([]);
  const [halls, setHalls] = useState([]);
  const [lawns, setLawns] = useState([]);
  const [photoshoots, setPhotoshoots] = useState([]);
  
  const { user } = useAuth();

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Define API endpoints based on your configuration
      const endpoints = {
        ROOMS: '/room/calendar',
        HALLS: '/hall/get/halls', // Adjust based on your actual endpoint
        LAWNS: '/lawn/get/lawns', // Adjust based on your actual endpoint
        PHOTOSHOOTS: '/photoShoot/get/photoShoots', // Adjust based on your actual endpoint
      };
      
      // Fetch data based on selected facility type
      const token = await AsyncStorage.getItem('access_token');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      
      // For rooms - calendar data
      if (selectedFacilityType === 'ROOMS') {
        try {
          const response = await api.get('/room/calendar', { headers });
          setRooms(response.data || []);
        } catch (error) {
          console.error('Error fetching rooms:', error);
          setRooms([]);
        }
      }
      
      // For halls
      if (selectedFacilityType === 'HALLS') {
        try {
          const response = await api.get('/hall/get/halls', { headers });
          setHalls(response.data || []);
        } catch (error) {
          console.error('Error fetching halls:', error);
          setHalls([]);
        }
      }
      
      // For lawns
      if (selectedFacilityType === 'LAWNS') {
        try {
          const response = await api.get('/lawn/get/lawns', { headers });
          setLawns(response.data || []);
        } catch (error) {
          console.error('Error fetching lawns:', error);
          setLawns([]);
        }
      }
      
      // For photoshoots
      if (selectedFacilityType === 'PHOTOSHOOTS') {
        try {
          const response = await api.get('/photoShoot/get/photoShoots', { headers });
          setPhotoshoots(response.data || []);
        } catch (error) {
          console.error('Error fetching photoshoots:', error);
          setPhotoshoots([]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedFacilityType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Get current facility data
  const getCurrentFacilities = () => {
    switch (selectedFacilityType) {
      case 'ROOMS':
        return rooms;
      case 'HALLS':
        return halls;
      case 'LAWNS':
        return lawns;
      case 'PHOTOSHOOTS':
        return photoshoots;
      default:
        return [];
    }
  };

  // Filter rooms based on selection
  const filteredRooms = rooms.filter(room => {
    const typeMatch = selectedRoomType === 'ALL' || room.roomType?.type === selectedRoomType;
    const roomMatch = !selectedRoom || room.id.toString() === selectedRoom;
    return typeMatch && roomMatch;
  });

  // Get facilities to display
  const getFacilitiesForDisplay = () => {
    if (selectedFacilityType === 'ROOMS') {
      return filteredRooms;
    }
    return getCurrentFacilities();
  };

  // Generate marked dates for calendar view
  const generateMarkedDates = () => {
    const facilities = getFacilitiesForDisplay();
    const markedDates = {};

    facilities.forEach(facility => {
      // Process bookings
      if (facility.bookings && facility.bookings.length > 0) {
        facility.bookings.forEach(booking => {
          const startDate = parseISO(booking.checkIn || booking.bookingDate || booking.createdAt);
          const endDate = parseISO(booking.checkOut || booking.bookingDate || booking.createdAt);
          
          // If it's a single day booking
          if (booking.bookingDate || booking.createdAt) {
            const dateString = format(startDate, 'yyyy-MM-dd');
            if (!markedDates[dateString]) {
              markedDates[dateString] = {
                dots: [],
                selected: false,
              };
            }
            markedDates[dateString].dots.push({
              key: `booking-${facility.id}-${booking.id}`,
              color: '#3B82F6',
            });
          } else {
            // Multi-day booking for rooms
            const days = eachDayOfInterval({ start: startDate, end: endDate });
            days.forEach(day => {
              const dateString = format(day, 'yyyy-MM-dd');
              if (!markedDates[dateString]) {
                markedDates[dateString] = {
                  dots: [],
                  selected: false,
                };
              }
              markedDates[dateString].dots.push({
                key: `booking-${facility.id}-${booking.id}`,
                color: '#3B82F6',
              });
            });
          }
        });
      }

      // Process reservations
      if (facility.reservations && facility.reservations.length > 0) {
        facility.reservations.forEach(reservation => {
          const startDate = parseISO(reservation.reservedFrom || reservation.startDate);
          const endDate = parseISO(reservation.reservedTo || reservation.endDate);
          
          const days = eachDayOfInterval({ start: startDate, end: endDate });
          days.forEach(day => {
            const dateString = format(day, 'yyyy-MM-dd');
            if (!markedDates[dateString]) {
              markedDates[dateString] = {
                dots: [],
                selected: false,
              };
            }
            markedDates[dateString].dots.push({
              key: `reservation-${facility.id}-${reservation.id}`,
              color: '#F59E0B',
            });
          });
        });
      }

      // Process out of order periods
      if (facility.outOfOrders && facility.outOfOrders.length > 0) {
        facility.outOfOrders.forEach(outOfOrder => {
          const startDate = parseISO(outOfOrder.startDate);
          const endDate = parseISO(outOfOrder.endDate);
          
          const days = eachDayOfInterval({ start: startDate, end: endDate });
          days.forEach(day => {
            const dateString = format(day, 'yyyy-MM-dd');
            if (!markedDates[dateString]) {
              markedDates[dateString] = {
                dots: [],
                selected: false,
              };
            }
            markedDates[dateString].dots.push({
              key: `outoforder-${facility.id}-${outOfOrder.id}`,
              color: '#EF4444',
            });
          });
        });
      }
    });

    return markedDates;
  };

  // Get facility type icon
  const getFacilityTypeIcon = (type) => {
    switch (type) {
      case 'ROOMS':
        return <Bed size={20} color="#3B82F6" />;
      case 'HALLS':
        return <Building size={20} color="#10B981" />;
      case 'LAWNS':
        return <TreePalm size={20} color="#8B5CF6" />;
      case 'PHOTOSHOOTS':
        return <Camera size={20} color="#EC4899" />;
      default:
        return <Bed size={20} color="#3B82F6" />;
    }
  };

  // Get facility name
  const getFacilityName = (facility) => {
    if (selectedFacilityType === 'ROOMS') {
      return `Room ${facility.roomNumber || facility.roomNo || facility.id}`;
    }
    return facility.name || facility.title || `Facility ${facility.id}`;
  };

  // Get facility type display name
  const getFacilityTypeName = (type) => {
    switch (type) {
      case 'ROOMS':
        return 'Rooms';
      case 'HALLS':
        return 'Halls';
      case 'LAWNS':
        return 'Lawns';
      case 'PHOTOSHOOTS':
        return 'Photoshoots';
      default:
        return 'Rooms';
    }
  };

  // Timeline View Component
  const renderTimelineView = () => {
    const facilities = getFacilitiesForDisplay();
    const startDate = new Date(currentDate);
    const dates = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }

    const dayWidth = 80; // Fixed width for each day

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timelineContainer}>
          {/* Header Row - Dates */}
          <View style={styles.timelineHeader}>
            <View style={[styles.timelineCell, { width: 120 }]}>
              <Text style={styles.timelineHeaderText}>Facility</Text>
            </View>
            {dates.map((date, index) => (
              <View
                key={index}
                style={[
                  styles.timelineDateCell,
                  { width: dayWidth },
                  isSameDay(date, new Date()) && styles.todayCell,
                ]}
              >
                <Text style={styles.timelineDateText}>
                  {format(date, 'MMM d')}
                </Text>
                <Text style={styles.timelineDayText}>
                  {format(date, 'EEE')}
                </Text>
              </View>
            ))}
          </View>

          {/* Facility Rows */}
          {facilities.map((facility) => {
            const periods = [];
            const timelineStart = dates[0];
            const timelineEnd = dates[dates.length - 1];

            // Collect bookings
            if (facility.bookings && facility.bookings.length > 0) {
              facility.bookings.forEach((booking) => {
                if (selectedFacilityType === 'ROOMS') {
                  const startDate = parseISO(booking.checkIn);
                  const endDate = parseISO(booking.checkOut);

                  if (endDate >= timelineStart && startDate <= timelineEnd) {
                    periods.push({
                      id: `booking-${booking.id}`,
                      type: 'booking',
                      startDate,
                      endDate,
                      data: booking,
                      color: '#3B82F6',
                    });
                  }
                } else {
                  const bookingDate = parseISO(booking.bookingDate || booking.createdAt);
                  if (bookingDate >= timelineStart && bookingDate <= timelineEnd) {
                    periods.push({
                      id: `booking-${booking.id}`,
                      type: 'booking',
                      startDate: bookingDate,
                      endDate: bookingDate,
                      data: booking,
                      color: '#3B82F6',
                    });
                  }
                }
              });
            }

            // Collect reservations
            if (facility.reservations && facility.reservations.length > 0) {
              facility.reservations.forEach((reservation) => {
                const startDate = parseISO(reservation.reservedFrom);
                const endDate = parseISO(reservation.reservedTo);

                if (endDate >= timelineStart && startDate <= timelineEnd) {
                  periods.push({
                    id: `reservation-${reservation.id}`,
                    type: 'reservation',
                    startDate,
                    endDate,
                    data: reservation,
                    color: '#F59E0B',
                  });
                }
              });
            }

            // Collect out of orders
            if (facility.outOfOrders && facility.outOfOrders.length > 0) {
              facility.outOfOrders.forEach((outOfOrder) => {
                const startDate = parseISO(outOfOrder.startDate);
                const endDate = parseISO(outOfOrder.endDate);

                if (endDate >= timelineStart && startDate <= timelineEnd) {
                  periods.push({
                    id: `outoforder-${outOfOrder.id}`,
                    type: 'outOfOrder',
                    startDate,
                    endDate,
                    data: outOfOrder,
                    color: '#EF4444',
                  });
                }
              });
            }

            return (
              <View key={facility.id} style={styles.timelineRow}>
                <View style={[styles.timelineCell, { width: 120 }]}>
                  <Text style={styles.facilityName}>
                    {getFacilityName(facility)}
                  </Text>
                  {selectedFacilityType === 'ROOMS' && facility.roomType && (
                    <Text style={styles.facilityType}>
                      {facility.roomType.type}
                    </Text>
                  )}
                </View>

                <View style={styles.timelinePeriodsContainer}>
                  {/* Date grid background */}
                  <View style={styles.dateGrid}>
                    {dates.map((date, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dateGridCell,
                          { width: dayWidth },
                          isSameDay(date, new Date()) && styles.todayGridCell,
                        ]}
                      />
                    ))}
                  </View>

                  {/* Period bars */}
                  {periods.map((period) => {
                    const clippedStart = period.startDate < timelineStart ? timelineStart : period.startDate;
                    const clippedEnd = period.endDate > timelineEnd ? timelineEnd : period.endDate;
                    
                    const startOffset = differenceInDays(clippedStart, timelineStart);
                    const duration = differenceInDays(clippedEnd, clippedStart) + 1;
                    
                    const left = Math.max(0, startOffset * dayWidth);
                    const width = Math.max(dayWidth * 0.5, duration * dayWidth);

                    return (
                      <TouchableOpacity
                        key={period.id}
                        style={[
                          styles.periodBar,
                          { backgroundColor: period.color },
                          {
                            left,
                            width,
                            top: period.type === 'booking' ? 8 : 
                                 period.type === 'reservation' ? 16 : 24,
                          },
                        ]}
                        onPress={() => setSelectedPeriod({ period, facility })}
                      >
                        <Text style={styles.periodBarText} numberOfLines={1}>
                          {period.type === 'booking' && (period.data.memberName || period.data.guestName || 'Booking')}
                          {period.type === 'reservation' && (period.data.admin?.name || 'Reserved')}
                          {period.type === 'outOfOrder' && 'Out of Service'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  // Calendar View Component
  const renderCalendarView = () => {
    const markedDates = generateMarkedDates();

    return (
      <View style={styles.calendarContainer}>
        <Calendar
          current={format(currentDate, 'yyyy-MM-dd')}
          onDayPress={(day) => {
            const facilities = getFacilitiesForDisplay();
            const selectedDate = parseISO(day.dateString);
            
            const periodsOnDate = [];
            
            facilities.forEach(facility => {
              // Check bookings
              if (facility.bookings) {
                facility.bookings.forEach(booking => {
                  const startDate = parseISO(booking.checkIn || booking.bookingDate || booking.createdAt);
                  const endDate = parseISO(booking.checkOut || booking.bookingDate || booking.createdAt);
                  
                  if (isSameDay(selectedDate, startDate) || 
                      (booking.checkOut && isSameDay(selectedDate, endDate)) ||
                      (selectedDate >= startDate && selectedDate <= endDate)) {
                    periodsOnDate.push({
                      facility,
                      type: 'booking',
                      data: booking,
                    });
                  }
                });
              }
              
              // Check reservations
              if (facility.reservations) {
                facility.reservations.forEach(reservation => {
                  const startDate = parseISO(reservation.reservedFrom || reservation.startDate);
                  const endDate = parseISO(reservation.reservedTo || reservation.endDate);
                  
                  if (selectedDate >= startDate && selectedDate <= endDate) {
                    periodsOnDate.push({
                      facility,
                      type: 'reservation',
                      data: reservation,
                    });
                  }
                });
              }
              
              // Check out of orders
              if (facility.outOfOrders) {
                facility.outOfOrders.forEach(outOfOrder => {
                  const startDate = parseISO(outOfOrder.startDate);
                  const endDate = parseISO(outOfOrder.endDate);
                  
                  if (selectedDate >= startDate && selectedDate <= endDate) {
                    periodsOnDate.push({
                      facility,
                      type: 'outOfOrder',
                      data: outOfOrder,
                    });
                  }
                });
              }
            });

            if (periodsOnDate.length > 0) {
              setSelectedPeriod({
                date: selectedDate,
                periods: periodsOnDate,
              });
            }
          }}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#6B7280',
            selectedDayBackgroundColor: '#3B82F6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3B82F6',
            dayTextColor: '#374151',
            textDisabledColor: '#D1D5DB',
            dotColor: '#3B82F6',
            selectedDotColor: '#ffffff',
            arrowColor: '#3B82F6',
            monthTextColor: '#111827',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading calendar data...</Text>
      </View>
    );
  }

  const facilities = getFacilitiesForDisplay();
  const roomTypes = [...new Set(rooms.map(room => room.roomType?.type).filter(Boolean))];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Facility Calendar</Text>
          <Text style={styles.headerSubtitle}>
            View bookings, reservations, and maintenance schedules
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Facility Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Facility Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
                {['ROOMS', 'HALLS', 'LAWNS', 'PHOTOSHOOTS'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      selectedFacilityType === type && styles.filterButtonActive,
                    ]}
                    onPress={() => {
                      setSelectedFacilityType(type);
                      setSelectedRoomType('ALL');
                      setSelectedRoom(null);
                    }}
                  >
                    <View style={styles.filterButtonContent}>
                      {getFacilityTypeIcon(type)}
                      <Text
                        style={[
                          styles.filterButtonText,
                          selectedFacilityType === type && styles.filterButtonTextActive,
                        ]}
                      >
                        {getFacilityTypeName(type)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Room-specific filters */}
            {selectedFacilityType === 'ROOMS' && roomTypes.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Room Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      selectedRoomType === 'ALL' && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedRoomType('ALL')}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedRoomType === 'ALL' && styles.filterButtonTextActive,
                      ]}
                    >
                      All Types
                    </Text>
                  </TouchableOpacity>
                  {roomTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterButton,
                        selectedRoomType === type && styles.filterButtonActive,
                      ]}
                      onPress={() => setSelectedRoomType(type)}
                    >
                      <Text
                        style={[
                          styles.filterButtonText,
                          selectedRoomType === type && styles.filterButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'month' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('month')}
          >
            <CalendarIcon size={18} color={viewMode === 'month' ? '#FFFFFF' : '#6B7280'} />
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'month' && styles.viewModeTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'timeline' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('timeline')}
          >
            <Clock size={18} color={viewMode === 'timeline' ? '#FFFFFF' : '#6B7280'} />
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'timeline' && styles.viewModeTextActive,
              ]}
            >
              Timeline ({daysToShow} days)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Days to Show Selector */}
        {viewMode === 'timeline' && (
          <View style={styles.daysSelector}>
            <Text style={styles.daysSelectorLabel}>Days to show:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysButtons}>
              {[7, 14, 30, 60, 90].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.dayButton,
                    daysToShow === days && styles.dayButtonActive,
                  ]}
                  onPress={() => setDaysToShow(days)}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      daysToShow === days && styles.dayButtonTextActive,
                    ]}
                  >
                    {days} days
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Bookings</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Reservations</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Out of Service</Text>
            </View>
          </View>
        </View>

        {/* Navigation for Timeline */}
        {viewMode === 'timeline' && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentDate(addDays(currentDate, -daysToShow))}
            >
              <ChevronLeft size={20} color="#3B82F6" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            
            <View style={styles.dateRangeDisplay}>
              <Text style={styles.dateRangeText}>
                {format(currentDate, 'MMM d, yyyy')} - {format(addDays(currentDate, daysToShow - 1), 'MMM d, yyyy')}
              </Text>
              <TouchableOpacity
                style={styles.todayButton}
                onPress={() => setCurrentDate(new Date())}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentDate(addDays(currentDate, daysToShow))}
            >
              <Text style={styles.navButtonText}>Next</Text>
              <ChevronRight size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        )}

        {/* Calendar/Timeline View */}
        {facilities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CalendarIcon size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              No {getFacilityTypeName(selectedFacilityType).toLowerCase()} found
            </Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters
            </Text>
          </View>
        ) : viewMode === 'month' ? (
          renderCalendarView()
        ) : (
          renderTimelineView()
        )}

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Current Status</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{facilities.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {facilities.filter(f => f.isBooked).length}
              </Text>
              <Text style={styles.statLabel}>Booked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {facilities.filter(f => f.isOutOfOrder).length}
              </Text>
              <Text style={styles.statLabel}>Out of Service</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {facilities.filter(f => !f.isBooked && !f.isOutOfOrder && !f.isReserved).length}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Period Details Modal */}
      <Modal
        visible={!!selectedPeriod}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPeriod(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPeriod?.date 
                  ? format(selectedPeriod.date, 'MMMM d, yyyy')
                  : 'Booking Details'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedPeriod(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedPeriod?.periods ? (
                selectedPeriod.periods.map((period, index) => (
                  <View key={index} style={styles.periodCard}>
                    <View style={styles.periodCardHeader}>
                      <Text style={styles.periodFacilityName}>
                        {getFacilityName(period.facility)}
                      </Text>
                      <View
                        style={[
                          styles.periodBadge,
                          {
                            backgroundColor:
                              period.type === 'booking'
                                ? '#DBEAFE'
                                : period.type === 'reservation'
                                ? '#FEF3C7'
                                : '#FEE2E2',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodBadgeText,
                            {
                              color:
                                period.type === 'booking'
                                  ? '#1E40AF'
                                  : period.type === 'reservation'
                                  ? '#92400E'
                                  : '#991B1B',
                            },
                          ]}
                        >
                          {period.type.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {period.type === 'booking' && (
                      <>
                        {period.data.memberName && (
                          <Text style={styles.periodDetail}>
                            Guest: {period.data.memberName}
                          </Text>
                        )}
                        {period.data.guestName && (
                          <Text style={styles.periodDetail}>
                            Guest: {period.data.guestName}
                          </Text>
                        )}
                        {(period.data.checkIn || period.data.bookingDate) && (
                          <Text style={styles.periodDetail}>
                            Date: {format(
                              parseISO(period.data.checkIn || period.data.bookingDate),
                              'MMM d, yyyy'
                            )}
                            {period.data.checkOut && ` to ${format(
                              parseISO(period.data.checkOut),
                              'MMM d, yyyy'
                            )}`}
                          </Text>
                        )}
                        {period.data.totalPrice && (
                          <Text style={styles.periodDetail}>
                            Amount: PKR {parseInt(period.data.totalPrice).toLocaleString()}
                          </Text>
                        )}
                        {period.data.paymentStatus && (
                          <View style={styles.paymentStatusContainer}>
                            <Text style={styles.periodDetail}>Payment: </Text>
                            <View
                              style={[
                                styles.paymentBadge,
                                {
                                  backgroundColor:
                                    period.data.paymentStatus === 'PAID'
                                      ? '#D1FAE5'
                                      : period.data.paymentStatus === 'UNPAID'
                                      ? '#FEE2E2'
                                      : '#FEF3C7',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.paymentBadgeText,
                                  {
                                    color:
                                      period.data.paymentStatus === 'PAID'
                                        ? '#065F46'
                                        : period.data.paymentStatus === 'UNPAID'
                                        ? '#991B1B'
                                        : '#92400E',
                                  },
                                ]}
                              >
                                {period.data.paymentStatus}
                              </Text>
                            </View>
                          </View>
                        )}
                      </>
                    )}

                    {period.type === 'reservation' && (
                      <>
                        <Text style={styles.periodDetail}>
                          Reserved by: {period.data.admin?.name || 'Admin'}
                        </Text>
                        <Text style={styles.periodDetail}>
                          Period: {format(
                            parseISO(period.data.reservedFrom || period.data.startDate),
                            'MMM d, yyyy'
                          )} - {format(
                            parseISO(period.data.reservedTo || period.data.endDate),
                            'MMM d, yyyy'
                          )}
                        </Text>
                      </>
                    )}

                    {period.type === 'outOfOrder' && (
                      <>
                        <Text style={styles.periodDetail}>
                          Reason: {period.data.reason || 'Maintenance'}
                        </Text>
                        <Text style={styles.periodDetail}>
                          Period: {format(
                            parseISO(period.data.startDate),
                            'MMM d, yyyy'
                          )} - {format(
                            parseISO(period.data.endDate),
                            'MMM d, yyyy'
                          )}
                        </Text>
                      </>
                    )}
                  </View>
                ))
              ) : selectedPeriod?.period && (
                <View style={styles.periodCard}>
                  <View style={styles.periodCardHeader}>
                    <Text style={styles.periodFacilityName}>
                      {getFacilityName(selectedPeriod.facility)}
                    </Text>
                    <View
                      style={[
                        styles.periodBadge,
                        {
                          backgroundColor:
                            selectedPeriod.period.type === 'booking'
                              ? '#DBEAFE'
                              : selectedPeriod.period.type === 'reservation'
                              ? '#FEF3C7'
                              : '#FEE2E2',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.periodBadgeText,
                          {
                            color:
                              selectedPeriod.period.type === 'booking'
                                ? '#1E40AF'
                                : selectedPeriod.period.type === 'reservation'
                                ? '#92400E'
                                : '#991B1B',
                          },
                        ]}
                      >
                        {selectedPeriod.period.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.periodDetail}>
                    Period: {format(
                      selectedPeriod.period.startDate,
                      'MMM d, yyyy'
                    )} - {format(
                      selectedPeriod.period.endDate,
                      'MMM d, yyyy'
                    )}
                  </Text>

                  {selectedPeriod.period.type === 'booking' && selectedPeriod.period.data.memberName && (
                    <Text style={styles.periodDetail}>
                      Guest: {selectedPeriod.period.data.memberName}
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setSelectedPeriod(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'System',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'System',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'System',
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    gap: 8,
  },
  viewModeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  viewModeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: 'System',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  daysSelector: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  daysSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'System',
  },
  daysButtons: {
    flexDirection: 'row',
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  dayButtonActive: {
    backgroundColor: '#3B82F6',
  },
  dayButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'System',
  },
  dayButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'System',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  navButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'System',
  },
  dateRangeDisplay: {
    alignItems: 'center',
  },
  dateRangeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 4,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  todayButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'System',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginTop: 16,
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'System',
  },
  timelineContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  timelineCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  timelineHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'System',
  },
  timelineDateCell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    backgroundColor: '#EFF6FF',
  },
  timelineDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'System',
  },
  timelineDayText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'System',
  },
  timelineRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 60,
  },
  timelinePeriodsContainer: {
    flex: 1,
    position: 'relative',
  },
  dateGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  dateGridCell: {
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
    height: '100%',
  },
  todayGridCell: {
    backgroundColor: '#EFF6FF',
  },
  periodBar: {
    position: 'absolute',
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  periodBarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'System',
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'System',
  },
  facilityType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'System',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'System',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'System',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#6B7280',
    fontFamily: 'System',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  periodCard: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
  },
  periodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodFacilityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    fontFamily: 'System',
  },
  periodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  periodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  periodDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'System',
  },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default calender;
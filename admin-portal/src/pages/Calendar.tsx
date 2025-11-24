import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Bed, Users, AlertTriangle, Clock, CheckCircle, XCircle, Building, TreePalm, Camera, Menu, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getCalendarRooms, getHalls, getLawns, getPhotoshoots } from "../../config/apis";

interface RoomBooking {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  memberName: string;
  paymentStatus: string;
  totalPrice: number;
}

interface RoomReservation {
  id: string;
  roomId: string;
  reservedFrom: string;
  reservedTo: string;
  admin: {
    name: string;
    email: string;
  };
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: {
    type: string;
    priceMember: string;
    priceGuest: string;
  };
  isActive: boolean;
  isOutOfOrder: boolean;
  isReserved: boolean;
  isBooked: boolean;
  outOfOrderFrom?: string;
  outOfOrderTo?: string;
  outOfOrderReason?: string;
  bookings: RoomBooking[];
  reservations: RoomReservation[];
}

interface Hall {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  isOutOfOrder: boolean;
  isBooked: boolean;
  isReserved: boolean;
  outOfOrderFrom?: string;
  outOfOrderTo?: string;
  outOfOrderReason?: string;
  bookings: any[];
  reservations: any[];
}

interface Lawn {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  isOutOfOrder: boolean;
  isBooked: boolean;
  isReserved: boolean;
  outOfOrderFrom?: string;
  outOfOrderTo?: string;
  outOfOrderReason?: string;
  bookings: any[];
  reservations: any[];
}

interface Photoshoot {
  id: string;
  name: string;
  isActive: boolean;
  isOutOfOrder: boolean;
  isBooked: boolean;
  isReserved: boolean;
  outOfOrderFrom?: string;
  outOfOrderTo?: string;
  outOfOrderReason?: string;
  bookings: any[];
  reservations: any[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: any[];
  reservations: any[];
  isOutOfOrder: boolean;
  outOfOrderInfo: Array<{
    facilityName: string;
    reason: string;
    from: string;
    to: string;
  }>;
  isPast: boolean;
  facilityType: string;
}

type FacilityType = "ROOMS" | "HALLS" | "LAWNS" | "PHOTOSHOOTS";

export default function FacilityCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFacilityType, setSelectedFacilityType] = useState<FacilityType>("ROOMS");
  const [selectedRoomType, setSelectedRoomType] = useState("ALL");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Fetch data based on selected facility type
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["calendarRooms"],
    queryFn: getCalendarRooms,
    enabled: selectedFacilityType === "ROOMS",
  });

  const { data: halls = [], isLoading: hallsLoading } = useQuery<Hall[]>({
    queryKey: ["halls"],
    queryFn: getHalls,
    enabled: selectedFacilityType === "HALLS",
  });

  const { data: lawns = [], isLoading: lawnsLoading } = useQuery<Lawn[]>({
    queryKey: ["lawns"],
    queryFn: getLawns,
    enabled: selectedFacilityType === "LAWNS",
  });

  const { data: photoshoots = [], isLoading: photoshootsLoading } = useQuery<Photoshoot[]>({
    queryKey: ["photoshoots"],
    queryFn: getPhotoshoots,
    enabled: selectedFacilityType === "PHOTOSHOOTS",
  });

  const isLoading = roomsLoading || hallsLoading || lawnsLoading || photoshootsLoading;

  // Helper function to get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
      case "UNPAID":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Unpaid</Badge>;
      case "HALF_PAID":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Half Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get current facility data based on selection
  const getCurrentFacilities = () => {
    switch (selectedFacilityType) {
      case "ROOMS":
        return rooms;
      case "HALLS":
        return halls;
      case "LAWNS":
        return lawns;
      case "PHOTOSHOOTS":
        return photoshoots;
      default:
        return [];
    }
  };

  // Filter rooms based on selection (only for rooms)
  const filteredRooms = rooms.filter(room => {
    const typeMatch = selectedRoomType === "ALL" || room.roomType.type === selectedRoomType;
    const roomMatch = !selectedRoom || room.id.toString() === selectedRoom;
    return typeMatch && roomMatch;
  });

  // Get facilities to display in calendar
  const getFacilitiesForCalendar = () => {
    if (selectedFacilityType === "ROOMS") {
      return filteredRooms;
    }
    return getCurrentFacilities();
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const facilities = getFacilitiesForCalendar();

    return days.map(date => {
      const dayBookings: any[] = [];
      const dayReservations: any[] = [];
      const dayOutOfOrderInfo: Array<{
        facilityName: string;
        reason: string;
        from: string;
        to: string;
      }> = [];

      facilities.forEach(facility => {
        // Check bookings for this day
        const facilityBookings = facility.bookings?.filter((booking: any) => {
          if (selectedFacilityType === "ROOMS") {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            return date >= checkIn && date <= checkOut;
          } else {
            // For other facilities, use bookingDate or similar field
            const bookingDate = new Date(booking.bookingDate || booking.createdAt);
            return isSameDay(bookingDate, date);
          }
        }) || [];
        dayBookings.push(...facilityBookings);

        // Check reservations for this day
        const facilityReservations = facility.reservations?.filter((reservation: any) => {
          const reservedFrom = new Date(reservation.reservedFrom);
          return isSameDay(reservedFrom, date);
        }) || [];
        dayReservations.push(...facilityReservations);

        // Check if facility is out of order on this day (current OR scheduled)
        let outOfOrderFrom, outOfOrderTo, outOfOrderReason;

        if (selectedFacilityType === "ROOMS") {
          outOfOrderFrom = facility.outOfOrderFrom;
          outOfOrderTo = facility.outOfOrderTo;
          outOfOrderReason = facility.outOfOrderReason;
        } else {
          outOfOrderFrom = facility.outOfOrderFrom;
          outOfOrderTo = facility.outOfOrderTo;
          outOfOrderReason = facility.outOfOrderReason;
        }

        // Check if facility has out-of-order dates that include this day
        // This includes both current out-of-order AND scheduled future maintenance
        if (outOfOrderFrom && outOfOrderTo) {
          const serviceFrom = new Date(outOfOrderFrom);
          const serviceTo = new Date(outOfOrderTo);

          // Check if the current date falls within the out-of-order period
          if (date >= serviceFrom && date <= serviceTo) {
            // Get facility name based on type
            let facilityName = '';
            if (selectedFacilityType === "ROOMS") {
              facilityName = `Room ${facility.roomNumber}`;
            } else if (selectedFacilityType === "HALLS") {
              facilityName = facility.name;
            } else if (selectedFacilityType === "LAWNS") {
              facilityName = facility.name;
            } else if (selectedFacilityType === "PHOTOSHOOTS") {
              facilityName = facility.name;
            }

            dayOutOfOrderInfo.push({
              facilityName,
              reason: outOfOrderReason || 'Maintenance',
              from: outOfOrderFrom,
              to: outOfOrderTo
            });
          }
        }
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isSameDay(date, new Date()),
        bookings: dayBookings,
        reservations: dayReservations,
        isOutOfOrder: dayOutOfOrderInfo.length > 0,
        outOfOrderInfo: dayOutOfOrderInfo,
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
        facilityType: selectedFacilityType,
      };
    });
  };

  const calendarDays = generateCalendarDays();

  // Calculate statistics
  const stats = {
    available: calendarDays.filter(day =>
      !day.isPast &&
      day.bookings.length === 0 &&
      day.reservations.length === 0 &&
      !day.isOutOfOrder
    ).length,
    booked: calendarDays.filter(day => day.bookings.length > 0).length,
    reserved: calendarDays.filter(day => day.reservations.length > 0).length,
    outOfOrder: calendarDays.filter(day => day.isOutOfOrder).length,
  };

  // Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get status color for day
  const getDayStatusColor = (day: CalendarDay): string => {
    if (day.isPast) return "bg-gray-100 text-gray-400";
    if (day.isOutOfOrder) return "bg-red-50 border-red-200 text-red-800";
    if (day.bookings.length > 0) return "bg-blue-50 border-blue-200 text-blue-800";
    if (day.reservations.length > 0) return "bg-orange-50 border-orange-200 text-orange-800";
    return "bg-green-50 border-green-200 text-green-800";
  };

  // Get status icon for day
  const getDayStatusIcon = (day: CalendarDay) => {
    if (day.isPast) return <Clock className="h-3 w-3 text-gray-400" />;
    if (day.isOutOfOrder) return <XCircle className="h-3 w-3 text-red-500" />;
    if (day.bookings.length > 0) return <Users className="h-3 w-3 text-blue-500" />;
    if (day.reservations.length > 0) return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  };

  // Get status text for day
  const getDayStatusText = (day: CalendarDay): string => {
    if (day.isPast) return "Past Date";
    if (day.isOutOfOrder) return "Out of Service";
    if (day.bookings.length > 0) return `${day.bookings.length} Booking${day.bookings.length > 1 ? 's' : ''}`;
    if (day.reservations.length > 0) return `${day.reservations.length} Reservation${day.reservations.length > 1 ? 's' : ''}`;
    return "Available";
  };

  // Get unique room types for filter (only for rooms)
  const roomTypes = [...new Set(rooms.map(room => room.roomType.type))];

  // Get facility type icon
  const getFacilityTypeIcon = (type: FacilityType) => {
    switch (type) {
      case "ROOMS":
        return <Bed className="h-4 w-4" />;
      case "HALLS":
        return <Building className="h-4 w-4" />;
      case "LAWNS":
        return <TreePalm className="h-4 w-4" />;
      case "PHOTOSHOOTS":
        return <Camera className="h-4 w-4" />;
      default:
        return <Bed className="h-4 w-4" />;
    }
  };

  // Get facility type display name
  const getFacilityTypeName = (type: FacilityType) => {
    switch (type) {
      case "ROOMS":
        return "Rooms";
      case "HALLS":
        return "Halls";
      case "LAWNS":
        return "Lawns";
      case "PHOTOSHOOTS":
        return "Photoshoots";
      default:
        return "Rooms";
    }
  };

  // Reset room-specific filters when facility type changes
  useEffect(() => {
    setSelectedRoomType("ALL");
    setSelectedRoom(null);
  }, [selectedFacilityType]);

  // Mobile Filters Component
  const MobileFilters = () => (
    <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetTitle className="flex items-center justify-between mb-6">
          <span>Filters & Controls</span>
          <Button variant="ghost" size="sm" onClick={() => setIsMobileFiltersOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </SheetTitle>
        <div className="space-y-6">
          {/* Facility Type Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Facility Type</label>
            <Select value={selectedFacilityType} onValueChange={(value: FacilityType) => setSelectedFacilityType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ROOMS">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    <span>Rooms</span>
                  </div>
                </SelectItem>
                <SelectItem value="HALLS">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Halls</span>
                  </div>
                </SelectItem>
                <SelectItem value="LAWNS">
                  <div className="flex items-center gap-2">
                    <TreePalm className="h-4 w-4" />
                    <span>Lawns</span>
                  </div>
                </SelectItem>
                <SelectItem value="PHOTOSHOOTS">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>Photoshoots</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room-specific filters (only show for rooms) */}
          {selectedFacilityType === "ROOMS" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Room Type</label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Room Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Room Types</SelectItem>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Specific Room</label>
                <Select
                  value={selectedRoom || "ALL"}
                  onValueChange={value => setSelectedRoom(value === "ALL" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Rooms</SelectItem>
                    {rooms
                      .filter(room => selectedRoomType === "ALL" || room.roomType.type === selectedRoomType)
                      .map(room => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          Room {room.roomNumber} ({room.roomType.type})
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Calendar Navigation */}
          <div className="space-y-4 pt-4 border-t">
            <label className="text-sm font-medium block">Calendar Navigation</label>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-center text-lg font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
            Facility Availability Calendar
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            View bookings, reservations, and maintenance schedules across all facilities
          </p>
        </div>
      </div>

      {/* Summary Statistics - MOVED TO TOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {stats.available}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Booked</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {stats.booked}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Reserved</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {stats.reserved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Out of Service</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {stats.outOfOrder}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Desktop Filters */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-3 flex-1">
              {/* Facility Type Filter */}
              <Select value={selectedFacilityType} onValueChange={(value: FacilityType) => setSelectedFacilityType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Facility Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROOMS">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      <span>Rooms</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="HALLS">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Halls</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="LAWNS">
                    <div className="flex items-center gap-2">
                      <TreePalm className="h-4 w-4" />
                      <span>Lawns</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PHOTOSHOOTS">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      <span>Photoshoots</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Room-specific filters (only show for rooms) */}
              {selectedFacilityType === "ROOMS" && (
                <>
                  <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Room Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Room Types</SelectItem>
                      {roomTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedRoom || "ALL"}
                    onValueChange={value => setSelectedRoom(value === "ALL" ? null : value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Rooms</SelectItem>
                      {rooms
                        .filter(room => selectedRoomType === "ALL" || room.roomType.type === selectedRoomType)
                        .map(room => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            Room {room.roomNumber} ({room.roomType.type})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Mobile Filters Trigger */}
            <div className="lg:hidden w-full">
              <MobileFilters />
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-normal">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="font-semibold min-w-[140px] text-center text-sm sm:text-base">
                {format(currentDate, "MMM yyyy")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Out of Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Past Date</span>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2 mt-2 sm:mt-0">
              {getFacilityTypeIcon(selectedFacilityType)}
              {getFacilityTypeName(selectedFacilityType)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading {getFacilityTypeName(selectedFacilityType).toLowerCase()} data...
              </div>
            </div>
          ) : (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
                {["S", "M", "T", "W", "T", "F", "S"].map(day => (
                  <div key={day} className="text-center font-medium text-xs sm:text-sm text-muted-foreground py-1 sm:py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] p-1 sm:p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md text-xs sm:text-sm",
                            getDayStatusColor(day),
                            day.isToday && "ring-1 sm:ring-2 ring-blue-500 ring-opacity-50"
                          )}
                          onClick={() => setSelectedDay(day)}
                        >
                          <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                            <span className={cn(
                              "font-medium",
                              day.isToday && "text-blue-600 font-bold"
                            )}>
                              {format(day.date, "d")}
                            </span>
                            <div className="scale-75 sm:scale-100">
                              {getDayStatusIcon(day)}
                            </div>
                          </div>

                          {/* Day Content */}
                          <div className="space-y-0.5 sm:space-y-1">
                            {/* Bookings */}
                            {day.bookings.slice(0, 1).map((booking, idx) => (
                              <div key={idx} className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate text-[10px] sm:text-xs">
                                {selectedFacilityType === "ROOMS" ? "🏨" :
                                  selectedFacilityType === "HALLS" ? "🏛️" :
                                    selectedFacilityType === "LAWNS" ? "🌿" : "📸"}
                                <span className="hidden sm:inline"> {booking.memberName || booking.guestName}</span>
                              </div>
                            ))}

                            {/* Reservations */}
                            {day.reservations.slice(0, 1).map((reservation, idx) => (
                              <div key={idx} className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded truncate text-[10px] sm:text-xs">
                                📋<span className="hidden sm:inline"> {reservation.admin?.name || 'Admin'}</span>
                              </div>
                            ))}

                            {/* Out of Service - Show specific facilities */}
                            {day.outOfOrderInfo.slice(0, 1).map((info, idx) => (
                              <div key={idx} className="bg-red-100 text-red-800 px-1 py-0.5 rounded truncate text-[10px] sm:text-xs">
                                🔧<span className="hidden sm:inline"> {info.facilityName}</span>
                              </div>
                            ))}

                            {/* Count badges for overflow */}
                            {(day.bookings.length > 1 || day.reservations.length > 1 || day.outOfOrderInfo.length > 1) && (
                              <div className="flex gap-0.5">
                                {day.bookings.length > 1 && (
                                  <Badge variant="secondary" className="h-3 text-[8px] sm:text-xs px-1">
                                    +{day.bookings.length - 1}
                                  </Badge>
                                )}
                                {day.reservations.length > 1 && (
                                  <Badge variant="secondary" className="h-3 text-[8px] sm:text-xs px-1">
                                    +{day.reservations.length - 1}
                                  </Badge>
                                )}
                                {day.outOfOrderInfo.length > 1 && (
                                  <Badge variant="secondary" className="h-3 text-[8px] sm:text-xs px-1 bg-red-100 text-red-800">
                                    +{day.outOfOrderInfo.length - 1}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs sm:max-w-sm text-xs sm:text-sm">
                        <div className="space-y-2">
                          <div className="font-semibold">
                            {format(day.date, "EEEE, MMMM d, yyyy")}
                            {day.isToday && <Badge className="ml-2">Today</Badge>}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getDayStatusIcon(day)}
                              <span>{getDayStatusText(day)}</span>
                            </div>

                            {day.bookings.length > 0 && (
                              <div>
                                <div className="font-medium text-blue-700">Bookings:</div>
                                {day.bookings.map((booking, idx) => (
                                  <div key={idx} className="ml-2">
                                    • {booking.memberName || booking.guestName}
                                    {booking.totalPrice && ` (PKR ${booking.totalPrice.toLocaleString()})`}
                                  </div>
                                ))}
                              </div>
                            )}

                            {day.reservations.length > 0 && (
                              <div>
                                <div className="font-medium text-orange-700">Reservations:</div>
                                {day.reservations.map((reservation, idx) => (
                                  <div key={idx} className="ml-2">
                                    • By {reservation.admin?.name || 'Admin'}
                                  </div>
                                ))}
                              </div>
                            )}

                            {day.outOfOrderInfo.length > 0 && (
                              <div>
                                <div className="font-medium text-red-700">Out of Service:</div>
                                {day.outOfOrderInfo.map((info, idx) => (
                                  <div key={idx} className="ml-2">
                                    • {info.facilityName}: {info.reason}
                                    <div className="text-xs text-muted-foreground">
                                      {format(new Date(info.from), "MMM d")} - {format(new Date(info.to), "MMM d, yyyy")}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Day Details Modal */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDay && format(selectedDay.date, "EEEE, MMMM d, yyyy")}
              {selectedDay?.isToday && (
                <Badge variant="default" className="ml-2">
                  Today
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedDay && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={selectedDay.bookings.length > 0 ? "border-blue-200 bg-blue-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Bookings</p>
                        <p className="text-2xl font-bold">{selectedDay.bookings.length}</p>
                      </div>
                      <Users className={`h-8 w-8 ${selectedDay.bookings.length > 0 ? "text-blue-600" : "text-muted-foreground"}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={selectedDay.reservations.length > 0 ? "border-orange-200 bg-orange-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reservations</p>
                        <p className="text-2xl font-bold">{selectedDay.reservations.length}</p>
                      </div>
                      <AlertTriangle className={`h-8 w-8 ${selectedDay.reservations.length > 0 ? "text-orange-600" : "text-muted-foreground"}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={selectedDay.isOutOfOrder ? "border-red-200 bg-red-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Out of Service</p>
                        <p className="text-2xl font-bold">{selectedDay.outOfOrderInfo.length}</p>
                      </div>
                      <XCircle className={`h-8 w-8 ${selectedDay.isOutOfOrder ? "text-red-600" : "text-muted-foreground"}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bookings Section */}
              {selectedDay.bookings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Users className="h-5 w-5" />
                      Bookings ({selectedDay.bookings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedDay.bookings.map((booking, index) => (
                        <div key={index} className="flex items-start justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {booking.memberName || `Member ${booking.Membership_No || 'Unknown'}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedFacilityType === "ROOMS" ? (
                                <>
                                  Check-in: {format(new Date(booking.checkIn), "MMM d, yyyy")} •
                                  Check-out: {format(new Date(booking.checkOut), "MMM d, yyyy")}
                                </>
                              ) : (
                                `Booked for ${format(new Date(booking.bookingDate || booking.createdAt), "MMM d, yyyy")}`
                              )}
                            </div>
                            {booking.totalPrice && (
                              <div className="text-sm font-medium">
                                PKR {parseInt(booking.totalPrice).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={
                              booking.paymentStatus === "PAID" ? "default" :
                                booking.paymentStatus === "UNPAID" ? "destructive" : "secondary"
                            }
                            className={
                              booking.paymentStatus === "PAID" ? "bg-green-100 text-green-800" :
                                booking.paymentStatus === "UNPAID" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {booking.paymentStatus === "PAID" ? "Paid" :
                              booking.paymentStatus === "UNPAID" ? "Unpaid" :
                                booking.paymentStatus === "HALF_PAID" ? "Half Paid" : booking.paymentStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reservations Section */}
              {selectedDay.reservations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertTriangle className="h-5 w-5" />
                      Reservations ({selectedDay.reservations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedDay.reservations.map((reservation, index) => (
                        <div key={index} className="flex items-start justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                          <div className="space-y-1">
                            <div className="font-medium">
                              Reserved by {reservation.admin?.name || 'Admin'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              From: {format(new Date(reservation.reservedFrom), "MMM d, yyyy")} •
                              To: {format(new Date(reservation.reservedTo), "MMM d, yyyy")}
                            </div>
                            {reservation.admin?.email && (
                              <div className="text-sm text-muted-foreground">
                                {reservation.admin.email}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            Admin Reservation
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Out of Service Section */}
              {selectedDay.isOutOfOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <XCircle className="h-5 w-5" />
                      Out of Service Facilities ({selectedDay.outOfOrderInfo.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedDay.outOfOrderInfo.map((info, index) => (
                        <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                          <div className="font-medium text-red-800">
                            {info.facilityName}
                          </div>
                          <div className="text-sm text-red-700 mt-1">
                            {info.reason}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Maintenance Period: {format(new Date(info.from), "MMM d, yyyy")} - {format(new Date(info.to), "MMM d, yyyy")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Activities Message */}
              {selectedDay.bookings.length === 0 && selectedDay.reservations.length === 0 && !selectedDay.isOutOfOrder && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Activities</h3>
                    <p className="text-muted-foreground">
                      There are no bookings, reservations, or maintenance scheduled for this date.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Past Date Warning */}
              {selectedDay.isPast && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">This is a past date</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mockRoomBookings, mockHallBookings, mockLawnBookings, mockPhotoshootBookings } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState("ALL");

  // Combine all bookings
  const allBookings = [
    ...mockRoomBookings.map(b => ({ ...b, type: "Room", facility: `Room ${b.roomNumber}`, bookingDate: b.checkIn.split(' ')[0], checkInDate: b.checkIn, checkOutDate: b.checkOut })),
    ...mockHallBookings.map(b => ({ ...b, type: "Hall", facility: b.hallName, checkInDate: undefined, checkOutDate: undefined })),
    ...mockLawnBookings.map(b => ({ ...b, type: "Lawn", facility: b.lawnName, checkInDate: undefined, checkOutDate: undefined })),
    ...mockPhotoshootBookings.map(b => ({ ...b, type: "Photoshoot", facility: "Studio Session", checkInDate: undefined, checkOutDate: undefined })),
  ];

  // Filter bookings by selected date and type
  const selectedDateStr = date?.toISOString().split('T')[0];
  const filteredBookings = allBookings.filter(b => {
    const matchesDate = b.bookingDate === selectedDateStr;
    const matchesType = filter === "ALL" || b.type === filter;
    return matchesDate && matchesType;
  });

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Room: "bg-blue-500 text-white",
      Hall: "bg-purple-500 text-white",
      Lawn: "bg-green-500 text-white",
      Photoshoot: "bg-orange-500 text-white",
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Booking Calendar</h2>
        <p className="text-muted-foreground">View all bookings across facilities</p>
      </div>

      <div className="flex gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Bookings</SelectItem>
            <SelectItem value="Room">Rooms</SelectItem>
            <SelectItem value="Hall">Halls</SelectItem>
            <SelectItem value="Lawn">Lawns</SelectItem>
            <SelectItem value="Photoshoot">Photoshoot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Bookings for {date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bookings for this date</p>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getTypeBadge(booking.type)}
                        <span className="font-medium">{booking.facility}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Member: {booking.memberName}
                      </p>
                      {booking.checkInDate && booking.checkOutDate && (
                        <p className="text-sm text-muted-foreground">
                          {booking.checkInDate} to {booking.checkOutDate}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">PKR {booking.totalPrice.toLocaleString()}</p>
                      <Badge variant={booking.paymentStatus === "PAID" ? "default" : "secondary"}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

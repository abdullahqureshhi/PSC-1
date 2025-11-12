import { useState } from "react";
import { mockRoomBookings, mockRoomTypes, mockRooms } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function RoomBookings() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);
  const [cancelBooking, setCancelBooking] = useState<any>(null);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [pricingType, setPricingType] = useState("member");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paidAmount, setPaidAmount] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const { toast } = useToast();

  // Calculate price when room type or dates change
  const calculatePrice = (roomType: string, pricing: string, inDate: string, outDate: string) => {
    if (!roomType || !inDate || !outDate) return 0;
    const type = mockRoomTypes.find(t => t.type === roomType);
    if (!type) return 0;
    
    const checkInDate = new Date(inDate);
    const checkOutDate = new Date(outDate);
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return 0;
    const pricePerDay = pricing === "member" ? type.pricePerDayMember : type.pricePerDayGuest;
    return days * pricePerDay;
  };

  const availableRooms = selectedRoomType 
    ? mockRooms.filter(r => r.roomType === selectedRoomType && r.isActive)
    : [];

  const filteredBookings = paymentFilter === "ALL" 
    ? mockRoomBookings 
    : mockRoomBookings.filter(b => b.paymentStatus === paymentFilter);

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "HALF_PAID":
        return <Badge className="bg-warning text-warning-foreground">Half Paid</Badge>;
      case "UNPAID":
        return <Badge variant="destructive">Unpaid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Room Bookings</h2>
          <p className="text-muted-foreground">Manage room reservations</p>
        </div>
        <div className="flex gap-2">
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="HALF_PAID">Half Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setSelectedRoomType(""); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Room Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <Label>Member Name</Label>
                  <Input placeholder="Member name" className="mt-2" />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Select value={selectedRoomType} onValueChange={(val) => {
                    setSelectedRoomType(val);
                    setSelectedRoom("");
                    setCalculatedPrice(calculatePrice(val, pricingType, checkIn, checkOut));
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRoomTypes.map(type => (
                        <SelectItem key={type.id} value={type.type}>{type.type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Room Number</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom} disabled={!selectedRoomType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={selectedRoomType ? "Select room" : "Select type first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map(room => (
                        <SelectItem key={room.id} value={room.roomNumber}>{room.roomNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pricing Type</Label>
                  <Select value={pricingType} onValueChange={(val) => {
                    setPricingType(val);
                    setCalculatedPrice(calculatePrice(selectedRoomType, val, checkIn, checkOut));
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Check-in</Label>
                  <Input type="datetime-local" className="mt-2" value={checkIn} onChange={(e) => {
                    setCheckIn(e.target.value);
                    setCalculatedPrice(calculatePrice(selectedRoomType, pricingType, e.target.value, checkOut));
                  }} />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input type="datetime-local" className="mt-2" value={checkOut} onChange={(e) => {
                    setCheckOut(e.target.value);
                    setCalculatedPrice(calculatePrice(selectedRoomType, pricingType, checkIn, e.target.value));
                  }} />
                </div>
                <div className="md:col-span-2">
                  <Label>Total Price</Label>
                  <Input type="text" className="mt-2 font-bold text-lg" value={`PKR ${calculatedPrice.toLocaleString()}`} disabled />
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                      <SelectItem value="HALF_PAID">Half Paid</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentStatus === "HALF_PAID" && (
                  <>
                    <div>
                      <Label>Paid Amount (PKR)</Label>
                      <Input 
                        type="number" 
                        value={paidAmount || ""} 
                        onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                        className="mt-2"
                        placeholder="Enter paid amount"
                      />
                    </div>
                    <div>
                      <Label>Remaining Amount (PKR)</Label>
                      <Input 
                        type="number" 
                        value={calculatedPrice - paidAmount}
                        className="mt-2"
                        readOnly
                        disabled
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddOpen(false);
                  setSelectedRoomType("");
                  setSelectedRoom("");
                  setCheckIn("");
                  setCheckOut("");
                  setCalculatedPrice(0);
                  setPaymentStatus("UNPAID");
                  setPaidAmount(0);
                }}>Cancel</Button>
                <Button onClick={() => { 
                  toast({ title: "Booking created", description: `Total: PKR ${calculatedPrice.toLocaleString()}` }); 
                  setIsAddOpen(false);
                  setSelectedRoomType("");
                  setSelectedRoom("");
                  setCheckIn("");
                  setCheckOut("");
                  setCalculatedPrice(0);
                  setPaymentStatus("UNPAID");
                  setPaidAmount(0);
                }}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.memberName}</TableCell>
                  <TableCell>{booking.roomNumber}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>PKR {booking.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditBooking(booking)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setCancelBooking(booking)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editBooking} onOpenChange={() => setEditBooking(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>Member Name</Label>
              <Input defaultValue={editBooking?.memberName} className="mt-2" />
            </div>
            <div>
              <Label>Room Type</Label>
              <Select defaultValue={editBooking?.roomType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockRoomTypes.map(type => (
                    <SelectItem key={type.id} value={type.type}>{type.type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Room Number</Label>
              <Input defaultValue={editBooking?.roomNumber} className="mt-2" />
            </div>
            <div>
              <Label>Pricing Type</Label>
              <Select defaultValue={editBooking?.pricingType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Check-in</Label>
              <Input type="datetime-local" defaultValue={editBooking?.checkIn} className="mt-2" />
            </div>
            <div>
              <Label>Check-out</Label>
              <Input type="datetime-local" defaultValue={editBooking?.checkOut} className="mt-2" />
            </div>
            <div>
              <Label>Total Price (PKR)</Label>
              <Input type="number" defaultValue={editBooking?.totalPrice} className="mt-2" />
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select defaultValue={editBooking?.paymentStatus}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="HALF_PAID">Half Paid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editBooking?.paymentStatus === "HALF_PAID" && (
              <>
                <div>
                  <Label>Paid Amount (PKR)</Label>
                  <Input 
                    type="number" 
                    defaultValue={editBooking?.paidAmount || editBooking?.totalPrice / 2} 
                    className="mt-2"
                    onChange={(e) => {
                      const paidAmount = parseFloat(e.target.value) || 0;
                      const remaining = editBooking?.totalPrice - paidAmount;
                      const remainingInput = document.querySelector('[data-remaining]') as HTMLInputElement;
                      if (remainingInput) remainingInput.value = remaining.toString();
                    }}
                  />
                </div>
                <div>
                  <Label>Remaining Amount (PKR)</Label>
                  <Input 
                    type="number" 
                    defaultValue={editBooking?.remainingAmount || editBooking?.totalPrice / 2}
                    className="mt-2"
                    data-remaining
                    readOnly
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBooking(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Booking updated" }); setEditBooking(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!cancelBooking} onOpenChange={() => setCancelBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to cancel this booking for <strong>{cancelBooking?.memberName}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBooking(null)}>No</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Booking cancelled" }); setCancelBooking(null); }}>Cancel Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

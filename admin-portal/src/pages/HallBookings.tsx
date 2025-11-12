import { useState } from "react";
import { mockHallBookings, mockHalls } from "@/lib/mockData";
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

export default function HallBookings() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);
  const [cancelBooking, setCancelBooking] = useState<any>(null);
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedHall, setSelectedHall] = useState("");
  const [pricingType, setPricingType] = useState("member");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paidAmount, setPaidAmount] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const { toast } = useToast();

  const calculateHallPrice = (hallName: string, pricing: string) => {
    const hall = mockHalls.find(h => h.name === hallName);
    if (!hall) return 0;
    return pricing === "member" ? hall.chargesMembers : hall.chargesGuests;
  };

  const filteredBookings = paymentFilter === "ALL" 
    ? mockHallBookings 
    : mockHallBookings.filter(b => b.paymentStatus === paymentFilter);

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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Hall Bookings</h2>
          <p className="text-muted-foreground">Manage event hall reservations</p>
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Hall Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <Label>Member Name</Label>
                  <Input placeholder="Member name" className="mt-2" />
                </div>
                <div>
                  <Label>Hall Name</Label>
                  <Select value={selectedHall} onValueChange={(val) => {
                    setSelectedHall(val);
                    setCalculatedPrice(calculateHallPrice(val, pricingType));
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select hall" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockHalls.filter(h => h.isActive).map(hall => (
                        <SelectItem key={hall.id} value={hall.name}>{hall.name} (Capacity: {hall.capacity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Booking Date</Label>
                  <Input type="date" className="mt-2" />
                </div>
                <div>
                  <Label>Event Type</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mehandi">Mehandi</SelectItem>
                      <SelectItem value="barat">Barat</SelectItem>
                      <SelectItem value="walima">Walima</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Booking Time</Label>
                  <Select defaultValue="EVENING">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">Morning</SelectItem>
                      <SelectItem value="EVENING">Evening</SelectItem>
                      <SelectItem value="NIGHT">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pricing Type</Label>
                  <Select value={pricingType} onValueChange={(val) => {
                    setPricingType(val);
                    setCalculatedPrice(calculateHallPrice(selectedHall, val));
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
                  setSelectedHall("");
                  setCalculatedPrice(0);
                  setPaymentStatus("UNPAID");
                  setPaidAmount(0);
                }}>Cancel</Button>
                <Button onClick={() => { 
                  toast({ title: "Booking created", description: `Total: PKR ${calculatedPrice.toLocaleString()}` }); 
                  setIsAddOpen(false);
                  setSelectedHall("");
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
                <TableHead>Hall</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.memberName}</TableCell>
                  <TableCell>{booking.hallName}</TableCell>
                  <TableCell>{booking.bookingDate}</TableCell>
                  <TableCell>{booking.eventType}</TableCell>
                  <TableCell>{booking.bookingTime}</TableCell>
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

      {/* Edit & Delete Dialogs */}
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
              <Label>Hall Name</Label>
              <Input defaultValue={editBooking?.hallName} className="mt-2" />
            </div>
            <div>
              <Label>Booking Date</Label>
              <Input type="date" defaultValue={editBooking?.bookingDate} className="mt-2" />
            </div>
            <div>
              <Label>Event Type</Label>
              <Input defaultValue={editBooking?.eventType} className="mt-2" />
            </div>
            <div>
              <Label>Booking Time</Label>
              <Select defaultValue={editBooking?.bookingTime}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="EVENING">Evening</SelectItem>
                  <SelectItem value="NIGHT">Night</SelectItem>
                </SelectContent>
              </Select>
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
                      const remainingInput = document.querySelector('[data-remaining-hall]') as HTMLInputElement;
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
                    data-remaining-hall
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

      <Dialog open={!!cancelBooking} onOpenChange={() => setCancelBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to cancel this booking?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBooking(null)}>No</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Booking cancelled" }); setCancelBooking(null); }}>Cancel Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

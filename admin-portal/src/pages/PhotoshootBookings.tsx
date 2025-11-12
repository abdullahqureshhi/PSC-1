import { useState } from "react";
import { mockPhotoshootBookings } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function PhotoshootBookings() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);
  const [deleteBooking, setDeleteBooking] = useState<any>(null);
  const [cancelBooking, setCancelBooking] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pricingType, setPricingType] = useState("member");
  const [paymentStatus, setPaymentStatus] = useState("UNPAID");
  const [paidAmount, setPaidAmount] = useState(0);
  const [hours, setHours] = useState(0);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const { toast } = useToast();

  const calculatePhotoshootPrice = (pricing: string, bookingHours: number) => {
    if (bookingHours <= 0) return 0;
    const pricePerHour = pricing === "member" ? 5000 : 8000;
    return bookingHours * pricePerHour;
  };

  const filteredBookings = statusFilter === "ALL" 
    ? mockPhotoshootBookings 
    : mockPhotoshootBookings.filter(b => b.paymentStatus === statusFilter);

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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Photoshoot Bookings</h2>
          <p className="text-muted-foreground">Manage studio photoshoot sessions</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <DialogTitle>Create Photoshoot Booking</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div>
                  <Label>Member Name</Label>
                  <Input placeholder="Member name" className="mt-2" />
                </div>
                <div>
                  <Label>Booking Date</Label>
                  <Input type="date" className="mt-2" />
                </div>
                <div>
                  <Label>Booking Hours</Label>
                  <Input type="number" placeholder="3" className="mt-2" value={hours || ""} onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    setHours(h);
                    setCalculatedPrice(calculatePhotoshootPrice(pricingType, h));
                  }} />
                </div>
                <div>
                  <Label>Pricing Type</Label>
                  <Select value={pricingType} onValueChange={(val) => {
                    setPricingType(val);
                    setCalculatedPrice(calculatePhotoshootPrice(val, hours));
                  }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member (PKR 5,000/hr)</SelectItem>
                      <SelectItem value="guest">Guest (PKR 8,000/hr)</SelectItem>
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
                  setHours(0);
                  setCalculatedPrice(0);
                  setPaymentStatus("UNPAID");
                  setPaidAmount(0);
                }}>Cancel</Button>
                <Button onClick={() => { 
                  toast({ title: "Booking created", description: `Total: PKR ${calculatedPrice.toLocaleString()}` }); 
                  setIsAddOpen(false);
                  setHours(0);
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
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.memberName}</TableCell>
                  <TableCell>{booking.bookingDate}</TableCell>
                  <TableCell>{booking.bookingHours}h</TableCell>
                  <TableCell>PKR {booking.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditBooking(booking)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteBooking(booking)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-warning hover:text-warning"
                        onClick={() => setCancelBooking(booking)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit, Delete & Cancel Dialogs */}
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
              <Label>Booking Date</Label>
              <Input type="date" defaultValue={editBooking?.bookingDate} className="mt-2" />
            </div>
            <div>
              <Label>Booking Hours</Label>
              <Input type="number" defaultValue={editBooking?.bookingHours} className="mt-2" />
            </div>
            <div>
              <Label>Pricing Type</Label>
              <Select defaultValue={editBooking?.pricingType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member (PKR 5,000/hr)</SelectItem>
                  <SelectItem value="guest">Guest (PKR 8,000/hr)</SelectItem>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBooking(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Booking updated" }); setEditBooking(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteBooking} onOpenChange={() => setDeleteBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this booking?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBooking(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Booking deleted" }); setDeleteBooking(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelBooking} onOpenChange={() => setCancelBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to cancel this booking? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelBooking(null)}>Go Back</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Booking cancelled" }); setCancelBooking(null); }}>Cancel Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

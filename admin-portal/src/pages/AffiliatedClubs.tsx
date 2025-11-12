import { useState } from "react";
import { mockAffiliatedClubRequests } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AffiliatedClubs() {
  const [viewRequest, setViewRequest] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const { toast } = useToast();

  const filteredRequests = mockAffiliatedClubRequests.filter(r => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesType = typeFilter === "ALL" || r.requestType === typeFilter;
    return matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "PENDING":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleApprove = (id: number) => {
    toast({ title: "Request approved successfully" });
  };

  const handleReject = (id: number) => {
    toast({ title: "Request rejected", variant: "destructive" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Affiliated Club Requests</h2>
          <p className="text-muted-foreground">Manage member requests for affiliated club access</p>
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="PERSONAL">Personal</SelectItem>
              <SelectItem value="GUEST">Guest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Membership No</TableHead>
                <TableHead>Club Name</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.memberName}</TableCell>
                  <TableCell>{request.membershipNo}</TableCell>
                  <TableCell>{request.clubName}</TableCell>
                  <TableCell>
                    <Badge variant={request.requestType === "PERSONAL" ? "default" : "secondary"}>
                      {request.requestType}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>{request.guestCount}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setViewRequest(request)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === "PENDING" && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-success hover:text-success"
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Member Name</p>
                <p className="font-medium">{viewRequest?.memberName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membership No</p>
                <p className="font-medium">{viewRequest?.membershipNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Club Name</p>
                <p className="font-medium">{viewRequest?.clubName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Request Type</p>
                <Badge variant={viewRequest?.requestType === "PERSONAL" ? "default" : "secondary"}>
                  {viewRequest?.requestType}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Request Date</p>
                <p className="font-medium">{viewRequest?.requestDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guest Count</p>
                <p className="font-medium">{viewRequest?.guestCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(viewRequest?.status)}
              </div>
            </div>
            {viewRequest?.requestType === "GUEST" && viewRequest?.guestNames && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Guest Names</p>
                <p className="font-medium">{viewRequest?.guestNames}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Purpose</p>
              <p className="font-medium">{viewRequest?.purpose}</p>
            </div>
          </div>
          {viewRequest?.status === "PENDING" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRequest(null)}>Close</Button>
              <Button 
                variant="destructive" 
                onClick={() => { handleReject(viewRequest.id); setViewRequest(null); }}
              >
                Reject
              </Button>
              <Button 
                onClick={() => { handleApprove(viewRequest.id); setViewRequest(null); }}
              >
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

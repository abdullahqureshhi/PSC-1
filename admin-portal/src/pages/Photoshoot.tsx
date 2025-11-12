import { useState } from "react";
import { mockPhotoshoot } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { exportPhotoshootReport } from "@/lib/pdfExport";

export default function Photoshoot() {
  const [editPhotoshoot, setEditPhotoshoot] = useState<any>(null);
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Photoshoot</h2>
          <p className="text-muted-foreground">Configure photoshoot studio settings</p>
        </div>
        <Button variant="outline" onClick={() => exportPhotoshootReport(mockPhotoshoot)} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Member Charges (per hour)</TableHead>
                <TableHead>Guest Charges (per hour)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPhotoshoot.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>PKR {item.memberChargesPerHour.toLocaleString()}</TableCell>
                  <TableCell>PKR {item.guestChargesPerHour.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditPhotoshoot(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editPhotoshoot} onOpenChange={() => setEditPhotoshoot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photoshoot Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Description</Label>
              <Textarea defaultValue={editPhotoshoot?.description} className="mt-2" />
            </div>
            <div>
              <Label>Member Charges Per Hour (PKR)</Label>
              <Input type="number" defaultValue={editPhotoshoot?.memberChargesPerHour} className="mt-2" />
            </div>
            <div>
              <Label>Guest Charges Per Hour (PKR)</Label>
              <Input type="number" defaultValue={editPhotoshoot?.guestChargesPerHour} className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPhotoshoot(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Photoshoot settings updated" }); setEditPhotoshoot(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

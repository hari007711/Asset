// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Settings, Edit3, Shield, FileText, CheckCircle } from "lucide-react";
// import AssetActions from "../AssetActions";

// export interface AssetType {
//   id: string;
//   asset_name: string;
//   category: string;
//   status: string;
//   owner?: string;
//   created_at?: string;
//   updated_at?: string;
//   serial_number?: string;
//   cost?: number;
//   purchase_date?: string;
//   warranty_expiry?: string;
// }

// type QuickActionsCardProps = {
//   asset: AssetType;
//   users: any[];
//   onUpdate: (updated: AssetType) => void;
//   editDialogOpen: boolean;
//   setEditDialogOpen: (open: boolean) => void;
//   editFormData: any;
//   handleEditInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   handleEditSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
//   editMessage?: string;
//   editMessageType?: "success" | "error";
//   editLoading?: boolean;
// };

// export default function QuickActionsCard({
//   asset,
//   users,
//   onUpdate,
//   editDialogOpen,
//   setEditDialogOpen,
//   editFormData,
//   handleEditInputChange,
//   handleEditSubmit,
//   editMessage,
//   editMessageType,
//   editLoading,
// }: QuickActionsCardProps) {
//   return (
//     <Card className="border-slate-200 shadow-sm">
//       <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-200">
//         <CardTitle className="flex items-center gap-2 text-slate-900">
//           <div className="p-1.5 bg-violet-100 rounded-lg">
//             <Settings className="w-4 h-4 text-violet-600" />
//           </div>
//           Quick Actions
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-6">
//         <div className="space-y-4">
//           <Separator className="bg-slate-200" />
//           <div className="grid grid-cols-1 gap-3">
//             <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all"
//                 >
//                   <Edit3 className="w-4 h-4 mr-2" />
//                   Edit Asset Details
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="max-w-lg">
//                 <DialogHeader>
//                   <DialogTitle className="flex items-center gap-2">
//                     <div className="p-1.5 bg-blue-100 rounded-lg">
//                       <Edit3 className="w-4 h-4 text-blue-600" />
//                     </div>
//                     Edit Asset Details
//                   </DialogTitle>
//                   <DialogDescription>
//                     Update the details for{" "}
//                     <span className="font-medium">{asset.asset_name}</span>
//                   </DialogDescription>
//                 </DialogHeader>

//                 <form onSubmit={handleEditSubmit} className="space-y-5">
//                   <div className="space-y-2">
//                     <Label htmlFor="edit_asset_name">Asset Name</Label>
//                     <Input
//                       id="edit_asset_name"
//                       name="asset_name"
//                       value={editFormData.asset_name}
//                       onChange={handleEditInputChange}
//                       placeholder="Enter asset name"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="edit_serial_number">Serial Number</Label>
//                     <Input
//                       id="edit_serial_number"
//                       name="serial_number"
//                       value={editFormData.serial_number}
//                       onChange={handleEditInputChange}
//                       placeholder="Enter serial number"
//                       className="font-mono"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="edit_cost">Cost (₹)</Label>
//                     <Input
//                       id="edit_cost"
//                       name="cost"
//                       type="number"
//                       step="0.01"
//                       value={editFormData.cost}
//                       onChange={handleEditInputChange}
//                       placeholder="Enter cost"
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="edit_purchase_date">Purchase Date</Label>
//                       <Input
//                         id="edit_purchase_date"
//                         name="purchase_date"
//                         type="date"
//                         value={editFormData.purchase_date}
//                         onChange={handleEditInputChange}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="edit_warranty_expiry">
//                         Warranty Expiry
//                       </Label>
//                       <Input
//                         id="edit_warranty_expiry"
//                         name="warranty_expiry"
//                         type="date"
//                         value={editFormData.warranty_expiry}
//                         onChange={handleEditInputChange}
//                       />
//                     </div>
//                   </div>

//                   {editMessage && (
//                     <Alert
//                       variant={
//                         editMessageType === "error" ? "destructive" : "default"
//                       }
//                       className={
//                         editMessageType === "success"
//                           ? "bg-green-50 border-green-200 text-green-800"
//                           : ""
//                       }
//                     >
//                       <AlertDescription>{editMessage}</AlertDescription>
//                     </Alert>
//                   )}

//                   <div className="flex gap-3 pt-2">
//                     <Button
//                       type="submit"
//                       disabled={editLoading}
//                       className="flex-1 bg-blue-600 hover:bg-blue-700"
//                     >
//                       {editLoading ? (
//                         <>
//                           <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
//                           Updating...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle className="w-4 h-4 mr-2" />
//                           Update Asset
//                         </>
//                       )}
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setEditDialogOpen(false)}
//                       disabled={editLoading}
//                       className="hover:bg-slate-50"
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </form>
//               </DialogContent>
//             </Dialog>

//             <Button
//               variant="outline"
//               className="w-full justify-start hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all"
//             >
//               <Shield className="w-4 h-4 mr-2" />
//               View Warranty Details
//             </Button>
//             <Button
//               variant="outline"
//               className="w-full justify-start hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all"
//             >
//               <FileText className="w-4 h-4 mr-2" />
//               Generate Report
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

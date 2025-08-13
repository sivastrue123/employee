import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, EllipsisVertical } from "lucide-react";
const ListingCard = () => {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white w-60 lg:w-72">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Web Development</h3>
          <div className="flex justify-end items-center gap-2">
            <Star className="w-5 h-5 text-slate-500 cursor-pointer" />
            {/* <EllipsisVertical className="w-5 h-5 text-slate-500" /> */}
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Brief description of the project goes here. It should be concise and
          informative.
        </p>
      </CardHeader>

      <CardContent className="space-y-4"></CardContent>
    </Card>
  );
};

export default ListingCard;

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star, EllipsisVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
const ListingCard = () => {
  return (
    <Card className="border-0 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 bg-white w-60 lg:w-72">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Web Development</h3>
          <div className="flex justify-end items-center gap-2">
            <Star className="w-5 h-5 text-slate-500 cursor-pointer" />
            {/* <EllipsisVertical className="w-5 h-5 text-slate-500" /> */}
          </div>
        </div>
        <Badge
          className={`text-xs mt-1 bg-green-100 text-green-800 border-green-200`}
        >
          web
        </Badge>
        <p className="text-sm text-slate-600 mt-1">
          Brief description of the project goes here. It should be concise and
          informative.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <p>Project Completion Status</p>
        <Progress className="!bg-slate-200 !rounded-[4px]" value={50} />
        <div className="flex -space-x-3">
          <img
            className="h-12 w-12 rounded-full ring ring-white"
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3.25&w=256&h=256&q=80"
          />
          <img
            className="h-12 w-12 rounded-full ring ring-white"
            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80"
          />
          <img
            className="h-12 w-12 rounded-full ring ring-white"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80"
          />
          <img
            className="h-12 w-12 rounded-full ring ring-white"
            src="https://images.unsplash.com/photo-1663996806932-357eddab9b50?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300 font-semibold text-white ring ring-white">
            +13
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;


import React from "react";

const DashboardHeader = () => {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">HBL Assignments</h1>
      <p className="text-muted-foreground">
        Track your Home Based Learning assignments and announcements
      </p>
    </div>
  );
};

export default DashboardHeader;

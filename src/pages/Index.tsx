import { useState, useEffect } from "react";
import { Map } from "@/components/Map";
import { Tabs } from "@/components/Tabs";
import { DatePicker } from "@/components/DatePicker";
import { startRealtimeSimulation } from "@/lib/firebase";

const tabs = [
  { id: "realtime", label: "Real-time Location" },
  { id: "history", label: "History" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("realtime");
  const [selectedDate, setSelectedDate] = useState<Date>();

  useEffect(() => {
    // Start the simulation when in development
    if (process.env.NODE_ENV === 'development') {
      const stopSimulation = startRealtimeSimulation();
      return () => stopSimulation();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Location Tracker</h1>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        {activeTab === "history" && (
          <div className="flex justify-end">
            <DatePicker date={selectedDate} onSelect={setSelectedDate} />
          </div>
        )}
        
        <div className="tab-content">
          <Map 
            isHistorical={activeTab === "history"} 
            selectedDate={selectedDate} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
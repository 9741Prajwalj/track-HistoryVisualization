import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, query, orderByChild, equalTo } from 'firebase/database';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCEYJxxFVQeiqaeJoDIrH1QjvMMZb4f6cs",
  authDomain: "realtrack-history.firebaseapp.com",
  databaseURL: "https://realtrack-history-default-rtdb.firebaseio.com",
  projectId: "realtrack-history",
  storageBucket: "realtrack-history.firebasestorage.app",
  messagingSenderId: "358435985724",
  appId: "1:358435985724:web:690bc5da66576a2ccd2639",
  measurementId: "G-1DHJDH6G8K"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to populate dummy data
export const populateDummyData = async () => {
  // Set initial realtime data
  await set(ref(db, 'realtimeData'), {
    latitude: 51.505,
    longitude: -0.09,
    timestamp: new Date().toISOString()
  });

  // Generate dummy historical data for the past 7 days
  const generateDummyPositions = (date: Date) => {
    const positions = [];
    for (let i = 0; i < 10; i++) {
      const time = new Date(date);
      time.setHours(9 + i);
      time.setMinutes(Math.floor(Math.random() * 60));
      
      positions.push({
        timestamp: time.toISOString(),
        latitude: 51.505 + (Math.random() - 0.5) * 0.02,
        longitude: -0.09 + (Math.random() - 0.5) * 0.02
      });
    }
    return positions;
  };

  // Populate historical data for the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    
    const positions = generateDummyPositions(date);
    await set(ref(db, `logs/${dayKey}`), positions);
  }

  console.log('Dummy data populated successfully');
};

// Function to simulate real-time updates (for testing)
export const startRealtimeSimulation = () => {
  const updateInterval = setInterval(() => {
    const newPosition = {
      latitude: 51.505 + (Math.random() - 0.5) * 0.01,
      longitude: -0.09 + (Math.random() - 0.5) * 0.01,
      timestamp: new Date().toISOString()
    };
    
    set(ref(db, 'realtimeData'), newPosition);
  }, 5000); // Update every 5 seconds

  return () => clearInterval(updateInterval);
};

export const subscribeToRealtimeLocation = (callback: (location: { lat: number; lng: number }) => void) => {
  const locationRef = ref(db, 'realtimeData');
  return onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback({ lat: data.latitude, lng: data.longitude });
      console.log('Real-time location update:', data);
    }
  });
};

export const getHistoricalData = async (date: Date) => {
  const dayKey = date.toISOString().split('T')[0];
  const logsRef = ref(db, `logs/${dayKey}`);

  return new Promise((resolve) => {
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const positions = Object.values(data)
          .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map((log: any) => [log.latitude, log.longitude] as [number, number]);
        console.log('Historical data retrieved:', positions);
        resolve(positions);
      } else {
        console.log('No historical data found for date:', dayKey);
        resolve([]);
      }
    }, { onlyOnce: true });
  });
};

// Initialize dummy data if needed
if (process.env.NODE_ENV === 'development') {
  populateDummyData().then(() => {
    console.log('Starting realtime simulation...');
    startRealtimeSimulation();
  });
}
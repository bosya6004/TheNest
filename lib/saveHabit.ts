interface SaveHabitParams {
    habitId: string;
    month: string; // e.g. "2025-03"
    day: string;   // e.g. "14"
    value: boolean;
  }
  
  export async function saveHabit({ habitId, month, day, value }: SaveHabitParams) {
    try {
      const res = await fetch("/api/save-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, month, day, value }),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unknown error while saving habit");
      }
  
      return data;
    } catch (err) {
      console.error("saveHabit error:", err);
      throw err;
    }
  }
  
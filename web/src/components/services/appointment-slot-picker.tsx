"use client";

import { useEffect, useState } from "react";
import type { ServiceType } from "@/types";

interface Props {
  type: ServiceType;
  value: string;
  onChange: (isoDateTime: string) => void;
}

export function AppointmentSlotPicker({ type, value, onChange }: Props) {
  const [schedule, setSchedule] = useState<Array<{ date: string; slots: string[] }>>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    fetch(`/api/services/slots?type=${type}`)
      .then((r) => r.json())
      .then((data) => setSchedule(data.schedule || []));
  }, [type]);

  useEffect(() => {
    if (!selectedDate) return;
    fetch(`/api/services/slots?type=${type}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setAvailableSlots(data.slots || []));
  }, [type, selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      onChange(`${selectedDate}T${selectedTime}:00`);
    }
  }, [selectedDate, selectedTime, onChange]);

  useEffect(() => {
    if (value) {
      const [datePart, timePart] = value.split("T");
      if (datePart) setSelectedDate(datePart);
      if (timePart) setSelectedTime(timePart.slice(0, 5));
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Appointment Date</label>
        <select
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime("");
          }}
          required
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
        >
          <option value="">Select a date</option>
          {schedule.map((day) => (
            <option key={day.date} value={day.date}>
              {new Date(day.date + "T12:00:00").toLocaleDateString("en-ET", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </option>
          ))}
        </select>
      </div>

      {selectedDate && (
        <div>
          <label className="mb-1 block text-sm font-medium">Available Time Slots</label>
          {availableSlots.length === 0 ? (
            <p className="text-sm text-amber-600">No slots available — pick another date.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-lg border px-2 py-2 text-sm transition ${
                    selectedTime === slot
                      ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-800"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <input type="hidden" name="scheduledAt" value={value} required />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";

interface Props {
  bookingId: string;
  onSubmitted?: () => void;
}

export function ServiceReviewForm({ bookingId, onSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/services/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to submit review");
      setLoading(false);
      return;
    }

    setDone(true);
    onSubmitted?.();
    setLoading(false);
  }

  if (done) {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-800">
        Thank you for your review!
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">Rate this service</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Your feedback</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
          rows={3}
          placeholder="How was the service quality, punctuality, and professionalism?"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}

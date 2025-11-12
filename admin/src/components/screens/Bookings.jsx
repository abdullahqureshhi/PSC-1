import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../../../config/apis";
import BookingCard from "../cards/BookingCard";
import BookingModal from "../modals/BookingModal";
import ConfirmModal from "../ui/modals/ConfirmModal";

function Bookings() {
  const queryClient = useQueryClient();

  // ── TOGGLER STATE ───────────────────────────────────────
  const [bookingsFor, setBookingsFor] = useState("rooms");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", bookingsFor], // ← changes on toggle
    queryFn: () => getBookings(bookingsFor),
  });
  // console.log(bookings)

  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [error, setError] = useState("");
  const [confirmData, setConfirmData] = useState(null);

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["bookings", bookingsFor]);
      setShowModal(false);
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["bookings", bookingsFor]);
      queryClient.invalidateQueries({ queryKey: ["availableRooms"] });
      setShowModal(false);
    },
    onError: (err) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(["bookings", bookingsFor]);
      setConfirmData(null);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (data, isNew) => {
    if (isNew) createMutation.mutate(data);
    else updateMutation.mutate(data);
  };

  const handleDelete = (booking) => {
    const entity =
      booking.room?.roomNumber ||
      booking.hall?.name ||
      booking.lawn?.name ||
      booking.photoshoot?.location ||
      "Unknown";

    setConfirmData({
      title: "Delete Booking",
      message: `Are you sure you want to delete booking for "${entity}"?`,
      onConfirm: () => deleteMutation.mutate(booking.id),
    });
  };

  const handleOpenModal = (booking = null) => {
    setEditingBooking(booking);
    setError("");
    setShowModal(true);
  };

  // ── TOGGLE BUTTONS ───────────────────────────────────────
  const toggleOptions = [
    { label: "Room", value: "rooms" },
    { label: "Hall", value: "halls" },
    { label: "Lawn", value: "lawns" },
    { label: "Photoshoot", value: "photoshoots" },
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Header + Toggler */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 border-b border-amber-400/50 pb-4 gap-4">
        <div className="flex gap-2 bg-gray-800 p-1 rounded-full shadow-inner">
          {toggleOptions.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBookingsFor(opt.value )}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                bookingsFor === opt.value
                  ? "bg-amber-400 text-gray-950 shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-x-1 px-4 py-2 bg-amber-400 text-gray-950 font-bold rounded-full shadow-lg hover:bg-amber-500 transition-colors cursor-pointer"
        >
          <CalendarPlus size={14} />
          <p className="text-xs font-medium">Add New Booking</p>
        </motion.button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center p-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2print border-amber-400"></div>
        </div>
      ) : (
        <>
          {/* Booking Cards */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BookingCard
                      booking={booking}
                      onEdit={() => handleOpenModal(booking)}
                      onDelete={() => handleDelete(booking)}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-10 rounded-xl border border-amber-400/50"
                >
                  <p className="text-lg font-sm tracking-wider text-white/70">
                    No {bookingsFor.toLowerCase()} bookings found. Click "Add New Booking" to start!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <BookingModal
            booking={editingBooking}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
            error={error}
            setError={setError}
          />
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <ConfirmModal
        show={!!confirmData}
        title={confirmData?.title}
        message={confirmData?.message}
        onConfirm={confirmData?.onConfirm}
        onCancel={() => setConfirmData(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default Bookings;
/* BookingModal.jsx */
import { useState, useCallback, useEffect, useMemo } from "react";
import AsyncSelect from "react-select/async";
import { motion } from "framer-motion";
import {
  X,
  CalendarPlus,
  Users,
  DollarSign,
  Clock,
  Camera,
  Trees,
  Building,
} from "lucide-react";
import throttle from "lodash/throttle";
import { useQuery } from "@tanstack/react-query";
import {
  searchMembers,
  getRoomTypes,
  getAvailRooms,
  getHallTypes,
  getLawnCategories,
  getAvailableLawns,
  getPhotoshoots,
} from "../../../config/apis";

const selectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    color: "white",
    minHeight: "48px",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1f1f1f",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#f59e0b"
      : state.isFocused
        ? "#2a2a2a"
        : "#1f1f1f",
    color: state.isSelected ? "black" : "white",
    opacity: state.data.isBooked ? 0.6 : 1,
    cursor: state.data.isBooked ? "not-allowed" : "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "white" }),
  placeholder: (base) => ({ ...base, color: "#888" }),
  input: (base) => ({ ...base, color: "white" }),
};

export default function BookingModal({ onClose, onSubmit, error, setError, booking }) {
  const isEdit = !!booking;

  /* ==================== INITIAL FORM ==================== */
  const initialFormData = useMemo(() => {
    if (!isEdit) {
      return {
        membershipNo: "",
        category: "",
        subCategoryId: "",
        entityId: "",
        checkIn: "",
        checkOut: "",
        eventTime: "",
        eventType: "",
        bookingDate: "",
        timeSlot: "",
        photoshootTime: "",
        guestsCount: "",
        totalPrice: "",
        paymentStatus: "UNPAID",
        pricingType: "member",
        paidAmount: "",
        pendingAmount: "",
      };
    }

    const normalizeDate = (date) => (date ? new Date(date).toISOString().split("T")[0] : "");

    // Detect category from booking
    let category = "Room";
    if (booking.hallId) category = "Hall";
    else if (booking.lawnId) category = "Lawn";
    else if (booking.photoshootId) category = "Photoshoot";

    return {
      membershipNo: booking.Membership_No || "",
      category,
      subCategoryId:
        booking.room?.roomType?.id?.toString() ||
        booking.hall?.hallType?.id?.toString() ||
        booking.lawn?.lawnCategory?.id?.toString() ||
        "",
      entityId:
        (booking.roomId || booking.hallId || booking.lawnId || booking.photoshootId)?.toString() || "",
      checkIn: category === "Room" ? normalizeDate(booking.checkIn) : "",
      checkOut: category === "Room" ? normalizeDate(booking.checkOut) : "",
      bookingDate: category !== "Room" ? normalizeDate(booking.bookingDate) : "",
      eventTime: booking.eventTime || "",
      eventType: booking.eventType || "",
      timeSlot: booking.timeSlot || "",
      photoshootTime: booking.photoshootTime || "",
      guestsCount: booking.guestsCount?.toString() || "",
      totalPrice: booking.totalPrice?.toString() || "",
      paymentStatus: booking.paymentStatus || "UNPAID",
      pricingType: booking.pricingType || "member",
      paidAmount: booking.paidAmount?.toString() || "",
      pendingAmount: booking.pendingAmount?.toString() || "",
    };
  }, [isEdit, booking]);

  const [formData, setFormData] = useState(initialFormData);
  const [searchQuery, setSearchQuery] = useState(isEdit ? booking?.Membership_No || "" : "");

  /* ==================== MEMBER SEARCH ==================== */
  const { data: members = [], isFetching: isLoadingMembers } = useQuery({
    queryKey: ["members", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const { data } = await searchMembers(searchQuery.trim());
      return data.map((m) => ({
        label: `${m.Membership_No} - ${m.Name}`,
        value: m.Membership_No,
        sno: m.Sno,
      }));
    },
    enabled: !!searchQuery,
  });

  const loadMembers = useCallback(
    throttle((input, cb) => {
      setSearchQuery(input);
      const filtered = members.filter((o) =>
        o.label.toLowerCase().includes(input.toLowerCase())
      );
      cb(filtered);
    }, 900),
    [members]
  );

  /* ==================== FETCH DATA PER CATEGORY ==================== */
  // Room
  const { data: roomTypes = [] } = useQuery({
    queryKey: ["roomTypes"],
    queryFn: async () => {
      const { data } = await getRoomTypes();
      return data.map((x) => ({ label: x.type, value: x.id }));
    },
    enabled: formData.category === "Room",
  });

  const {
    data: availableRoomsRaw = [],
    isFetching: loadingRooms,
  } = useQuery({
    queryKey: ["availableRooms", formData.subCategoryId],
    queryFn: async () => {
      if (!formData.subCategoryId) return [];
      const { data } = await getAvailRooms(Number(formData.subCategoryId));
      return data;
    },
    enabled: formData.category === "Room" && !!formData.subCategoryId,
  });

  const availableRooms = useMemo(() => {
    return availableRoomsRaw.map((r) => ({
      label: r.roomNumber || "Unnamed",
      value: r.id,
      priceMember: Number(r.roomType.priceMember),
      priceGuest: Number(r.roomType.priceGuest),
      isBooked: r.isBooked,
    }));
  }, [availableRoomsRaw]);

  // Hall
  // Hall
  const { data: hallTypes = [] } = useQuery({
    queryKey: ["hallTypes"],
    queryFn: async () => {
      const { data } = await getHallTypes();          // ← returns full Hall objects
      // console.log("Raw halls:", data);               // ← keep this for debugging
      return data.map((h) => ({
        label: h.name,
        value: h.id,
        priceMember: Number(h.chargesMembers),       // ← ADD THIS
        priceGuest: Number(h.chargesGuests),         // ← ADD THIS
        isBooked: h.isBooked,
      }));
    },
    enabled: formData.category === "Hall",
  });
  // console.log(hallTypes)


  // Lawn
  const { data: lawnCategories = [] } = useQuery({
    queryKey: ["lawnCategories"],
    queryFn: async () => {
      const { data } = await getLawnCategories();
      return data.map((c) => ({ label: c.category, value: c.id }));
    },
    enabled: formData.category === "Lawn",
  });

  const {
    data: availableLawns = [],
    isFetching: loadingLawns,
  } = useQuery({
    queryKey: ["availableLawns", formData.subCategoryId],
    queryFn: async () => {
      if (!formData.subCategoryId) return [];
      const { data } = await getAvailableLawns(formData.subCategoryId);
      return data.map((l) => ({
        label: `${l.description} (${l.minGuests}-${l.maxGuests} guests)`,
        value: l.id,
        memberCharges: Number(l.memberCharges),
        guestCharges: Number(l.guestCharges),
        isBooked: l.isBooked,
      }));
      // return data.filter((l) => l.lawnCategoryId === Number(formData.subCategoryId));
    },
    enabled: formData.category === "Lawn" && !!formData.subCategoryId,
  });

  // Photoshoot
  const {
    data: photoshoots = [],
    isFetching: loadingPhotoshoots,
  } = useQuery({
    queryKey: ["photoshoots"],
    queryFn: async () => {
      const { data } = await getPhotoshoots();
      return data.map((p) => ({
        label: p.description,
        value: p.id,
        priceMember: Number(p.memberCharges),
        priceGuest: Number(p.guestCharges),
        isBooked: p.isBooked,
      }));
    },
    enabled: formData.category === "Photoshoot",
  });

  /* ==================== PRE-SELECTED OPTIONS ==================== */
  const selectedMember = useMemo(() => {
    if (!formData.membershipNo) return null;
    return (
      members.find((m) => m.value === formData.membershipNo) || {
        label: formData.membershipNo,
        value: formData.membershipNo,
      }
    );
  }, [members, formData.membershipNo]);

  const subCategoryOptions = useMemo(() => {
    if (formData.category === "Room") return roomTypes;
    if (formData.category === "Hall") return hallTypes;
    if (formData.category === "Lawn") return lawnCategories;
    return [];
  }, [formData.category, roomTypes, hallTypes, lawnCategories]);

  const entityOptions = useMemo(() => {
    if (formData.category === "Room") return availableRooms;
    if (formData.category === "Hall") return hallTypes;
    if (formData.category === "Lawn") return availableLawns;
    if (formData.category === "Photoshoot") return photoshoots;
    console.log("entity:", availableLawns)
    return [];
  }, [
    formData.category,
    availableRooms,
    hallTypes,
    availableLawns,
    photoshoots,
  ]);

  const selectedSubCategory = useMemo(() => {
    if (!formData.subCategoryId) return null;
    return subCategoryOptions.find((s) => s.value === Number(formData.subCategoryId)) || null;
  }, [subCategoryOptions, formData.subCategoryId]);

  const selectedEntity = useMemo(() => {
    if (!formData.entityId) return null;
    return entityOptions.find((e) => e.value === Number(formData.entityId)) || null;
  }, [entityOptions, formData.entityId]);

  /* ==================== PAID AMOUNT LOGIC ==================== */
  const handlePaidAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const paid = parseFloat(raw) || 0;
    const total = parseFloat(formData.totalPrice) || 0;
    if (paid > total) {
      setError("Paid amount cannot exceed total price.");
      return;
    }
    setError("");
    const pending = (total - paid).toFixed(2);
    setFormData((prev) => ({
      ...prev,
      paidAmount: raw,
      pendingAmount: pending,
      paymentStatus: paid === 0 ? "UNPAID" : paid === total ? "PAID" : "HALF_PAID",
    }));
  };

  useEffect(() => {
    if (formData.paymentStatus !== "HALF_PAID") {
      setFormData((prev) => ({ ...prev, paidAmount: "", pendingAmount: "" }));
    }
  }, [formData.paymentStatus]);

  /* ==================== HANDLERS ==================== */
  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
      subCategoryId: value === "Room" || value === "Lawn" ? "" : null,
      entityId: "",
      checkIn: "",
      checkOut: "",
      bookingDate: "",
      timeSlot: "",
      photoshootTime: "",
      guestsCount: "",
      totalPrice: isEdit ? prev.totalPrice : "",
      pricingType: "member",
      paidAmount: "",
      pendingAmount: "",
    }));
  };

  const handleMemberChange = (opt) => {
    setFormData((prev) => ({ ...prev, membershipNo: opt ? opt.value : "" }));
  };

  const handleSubCategoryChange = (opt) => {
    if (!opt) return;
    setFormData((prev) => ({
      ...prev,
      subCategoryId: prev.category === "Room" || prev.category === "Lawn" ? opt.value : null,
      entityId: "",
      totalPrice: isEdit ? prev.totalPrice : "",
    }));
  };

  const handleEntityChange = (opt) => {
    if (opt && !opt.isBooked) {
      setFormData((prev) => ({
        ...prev,
        entityId: opt.value,
        totalPrice: isEdit ? prev.totalPrice : "",
      }));
    }
  };

  const handleEventTimeChange = (value) => {
    setFormData((prev) => ({ ...prev, eventTime: value, totalPrice: isEdit ? prev.totalPrice : "" }));
  };

  const handleEventTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, eventType: value }));
  };

  const handlePricingTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, pricingType: type, totalPrice: isEdit ? prev.totalPrice : "" }));
  };

  const handlePaymentStatusChange = (status) => {
    const total = parseFloat(formData.totalPrice) || 0;
    setFormData((prev) => ({
      ...prev,
      paymentStatus: status,
      paidAmount: status === "PAID" ? total.toString() : "",
      pendingAmount: status === "PAID" ? "0.00" : "",
    }));
  };

  const handleCheckInChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      checkIn: value,
      checkOut: prev.checkOut && new Date(prev.checkOut) < new Date(value) ? "" : prev.checkOut,
      totalPrice: isEdit ? prev.totalPrice : "",
    }));
  };

  const handleCheckOutChange = (e) => {
    setFormData((prev) => ({ ...prev, checkOut: e.target.value, totalPrice: isEdit ? prev.totalPrice : "" }));
  };

  const handleBookingDateChange = (e) => {
    setFormData((prev) => ({ ...prev, bookingDate: e.target.value, totalPrice: isEdit ? prev.totalPrice : "" }));
  };

  const handleGuestsCountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setFormData((prev) => ({ ...prev, guestsCount: val }));
  };

  /* ==================== AUTO PRICE CALCULATION ==================== */
  useEffect(() => {
    // console.log(formData)
    if (!formData.entityId) return;

    const entity = entityOptions.find((e) => e.value === Number(formData.entityId));
    if (!entity) return;

    let total = 0;

    if (formData.category === "Room") {
      if (!formData.checkIn || !formData.checkOut) return;
      const nights = Math.max(
        1,
        Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))
      );
      const rate = formData.pricingType === "guest" ? entity.priceGuest : entity.priceMember;
      total = rate * nights;
    } else if (formData.category === "Hall") {
      // console.log("asd")
      if (!formData.bookingDate) return;
      const rate = formData.pricingType === "guest" ? entity.priceGuest : entity.priceMember;
      total = rate;
      // console.log(total)
    } else if (formData.category === "Lawn") {
      if (!formData.bookingDate || !formData.guestsCount) return;
      const guests = Number(formData.guestsCount);
      const rate = formData.pricingType === "guest" ? entity.guestCharges : entity.memberCharges;
      total = rate;
    } else if (formData.category === "Photoshoot") {
      if (!formData.photoshootTime) return;
      const hours = parseFloat(formData.photoshootTime) || 0;
      const rate = formData.pricingType === "guest" ? entity.priceGuest : entity.priceMember;
      total = rate * hours;
    }

    const totalStr = total.toFixed(2);
    setFormData((prev) => {
      const prevPaid = parseFloat(prev.paidAmount) || 0;
      let newPaid = prevPaid;
      if (prev.paymentStatus === "PAID") newPaid = total;
      const pending = (total - newPaid).toFixed(2);
      return {
        ...prev,
        totalPrice: totalStr,
        paidAmount: newPaid.toString(),
        pendingAmount: pending,
        paymentStatus:
          newPaid === 0 ? "UNPAID" : newPaid === total ? "PAID" : "HALF_PAID",
      };
    });
  }, [
    formData.category,
    formData.entityId,
    formData.checkIn,
    formData.checkOut,
    formData.bookingDate,
    formData.guestsCount,
    formData.photoshootTime,
    formData.pricingType,
    entityOptions,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const required = [formData.membershipNo, formData.category, formData.entityId];

    if (formData.category === "Room") {
      required.push(formData.subCategoryId, formData.checkIn, formData.checkOut);
    } else if (formData.category === "Lawn") {
      required.push(formData.subCategoryId, formData.bookingDate, formData.guestsCount);
    } else if (formData.category === "Hall") {
      required.push(formData.bookingDate, formData.eventTime, formData.eventType);
    } else if (formData.category === "Photoshoot") {
      required.push(formData.bookingDate, formData.photoshootTime);
    }

    if (formData.paymentStatus === "HALF_PAID" && !formData.paidAmount) {
      setError("Please enter paid amount for half-paid booking.");
      return;
    }

    if (required.some((x) => !x)) {
      setError("Please fill all required fields.");
      return;
    }

    const payload = {
      id: isEdit ? booking.id : undefined,
      membershipNo: formData.membershipNo,
      category: formData.category,
      subCategoryId: formData.subCategoryId ? Number(formData.subCategoryId) : null,
      entityId: Number(formData.entityId),
      checkIn: formData.checkIn || null,
      checkOut: formData.checkOut || null,
      bookingDate: formData.bookingDate || null,
      eventTime: formData.eventTime || null,
      eventType: formData.eventType || null,
      timeSlot: formData.timeSlot || null,
      photoshootTime: formData.photoshootTime || null,
      guestsCount: formData.guestsCount ? Number(formData.guestsCount) : null,
      totalPrice: Number(formData.totalPrice),
      paymentStatus: formData.paymentStatus,
      pricingType: formData.pricingType,
      paidAmount: Number(formData.paidAmount) || 0,
      pendingAmount: Number(formData.pendingAmount) || 0,
      paymentMode: "CASH",
    };

    onSubmit(payload, !isEdit);
  };

  /* ==================== UI ==================== */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        className="bg-gray-900 border border-amber-400/30 rounded-xl w-full max-w-5xl max-h-[85vh] flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-4 flex justify-between items-center border-b border-amber-400/20 bg-gray-900">
          <h2 className="text-2xl text-amber-400 font-bold flex items-center gap-2">
            <CalendarPlus size={20} /> {isEdit ? "Edit" : "New"} Booking
          </h2>
          <button onClick={onClose} className="text-amber-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ROW 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-amber-400 text-sm font-medium mb-1 block">
                Member <span className="text-red-500">*</span>
              </label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadMembers}
                onChange={handleMemberChange}
                placeholder="Search member..."
                styles={selectStyles}
                isClearable
                isLoading={isLoadingMembers}
                value={selectedMember}
                noOptionsMessage={() =>
                  searchQuery ? "No members found" : "Type to search..."
                }
              />
            </div>

            <div>
              <label className="text-amber-400 text-sm font-medium mb-1 block">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="Room">Room</option>
                <option value="Hall">Hall</option>
                <option value="Lawn">Lawn</option>
                <option value="Photoshoot">Photoshoot</option>
              </select>
            </div>
          </div>

          {/* ROW 2 - SUBCATEGORY & ENTITY */}
          {formData.category && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subcategory: Only for Room & Lawn */}
              {(formData.category === "Room" || formData.category === "Lawn") && (
                <div>
                  <label className="text-amber-400 text-sm font-medium mb-1 block">
                    {formData.category === "Room" ? "Room Type" : "Lawn Category"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <AsyncSelect
                    key={`subcat-${formData.category}-${formData.subCategoryId}`}
                    cacheOptions
                    defaultOptions={subCategoryOptions}
                    loadOptions={() => Promise.resolve(subCategoryOptions)}
                    onChange={handleSubCategoryChange}
                    placeholder="Select..."
                    styles={selectStyles}
                    isClearable
                    value={selectedSubCategory}
                    isLoading={
                      formData.category === "Room"
                        ? roomTypes.length === 0
                        : lawnCategories.length === 0
                    }
                  />
                </div>
              )}

              {/* Entity: Always show */}
              {console.log(entityOptions)}
              <div>
                <label className="text-amber-400 text-sm font-medium mb-1 block">
                  {formData.category} <span className="text-red-500">*</span>
                </label>
                <AsyncSelect
                  key={`entity-${formData.category}-${formData.entityId}`}
                  cacheOptions
                  defaultOptions={entityOptions}
                  loadOptions={() => Promise.resolve(entityOptions)}
                  onChange={handleEntityChange}
                  placeholder="Select..."
                  styles={selectStyles}
                  isClearable
                  value={selectedEntity}
                  isLoading={
                    formData.category === "Room"
                      ? loadingRooms
                      : formData.category === "Lawn"
                        ? loadingLawns
                        : formData.category === "Hall"
                          ? hallTypes.length === 0
                          : loadingPhotoshoots
                  }
                  isOptionDisabled={(opt) => opt.isBooked}
                />
              </div>
            </div>
          )}
          {formData.category === "Hall" && <div>



          </div>}

          {/* ROW 3 - DATES / TIME / GUESTS */}
          {formData.category === "Room" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-amber-400 text-sm font-medium mb-1 block">
                  Check-In <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.checkIn}
                  onChange={handleCheckInChange}
                />
              </div>
              <div>
                <label className="text-amber-400 text-sm font-medium mb-1 block">
                  Check-Out <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                  min={formData.checkIn || new Date().toISOString().split("T")[0]}
                  value={formData.checkOut}
                  onChange={handleCheckOutChange}
                />
              </div>
            </div>
          )}

          {formData.category !== "Room" && (
            <div className="space-y-6">
              {/* Booking Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-amber-400 text-sm font-medium mb-1 block">
                    Booking Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.bookingDate}
                    onChange={handleBookingDateChange}
                  />
                </div>

                {/* Event Time & Type - Only for Hall */}
                {formData.category === "Hall" && (
                  <>
                    <div>
                      <label className="text-amber-400 text-sm font-medium mb-1 block">
                        Event Time <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                        value={formData.eventTime}
                        onChange={(e) => handleEventTimeChange(e.target.value)}
                      >
                        <option value="">Select Time</option>
                        <option value="morning-hitea">Morning - Hi-Tea</option>
                        <option value="evening-lunch">Evening - Lunch</option>
                        <option value="night-dinner">Night - Dinner</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-amber-400 text-sm font-medium mb-1 block">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                        value={formData.eventType}
                        onChange={(e) => handleEventTypeChange(e.target.value)}
                      >
                        <option value="">Select Type</option>
                        <option value="mehandi">Mehandi</option>
                        <option value="barat">Barat</option>
                        <option value="walima">Walima</option>
                        <option value="birthday">Birthday</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Lawn & Photoshoot fields */}
                {formData.category === "Lawn" && (
                  <div>
                    <label className="text-amber-400 text-sm font-medium mb-1 block">
                      Guests Count <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. 150"
                      value={formData.guestsCount}
                      onChange={handleGuestsCountChange}
                    />
                  </div>
                )}
                {formData.category === "Photoshoot" && (
                  <div>
                    <label className="text-amber-400 text-sm font-medium mb-1 block">
                      Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                      placeholder="e.g. 2.5"
                      value={formData.photoshootTime}
                      onChange={(e) =>
                        setFormData({ ...formData, photoshootTime: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRICING & PAYMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-amber-400 text-sm font-medium mb-1 block">Pricing Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handlePricingTypeChange("member")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${formData.pricingType === "member"
                    ? "bg-amber-400 text-black"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => handlePricingTypeChange("guest")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${formData.pricingType === "guest"
                    ? "bg-amber-400 text-black"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                    }`}
                >
                  Guest
                </button>
              </div>
            </div>

            <div>
              <label className="text-amber-400 text-sm font-medium mb-1 block">Payment Status</label>
              <div className="flex gap-2">
                {["UNPAID", "HALF_PAID", "PAID"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handlePaymentStatusChange(status)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${formData.paymentStatus === status
                      ? "bg-amber-400 text-black"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                      }`}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HALF-PAID */}
          {formData.paymentStatus === "HALF_PAID" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-amber-400 text-sm font-medium mb-1 block">
                  Paid Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700 focus:border-amber-400 focus:outline-none"
                  placeholder="Enter amount"
                  value={formData.paidAmount}
                  onChange={handlePaidAmountChange}
                />
              </div>
              <div>
                <label className="text-amber-400 text-sm font-medium mb-1 block">Pending Amount</label>
                <input
                  type="text"
                  className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700"
                  value={formData.pendingAmount ? `Rs-${formData.pendingAmount}` : ""}
                  readOnly
                />
              </div>
              <div>
                <label className="text-amber-400 text-sm font-medium mb-1 block">Total Amount</label>
                <input
                  type="text"
                  className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700"
                  value={formData.totalPrice ? `Rs-${formData.totalPrice}` : ""}
                  readOnly
                />
              </div>
            </div>
          )}

          {/* NORMAL TOTAL */}
          {formData.paymentStatus !== "HALF_PAID" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div />
              <div>
                <label className="text-amber-400 text-sm font-medium mb-1 block">Total Price</label>
                <input
                  type="text"
                  className="bg-gray-800 text-white w-full p-3 rounded-md border border-gray-700"
                  value={formData.totalPrice ? `Rs-${formData.totalPrice}` : ""}
                  readOnly
                  placeholder="Auto-calculated..."
                />
              </div>
            </div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm col-span-2"
            >
              {error}
            </motion.p>
          )}
        </form>

        <div className="p-4 border-t border-amber-400/20 bg-gray-900 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-700 text-white rounded-full hover:bg-gray-600"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            onClick={handleSubmit}
            disabled={
              !formData.totalPrice ||
              (formData.paymentStatus === "HALF_PAID" && !formData.paidAmount)
            }
            className="px-6 py-2.5 bg-amber-400 text-black rounded-full font-semibold hover:bg-amber-500 shadow-md disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            {isEdit ? "Update" : "Create"} Booking
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
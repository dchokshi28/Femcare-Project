import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Phone, MapPinned, CalendarDays, Clock3, CheckCircle2, Navigation, Building2, UserRoundCheck, Mail, X, ChevronLeft, ChevronRight, Sparkles, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Provider data with stable IDs
const providers = [
  { id: "vadodara-1", type: "Hospital", name: "BuildingRace Hospital", specialty: "Gynecology & Obstetrics", address: "Race Course Road, Near Natubhai Circle, Vadodara, Gujarat", phone: "+91 265 278 0000", latitude: 22.2987, longitude: 73.1989 },
  { id: "vadodara-2", type: "Hospital", name: "Jetalpur Road Multispecialty Hospital", specialty: "Advanced Multispecialty Care", address: "Jetalpur Road, behind Gujarat Kidney Hospital, Vadodara, Gujarat", phone: "+91 265 246 1111", latitude: 22.2868, longitude: 73.1569 },
  { id: "vadodara-3", type: "Hospital", name: "Sun-Pharma Hospital", specialty: "Women's Care Unit & Gynae Services", address: "Sun-Pharma Atladra Road, opposite ICAI Bhavan, Vadodara, Gujarat", phone: "+91 265 256 2222", latitude: 22.2876, longitude: 73.1521 },
  { id: "vadodara-4", type: "Hospital", name: "Akshar Hospital", specialty: "High-risk Pregnancy & Laparoscopic Gynae Care", address: "Akshar Chowk, Old Padra Road, Vadodara, Gujarat", phone: "+91 265 234 3333", latitude: 22.3034, longitude: 73.1775 },
  { id: "vadodara-5", type: "Clinic", name: "Dr. Reshmi Banerjee Clinic", specialty: "Women's Health, Maternity & Gynae", address: "GF 1,2 & FF 1,2,3, Syamal Sapphire, Gotri-Vasna Link Road, near Nilamber Circle, Vadodara, Gujarat", phone: "+91 265 289 4444", latitude: 22.3235, longitude: 73.1649 },
  { id: "vadodara-6", type: "Hospital", name: "Waghodia Hospital", specialty: "Obstetrics & Gynecology", address: "P.O. Limda, Taluka Waghodia, Vadodara, Gujarat", phone: "+91 265 244 5555", latitude: 22.3428, longitude: 73.2723 },
  { id: "vadodara-7", type: "Hospital", name: "Shree Krishna Hospital", specialty: "Gynecology & Obstetrics", address: "Near Akota, Vadodara, Gujarat", phone: "+91 265 666 7000", latitude: 22.2932, longitude: 73.1945 },
  { id: "vadodara-8", type: "Clinic", name: "Apex Women's Clinic", specialty: "Reproductive Health & Fertility", address: "Alkapuri, Vadodara, Gujarat", phone: "+91 265 234 1122", latitude: 22.3089, longitude: 73.181 },
  { id: "vadodara-9", type: "Hospital", name: "Nandaben Hospital", specialty: "Women Health & Gynae", address: "Tarsali, Vadodara, Gujarat", phone: "+91 265 256 3344", latitude: 22.289, longitude: 73.1838 },
  { id: "vadodara-10", type: "Clinic", name: "Dr. Meera Shah Gynae Clinic", specialty: "PCOS, Menstrual Health", address: "Manjalpur, Vadodara, Gujarat", phone: "+91 265 654 8899", latitude: 22.2696, longitude: 73.1997 },
];

import { API_BASE, apiFetch } from '../lib/api';

// Fixed 16 deterministic slots — always rendered regardless of availability response
const MORNING_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
];
const AFTERNOON_SLOTS = [
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];
const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS]; // 16 total
const fetchProviderSlots = async (providerId, date, signal) => {
  const response = await fetch(`${API_BASE}/api/booking-availability`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider_id: providerId, date }),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Availability request failed (${response.status}).`);
  if (!Array.isArray(data.slots)) throw new Error('The server returned an invalid availability response.');
  return data.slots;
};

const toLocalISODate = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateUpcomingDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(toLocalISODate(date));
  }
  
  return dates;
};

const formatPhoneLink = (phone) => phone.replace(/\s+/g, '');
const formatDisplayDate = (dateStr) => {
  const [year, monthNumber, dayNumber] = dateStr.split('-').map(Number);
  const date = new Date(year, monthNumber - 1, dayNumber);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  return { month, day: date.getDate() };
};

const FindCare = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(providers[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availability, setAvailability] = useState(new Set()); // Set of booked slot strings
  const [availabilityStatus, setAvailabilityStatus] = useState('loading');
  const [stats, setStats] = useState({ total_slots: 16, booked_slots: 0, available_slots: 16 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null); // { booking, email_sent }
  const [confirmed, setConfirmed] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState(null);
  const [bookingQuota, setBookingQuota] = useState(null);
  const [dateScrollIndex, setDateScrollIndex] = useState(0);
  const [view, setView] = useState('booking'); // 'booking' or 'history'
  const bookingInFlight = useRef(false);
  const availabilityRequestId = useRef(0);

  const isPaidActive = Boolean(
    user?.is_premium &&
    (!user?.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt).getTime() > Date.now())
  );
  const validBookings = useMemo(() => bookings.filter(b => b.status !== 'cancelled'), [bookings]);
  const freeBookingUsed = validBookings.length >= 1;
  
  const upcomingDates = useMemo(() => generateUpcomingDates(), []);
  const visibleDates = upcomingDates.slice(dateScrollIndex, dateScrollIndex + 5);
  
  const mapCenter = useMemo(() => [22.3072, 73.1812], []);

  // Fetch availability when provider or date changes
  useEffect(() => {
    if (!selectedDate || !selected) return;
    let active = true;
    const controller = new AbortController();
    const requestId = ++availabilityRequestId.current;
    setAvailabilityStatus('loading');
    setSelectedSlot('');

    const fetchAvailability = async () => {
      try {
        const slotsArr = await fetchProviderSlots(selected.id, selectedDate, controller.signal);
        if (!active || requestId !== availabilityRequestId.current) return;
        const bookedSet = new Set(
          slotsArr
            .filter(s => s.is_available === false)
            .map(s => s.slot_time)
        );
        setAvailability(bookedSet);
        
        // Derive stats from fixed 16 slots and booked set
        const bookedCount = bookedSet.size;
        setStats({
          total_slots: ALL_SLOTS.length,
          booked_slots: bookedCount,
          available_slots: ALL_SLOTS.length - bookedCount,
        });
        setAvailabilityStatus('ready');
      } catch (error) {
        if (!active || requestId !== availabilityRequestId.current || error.name === 'AbortError') return;
        console.error('Error fetching availability:', error);
        setAvailability(new Set());
        setStats({ total_slots: 16, booked_slots: 0, available_slots: 0 });
        setAvailabilityStatus('error');
        alert('Unable to verify available time slots. Please try again before booking.');
      }
    };
    
    fetchAvailability();
    return () => {
      active = false;
      controller.abort();
    };
  }, [selected, selectedDate]);
  
  // Fetch user bookings
  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/bookings`, {
          credentials: 'include'
        });
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : {};
        if (!response.ok) throw new Error(data.detail || `Could not load bookings (${response.status}).`);
        if (!Array.isArray(data.bookings)) throw new Error('The server returned an invalid bookings response.');
        
        setBookings(data.bookings);
        if (data.can_book !== undefined) {
          setBookingQuota({
            can_book: data.can_book,
            valid_bookings_count: data.valid_bookings_count,
            free_booking_used: data.free_booking_used,
            has_active_subscription: data.has_active_subscription,
          });
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        if (view === 'history') alert(error.message || 'Bookings are temporarily unavailable.');
      }
    };
    
    fetchBookings();
  }, [confirmed, user, view]);
  
  // Set initial date
  useEffect(() => {
    if (!selectedDate && upcomingDates.length > 0) {
      setSelectedDate(upcomingDates[0]);
    }
  }, [upcomingDates, selectedDate]);

  const saveBooking = async () => {
    if (bookingInFlight.current) return;
    if (!selectedDate || !selectedSlot) {
      alert('Please select both date and time slot');
      return;
    }
    if (availabilityStatus !== 'ready') {
      alert('Available time slots have not been verified. Please try again.');
      return;
    }
    if (availability.has(selectedSlot)) {
      alert('This time slot is already booked. Please select another slot.');
      return;
    }

    if (freeBookingUsed && !isPaidActive) {
      setUpgradePrompt({
        message: 'Your free booking has been used. Upgrade your subscription to book another slot.',
        details: {
          hospital: selected?.name,
          doctor: selected?.specialty,
          date: selectedDate,
          slot: selectedSlot,
        }
      });
      return;
    }

    const submittedAppointment = {
      provider_id: selected.id,
      hospital: selected.name,
      doctor: selected.specialty,
      date: selectedDate,
      slot: selectedSlot,
    };

    bookingInFlight.current = true;
    availabilityRequestId.current += 1;
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/book-appointment`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submittedAppointment),
      });

      if (!response.ok) {
        let errMsg = 'Booking failed';
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const errBody = await response.json();
            errMsg = errBody.detail || errBody.error || errMsg;
          }
        } catch {}
        if (response.status === 403 || errMsg.toLowerCase().includes('free booking has been used')) {
          setUpgradePrompt({
            message: errMsg || 'Your free booking has been used. Upgrade your subscription to book another slot.',
            details: {
              hospital: selected?.name,
              doctor: selected?.specialty,
              date: selectedDate,
              slot: selectedSlot,
            }
          });
          return;
        }
        throw new Error(errMsg);
      }

      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error('Server returned an unexpected response. Please try again.');
      }
      const data = await response.json();
      if (data.success !== true || !data.booking) {
        throw new Error(data.message || 'The server did not confirm the appointment booking.');
      }
      setBookingResult(data);
      setConfirmed(true);
      setSelectedSlot('');
      
      // Refresh availability after booking
      const refreshId = ++availabilityRequestId.current;
      try {
        const slotsArr = await fetchProviderSlots(submittedAppointment.provider_id, submittedAppointment.date);
        if (refreshId !== availabilityRequestId.current) return;
        const bookedSet = new Set(slotsArr.filter(s => s.is_available === false).map(s => s.slot_time));
        setAvailability(bookedSet);
        setStats({ total_slots: ALL_SLOTS.length, booked_slots: bookedSet.size, available_slots: ALL_SLOTS.length - bookedSet.size });
        setAvailabilityStatus('ready');
      } catch (refreshError) {
        if (refreshId !== availabilityRequestId.current) return;
        console.error('Appointment saved, but availability refresh failed:', refreshError);
        setAvailabilityStatus('error');
        setAvailability(new Set());
        setStats({ total_slots: 16, booked_slots: 0, available_slots: 0 });
      }
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert(error.message);
    } finally {
      bookingInFlight.current = false;
      setLoading(false);
    }
  };
  
  const cancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/cancel-booking`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ booking_id: bookingId })
      });
      
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : {};
      if (!response.ok) throw new Error(data.detail || `Cancellation failed (${response.status}).`);
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      const emailMsg = data.email_sent
        ? '\nA cancellation email has been sent to your email address.'
        : '';
      alert(`Booking cancelled successfully.${emailMsg}`);
    } catch (error) {
      console.error('Cancel failed:', error);
      alert(error.message || 'Failed to cancel booking');
    }
  };
  
  const morningSlots   = MORNING_SLOTS;
  const afternoonSlots = AFTERNOON_SLOTS;

  return (
    <div className="mx-auto w-full max-w-[1800px] min-h-[calc(100vh-4.25rem)] bg-[#FFFDFC] px-2.5 sm:px-4 lg:px-6 py-3 text-[#17213D]">
      <div className="space-y-4">

        {/* Header Banner */}
        <div className="rounded-[24px] border border-[#F5F0F7] bg-[#FFFDFC] p-4 sm:p-5 shadow-[0_12px_24px_rgba(23,33,61,0.03)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#3B72AF]">
                <MapPinned className="h-3.5 w-3.5" /> Vadodara Healthcare Network
              </div>
              <h1 className="mt-0.5 text-2xl sm:text-3xl font-black tracking-[-0.05em] text-[#17213D]">
                Book Gynecology & Obstetrics Consultation
              </h1>
              <p className="text-[0.78rem] text-[#667085]">
                Verified reproductive health specialists with real-time slot availability
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('booking')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  view === 'booking' 
                    ? 'bg-[#17213D] text-white' 
                    : 'bg-[#F5F0F7] text-[#17213D]'
                }`}
              >
                Book
              </button>
              <button
                onClick={() => setView('history')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  view === 'history' 
                    ? 'bg-[#17213D] text-white' 
                    : 'bg-[#F5F0F7] text-[#17213D]'
                }`}
              >
                My Bookings ({bookings.filter(b => b.status === 'confirmed').length})
              </button>
            </div>
          </div>

          {view === 'booking' && (
            <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              {/* Map */}
              <div className="overflow-hidden rounded-[20px] border border-[#F5F0F7] bg-[#F5F0F7] p-1.5 shadow-sm">
                <MapContainer
                  center={mapCenter}
                  zoom={12}
                  scrollWheelZoom
                  className="h-[380px] w-full overflow-hidden rounded-[16px]"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {providers.map((center) => (
                    <Marker
                      key={center.id}
                      position={[center.latitude, center.longitude]}
                      icon={customIcon}
                    >
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <div className="font-bold text-[#17213D]">{center.name}</div>
                          <div className="text-xs text-[#667085]">{center.specialty}</div>
                          <div className="text-xs text-[#667085]">{center.address}</div>
                          <a href={`tel:${formatPhoneLink(center.phone)}`} className="text-[#3B72AF] font-semibold text-xs underline">{center.phone}</a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Care Centers List */}
              <div className="space-y-2.5 max-h-[395px] overflow-y-auto pr-1">
                {providers.map((center) => {
                  const isSelected = selected?.id === center.id;
                  return (
                    <button
                      key={center.id}
                      onClick={() => {
                        if (bookingInFlight.current) return;
                        availabilityRequestId.current += 1;
                        setSelected(center);
                        setSelectedSlot('');
                        setAvailability(new Set());
                        setAvailabilityStatus('loading');
                        setStats({ total_slots: 16, booked_slots: 0, available_slots: 0 });
                      }}
                      className={`w-full rounded-[18px] border p-3.5 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-[#C8B7E8] bg-[#F5F0F7] ring-2 ring-[#C8B7E8]/40 shadow-sm'
                          : 'border-[#F5F0F7] bg-[#FFFDFC] hover:border-[#C8B7E8]/60 hover:bg-[#F5F0F7]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[0.95rem] font-bold text-[#17213D] flex items-center gap-1.5">
                            {center.name}
                            <UserRoundCheck className="h-3.5 w-3.5 text-[#3B72AF]" />
                          </div>
                          <div className="mt-0.5 text-[0.72rem] font-medium text-[#667085]">
                            {center.specialty}
                          </div>
                        </div>
                        <span className="rounded-full bg-[#D9E7F4] px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-[#17213D]">
                          {center.type}
                        </span>
                      </div>
                      <div className="mt-2.5 space-y-1 text-[0.72rem] text-[#667085]">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#17213D]" />
                          <span className="truncate">{center.address}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[0.68rem]">
                          <span className="flex items-center gap-1 text-[#17213D] font-semibold">
                            <Phone className="h-3 w-3 text-[#3B72AF]" />
                            {center.phone}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Booking History View */}
          {view === 'history' && (
            <div className="mt-4 space-y-3">
              {bookings.length === 0 ? (
                <div className="rounded-[18px] bg-[#F5F0F7] p-6 text-center">
                  <p className="text-sm text-[#667085]">No bookings yet</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="rounded-[18px] border border-[#F5F0F7] bg-[#FFFDFC] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-[#17213D]">{booking.hospital_name}</div>
                        <div className="text-sm text-[#667085]">{booking.doctor_specialty}</div>
                        <div className="mt-2 flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {booking.appointment_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {booking.appointment_slot}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => cancelBooking(booking.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Booking Slot Selection - Only show in booking view */}
        {view === 'booking' && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Slot Selection */}
            <div className="rounded-[24px] border border-[#F5F0F7] bg-[#FFFDFC] p-5 shadow-[0_12px_24px_rgba(23,33,61,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0F7] text-[#17213D]">
                    <Clock3 className="h-5 w-5 text-[#3B72AF]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#17213D]">Select Appointment Date & Time</h3>
                    <p className="text-[0.7rem] text-[#667085]">{stats.available_slots} of {stats.total_slots} slots available</p>
                  </div>
                </div>
              </div>

              {/* Booking Allowance & Subscription Banner */}
              {freeBookingUsed && !isPaidActive ? (
                <div className="mb-4 rounded-[16px] border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-950">1 Free Booking Used</div>
                      <div className="text-[0.72rem] text-amber-800">
                        You have already used your complimentary consultation slot. Upgrade your subscription to book another slot.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="shrink-0 rounded-full bg-gradient-to-r from-[#983459] to-[#5B2D8E] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all text-center"
                  >
                    Upgrade Now
                  </button>
                </div>
              ) : isPaidActive ? (
                <div className="mb-4 rounded-[16px] border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-900 flex items-center gap-2.5 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">
                      {user?.subscriptionPlan === 'annual' ? 'Annual Plan Active' : 'Monthly Plan Active'}:
                    </span>{' '}
                    <span className="text-[0.72rem] text-emerald-800">
                      Unlimited appointments with verified specialists are included in your subscription.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-4 rounded-[16px] border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900 flex items-center gap-2.5 shadow-sm">
                  <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold">Complimentary Consultation:</span>{' '}
                    <span className="text-[0.72rem] text-blue-800">
                      You have 1 free booking slot available on your account.
                    </span>
                  </div>
                </div>
              )}

              {/* Hospital Summary */}
              <div className="mb-4 grid gap-2.5 sm:grid-cols-2 rounded-[16px] bg-[#F5F0F7] p-3 border border-[#F5F0F7]">
                <div>
                  <span className="text-[0.58rem] font-bold uppercase tracking-wider text-[#667085]">Hospital / Clinic</span>
                  <div className="text-sm font-bold text-[#17213D]">{selected?.name}</div>
                </div>
                <div>
                  <span className="text-[0.58rem] font-bold uppercase tracking-wider text-[#667085]">Specialty Care</span>
                  <div className="text-sm font-bold text-[#17213D]">{selected?.specialty}</div>
                </div>
              </div>

              {/* Date Selection with Scroll */}
              <div className="mb-4 space-y-1.5">
                <label className="text-[0.72rem] font-bold uppercase tracking-wider text-[#17213D]">
                  Step 1: Choose Date
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDateScrollIndex(Math.max(0, dateScrollIndex - 1))}
                    disabled={dateScrollIndex === 0}
                    className="p-2 rounded-full bg-[#F5F0F7] disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex flex-1 gap-2 overflow-hidden">
                    {visibleDates.map((dateStr) => {
                      const { month, day } = formatDisplayDate(dateStr);
                      const isSelectedDate = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          onClick={() => {
                            if (bookingInFlight.current) return;
                            availabilityRequestId.current += 1;
                            setSelectedDate(dateStr);
                            setSelectedSlot('');
                            setAvailability(new Set());
                            setAvailabilityStatus('loading');
                            setStats({ total_slots: 16, booked_slots: 0, available_slots: 0 });
                          }}
                          className={`flex flex-col items-center gap-0.5 rounded-[12px] px-3 py-2 text-xs font-bold transition-all flex-1 ${
                            isSelectedDate
                              ? 'bg-[#17213D] text-[#FFFDFC] shadow-md scale-105'
                              : 'bg-[#F5F0F7] text-[#17213D] hover:bg-[#F2C5CF]'
                          }`}
                        >
                          <span className="text-[0.6rem] opacity-70">{month}</span>
                          <span className="text-lg">{day}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setDateScrollIndex(Math.min(upcomingDates.length - 5, dateScrollIndex + 1))}
                    disabled={dateScrollIndex >= upcomingDates.length - 5}
                    className="p-2 rounded-full bg-[#F5F0F7] disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-5 space-y-3">
                <label className="text-[0.72rem] font-bold uppercase tracking-wider text-[#17213D]">
                  Step 2: Choose Time Slot
                </label>
                
                {/* Morning Slots */}
                <div>
                  <div className="text-[0.65rem] font-bold text-[#667085] mb-2">MORNING (09:00 - 12:30)</div>
                  <div className="grid grid-cols-4 gap-2">
                    {morningSlots.map((slot) => {
                      const isBooked   = availability.has(slot);
                      const unavailable = availabilityStatus !== 'ready' || isBooked;
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          disabled={unavailable}
                          onClick={() => { if (!bookingInFlight.current) setSelectedSlot(slot); }}
                          className={`flex flex-col items-center justify-center rounded-[10px] px-2 py-2 text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#E95A7A] text-[#FFFDFC] ring-2 ring-[#E95A7A]/40 shadow-md'
                            : unavailable
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#F5F0F7] text-[#17213D] hover:bg-[#C8B7E8]'
                          }`}
                        >
                          <span>{slot}</span>
                          {isBooked && availabilityStatus === 'ready' && <span className="text-[0.5rem]">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Afternoon Slots */}
                <div>
                  <div className="text-[0.65rem] font-bold text-[#667085] mb-2">AFTERNOON (02:00 - 05:30)</div>
                  <div className="grid grid-cols-4 gap-2">
                    {afternoonSlots.map((slot) => {
                      const isBooked   = availability.has(slot);
                      const unavailable = availabilityStatus !== 'ready' || isBooked;
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          disabled={unavailable}
                          onClick={() => { if (!bookingInFlight.current) setSelectedSlot(slot); }}
                          className={`flex flex-col items-center justify-center rounded-[10px] px-2 py-2 text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#E95A7A] text-[#FFFDFC] ring-2 ring-[#E95A7A]/40 shadow-md'
                            : unavailable
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#F5F0F7] text-[#17213D] hover:bg-[#C8B7E8]'
                          }`}
                        >
                          <span>{slot}</span>
                          {isBooked && availabilityStatus === 'ready' && <span className="text-[0.5rem]">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center gap-4 text-[0.65rem] text-[#667085] pt-2 border-t border-[#F5F0F7]">
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#F5F0F7]"></div>
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-100"></div>
                    Booked
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#E95A7A]"></div>
                    Selected
                  </span>
                </div>
              </div>

              {/* Booking Actions */}
              <div className="flex flex-wrap items-center gap-3 border-t border-[#F5F0F7] pt-4">
                <button
                  onClick={saveBooking}
                  disabled={!selectedDate || !selectedSlot || loading}
                  className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all shadow-md ${
                    selectedDate && selectedSlot && !loading
                      ? 'bg-[#17213D] text-[#FFFDFC] hover:bg-[#17213D]/90 hover:-translate-y-0.5'
                      : 'bg-[#667085]/30 text-[#667085] cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Booking...' : 'Confirm Appointment Booking'}
                </button>

                <a
                  href={`tel:${formatPhoneLink(selected?.phone || '')}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F0F7] bg-[#F5F0F7] px-4 py-2 text-xs font-semibold text-[#17213D] hover:bg-[#D9E7F4] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#3B72AF]" />
                  Call Clinic
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected?.address || 'Vadodara')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F5F0F7] bg-[#F5F0F7] px-4 py-2 text-xs font-semibold text-[#17213D] hover:bg-[#D9E7F4] transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5 text-[#3B72AF]" />
                  Get Directions
                </a>
              </div>
            </div>

            {/* Status Card */}
            <div className="rounded-[24px] border border-[#F5F0F7] bg-[#FFFDFC] p-5 shadow-[0_12px_24px_rgba(23,33,61,0.03)] flex flex-col justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0F7] text-[#17213D]">
                    <CheckCircle2 className="h-5 w-5 text-[#3B72AF]" />
                  </div>
                  <h3 className="text-base font-black text-[#17213D]">Booking Status</h3>
                </div>

                {confirmed ? (
                  <div className="rounded-[18px] bg-[#F2C5CF]/60 p-4 border border-[#F2C5CF] space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-black text-[#17213D]">
                      <CheckCircle2 className="h-4 w-4 text-[#E95A7A]" />
                      Appointment Confirmed!
                    </div>
                    <div className="text-xs font-semibold text-[#17213D]">
                      {bookingResult?.booking?.hospital_name || selected?.name}
                    </div>
                    <div className="text-[0.72rem] text-[#667085]">
                      {bookingResult?.booking?.doctor_specialty || selected?.specialty}
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-3 text-[0.72rem]">
                      <span className="flex items-center gap-1 font-bold text-[#17213D]">
                        <CalendarDays className="h-3 w-3" />
                        {bookingResult?.booking?.appointment_date || selectedDate}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#17213D]">
                        <Clock3 className="h-3 w-3" />
                        {bookingResult?.booking?.appointment_slot || selectedSlot}
                      </span>
                    </div>

                    {/* Booking ID */}
                    {bookingResult?.booking?.id && (
                      <div className="rounded-[10px] bg-[#F5F0F7] px-3 py-2 text-[0.68rem]">
                        <span className="text-[#667085] font-semibold">Booking ID: </span>
                        <span className="font-mono font-bold text-[#5B2D8E] tracking-wider">
                          {String(bookingResult.booking.id).toUpperCase().slice(-8)}
                        </span>
                      </div>
                    )}

                    {/* Email status */}
                    <div className={`flex items-center gap-2 rounded-[10px] p-2.5 text-[0.68rem] font-semibold border ${
                      bookingResult?.email_sent
                        ? 'bg-[#FFFDFC] text-[#3B72AF] border-[#D9E7F4]'
                        : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                    }`}>
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {bookingResult?.email_sent
                        ? <span>Confirmation sent to <strong>{user?.email}</strong></span>
                        : <span>Appointment booked. Confirmation email could not be sent right now.</span>
                      }
                    </div>

                    {/* Book another */}
                    <button
                      onClick={() => { setConfirmed(false); setBookingResult(null); }}
                      className="w-full rounded-full border border-[#F5F0F7] bg-[#FFFDFC] py-1.5 text-[0.68rem] font-bold text-[#17213D] hover:bg-[#F5F0F7] transition-colors"
                    >
                      Book Another Appointment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-xs text-[#667085]">
                    <div className="flex items-center gap-2 rounded-[14px] bg-[#F5F0F7] p-2.5">
                      <MapPinned className="h-4 w-4 text-[#3B72AF] shrink-0" />
                      <span>Vadodara healthcare providers</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[14px] bg-[#F5F0F7] p-2.5">
                      <Clock3 className="h-4 w-4 text-[#3B72AF] shrink-0" />
                      <span>Real-time database verification</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-[14px] bg-[#F5F0F7] p-2.5">
                      <Building2 className="h-4 w-4 text-[#3B72AF] shrink-0" />
                      <span>Double-booking prevention</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#F5F0F7] text-[0.65rem] text-[#667085] text-center">
                FemCare Certified Medical Partner Network • Emergency: 112
              </div>
            </div>
          </div>
        )}

      {/* Subscription Upgrade Modal */}
      {upgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[24px] border border-[#F5F0F7] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#17213D]">Subscription Required</h3>
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-amber-700">1 Free Booking Limit Reached</span>
                </div>
              </div>
              <button
                onClick={() => setUpgradePrompt(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-[16px] bg-[#FFFDFC] border border-amber-200 p-4 text-xs text-[#17213D] space-y-2">
              <p className="font-semibold text-amber-950 leading-relaxed text-sm">
                {upgradePrompt.message}
              </p>
              <p className="text-[0.72rem] text-[#667085]">
                Every FemCare account includes 1 free consultation slot. To book multiple appointments with verified specialists, upgrade to our Monthly or Annual plan.
              </p>
            </div>

            {upgradePrompt.details && (
              <div className="rounded-[14px] bg-[#F5F0F7] p-3 text-[0.72rem] text-[#17213D] space-y-1 border border-gray-100">
                <div className="font-bold text-[#667085] uppercase tracking-wider text-[0.6rem]">Preserved Slot Selection</div>
                <div className="font-bold text-[#17213D]">{upgradePrompt.details.hospital}</div>
                <div className="text-[#667085]">
                  {upgradePrompt.details.doctor} • {upgradePrompt.details.date} at {upgradePrompt.details.slot}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setUpgradePrompt(null)}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/subscription')}
                className="flex-1 rounded-full bg-gradient-to-r from-[#983459] to-[#5B2D8E] py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all text-center"
              >
                View Subscription Plans
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FindCare;


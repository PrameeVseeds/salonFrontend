import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Clock3,
  LogOut,
  Scissors,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CustomerBottomNav from "../../components/customer/CustomerBottomNav";
import CustomerNotificationBell from "../../components/customer/CustomerNotificationBell";
import CustomerProfileModal from "../../components/customer/CustomerProfileModal";
import { usePublicTheme } from "../../hooks/usePublicTheme";
import {
  cancelCustomerAppointment,
  createCustomerAppointment,
  getAvailableAppointmentSlots,
  getCustomerAppointments,
} from "../../services/appointmentService";
import { getCustomerProfile, logoutCustomer, } from "../../services/customerAuthService";
import { getPublicServices } from "../../services/salonService";
import { getPublicEmployees } from "../../services/employeeService";
import { getPublicAssignedEmployeeServices } from "../../services/employeeServiceAssignmentService";
import type { Appointment } from "../../types/appointment";
import type { Customer } from "../../types/customer";
import type { SalonService } from "../../types/service";
import type { Employee } from "../../types/employee";
import { getApiErrorMessage } from "../../utils/apiError";
import "./customerDashboardPage.css";
import "./customerAppointmentsPage.css";

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = localDateKey(new Date());
const CustomerAppointmentsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { brand, style } = usePublicTheme();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [services, setServices] = useState<SalonService[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
  const [employeeChoice, setEmployeeChoice] = useState("any");
  const [appointmentCount, setAppointmentCount] = useState(1);
  const [appointmentChoices, setAppointmentChoices] = useState<Array<{ serviceIds: string[]; subServiceIds: Array<number | null>; employeeId: string }>>([
    { serviceIds: params.get("service") ? [params.get("service")!] : [], subServiceIds: [], employeeId: "" },
  ]);
  const [employeeServiceIds, setEmployeeServiceIds] = useState<Record<number, number[]>>({});
  const [expandedServiceCards, setExpandedServiceCards] = useState<Set<number>>(new Set());
  const [expandedParentServices, setExpandedParentServices] = useState<Set<number>>(new Set());
  const [expandedAppointmentCards, setExpandedAppointmentCards] = useState<Set<number>>(new Set([0]));
  const [expandedBulkAddOns, setExpandedBulkAddOns] = useState<Set<string>>(new Set());
  const [slotSuggestion, setSlotSuggestion] = useState<{
    slot: string;
    remaining: number;
    alreadyBooked: number;
    selectedSlot?: string;
    selectedCount?: number;
  } | null>(null);
  const [slotEmployees, setSlotEmployees] = useState<Record<string, number>>(
    {},
  );
  const [slotCapacities, setSlotCapacities] = useState<Record<string, number>>({});
  const [slotDetails, setSlotDetails] = useState<Record<string, {
    serviceLimit: number;
    bookedCount: number;
    availableEmployees: number;
    remainingCapacity: number;
    limitingReason: "service_capacity" | "employee_availability" | "both" | null;
  }>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    serviceId: params.get("service") ?? "",
    serviceIds: params.get("service") ? [params.get("service")!] : [] as string[],
    subServiceIds: [] as Array<number | null>,
    employeeId: "",
    appointmentDate: "",
    startTime: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [bookingFilter, setBookingFilter] = useState<"upcoming" | "cancelled" | "past">("upcoming");
  const [visibleBookingCount, setVisibleBookingCount] = useState(10);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const initialServiceId = params.get("service") ?? "";
  const isBookingPage = location.pathname === "/book-appointment";

  const visibleAvailableSlots = useMemo(
    () => availableSlots.filter((slot) =>
      new Date(`${form.appointmentDate}T${slot}`).getTime() > currentTime,
    ),
    [availableSlots, form.appointmentDate, currentTime],
  );

  useEffect(() => {
    const clockTimer = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(clockTimer);
  }, []);
  useEffect(() => {
    const cancelId = Number(params.get("cancel"));
    if (!cancelId || isBookingPage || !appointments.length)
      return;
    const target = appointments.find((appointment) => appointment.id === cancelId && appointment.status === "Scheduled");
    if (target) {
      setCancelTarget(target);
      navigate("/appointments", { replace: true });
    }
  }, [appointments, isBookingPage, navigate, params]);

  useEffect(() => {
    Promise.allSettled([
      getCustomerProfile(),
      getPublicServices(),
      getPublicEmployees(),
      getCustomerAppointments(),
    ]).then(([profile, serviceResult, employeeResult, bookingResult]) => {
      if (profile.status === "fulfilled")
        setCustomer(profile.value.data.customer);
      if (serviceResult.status === "fulfilled")
        setServices(
          serviceResult.value.data.services.filter((item) => item.isActive),
        );
      if (employeeResult.status === "fulfilled")
        setEmployees(
          employeeResult.value.data.employees.filter((item) => item.isActive),
        );
      if (bookingResult.status === "fulfilled")
        setAppointments(bookingResult.value.data.appointments);
      else
        setMessage({
          type: "error",
          text: getApiErrorMessage(
            bookingResult.reason,
            "Unable to load your appointments.",
          ),
        });
    });
  }, []);
  useEffect(() => {
    if (!initialServiceId || !employees.length) return;
    let active = true;
    Promise.all(
      employees.map(async (employee) => {
        try {
          const { data } = await getPublicAssignedEmployeeServices(employee.id);
          return data.services.some(
            (service) => service.id === Number(initialServiceId),
          )
            ? employee
            : null;
        } catch {
          return null;
        }
      }),
    ).then((matches) => {
      if (active)
        setAssignedEmployees(
          matches.filter((employee): employee is Employee => employee !== null),
        );
    });
    return () => {
      active = false;
    };
  }, [employees, initialServiceId]);
  useEffect(() => {
    if (!employees.length) return;
    let active = true;
    Promise.all(employees.map(async (employee) => {
      try {
        const { data } = await getPublicAssignedEmployeeServices(employee.id);
        return [employee.id, data.services.map((service) => service.id)] as const;
      } catch {
        return [employee.id, []] as const;
      }
    })).then((entries) => {
      if (active) setEmployeeServiceIds(Object.fromEntries(entries));
    });
    return () => { active = false; };
  }, [employees]);
  const loadSlots = (
    serviceIds: string[],
    choice: string,
    appointmentDate: string,
    staff = assignedEmployees,
    subServiceIds: Array<number | null> = form.subServiceIds,
  ) => {
    setEmployeeChoice(choice);
    setForm((current) => ({
      ...current,
      serviceId: serviceIds[0] ?? "",
      serviceIds,
      subServiceIds,
      employeeId: choice === "any" ? "" : choice,
      appointmentDate,
      startTime: "",
    }));
    setAppointmentChoices((current) => current.map(() => ({ serviceIds, subServiceIds, employeeId: "" })));
    setAvailableSlots([]);
    setSlotsError(null);
    setSlotsMessage(null);
    setSlotEmployees({});
    setSlotCapacities({});
    setSlotDetails({});
    if (!serviceIds.length || !appointmentDate) return;
    setSlotsLoading(true);
    const candidates =
      choice === "any"
        ? [null]
        : staff.filter((employee) => employee.id === Number(choice));
    Promise.all(
      (candidates.length ? candidates : [null]).map(async (employee) => ({
        employeeId: employee?.id ?? null,
        availability: await getAvailableAppointmentSlots(
          serviceIds.map(Number),
          employee?.id ?? null,
          appointmentDate,
          subServiceIds,
        ),
      })),
    )
      .then((results) => {
        const slotMap: Record<string, number> = {};
        const capacityMap: Record<string, number> = {};
        const uniqueSlots = new Set<string>();
        results.forEach((result) =>
          result.availability.slots.forEach((slot) => {
            uniqueSlots.add(slot);
            capacityMap[slot] = Math.max(capacityMap[slot] ?? 0, result.availability.slotDetails[slot]?.remainingCapacity ?? 1);
            if (result.employeeId !== null && !slotMap[slot]) slotMap[slot] = result.employeeId;
          }),
        );
        setSlotEmployees(slotMap);
        setSlotCapacities(capacityMap);
        setSlotDetails(Object.assign({}, ...results.map((result) => result.availability.slotDetails)));
        setAvailableSlots([...uniqueSlots].sort());
        if (!uniqueSlots.size)
          setSlotsMessage(results.find((result) => result.availability.message)?.availability.message ?? null);
      })
      .catch((error) =>
        setSlotsError(
          getApiErrorMessage(error, "Unable to load available times."),
        ),
      )
      .finally(() => setSlotsLoading(false));
  };
  const selectServices = async (serviceIds: string[], subServiceIds: Array<number | null> = []) => {
    setAssignedEmployees([]);
    setEmployeeChoice("any");
    setAvailableSlots([]);
    setSlotEmployees({});
    setSlotCapacities({});
    setSlotDetails({});
    setSlotsMessage(null);
    setForm((current) => ({
      ...current,
      serviceId: serviceIds[0] ?? "",
      serviceIds,
      subServiceIds,
      employeeId: "",
      startTime: "",
    }));
    if (!serviceIds.length)
      return;
    const matches = (
      await Promise.all(
        employees.map(async (employee) => {
          try {
            const { data } = await getPublicAssignedEmployeeServices(
              employee.id,
            );
            return serviceIds.every((serviceId) => data.services.some(
              (service) => service.id === Number(serviceId),
            ))
              ? employee
              : null;
          } catch {
            return null;
          }
        }),
      )
    ).filter((employee): employee is Employee => employee !== null);
    setAssignedEmployees(matches);
    if (form.appointmentDate)
      loadSlots(serviceIds, "any", form.appointmentDate, matches, subServiceIds);
  };
  const upcoming = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            (item.status === "Scheduled" || item.status === "In Progress") &&
            item.appointmentDate >= today,
        )
        .sort((a, b) =>
          `${a.appointmentDate}${a.startTime}`.localeCompare(
            `${b.appointmentDate}${b.startTime}`,
          ),
        ),
    [appointments],
  );
  const cancelled = useMemo(
    () =>
      appointments
        .filter((item) => item.status === "Cancelled")
        .sort((a, b) =>
          `${b.appointmentDate}${b.startTime}`.localeCompare(
            `${a.appointmentDate}${a.startTime}`,
          ),
        ),
    [appointments],
  );
  const past = useMemo(
    () =>
      appointments
        .filter(
          (item) =>
            item.status === "Completed" ||
            ((item.status === "Scheduled" || item.status === "In Progress") &&
              item.appointmentDate < today),
        )
        .sort((a, b) =>
          `${b.appointmentDate}${b.startTime}`.localeCompare(
            `${a.appointmentDate}${a.startTime}`,
          ),
        ),
    [appointments],
  );
  const selectedServices = useMemo(
    () => form.serviceIds.flatMap((id, index) => {
      const parent = services.find((service) => service.id === Number(id));
      const item = parent?.subServices?.find((subService) => subService.id === form.subServiceIds[index]) ?? parent;
      return item ? [item] : [];
    }),
    [form.serviceIds, form.subServiceIds, services],
  );
  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input)
      return;
    try {
      input.showPicker();
    } catch {
      input.focus();
      input.click();
    }
  };
  const filteredBookings = bookingFilter === "upcoming"
    ? upcoming
    : bookingFilter === "cancelled"
      ? cancelled
      : past;
  const filteredBookingTitle = bookingFilter === "upcoming"
    ? "Upcoming"
    : bookingFilter === "cancelled"
      ? "Cancelled"
      : "Past bookings";
  const groupedBookings = (() => {
    const groups: Appointment[][] = [];
    filteredBookings.forEach((appointment) => {
      const group = groups.find((candidate) => {
        const first = candidate[0]!;
        return first.appointmentDate === appointment.appointmentDate &&
          first.status === appointment.status &&
          Math.abs(new Date(first.createdAt).getTime() - new Date(appointment.createdAt).getTime()) <= 5 * 60_000;
      });
      if (group)
        group.push(appointment);
      else
        groups.push([appointment]);
    });
    return groups;
  })();

  const resetBookingForm = () => {
    setForm({ serviceId: "", serviceIds: [], subServiceIds: [], employeeId: "", appointmentDate: "", startTime: "", notes: "" });
    setAssignedEmployees([]);
    setEmployeeChoice("any");
    setAppointmentCount(1);
    setAppointmentChoices([{ serviceIds: [], subServiceIds: [], employeeId: "" }]);
    setExpandedServiceCards(new Set());
    setExpandedParentServices(new Set());
    setExpandedAppointmentCards(new Set([0]));
    setExpandedBulkAddOns(new Set());
    setAvailableSlots([]);
    setSlotEmployees({});
    setSlotCapacities({});
    setSlotDetails({});
    setSlotsMessage(null);
    setSlotSuggestion(null);
  };

  const nearestAvailableSlot = async (fromSlot: string): Promise<string | null> => {
    const availability = await getAvailableAppointmentSlots(
      form.serviceIds.map(Number), null, form.appointmentDate, form.subServiceIds,
    );
    const toMinutes = (slot: string) => {
      const [hours = 0, minutes = 0] = slot.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const origin = toMinutes(fromSlot);
    return availability.slots
      .filter((slot) => slot !== fromSlot && new Date(`${form.appointmentDate}T${slot}`).getTime() > Date.now())
      .sort((first, second) => Math.abs(toMinutes(first) - origin) - Math.abs(toMinutes(second) - origin))[0] ?? null;
  };

  const attemptBooking = async (count: number, slot: string, alreadyBooked = 0) => {
    setBusy(true);
    setMessage(null);
    const booked: Appointment[] = [];
    try {
      for (let index = 0; index < count; index += 1) {
        const choice = appointmentChoices[index] ?? { serviceIds: form.serviceIds, subServiceIds: form.subServiceIds, employeeId: form.employeeId };
        const { data } = await createCustomerAppointment({
          serviceId: Number(choice.serviceIds[0]),
          serviceIds: choice.serviceIds.map(Number),
          subServiceIds: choice.subServiceIds,
          employeeId: choice.employeeId ? Number(choice.employeeId) : null,
          appointmentDate: form.appointmentDate,
          startTime: slot,
          notes: form.notes.trim() || null,
        });
        booked.push(data.appointment);
      }
      setAppointments((current) => [...current, ...booked]);
      const totalBooked = alreadyBooked + booked.length;
      resetBookingForm();
      setMessage({
        type: "success",
        text: totalBooked === 1
          ? "Appointment booked successfully."
          : `${totalBooked} appointments booked successfully.`,
      });
    } catch (error) {
      if (booked.length) setAppointments((current) => [...current, ...booked]);
      const totalBooked = alreadyBooked + booked.length;
      const remaining = count - booked.length;
      try {
        const nearest = await nearestAvailableSlot(slot);
        if (nearest) {
          setSlotSuggestion({ slot: nearest, remaining, alreadyBooked: totalBooked });
          setAppointmentCount(remaining);
          return;
        }
      } catch { /* Keep the original availability error below. */ }
      setAppointmentCount(remaining);
      setMessage({
        type: "error",
        text: `${totalBooked ? `${totalBooked} appointment${totalBooked === 1 ? " is" : "s are"} booked. ` : ""}
        ${getApiErrorMessage(error, "No alternative appointment slot is available.")}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const bookApprovedSplit = async (selectedCount: number, selectedSlot: string, remaining: number, nearestSlot: string) => {
    setBusy(true);
    setMessage(null);
    const booked: Appointment[] = [];
    try {
      for (const plan of [{ count: selectedCount, slot: selectedSlot }, { count: remaining, slot: nearestSlot }]) {
        for (let index = 0; index < plan.count; index += 1) {
          const choice = appointmentChoices[booked.length] ?? { serviceIds: form.serviceIds, subServiceIds: form.subServiceIds, employeeId: "" };
          const { data } = await createCustomerAppointment({
            serviceId: Number(choice.serviceIds[0]),
            serviceIds: choice.serviceIds.map(Number),
            subServiceIds: choice.subServiceIds,
            employeeId: choice.employeeId ? Number(choice.employeeId) : null,
            appointmentDate: form.appointmentDate,
            startTime: plan.slot,
            notes: form.notes.trim() || null,
          });
          booked.push(data.appointment);
        }
      }
      setAppointments((current) => [...current, ...booked]);
      resetBookingForm();
      setMessage({ type: "success", text: `${booked.length} appointments booked successfully.` });
    } catch (error) {
      if (booked.length) setAppointments((current) => [...current, ...booked]);
      setSlotSuggestion(null);
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Availability changed before the approved booking could be completed."),
      });
    } finally {
      setBusy(false);
    }
  };

  const book = async (event: FormEvent) => {
    event.preventDefault();
    const choices = appointmentChoices.slice(0, appointmentCount);
    if (choices.some((choice) => !choice.serviceIds.length)) {
      setMessage({ type: "error", text: "Please select at least one service for every appointment." });
      return;
    }
    setBusy(true);
    try {
      const checks = await Promise.all(choices.map((choice) => getAvailableAppointmentSlots(
        choice.serviceIds.map(Number), choice.employeeId ? Number(choice.employeeId) : null, form.appointmentDate, choice.subServiceIds,
      )));
      const unavailableIndex = checks.findIndex((availability) => !availability.slots.includes(form.startTime));
      if (unavailableIndex >= 0) {
        setMessage({
          type: "error", text: `Appointment #${unavailableIndex + 1}'s services or professional are not available at ${form.startTime.slice(0, 5)}. 
        Please change that appointment or select another time.` });
        return;
      }
      const selectedProfessionals = choices.map((choice) => choice.employeeId).filter(Boolean);
      if (new Set(selectedProfessionals).size !== selectedProfessionals.length) {
        setMessage({ type: "error", text: "The same professional cannot be selected for two appointments at the same time. Choose another professional or use Any available professional." });
        return;
      }
      const groupedCounts = new Map<string, { count: number; checkIndex: number }>();
      choices.forEach((choice, index) => {
        const key = choice.serviceIds.join(",");
        const current = groupedCounts.get(key);
        groupedCounts.set(key, { count: (current?.count ?? 0) + 1, checkIndex: current?.checkIndex ?? index });
      });
      const overCapacity = [...groupedCounts.values()].find((group) =>
        group.count > (checks[group.checkIndex]!.slotDetails[form.startTime]?.remainingCapacity ?? 1),
      );
      if (overCapacity && groupedCounts.size > 1) {
        const available = checks[overCapacity.checkIndex]!.slotDetails[form.startTime]?.remainingCapacity ?? 0;
        setMessage({
          type: "error", text: `Only ${available} of the appointments using the same services can fit at this time. 
          Select another slot, reduce that service count, or choose different services.` });
        return;
      }
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Unable to verify all appointment selections.") });
      return;
    } finally {
      setBusy(false);
    }
    const usesSharedServices = choices.every((choice) => choice.serviceIds.join(",") === form.serviceIds.join(","));
    const selectedCapacity = Math.max(1, slotCapacities[form.startTime] ?? 1);
    if (usesSharedServices && appointmentCount > selectedCapacity) {
      const remaining = appointmentCount - selectedCapacity;
      const [hours = 0, minutes = 0] = form.startTime.split(":").map(Number);
      const selectedMinutes = hours * 60 + minutes;
      const nearest = availableSlots
        .filter((slot) => slot !== form.startTime && (slotCapacities[slot] ?? 0) >= remaining)
        .sort((first, second) => {
          const distance = (slot: string) => {
            const [slotHours = 0, slotMinutes = 0] = slot.split(":").map(Number);
            return Math.abs(slotHours * 60 + slotMinutes - selectedMinutes);
          };
          return distance(first) - distance(second);
        })[0];
      if (!nearest) {
        setMessage({
          type: "error", text:
            "No nearby slot can hold the remaining appointments. Please select another time or reduce the appointment count."
        });
        return;
      }
      setSlotSuggestion({
        slot: nearest,
        remaining,
        alreadyBooked: 0,
        selectedSlot: form.startTime,
        selectedCount: selectedCapacity,
      });
      return;
    }
    void attemptBooking(appointmentCount, form.startTime);
  };
  const cancelBooking = async () => {
    if (!cancelTarget)
      return;
    setBusy(true);
    try {
      const { data } = await cancelCustomerAppointment(
        cancelTarget.id,
        "Cancelled by customer",
      );
      setAppointments((current) =>
        current.map((item) =>
          item.id === data.appointment.id ? data.appointment : item,
        ),
      );
      setCancelTarget(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to cancel this appointment."),
      });
    } finally {
      setBusy(false);
    }
  };
  const signOut = () => {
    logoutCustomer();
    navigate("/", { replace: true });
  };
  const card = (items: Appointment[], cancellable: boolean) => {
    const item = items[0]!;
    const getAppointmentSummary = (appointment: Appointment) => {
      const segments = appointment.services ?? [];
      const mainServiceNames = [...new Set(
        segments.filter((segment) => segment.subServiceId == null).map((segment) => segment.serviceName),
      )];
      const addOnNames = segments
        .filter((segment) => segment.subServiceId != null)
        .map((segment) => segment.serviceName);
      const durationMinutes = segments.length
        ? segments.reduce((total, segment) => total + Number(segment.durationMinutes || 0), 0)
        : Number(appointment.serviceDurationMinutes || 0);
      const totalPrice = segments.length
        ? segments.reduce((total, segment) => total + Number(segment.price || 0), 0)
        : Number(appointment.totalAmount || 0);

      return {
        mainServiceName: mainServiceNames.join(" + ") || appointment.serviceName ||
          services.find((service) => service.id === appointment.serviceId)?.name || "Salon service",
        addOnNames,
        durationMinutes,
        totalPrice,
        timeRange: `${appointment.startTime.slice(0, 5)}–${appointment.endTime.slice(0, 5)}`,
      };
    };
    const itemSummary = getAppointmentSummary(item);
    return (
      <article className={`customer-appointment-card${items.length > 1 ? " is-bulk" : ""}`}
        key={items.map((appointment) => appointment.id).join("-")}>
        <span className="customer-appointment-image">
          {services.find((service) => service.id === item.serviceId)?.imageUrl ? (
            <img src={services.find((service) => service.id === item.serviceId)?.imageUrl} alt="" />
          ) : (
            <Scissors aria-hidden="true" />
          )}
        </span>
        <div className="customer-appointment-details">
          <strong>
            {items.length > 1 ? "Bulk appointment set" : itemSummary.mainServiceName}
          </strong>
          {items.length === 1 && itemSummary.addOnNames.length > 0 && (
            <span className="customer-appointment-addons">
              <b>Sub-services</b> {itemSummary.addOnNames.join(" + ")}
            </span>
          )}
          {items.length === 1 && (
            <div className="customer-appointment-summary">
              <span><Clock3 /> {itemSummary.timeRange}</span>
              <span>{itemSummary.durationMinutes} min</span>
              <span>Rs. {itemSummary.totalPrice.toFixed(2)}</span>
            </div>
          )}
          {items.length > 1 && <b className="customer-bulk-booking-badge">Bulk booking · {items.length} appointments</b>}
          {items.length > 1 && <span>
            <Clock3 /> {`${new Set(items.map((appointment) => appointment.startTime)).size} scheduled time${new Set(items.map((appointment) =>
              appointment.startTime)).size === 1 ? "" : "s"}`}
          </span>}
          <span>
            <CalendarDays /> {new Date(`${item.appointmentDate}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <div className="customer-bulk-booking-items">
            {items.map((appointment, index) => {
              const summary = getAppointmentSummary(appointment);
              return (
              <span key={appointment.id}>
                <div className="customer-bulk-item-info">
                  <b>#{index + 1}</b>
                  <strong>{summary.mainServiceName}</strong>
                  <time><Clock3 /> {summary.timeRange}</time>
                  {summary.addOnNames.length > 0 && (
                    <em className="customer-bulk-item-addons">Sub-services: {summary.addOnNames.join(" + ")}</em>
                  )}
                  <span className="customer-bulk-item-totals">{summary.durationMinutes} min · Rs. {summary.totalPrice.toFixed(2)}</span>
                  <small>{appointment.services?.length ? [...new Set(appointment.services.map
                    ((service) => service.employeeName).filter(Boolean))].join(" + ") || "Professional assigned by salon" :
                    appointment.employeeName ??
                    (() => {
                      const employee = employees.find((candidate) => candidate.id === appointment.employeeId);
                      return employee ? `${employee.firstName} ${employee.lastName}` : "Professional assigned by salon";
                    })()}</small>
                  {appointment.status === "Cancelled" && (
                    <p className="customer-cancellation-reason">
                      <b>Cancellation reason</b>
                      <span>{appointment.cancellationReason?.trim() || "No reason was provided."}</span>
                    </p>
                  )}
                </div>
                {cancellable && <button type="button" onClick={() => setCancelTarget(appointment)}>Cancel</button>}
              </span>
              );
            })}
          </div>
        </div>
        <aside className="customer-appointment-meta">
          <b className={`is-${item.status.toLowerCase().replace(" ", "-")}`}>
            {item.status}
          </b>
          <time>
            <strong>
              {new Date(`${item.appointmentDate}T00:00`).toLocaleDateString(undefined, { day: "2-digit" })}
            </strong>
            <span>
              {new Date(`${item.appointmentDate}T00:00`).toLocaleDateString(undefined, { month: "short" })}
            </span>
          </time>
        </aside>
      </article>
    );
  };

  return (
    <main className="customer-appointments-page" style={style}>
      <header className="customer-dashboard_header">
        <div className="customer-dashboard_brand">
          <span>
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={`${brand.salonName} logo`} />
            ) : (
              <Scissors />
            )}
          </span>
          <strong>{brand.salonName}</strong>
        </div>
        <div className="customer-dashboard_header-actions">
          <CustomerNotificationBell />
          <button
            className="customer-profile-trigger"
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="View your profile"
            aria-expanded={profileOpen}
          >
            {customer?.profileImage ? (
              <img src={customer.profileImage} alt="" />
            ) : (
              <UserRound />
            )}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            aria-label="Sign out"
          >
            <LogOut />
          </button>
        </div>
      </header>
      <div className="customer-appointments-content">
        <section className={`customer-appointments-heading${isBookingPage ? " is-booking" : ""}`}>
          {isBookingPage && (
            <button
              className="customer-booking-back"
              type="button"
              aria-label="Back to services"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/services")}
            >
              <ArrowLeft aria-hidden="true" />
            </button>
          )}
          <div className="customer-appointments-heading-copy">
            <p>{isBookingPage ? "Plan your visit" : "Your schedule"}</p>
            <h1>{isBookingPage ? "Book an appointment" : "Bookings"}</h1>
            <span>{isBookingPage ? "Choose your preferred service and time." : "View and manage your salon visits."}</span>
          </div>
          {!isBookingPage && (
            <button
              className="customer-new-appointment"
              type="button"
              onClick={() => navigate("/book-appointment")}
            >
              <CalendarPlus aria-hidden="true" />
              <span>Book appointment</span>
            </button>
          )}
        </section>
        {isBookingPage && (
          <form
            className="customer-booking-form"
            onSubmit={(event) => void book(event)}
          >
            <header>
              <CalendarDays />
              <div>
                <h2>Book an appointment</h2>
                <p>
                  {selectedServices.length ? `${selectedServices.length} service${selectedServices.length === 1 ? "" : "s"} · 
                ${selectedServices.reduce((total, service) => total + service.durationMinutes, 0)} min · 
                ${selectedServices.reduce((total, service) => total + Number(service.price), 0).toFixed(2)}`
                    : "Choose your service, professional, and preferred time."}
                </p>
              </div>
            </header>
            <fieldset className="customer-service-options">
              <legend>Services</legend>
              <div>
                {services.filter((service) => service.subServices?.some((item) => item.isActive)).map((service) => {
                  const subServices = service.subServices.filter((item) => item.isActive);
                  const selected = subServices.filter((item) => form.serviceIds.some((id, index) => Number(id) === service.id && form.subServiceIds[index] === item.id));
                  const parentSelectedIndex = form.serviceIds.findIndex((id, index) => Number(id) === service.id && form.subServiceIds[index] == null);
                  const expanded = expandedParentServices.has(service.id);
                  return <article key={service.id} className={`customer-service-parent${parentSelectedIndex >= 0 ? " is-selected" : ""}`}>
                    <div className="customer-service-parent-header">
                    <input className="customer-service-parent-checkbox" type="checkbox" aria-label={`Select ${service.name}`}
                      checked={parentSelectedIndex >= 0} onChange={() => {
                        const serviceIds = [...form.serviceIds], subServiceIds = [...form.subServiceIds];
                        if (parentSelectedIndex >= 0) {
                          for (let index = serviceIds.length - 1; index >= 0; index -= 1)
                            if (Number(serviceIds[index]) === service.id) { serviceIds.splice(index, 1); subServiceIds.splice(index, 1); }
                        }
                        else { serviceIds.push(String(service.id)); subServiceIds.push(null); }
                        void selectServices(serviceIds, subServiceIds);
                      }} />
                    <button type="button" className="customer-service-parent-toggle" aria-expanded={expanded} onClick={() => setExpandedParentServices((current) => {
                      const next = new Set(current); if (next.has(service.id)) next.delete(service.id); else next.add(service.id); return next;
                    })}>
                      <span className="customer-service-option-image" aria-hidden="true">{service.imageUrl ? <img src={service.imageUrl} alt="" /> : <Scissors />}</span>
                      <span><strong>{service.name}</strong><small>{service.durationMinutes} min · Rs. {Number(service.price).toFixed(2)}{parentSelectedIndex >= 0 && selected.length ? ` · ${selected.length} sub service${selected.length === 1 ? "" : "s"}` : ""}</small></span>
                      <ChevronDown aria-hidden="true" />
                    </button>
                    </div>
                    <button type="button" className="customer-sub-services-toggle" aria-expanded={expanded} onClick={() => setExpandedParentServices((current) => {
                      const next = new Set(current); if (next.has(service.id)) next.delete(service.id); else next.add(service.id); return next;
                    })}>
                      <span><strong>Sub Services</strong><small>{selected.length} selected</small></span>
                      <ChevronDown aria-hidden="true" />
                    </button>
                    {expanded && <div className="customer-sub-service-dropdown">
                      <p>Sub Services</p>
                      {subServices.map((subService) => {
                        const selectedIndex = form.serviceIds.findIndex((id, index) => Number(id) === service.id && form.subServiceIds[index] === subService.id);
                        return <label key={subService.id} className={selectedIndex >= 0 ? "is-selected" : ""}>
                          <input type="checkbox" checked={selectedIndex >= 0} onChange={() => {
                            const serviceIds = [...form.serviceIds], subServiceIds = [...form.subServiceIds];
                            if (selectedIndex >= 0) { serviceIds.splice(selectedIndex, 1); subServiceIds.splice(selectedIndex, 1); }
                            else {
                              if (!serviceIds.some((id, index) => Number(id) === service.id && subServiceIds[index] == null)) {
                                serviceIds.push(String(service.id)); subServiceIds.push(null);
                              }
                              serviceIds.push(String(service.id)); subServiceIds.push(subService.id);
                            }
                            void selectServices(serviceIds, subServiceIds);
                          }} />
                          <span><strong>{subService.name}</strong><small>{subService.durationMinutes} min · Rs. {Number(subService.price).toFixed(2)}</small></span>
                        </label>;
                      })}
                    </div>}
                  </article>;
                })}
                {services.filter(() => false).flatMap((service) => service.subServices?.filter((item) => item.isActive).map((subService) => ({ service, subService })) ?? [])
                  .map(({ service, subService }) => {
                    const selectedIndex = form.serviceIds.findIndex((id, index) => Number(id) === service.id && form.subServiceIds[index] === subService.id);
                    return <label key={`sub-${subService.id}`} className={selectedIndex >= 0 ? "is-selected" : ""}>
                      <input type="checkbox" checked={selectedIndex >= 0} onChange={() => {
                        const serviceIds = [...form.serviceIds];
                        const subServiceIds = [...form.subServiceIds];
                        if (selectedIndex >= 0) { serviceIds.splice(selectedIndex, 1); subServiceIds.splice(selectedIndex, 1); }
                        else { serviceIds.push(String(service.id)); subServiceIds.push(subService.id); }
                        void selectServices(serviceIds, subServiceIds);
                      }} />
                      <strong>{subService.name}</strong><em>{service.name}</em>
                      <small>{subService.durationMinutes} min · {Number(subService.price).toFixed(2)}</small>
                      <span className="customer-service-option-image" aria-hidden="true">
                        {service.imageUrl ? <img src={service.imageUrl} alt="" /> : <Scissors />}
                      </span>
                    </label>;
                  })}
                {services.filter((service) => !(service.subServices?.some((item) => item.isActive))).map((service) => (
                  <label key={service.id} className={form.serviceIds.includes(String(service.id)) ? "is-selected" : ""}>
                    <input type="checkbox" checked={form.serviceIds.includes(String(service.id))}
                      onChange={() => {
                        const id = String(service.id);
                        const serviceIds = [...form.serviceIds], subServiceIds = [...form.subServiceIds];
                        const selectedIndex = serviceIds.findIndex((item, index) => item === id && subServiceIds[index] == null);
                        if (selectedIndex >= 0) { serviceIds.splice(selectedIndex, 1); subServiceIds.splice(selectedIndex, 1); }
                        else { serviceIds.push(id); subServiceIds.push(null); }
                        void selectServices(serviceIds, subServiceIds);
                      }} />
                    <strong>{service.name}</strong>
                    <small>{service.durationMinutes} min · {Number(service.price).toFixed(2)}</small>
                    <span className="customer-service-option-image" aria-hidden="true">
                      {service.imageUrl ? <img src={service.imageUrl} alt="" /> : <Scissors />}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="customer-professional-field">
              <legend>
                Professional <small>(optional)</small>
              </legend>
              {!form.serviceId ? (
                <p className="customer-professional-empty">
                  Select a service to see its professionals.
                </p>
              ) : assignedEmployees.length ? (
                <div className="customer-professional-options">
                  <button
                    className={employeeChoice === "any" ? "is-selected" : ""}
                    type="button"
                    onClick={() =>
                      loadSlots(form.serviceIds, "any", form.appointmentDate)
                    }
                  >
                    <span>
                      <UserRound />
                    </span>
                    <strong>Any professional</strong>
                    <small>Earliest available</small>
                  </button>
                  {assignedEmployees.map((employee) => (
                    <button
                      className={
                        employeeChoice === String(employee.id)
                          ? "is-selected"
                          : ""
                      }
                      type="button"
                      key={employee.id}
                      onClick={() =>
                        loadSlots(
                          form.serviceIds,
                          String(employee.id),
                          form.appointmentDate,
                        )
                      }
                    >
                      <span>
                        {employee.profileImage ? (
                          <img src={employee.profileImage} alt="" />
                        ) : (
                          <UserRound />
                        )}
                      </span>
                      <strong>
                        {employee.firstName} {employee.lastName}
                      </strong>
                      <small>Select professional</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="customer-professional-empty">
                  No professional selection is needed. The salon can assign one later.
                </p>
              )}
            </fieldset>
            <label className="customer-date-field">
              <span>Date</span>
              <span
                className="customer-date-picker"
                role="button"
                tabIndex={0}
                onClick={openDatePicker}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openDatePicker();
                  }
                }}
              >
                <CalendarDays aria-hidden="true" />
                <span className={form.appointmentDate ? "" : "is-placeholder"}>
                  {form.appointmentDate
                    ? form.appointmentDate.split("-").reverse().join("-")
                    : "dd-mm-yyyy"}
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  aria-label="Appointment date"
                  min={today}
                  value={form.appointmentDate}
                  onChange={(e) =>
                    loadSlots(form.serviceIds, employeeChoice, e.target.value)
                  }
                  required
                />
              </span>
            </label>
            <fieldset className="customer-time-slots">
              <legend>Available times</legend>
              {!form.appointmentDate || !form.serviceId ? (
                <p>Select a service and date to view times.</p>
              ) : slotsLoading ? (
                <p>Checking available times...</p>
              ) : slotsError ? (
                <p className="is-error">{slotsError}</p>
              ) : visibleAvailableSlots.length ? (
                <div>
                  {visibleAvailableSlots.map((slot) => (
                    <button
                      className={form.startTime === slot ? "is-selected" : ""}
                      type="button"
                      key={slot}
                      onClick={() =>
                        setForm({
                          ...form,
                          startTime: slot,
                          employeeId: employeeChoice !== "any" && slotEmployees[slot] ? String(slotEmployees[slot]) : "",
                        })
                      }
                    >
                      {slot.slice(0, 5)}
                    </button>
                  ))}
                </div>
              ) : (
                <p>{slotsMessage ?? "No available times for this date."}</p>
              )}
            </fieldset>
            <fieldset className="customer-appointment-count">
              <legend>Appointment count</legend>
              <div role="group" aria-label="Number of appointments">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={appointmentCount === count ? "is-selected" : ""}
                    onClick={() => {
                      setAppointmentCount(count);
                      setAppointmentChoices((current) => Array.from({ length: count }, (_, index) =>
                        current[index] ?? { serviceIds: form.serviceIds, subServiceIds: form.subServiceIds, employeeId: "" },
                      ));
                      setExpandedAppointmentCards(new Set([0]));
                      setExpandedBulkAddOns(new Set());
                    }}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <small>
                {appointmentCount > 1
                  ? "Customize services and professionals for each appointment below."
                  : "Book up to four appointments at the selected time."}
              </small>
            </fieldset>
            {appointmentCount > 1 && (
              <section className="customer-bulk-configurator" aria-label="Configure each appointment">
                <header>
                  <strong>Customize each appointment</strong>
                  <small>Choose services and a professional separately.</small>
                </header>
                {appointmentChoices.slice(0, appointmentCount).map((choice, index) => {
                  const eligible = employees.filter((employee) =>
                    choice.serviceIds.length > 0 && choice.serviceIds.every((serviceId) =>
                      (employeeServiceIds[employee.id] ?? []).includes(Number(serviceId)),
                    ),
                  );
                  return (
                    <article key={index}>
                      <button
                        type="button"
                        className={`customer-appointment-card-toggle${expandedAppointmentCards.has(index) ? " is-open" : ""}`}
                        aria-expanded={expandedAppointmentCards.has(index)}
                        onClick={() => setExpandedAppointmentCards((current) => {
                          const next = new Set(current);
                          if (next.has(index))
                            next.delete(index);
                          else
                            next.add(index);
                          return next;
                        })}
                      >
                        <span>
                          <b>Appointment {index + 1}</b>
                          <small>
                            {choice.serviceIds.length} service{choice.serviceIds.length === 1 ? "" : "s"} · {choice.employeeId
                              ? (() => {
                                const employee = employees.find((item) => item.id === Number(choice.employeeId));
                                return employee ? `${employee.firstName} ${employee.lastName}` : "Selected professional";
                              })()
                              : "Any professional"}
                          </small>
                        </span>
                        <ChevronDown aria-hidden="true" />
                      </button>
                      {expandedAppointmentCards.has(index) && <div className="customer-appointment-card-body">
                        <button
                          className={`customer-bulk-services-toggle${expandedServiceCards.has(index) ? " is-open" : ""}`}
                          type="button"
                          aria-expanded={expandedServiceCards.has(index)}
                          onClick={() => setExpandedServiceCards((current) => {
                            const next = new Set(current);
                            if (next.has(index)) next.delete(index);
                            else next.add(index);
                            return next;
                          })}
                        >
                          <span>
                            <b>Services</b>
                            <small>{choice.serviceIds.length ? `${choice.serviceIds.length} selected` : "Choose services"}</small>
                          </span>
                          <ChevronDown aria-hidden="true" />
                        </button>
                        {expandedServiceCards.has(index) && <fieldset>
                          <legend>Services</legend>
                          <div>
                            {services.map((service) => {
                              const addOns = service.subServices?.filter((item) => item.isActive) ?? [];
                              const parentIndex = choice.serviceIds.findIndex((id, position) => Number(id) === service.id && choice.subServiceIds[position] == null);
                              const accordionKey = `${index}-${service.id}`;
                              const addOnsOpen = expandedBulkAddOns.has(accordionKey);
                              const updateSelection = (subServiceId: number | null) => setAppointmentChoices((current) => current.map((item, itemIndex) => {
                                if (itemIndex !== index) return item;
                                const serviceIds = [...item.serviceIds], subServiceIds = [...item.subServiceIds];
                                const selectedIndex = serviceIds.findIndex((id, position) => Number(id) === service.id && subServiceIds[position] === subServiceId);
                                if (selectedIndex >= 0) {
                                  if (subServiceId === null) {
                                    for (let position = serviceIds.length - 1; position >= 0; position -= 1)
                                      if (Number(serviceIds[position]) === service.id) { serviceIds.splice(position, 1); subServiceIds.splice(position, 1); }
                                  } else { serviceIds.splice(selectedIndex, 1); subServiceIds.splice(selectedIndex, 1); }
                                } else {
                                  if (subServiceId !== null && !serviceIds.some((id, position) => Number(id) === service.id && subServiceIds[position] == null)) {
                                    serviceIds.push(String(service.id)); subServiceIds.push(null);
                                  }
                                  serviceIds.push(String(service.id)); subServiceIds.push(subServiceId);
                                }
                                return { serviceIds, subServiceIds, employeeId: "" };
                              }));
                              return <section key={service.id} className={`customer-bulk-service-group${parentIndex >= 0 ? " is-selected" : ""}`}>
                                <label className={parentIndex >= 0 ? "is-selected" : ""}>
                                  <input type="checkbox" checked={parentIndex >= 0} onChange={() => updateSelection(null)} />
                                  <span><b>{service.name}</b><small>{service.durationMinutes} min · Rs. {Number(service.price).toFixed(2)}</small></span>
                                </label>
                                {addOns.length > 0 && <>
                                  <button type="button" className="customer-bulk-addons-toggle" aria-expanded={addOnsOpen} onClick={() => setExpandedBulkAddOns((current) => {
                                    const next = new Set(current); if (next.has(accordionKey)) next.delete(accordionKey); else next.add(accordionKey); return next;
                                  })}>
                                    <span>Sub Services<small>{addOns.filter((addOn) => choice.subServiceIds.includes(addOn.id)).length} selected</small></span>
                                    <ChevronDown aria-hidden="true" />
                                  </button>
                                  {addOnsOpen && <div className="customer-bulk-addons-panel">{addOns.map((addOn) => {
                                    const selected = choice.serviceIds.some((id, position) => Number(id) === service.id && choice.subServiceIds[position] === addOn.id);
                                    return <label key={addOn.id} className={selected ? "is-selected" : ""}>
                                      <input type="checkbox" checked={selected} onChange={() => updateSelection(addOn.id)} />
                                      <span><b>{addOn.name}</b><small>{addOn.durationMinutes} min · Rs. {Number(addOn.price).toFixed(2)}</small></span>
                                      <span className="customer-bulk-addon-image" aria-hidden="true">
                                        {addOn.imageUrl ? <img src={addOn.imageUrl} alt="" /> : <Scissors />}
                                      </span>
                                    </label>;
                                  })}</div>}
                                </>}
                              </section>;
                            })}
                            {services.filter(() => false).flatMap((service) => {
                              const activeSubServices = service.subServices?.filter((item) => item.isActive) ?? [];
                              return ([null, ...activeSubServices] as Array<(typeof activeSubServices)[number] | null>).map((subService) => ({ service, subService }));
                            }).map(({ service, subService }) => {
                              const subServiceId = subService?.id ?? null;
                              const selectedIndex = choice.serviceIds.findIndex((id, position) => Number(id) === service.id && choice.subServiceIds[position] === subServiceId);
                              const option = subService ?? service;
                              return <label key={`${service.id}-${subServiceId ?? "service"}`} className={`${selectedIndex >= 0 ? "is-selected" : ""}${subService ? " is-add-on" : " is-main-service"}`}>
                                <input
                                  type="checkbox"
                                  checked={selectedIndex >= 0}
                                  onChange={() => setAppointmentChoices((current) => current.map((item, itemIndex) => {
                                    if (itemIndex !== index) return item;
                                    const serviceIds = [...item.serviceIds], subServiceIds = [...item.subServiceIds];
                                    if (selectedIndex >= 0) {
                                      if (subServiceId === null) {
                                        for (let position = serviceIds.length - 1; position >= 0; position -= 1)
                                          if (Number(serviceIds[position]) === service.id) { serviceIds.splice(position, 1); subServiceIds.splice(position, 1); }
                                      } else { serviceIds.splice(selectedIndex, 1); subServiceIds.splice(selectedIndex, 1); }
                                    } else {
                                      if (subServiceId !== null && !serviceIds.some((id, position) => Number(id) === service.id && subServiceIds[position] == null)) {
                                        serviceIds.push(String(service.id)); subServiceIds.push(null);
                                      }
                                      serviceIds.push(String(service.id)); subServiceIds.push(subServiceId);
                                    }
                                    return { serviceIds, subServiceIds, employeeId: "" };
                                  }))}
                                />
                                <span>
                                  <b>{option.name}</b>
                                  <em>{subService ? "Optional add-on" : "Main service"}</em>
                                  <small>{option.durationMinutes} min{subService ? ` · ${service.name}` : ""}</small>
                                </span>
                              </label>
                            })}
                          </div>
                        </fieldset>}
                        <label>
                          <span>Professional</span>
                          <select value={choice.employeeId} onChange={(event) => setAppointmentChoices((current) =>
                            current.map((item, itemIndex) => itemIndex === index ? { ...item, employeeId: event.target.value } : item),
                          )}>
                            <option value="">Any available professional</option>
                            {eligible.map((employee) => (
                              <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>
                            ))}
                          </select>
                        </label>
                      </div>}
                    </article>
                  );
                })}
              </section>
            )}
            <label>
              <span>Notes (optional)</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any preferences for your visit"
              />
            </label>
            {message && (
              <p className={`customer-booking-message is-${message.type}`}>
                {message.text}
              </p>
            )}
            <button disabled={busy || !form.startTime}>
              {busy ? "Booking..." : "Confirm appointment"}
            </button>
          </form>
        )}
        {!isBookingPage && (
          <>
            <nav className="customer-booking-filters" aria-label="Filter bookings">
              {([
                ["upcoming", "Upcoming", upcoming.length],
                ["cancelled", "Cancelled", cancelled.length],
                ["past", "Past", past.length],
              ] as const).map(([value, label, count]) => (
                <button
                  className={bookingFilter === value ? "is-active" : ""}
                  type="button"
                  key={value}
                  onClick={() => { setBookingFilter(value); setVisibleBookingCount(10); }}
                  aria-pressed={bookingFilter === value}
                >
                  <span>{label}</span>
                  <b>{count}</b>
                </button>
              ))}
            </nav>
            <section className="customer-appointments-list">
              <header>
                <h2>{filteredBookingTitle}</h2>
                <span>{filteredBookings.length}</span>
              </header>
              {filteredBookings.length ? (
                groupedBookings.slice(0, visibleBookingCount).map((group) => card(group,
                  bookingFilter === "upcoming" && group.every((item) => item.status === "Scheduled")))
              ) : (
                <div className="customer-appointment-empty">
                  No {filteredBookingTitle.toLowerCase()}.
                </div>
              )}
              {groupedBookings.length > visibleBookingCount && (
                <button className="customer-bookings-more" type="button" onClick={() =>
                  setVisibleBookingCount((count) => count + 10)}>
                  Show more bookings
                </button>
              )}
            </section>
          </>
        )}
      </div>
      <CustomerBottomNav active={isBookingPage ? "services" : "bookings"} />
      {customer && <CustomerProfileModal open={profileOpen} initialTab="profile"
        customer={customer} onUpdated={setCustomer} onClose={() => setProfileOpen(false)} />}
      <ConfirmDialog
        open={slotSuggestion !== null}
        title="Use the nearest available time?"
        message={slotSuggestion
          ? slotSuggestion.selectedSlot && slotSuggestion.selectedCount
            ? (() => {
              const detail = slotDetails[slotSuggestion.selectedSlot!];
              const requested = slotSuggestion.selectedCount! + slotSuggestion.remaining;
              const reason = detail?.limitingReason === "service_capacity"
                ? "Service capacity reached"
                : detail?.limitingReason === "employee_availability"
                  ? "Not enough professionals"
                  : detail?.limitingReason === "both"
                    ? "Capacity and staff limit"
                    : "Slot capacity reached";
              return (
                <div className="customer-slot-proposal">
                  <span className="customer-slot-proposal_notice">Nothing has been booked yet</span>
                  <div className="customer-slot-proposal_stats">
                    <span>
                      <b>{requested}</b>
                      <small>Requested</small>
                    </span>
                    <span>
                      <b>{detail?.serviceLimit ?? slotSuggestion.selectedCount}</b>
                      <small>Slot limit</small>
                    </span>
                    <span>
                      <b>{detail?.bookedCount ?? 0}</b>
                      <small>Booked</small>
                    </span>
                    <span>
                      <b>{detail?.availableEmployees ?? slotSuggestion.selectedCount}</b>
                      <small>Staff free</small>
                    </span>
                  </div>
                  <strong className="customer-slot-proposal_reason">{reason}</strong>
                  <div className="customer-slot-proposal_plan">
                    <span>
                      <small>Selected time</small>
                      <b>{slotSuggestion.selectedSlot.slice(0, 5)}</b>
                      <em>{slotSuggestion.selectedCount} appointment{slotSuggestion.selectedCount === 1 ? "" : "s"}</em>
                    </span>
                    <i>+</i>
                    <span className="is-nearest">
                      <small>Nearest time</small>
                      <b>{slotSuggestion.slot.slice(0, 5)}</b>
                      <em>{slotSuggestion.remaining} appointment{slotSuggestion.remaining === 1 ? "" : "s"}</em>
                    </span>
                  </div>
                  <small className="customer-slot-proposal_date">{form.appointmentDate.split("-").reverse().join("-")}</small>
                </div>
              );
            })()
            : `${slotSuggestion.alreadyBooked} of your appointments ${slotSuggestion.alreadyBooked === 1 ? "has" : "have"} been booked.
             The nearest available time for the remaining ${slotSuggestion.remaining} ${slotSuggestion.remaining === 1 ? "appointment is" :
              "appointments is"} ${slotSuggestion.slot.slice(0, 5)} on ${form.appointmentDate.split("-").reverse().join("-")}. 
               Would you like to continue?`
          : ""}
        confirmLabel="Yes, book this time"
        cancelLabel="No, choose another"
        busyLabel="Booking..."
        tone="primary"
        busy={busy}
        onConfirm={() => {
          if (!slotSuggestion)
            return;
          if (slotSuggestion.selectedSlot && slotSuggestion.selectedCount)
            void bookApprovedSplit(slotSuggestion.selectedCount, slotSuggestion.selectedSlot, slotSuggestion.remaining,
              slotSuggestion.slot);
          else
            void attemptBooking(slotSuggestion.remaining, slotSuggestion.slot, slotSuggestion.alreadyBooked);
        }}
        onCancel={() => {
          const remaining = slotSuggestion?.remaining ?? appointmentCount;
          setSlotSuggestion(null);
          setAppointmentCount(remaining);
          setForm((current) => ({ ...current, startTime: "" }));
          setMessage({
            type: "error",
            text: "Please select another available time or reduce the appointment count.",
          });
        }}
      />
      <ConfirmDialog
        open={cancelTarget !== null}
        title="Cancel appointment?"
        message="This appointment will be cancelled and the salon will be notified."
        confirmLabel="Cancel appointment"
        busy={busy}
        onConfirm={() => void cancelBooking()}
        onCancel={() => setCancelTarget(null)}
      />
      <ConfirmDialog
        open={logoutOpen}
        title="Sign out?"
        message="Are you sure you want to sign out of your customer account?"
        confirmLabel="Sign out"
        onConfirm={signOut}
        onCancel={() => setLogoutOpen(false)}
      />
    </main>
  );
};

export default CustomerAppointmentsPage;

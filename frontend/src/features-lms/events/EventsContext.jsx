import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../services-lms/api';

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch registrations helper
  const refreshRegistrations = async () => {
    try {
      const isStudent = window.location.pathname.startsWith('/student');
      const isAdmin = window.location.pathname.startsWith('/admin');
      
      if (!isStudent && !isAdmin) {
        setRegistrations([]);
        return;
      }
      
      const regUrl = isStudent ? '/events/registrations/my?size=1000' : '/events/registrations?size=1000';
      const regResponse = await api.get(regUrl);
      if (regResponse.data && regResponse.data.data && regResponse.data.data.content) {
        const regData = Array.isArray(regResponse.data.data.content) 
          ? regResponse.data.data.content 
          : [];
        setRegistrations(regData);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error('Failed to refresh registrations:', err);
    }
  };

  // Fetch events and registrations from backend on mount
  const fetchData = async () => {
    const isStudent = window.location.pathname.startsWith('/student');
    const isTeacher = window.location.pathname.startsWith('/teacher');
    const isAdmin = window.location.pathname.startsWith('/admin');

    if (!isStudent && !isTeacher && !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch events
      const evResponse = await api.get('/events?size=1000');
      if (evResponse.data && evResponse.data.data && evResponse.data.data.content) {
        const eventsData = Array.isArray(evResponse.data.data.content) 
          ? evResponse.data.data.content 
          : [];
        setEvents(eventsData);
      } else {
        setEvents([]);
      }

      // Fetch registrations
      await refreshRegistrations();
    } catch (err) {
      console.error('Failed to fetch events data from backend:', err);
      setError(err.message || 'Failed to load events');
      setEvents([]);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createEvent = async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      if (response.data && response.data.data) {
        const newEvent = response.data.data;
        setEvents((prev) => [newEvent, ...(Array.isArray(prev) ? prev : [])]);
        return newEvent;
      }
    } catch (err) {
      console.error('Failed to create event:', err);
      throw err;
    }
  };

  const updateEvent = async (id, updatedData) => {
    try {
      const response = await api.put(`/events/${id}`, updatedData);
      if (response.data && response.data.data) {
        const saved = response.data.data;
        setEvents((prev) => {
          const eventsArray = Array.isArray(prev) ? prev : [];
          return eventsArray.map((ev) => 
            String(ev.id) === String(id) ? saved : ev
          );
        });
        return saved;
      }
    } catch (err) {
      console.error('Failed to update event:', err);
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => {
        const eventsArray = Array.isArray(prev) ? prev : [];
        return eventsArray.filter((ev) => String(ev.id) !== String(id));
      });
      setRegistrations((prev) => {
        const regArray = Array.isArray(prev) ? prev : [];
        return regArray.filter((reg) => String(reg.eventId) !== String(id));
      });
    } catch (err) {
      console.error('Failed to delete event:', err);
      throw err;
    }
  };

  const togglePublishEvent = async (id) => {
    const eventsArray = Array.isArray(events) ? events : [];
    const target = eventsArray.find((ev) => String(ev.id) === String(id));
    if (!target) return;

    const nextStatus = target.status === 'CANCELLED' ? 'UPCOMING' : 'CANCELLED';
    await updateEvent(id, { ...target, status: nextStatus });
  };

  const registerForEvent = async (eventId, studentInfo) => {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      if (response.data && response.data.data) {
        await refreshRegistrations();
        return true;
      }
    } catch (err) {
      console.error('Failed to register for event:', err);
    }
    return false;
  };

  const cancelEnrollment = async (eventId, email) => {
    try {
      await api.delete(`/events/${eventId}/register`);
      await refreshRegistrations();
    } catch (err) {
      console.error('Failed to cancel enrollment:', err);
    }
  };

  const updateEnrollmentStatus = async (regId, statusType, value) => {
    try {
      const response = await api.put(`/events/registrations/${regId}`, {
        statusType,
        value,
      });
      if (response.data && response.data.data) {
        const updated = response.data.data;
        setRegistrations((prev) => {
          const regArray = Array.isArray(prev) ? prev : [];
          return regArray.map((reg) => 
            String(reg.id) === String(regId) ? updated : reg
          );
        });
      }
    } catch (err) {
      console.error('Failed to update enrollment status:', err);
    }
  };

  const isRegistered = (eventId, email) => {
    if (!email) return false;
    const regArray = Array.isArray(registrations) ? registrations : [];
    return regArray.some(
      (reg) =>
        String(reg.eventId) === String(eventId) &&
        reg.studentEmail === email &&
        (reg.status === 'REGISTERED' || 
         reg.status === 'APPROVED' || 
         reg.status === 'Enrolled' || 
         reg.status === 'Approved' || 
         reg.status === 'Registered')
    );
  };

  const fetchEventsPage = async (page, size, sortBy = 'createdAt', sortDir = 'desc', search = '', active = null) => {
    try {
      const params = {
        page: String(page),
        size: String(size),
        sortBy,
        sortDir,
      };
      if (search) params.search = search;
      if (active !== null && active !== undefined) params.active = String(active);

      const response = await api.get('/events', { params });
      return response.data.data;
    } catch (err) {
      console.error('Failed to fetch events page:', err);
      throw err;
    }
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        registrations,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        togglePublishEvent,
        registerForEvent,
        cancelEnrollment,
        updateEnrollmentStatus,
        isRegistered,
        refreshData: fetchData,
        fetchEventsPage,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}